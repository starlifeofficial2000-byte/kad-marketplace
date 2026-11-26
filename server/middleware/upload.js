const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const { uploadToR2, deleteFromR2 } = require("../config/r2");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
]);

const ALLOWED_EXTENSIONS = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
]);

const storage = multer.memoryStorage();

function fileFilter(req, file, callback) {
    const mimeType = String(file.mimetype || "").toLowerCase();
    const extension = path.extname(file.originalname || "").toLowerCase();

    if (!ALLOWED_MIME_TYPES.has(mimeType) || !ALLOWED_EXTENSIONS.has(extension)) {
        return callback(
            new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname)
        );
    }

    return callback(null, true);
}

const multerUpload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter
});

function createR2Key(file) {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const randomId = crypto.randomBytes(16).toString("hex");
    return `uploads/${Date.now()}-${randomId}${extension}`;
}

async function applyKadWatermark(buffer) {
    const normalizedBuffer = await sharp(buffer, { failOn: "none" })
        .rotate()
        .toBuffer();

    const image = sharp(normalizedBuffer, { failOn: "none" });
    const metadata = await image.metadata();
    const width = Math.max(1, metadata.width || 1200);
    const bandHeight = Math.max(52, Math.min(120, Math.round(width * 0.09)));
    const fontSize = Math.max(20, Math.min(46, Math.round(width * 0.038)));
    const textY = Math.round(bandHeight * 0.68);

    const watermarkSvg = Buffer.from(
        `<svg width="${width}" height="${bandHeight}" viewBox="0 0 ${width} ${bandHeight}" xmlns="http://www.w3.org/2000/svg">` +
        `<rect x="0" y="0" width="${width}" height="${bandHeight}" fill="#07152b" fill-opacity="0.62"/>` +
        `<text x="${Math.round(width * 0.5)}" y="${textY}" text-anchor="middle" ` +
        `font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="800" ` +
        `letter-spacing="2" fill="#ffffff" stroke="#07152b" stroke-width="1" paint-order="stroke">KAD MARKETPLACE</text></svg>`
    );

    return image
        .composite([{ input: watermarkSvg, gravity: "south" }])
        .toBuffer();
}

async function uploadSingleFileToR2(file, applyWatermark = false) {
    if (!file || !Buffer.isBuffer(file.buffer)) {
        throw new Error("Invalid uploaded file: file buffer is missing.");
    }

    if (applyWatermark) {
        file.buffer = await applyKadWatermark(file.buffer);
    }

    const key = createR2Key(file);
    const result = await uploadToR2({
        key,
        buffer: file.buffer,
        contentType: file.mimetype || "application/octet-stream",
        cacheControl: "public, max-age=31536000, immutable"
    });

    if (!result || !result.key || !result.url) {
        throw new Error("R2 upload did not return an object key and public URL.");
    }

    file.filename = path.basename(key);
    file.r2Key = result.key;
    file.key = result.key;
    file.location = result.url;
    file.url = result.url;
    file.storage = "r2";
    file.buffer = null;

    return file;
}

async function uploadFilesToR2(files, applyWatermark = false) {
    if (!Array.isArray(files) || files.length === 0) return [];

    const uploadedFiles = [];

    try {
        for (const file of files) {
            const uploaded = await uploadSingleFileToR2(file, applyWatermark);
            uploadedFiles.push(uploaded);
        }

        return uploadedFiles;
    } catch (error) {
        await cleanupUploadedFiles(uploadedFiles);
        throw error;
    }
}

function collectFiles(req) {
    const collected = [];

    if (Array.isArray(req.files)) {
        collected.push(...req.files);
    } else if (req.files && typeof req.files === "object") {
        for (const value of Object.values(req.files)) {
            if (Array.isArray(value)) collected.push(...value);
        }
    }

    if (req.file) collected.push(req.file);

    return collected.filter(Boolean);
}

async function cleanupUploadedFiles(filesOrRequest) {
    if (!filesOrRequest) return;

    const files = Array.isArray(filesOrRequest)
        ? filesOrRequest
        : collectFiles(filesOrRequest);

    for (const file of files) {
        const key = file && (file.r2Key || file.key);
        if (!key) continue;

        try {
            await deleteFromR2(key);
            file.r2Key = null;
            file.key = null;
        } catch (error) {
            console.error(`[R2] Failed to delete ${key}:`, error.message);
        }
    }
}

function createR2Middleware(multerMiddleware, options = {}) {
    return function r2UploadMiddleware(req, res, next) {
        multerMiddleware(req, res, async (multerError) => {
            if (multerError) return next(multerError);

            try {
                const files = collectFiles(req);
                if (files.length) {
                    await uploadFilesToR2(files, options.watermark === true);
                }
                return next();
            } catch (uploadError) {
                await cleanupUploadedFiles(collectFiles(req));
                return next(uploadError);
            }
        });
    };
}

function single(fieldName, options = {}) {
    return createR2Middleware(multerUpload.single(fieldName), options);
}

function array(fieldName, maxCount, options = {}) {
    return createR2Middleware(multerUpload.array(fieldName, maxCount), options);
}

function fields(fieldConfig, options = {}) {
    return createR2Middleware(multerUpload.fields(fieldConfig), options);
}

function any(options = {}) {
    return createR2Middleware(multerUpload.any(), options);
}

function none() {
    return multerUpload.none();
}

function uploadErrorHandler(error, req, res, next) {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File is too large. Maximum allowed size is 5MB."
            });
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message: "Invalid image file or unexpected upload field. Only JPG, JPEG, PNG and WEBP files are allowed."
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message || "File upload failed."
        });
    }

    return next(error);
}

module.exports = {
    upload: multerUpload,
    single,
    array,
    fields,
    any,
    none,
    cleanupUploadedFiles,
    uploadFilesToR2,
    uploadSingleFileToR2,
    uploadErrorHandler
};

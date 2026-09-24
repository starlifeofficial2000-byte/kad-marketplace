const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const {
    uploadToR2,
    deleteFromR2
} = require("../config/r2");


/* =========================================================
   CONFIGURATION
========================================================= */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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


/* =========================================================
   MEMORY STORAGE
   IMPORTANT:
   Files are NOT written to Railway disk.
   They stay in memory until uploaded to R2.
========================================================= */

const storage = multer.memoryStorage();


/* =========================================================
   FILE FILTER
========================================================= */

function fileFilter(req, file, cb) {
    const mimeType = String(
        file.mimetype || ""
    ).toLowerCase();

    const extension = path
        .extname(file.originalname || "")
        .toLowerCase();

    if (
        !ALLOWED_MIME_TYPES.has(mimeType) ||
        !ALLOWED_EXTENSIONS.has(extension)
    ) {
        return cb(
            new multer.MulterError(
                "LIMIT_UNEXPECTED_FILE",
                file.fieldname
            )
        );
    }

    cb(null, true);
}


/* =========================================================
   MULTER INSTANCE
========================================================= */

const multerUpload = multer({
    storage,

    limits: {
        fileSize: MAX_FILE_SIZE
    },

    fileFilter
});


/* =========================================================
   CREATE R2 OBJECT KEY
========================================================= */

function createR2Key(file) {
    const extension = path
        .extname(file.originalname || "")
        .toLowerCase();

    const randomId = crypto
        .randomBytes(16)
        .toString("hex");

    const timestamp = Date.now();

    return `uploads/${timestamp}-${randomId}${extension}`;
}


/* =========================================================
   UPLOAD ONE FILE TO R2
========================================================= */

async function uploadSingleFileToR2(file) {
    if (!file || !file.buffer) {
        throw new Error(
            "Invalid uploaded file."
        );
    }

    const key = createR2Key(file);

    const result = await uploadToR2({
        key,

        buffer: file.buffer,

        contentType:
            file.mimetype ||
            "application/octet-stream",

        cacheControl:
            "public, max-age=31536000, immutable"
    });

    /*
     * Keep useful metadata on the Multer file object.
     * Controllers can use any of these values.
     */

    file.filename = path.basename(key);

    file.r2Key = result.key;

    file.key = result.key;

    file.location = result.url;

    file.url = result.url;

    file.storage = "r2";

    /*
     * Once the upload has completed, the Buffer is no
     * longer required.
     */

    file.buffer = null;

    return file;
}


/* =========================================================
   UPLOAD MULTIPLE FILES TO R2
========================================================= */

async function uploadFilesToR2(files) {
    if (!files || files.length === 0) {
        return [];
    }

    const uploadedFiles = [];

    try {
        for (const file of files) {
            const uploaded =
                await uploadSingleFileToR2(file);

            uploadedFiles.push(uploaded);
        }

        return uploadedFiles;

    } catch (error) {

        /*
         * If one upload fails after previous uploads
         * succeeded, remove the successful R2 objects.
         */

        for (const file of uploadedFiles) {
            try {
                if (file.r2Key) {
                    await deleteFromR2(
                        file.r2Key
                    );
                }
            } catch (cleanupError) {
                console.error(
                    "[R2] Failed to clean up uploaded object:",
                    cleanupError.message
                );
            }
        }

        throw error;
    }
}


/* =========================================================
   EXTRACT FILES FROM MULTER
========================================================= */

function collectFiles(req) {
    const files = [];

    if (Array.isArray(req.files)) {
        files.push(...req.files);
    }

    if (
        req.files &&
        typeof req.files === "object" &&
        !Array.isArray(req.files)
    ) {
        for (const fieldFiles of Object.values(
            req.files
        )) {
            if (Array.isArray(fieldFiles)) {
                files.push(...fieldFiles);
            }
        }
    }

    if (req.file) {
        files.push(req.file);
    }

    return files;
}


/* =========================================================
   CLEANUP R2 FILES
========================================================= */

async function cleanupUploadedFiles(files) {
    if (!files) {
        return;
    }

    const filesArray = Array.isArray(files)
        ? files
        : collectFiles({
              files,
              file: null
          });

    for (const file of filesArray) {
        if (!file) {
            continue;
        }

        const key =
            file.r2Key ||
            file.key;

        if (!key) {
            continue;
        }

        try {
            await deleteFromR2(key);
        } catch (error) {
            console.error(
                `[R2] Failed to delete ${key}:`,
                error.message
            );
        }
    }
}


/* =========================================================
   PROCESS MULTER FILES AFTER PARSING
========================================================= */

function createR2Middleware(multerMiddleware) {
    return async (req, res, next) => {
        multerMiddleware(
            req,
            res,
            async (error) => {
                if (error) {
                    return next(error);
                }

                try {
                    const files =
                        collectFiles(req);

                    if (files.length > 0) {
                        await uploadFilesToR2(
                            files
                        );
                    }

                    next();

                } catch (uploadError) {

                    /*
                     * Clean any R2 files that may have
                     * already been uploaded.
                     */

                    await cleanupUploadedFiles(
                        collectFiles(req)
                    );

                    next(uploadError);
                }
            }
        );
    };
}


/* =========================================================
   SINGLE FILE
========================================================= */

function single(fieldName) {
    return createR2Middleware(
        multerUpload.single(fieldName)
    );
}


/* =========================================================
   MULTIPLE FILES
========================================================= */

function array(fieldName, maxCount) {
    return createR2Middleware(
        multerUpload.array(
            fieldName,
            maxCount
        )
    );
}


/* =========================================================
   MULTIPLE FIELDS
========================================================= */

function fields(fieldConfig) {
    return createR2Middleware(
        multerUpload.fields(
            fieldConfig
        )
    );
}


/* =========================================================
   ANY FILE FIELD
========================================================= */

function any() {
    return createR2Middleware(
        multerUpload.any()
    );
}


/* =========================================================
   NO FILES
========================================================= */

function none() {
    return multerUpload.none();
}


/* =========================================================
   ERROR HANDLER
========================================================= */

function uploadErrorHandler(
    error,
    req,
    res,
    next
) {
    if (!error) {
        return next();
    }

    if (
        error instanceof multer.MulterError
    ) {
        if (
            error.code ===
            "LIMIT_FILE_SIZE"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "File is too large. Maximum allowed size is 5MB."
            });
        }

        if (
            error.code ===
            "LIMIT_UNEXPECTED_FILE"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid image file. Only JPG, JPEG, PNG and WEBP files are allowed."
            });
        }

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "File upload failed."
        });
    }

    return next(error);
}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
    upload: multerUpload,

    single,
    array,
    fields,
    any,
    none,

    cleanupUploadedFiles,
    uploadFilesToR2,

    uploadErrorHandler
};
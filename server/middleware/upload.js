const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const {
    uploadToR2,
    getR2PublicUrl
} = require("../config/r2");

/*
=====================================================
MULTER MEMORY STORAGE
=====================================================
Files are temporarily held in memory and then
uploaded directly to Cloudflare R2.

Nothing is permanently written to Railway's disk.
=====================================================
*/

const storage = multer.memoryStorage();

/*
=====================================================
FILE FILTER
=====================================================
*/

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    const allowedExtensions =
        /\.(jpg|jpeg|png|webp)$/i;

    const extensionValid =
        allowedExtensions.test(
            file.originalname
        );

    const mimeValid =
        allowedMimeTypes.includes(
            file.mimetype
        );

    if (mimeValid && extensionValid) {
        return cb(null, true);
    }

    return cb(
        new Error(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
        )
    );
};

/*
=====================================================
MULTER
=====================================================
*/

const multerUpload = multer({
    storage,
    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

/*
=====================================================
GENERATE R2 OBJECT KEY
=====================================================
*/

const createR2Key = (file) => {
    const extension =
        path
            .extname(file.originalname)
            .toLowerCase();

    const uniqueId =
        `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;

    /*
    Keep uploads organized inside R2.
    */

    return `uploads/${uniqueId}${extension}`;
};

/*
=====================================================
UPLOAD FILE TO R2
=====================================================
*/

const processR2Files = async (req) => {
    const files = [];

    if (req.file) {
        files.push(req.file);
    }

    if (Array.isArray(req.files)) {
        files.push(...req.files);
    } else if (req.files && typeof req.files === "object") {
        Object.values(req.files).forEach((fieldFiles) => {
            if (Array.isArray(fieldFiles)) {
                files.push(...fieldFiles);
            }
        });
    }

    if (files.length === 0) {
        return;
    }

    await Promise.all(
        files.map(async (file) => {
            const key = createR2Key(file);

            await uploadToR2({
                buffer: file.buffer,
                key,
                contentType: file.mimetype
            });

            /*
            =================================================
            COMPATIBILITY VALUES
            =================================================

            filename = R2 object key

            This is important because your existing
            controllers may already use:

                req.file.filename

            We keep that working.
            */

            file.filename = key;

            file.key = key;

            file.r2Key = key;

            file.location =
                getR2PublicUrl(key);

            file.r2Url =
                getR2PublicUrl(key);

            /*
            The file is no longer stored on Railway.
            */

            delete file.buffer;
        })
    );
};

/*
=====================================================
ERROR HANDLER
=====================================================
*/

const runUpload = (method, args) => {
    return (req, res, next) => {
        const middleware =
            multerUpload[method](...args);

        middleware(req, res, async (error) => {
            if (error) {
                return next(error);
            }

            try {
                await processR2Files(req);

                next();
            } catch (r2Error) {
                console.error(
                    "[R2] Upload failed:",
                    r2Error
                );

                next(r2Error);
            }
        });
    };
};

/*
=====================================================
PUBLIC UPLOAD API
=====================================================

Keeps compatibility with:

upload.single(...)
upload.array(...)
upload.fields(...)
upload.none(...)
=====================================================
*/

const upload = {
    single: (fieldName) =>
        runUpload("single", [fieldName]),

    array: (fieldName, maxCount) =>
        runUpload(
            "array",
            [fieldName, maxCount]
        ),

    fields: (fields) =>
        runUpload(
            "fields",
            [fields]
        ),

    none: () =>
        runUpload("none", [])
};

module.exports = upload;
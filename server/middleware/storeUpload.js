const multer = require("multer");
const path = require("path");

const { uploadToR2 } = require("../config/r2");

/* ==========================================
   MEMORY STORAGE
   FILES GO DIRECTLY TO R2
========================================== */

const storage = multer.memoryStorage();

/* ==========================================
   FILE FILTER
========================================== */

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, PNG and WEBP images are allowed."
            ),
            false
        );
    }
};

/* ==========================================
   CREATE R2 OBJECT KEY
========================================== */

function createR2Key(file) {
    const extension =
        path.extname(file.originalname || "").toLowerCase() ||
        ".jpg";

    const safeExtension =
        [".jpg", ".jpeg", ".png", ".webp"].includes(extension)
            ? extension
            : ".jpg";

    const randomPart =
        Math.random()
            .toString(36)
            .substring(2, 12);

    return `uploads/stores/${Date.now()}-${randomPart}${safeExtension}`;
}

/* ==========================================
   UPLOAD ONE FILE TO R2
========================================== */

async function uploadFileToR2(file) {
    if (!file || !file.buffer) {
        throw new Error("Invalid uploaded file.");
    }

    const key = createR2Key(file);

    const result = await uploadToR2({
        key,
        buffer: file.buffer,
        contentType: file.mimetype,
        cacheControl:
            "public, max-age=31536000, immutable"
    });

    /*
     * Keep useful metadata on req.file
     * so the controller can use it.
     */

    file.r2Key = result.key;
    file.key = result.key;
    file.location = result.url;
    file.url = result.url;
    file.filename = result.key.split("/").pop();
    file.storage = "r2";

    /*
     * We no longer need the buffer after
     * the R2 upload has completed.
     */

    file.buffer = null;

    return file;
}

/* ==========================================
   MULTER INSTANCE
========================================== */

const multerUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

/* ==========================================
   SINGLE
========================================== */

function single(fieldName) {
    const middleware =
        multerUpload.single(fieldName);

    return async (req, res, next) => {
        try {
            await new Promise((resolve, reject) => {
                middleware(req, res, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });

            if (req.file) {
                await uploadFileToR2(req.file);
            }

            next();
        } catch (error) {
            console.error(
                "STORE SINGLE UPLOAD ERROR:",
                error
            );

            next(error);
        }
    };
}

/* ==========================================
   ARRAY
========================================== */

function array(fieldName, maxCount) {
    const middleware =
        multerUpload.array(
            fieldName,
            maxCount
        );

    return async (req, res, next) => {
        try {
            await new Promise((resolve, reject) => {
                middleware(req, res, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });

            if (Array.isArray(req.files)) {
                for (const file of req.files) {
                    await uploadFileToR2(file);
                }
            }

            next();
        } catch (error) {
            console.error(
                "STORE ARRAY UPLOAD ERROR:",
                error
            );

            next(error);
        }
    };
}

/* ==========================================
   FIELDS
========================================== */

function fields(fields) {
    const middleware =
        multerUpload.fields(fields);

    return async (req, res, next) => {
        try {
            await new Promise((resolve, reject) => {
                middleware(req, res, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });

            if (req.files) {
                for (const fieldName of Object.keys(req.files)) {
                    const files =
                        req.files[fieldName] || [];

                    for (const file of files) {
                        await uploadFileToR2(file);
                    }
                }
            }

            next();
        } catch (error) {
            console.error(
                "STORE FIELDS UPLOAD ERROR:",
                error
            );

            next(error);
        }
    };
}

/* ==========================================
   ANY
========================================== */

function any() {
    const middleware =
        multerUpload.any();

    return async (req, res, next) => {
        try {
            await new Promise((resolve, reject) => {
                middleware(req, res, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });

            if (Array.isArray(req.files)) {
                for (const file of req.files) {
                    await uploadFileToR2(file);
                }
            }

            next();
        } catch (error) {
            console.error(
                "STORE ANY UPLOAD ERROR:",
                error
            );

            next(error);
        }
    };
}

/* ==========================================
   EXPORT
========================================== */

const upload = {
    single,
    array,
    fields,
    any,

    /*
     * Expose the underlying multer instance
     * if another Store feature needs it.
     */

    multer: multerUpload
};

module.exports = upload;
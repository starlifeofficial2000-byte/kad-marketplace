const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const {
    uploadToR2,
    deleteFromR2,
    getR2PublicUrl
} = require("../config/r2");

/*
|--------------------------------------------------------------------------
| Upload configuration
|--------------------------------------------------------------------------
*/

const MAX_FILE_SIZE =
    5 * 1024 * 1024;

const R2_UPLOAD_PREFIX =
    "uploads";

/*
|--------------------------------------------------------------------------
| Allowed image types
|--------------------------------------------------------------------------
*/

const allowedMimeTypes =
    new Set([
        "image/jpeg",
        "image/png",
        "image/webp"
    ]);

const allowedExtensions =
    /\.(jpg|jpeg|png|webp)$/i;

/*
|--------------------------------------------------------------------------
| Multer memory storage
|--------------------------------------------------------------------------
|
| Files are kept in memory temporarily.
|
| They are then uploaded directly to Cloudflare R2.
|
*/

const storage =
    multer.memoryStorage();

/*
|--------------------------------------------------------------------------
| File validation
|--------------------------------------------------------------------------
*/

const fileFilter =
    (req, file, cb) => {

        const extensionValid =
            allowedExtensions.test(
                path.basename(
                    file.originalname || ""
                )
            );

        const mimeValid =
            allowedMimeTypes.has(
                file.mimetype
            );

        if (
            extensionValid &&
            mimeValid
        ) {

            return cb(
                null,
                true
            );

        }

        return cb(
            new multer.MulterError(
                "LIMIT_UNEXPECTED_FILE",
                file.fieldname
            ),
            false
        );

    };

/*
|--------------------------------------------------------------------------
| Multer
|--------------------------------------------------------------------------
*/

const multerUpload =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize:
                MAX_FILE_SIZE

        }

    });

/*
|--------------------------------------------------------------------------
| Create unique R2 object key
|--------------------------------------------------------------------------
*/

function createObjectKey(file) {

    const extension =
        path
            .extname(
                file.originalname || ""
            )
            .toLowerCase();

    const uniqueName =
        `${Date.now()}-` +
        `${crypto.randomBytes(8).toString("hex")}` +
        `${extension}`;

    return (
        `${R2_UPLOAD_PREFIX}/` +
        uniqueName
    );

}

/*
|--------------------------------------------------------------------------
| Collect files from request
|--------------------------------------------------------------------------
*/

function getRequestFiles(req) {

    const files = [];

    /*
    |--------------------------------------------------------------------------
    | upload.single()
    |--------------------------------------------------------------------------
    */

    if (req.file) {

        files.push(
            req.file
        );

    }

    /*
    |--------------------------------------------------------------------------
    | upload.array()
    |--------------------------------------------------------------------------
    */

    if (
        Array.isArray(
            req.files
        )
    ) {

        files.push(
            ...req.files
        );

    }

    /*
    |--------------------------------------------------------------------------
    | upload.fields()
    |--------------------------------------------------------------------------
    */

    else if (
        req.files &&
        typeof req.files === "object"
    ) {

        Object.values(
            req.files
        ).forEach(
            fieldFiles => {

                if (
                    Array.isArray(
                        fieldFiles
                    )
                ) {

                    files.push(
                        ...fieldFiles
                    );

                }

            }
        );

    }

    return files;

}

/*
|--------------------------------------------------------------------------
| Cleanup R2 files
|--------------------------------------------------------------------------
*/

async function cleanupFiles(
    files
) {

    if (
        !Array.isArray(files) ||
        files.length === 0
    ) {

        return;

    }

    const keys = [
        ...new Set(

            files

                .map(
                    file =>
                        file?.r2Key ||
                        file?.key
                )

                .filter(Boolean)

        )
    ];

    await Promise.allSettled(

        keys.map(
            key =>
                deleteFromR2(
                    key
                )
        )

    );

}

/*
|--------------------------------------------------------------------------
| Upload files to R2
|--------------------------------------------------------------------------
*/

async function processR2Files(
    req
) {

    const files =
        getRequestFiles(req);

    if (
        files.length === 0
    ) {

        return;

    }

    const uploaded = [];

    try {

        await Promise.all(

            files.map(
                async file => {

                    const key =
                        createObjectKey(
                            file
                        );

                    const result =
                        await uploadToR2({

                            key,

                            buffer:
                                file.buffer,

                            contentType:
                                file.mimetype

                        });

                    /*
                    |--------------------------------------------------------------------------
                    | Backward compatibility
                    |--------------------------------------------------------------------------
                    |
                    | Existing controllers use:
                    |
                    | file.filename
                    |
                    */

                    file.filename =
                        path.basename(
                            key
                        );

                    file.originalFilename =
                        file.originalname;

                    /*
                    |--------------------------------------------------------------------------
                    | R2 metadata
                    |--------------------------------------------------------------------------
                    */

                    file.r2Key =
                        result.key;

                    file.key =
                        result.key;

                    file.location =
                        result.url ||
                        getR2PublicUrl(
                            result.key
                        ) ||
                        null;

                    file.storage =
                        "r2";

                    uploaded.push(
                        file
                    );

                }
            )

        );

    }

    catch (error) {

        /*
        |--------------------------------------------------------------------------
        | If one upload fails, delete
        | everything that already uploaded.
        |--------------------------------------------------------------------------
        */

        await cleanupFiles(
            uploaded
        );

        throw error;

    }

    finally {

        /*
        |--------------------------------------------------------------------------
        | Release image buffers
        |--------------------------------------------------------------------------
        */

        files.forEach(
            file => {

                delete file.buffer;

            }
        );

    }

}

/*
|--------------------------------------------------------------------------
| Wrap Multer and R2
|--------------------------------------------------------------------------
*/

function withR2(
    multerMiddleware
) {

    return (
        req,
        res,
        next
    ) => {

        multerMiddleware(
            req,
            res,
            async error => {

                if (error) {

                    return next(
                        error
                    );

                }

                try {

                    await processR2Files(
                        req
                    );

                    return next();

                }

                catch (
                    uploadError
                ) {

                    return next(
                        uploadError
                    );

                }

            }
        );

    };

}

/*
|--------------------------------------------------------------------------
| Public upload API
|--------------------------------------------------------------------------
*/

const upload = {

    single(fieldName) {

        return withR2(
            multerUpload.single(
                fieldName
            )
        );

    },

    array(
        fieldName,
        maxCount
    ) {

        return withR2(
            multerUpload.array(
                fieldName,
                maxCount
            )
        );

    },

    fields(fields) {

        return withR2(
            multerUpload.fields(
                fields
            )
        );

    },

    any() {

        return withR2(
            multerUpload.any()
        );

    },

    none() {

        return multerUpload.none();

    }

};

/*
|--------------------------------------------------------------------------
| Expose processor when needed
|--------------------------------------------------------------------------
*/

upload.processR2Files =
    processR2Files;

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports =
    upload;
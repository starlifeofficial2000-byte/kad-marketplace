// middleware/storeUpload.js

const multer = require("multer");
const path = require("path");

const {
    uploadToR2
} = require("../config/r2");

const storage =
    multer.memoryStorage();

const fileFilter = (
    req,
    file,
    cb
) => {
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (
        allowedTypes.includes(
            file.mimetype
        )
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            ),
            false
        );
    }
};

function createR2Key(file) {
    const extension =
        path.extname(
            file.originalname || ""
        ).toLowerCase();

    const safeExtension =
        [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        ].includes(extension)
            ? extension
            : ".jpg";

    const randomPart =
        Math.random()
            .toString(36)
            .substring(2, 12);

    return (
        `uploads/stores/` +
        `${Date.now()}-${randomPart}` +
        `${safeExtension}`
    );
}

async function uploadFileToR2(file) {
    if (
        !file ||
        !Buffer.isBuffer(file.buffer)
    ) {
        throw new Error(
            "Invalid uploaded file."
        );
    }

    const key =
        createR2Key(file);

    console.log(
        "[STORE R2] Uploading:",
        {
            originalName:
                file.originalname,
            mimeType:
                file.mimetype,
            key
        }
    );

    const result =
        await uploadToR2({
            key,
            buffer: file.buffer,
            contentType:
                file.mimetype,
            cacheControl:
                "public, max-age=31536000, immutable"
        });

    file.r2Key =
        result.key;

    file.key =
        result.key;

    file.url =
        result.url;

    file.location =
        result.url;

    file.filename =
        result.key.split("/").pop();

    file.storage =
        "r2";

    console.log(
        "[STORE R2] Upload complete:",
        {
            r2Key: file.r2Key,
            url: file.url
        }
    );

    return file;
}

const multerUpload =
    multer({
        storage,
        fileFilter,
        limits: {
            fileSize:
                5 * 1024 * 1024
        }
    });

function single(fieldName) {
    const middleware =
        multerUpload.single(
            fieldName
        );

    return async (
        req,
        res,
        next
    ) => {
        try {
            await new Promise(
                (
                    resolve,
                    reject
                ) => {
                    middleware(
                        req,
                        res,
                        error => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }
                        }
                    );
                }
            );

            if (req.file) {
                await uploadFileToR2(
                    req.file
                );
            }

            next();
        } catch (error) {
            console.error(
                "[STORE UPLOAD ERROR]",
                error
            );

            next(error);
        }
    };
}

function fields(fields) {
    const middleware =
        multerUpload.fields(
            fields
        );

    return async (
        req,
        res,
        next
    ) => {
        try {
            await new Promise(
                (
                    resolve,
                    reject
                ) => {
                    middleware(
                        req,
                        res,
                        error => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }
                        }
                    );
                }
            );

            if (req.files) {
                for (
                    const fieldName of Object.keys(
                        req.files
                    )
                ) {
                    const files =
                        req.files[
                            fieldName
                        ] || [];

                    for (
                        const file of files
                    ) {
                        await uploadFileToR2(
                            file
                        );
                    }
                }
            }

            next();
        } catch (error) {
            console.error(
                "[STORE FIELDS UPLOAD ERROR]",
                error
            );

            next(error);
        }
    };
}

function array(
    fieldName,
    maxCount
) {
    const middleware =
        multerUpload.array(
            fieldName,
            maxCount
        );

    return async (
        req,
        res,
        next
    ) => {
        try {
            await new Promise(
                (
                    resolve,
                    reject
                ) => {
                    middleware(
                        req,
                        res,
                        error => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }
                        }
                    );
                }
            );

            if (
                Array.isArray(
                    req.files
                )
            ) {
                for (
                    const file of req.files
                ) {
                    await uploadFileToR2(
                        file
                    );
                }
            }

            next();
        } catch (error) {
            console.error(
                "[STORE ARRAY UPLOAD ERROR]",
                error
            );

            next(error);
        }
    };
}

function any() {
    const middleware =
        multerUpload.any();

    return async (
        req,
        res,
        next
    ) => {
        try {
            await new Promise(
                (
                    resolve,
                    reject
                ) => {
                    middleware(
                        req,
                        res,
                        error => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }
                        }
                    );
                }
            );

            if (
                Array.isArray(
                    req.files
                )
            ) {
                for (
                    const file of req.files
                ) {
                    await uploadFileToR2(
                        file
                    );
                }
            }

            next();
        } catch (error) {
            console.error(
                "[STORE ANY UPLOAD ERROR]",
                error
            );

            next(error);
        }
    };
}

module.exports = {
    single,
    array,
    fields,
    any,
    multer: multerUpload
};
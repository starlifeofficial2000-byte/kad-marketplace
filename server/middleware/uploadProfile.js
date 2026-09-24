const multer = require("multer");
const path = require("path");

const {
    uploadToR2
} = require("../config/r2");

/*
==========================================================
MEMORY STORAGE
==========================================================
*/

const storage = multer.memoryStorage();

/*
==========================================================
FILE FILTER
==========================================================
*/

const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
    ];

    const allowedExtensions = [
        ".jpeg",
        ".jpg",
        ".png",
        ".gif",
        ".webp",
    ];

    const extension =
        path.extname(
            file.originalname || ""
        ).toLowerCase();

    const validMimeType =
        allowedMimeTypes.includes(
            file.mimetype
        );

    const validExtension =
        allowedExtensions.includes(
            extension
        );

    if (
        validMimeType &&
        validExtension
    ) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only JPG, JPEG, PNG, GIF, and WEBP images are allowed."
            ),
            false
        );

    }
};

/*
==========================================================
CREATE R2 KEY
==========================================================
*/

const createProfileImageKey = (file) => {

    const extension =
        path.extname(
            file.originalname || ""
        ).toLowerCase();

    /*
     * Keep GIF support because your existing
     * profile uploader allowed GIF.
     */

    const allowedExtensions = [
        ".jpeg",
        ".jpg",
        ".png",
        ".gif",
        ".webp",
    ];

    const safeExtension =
        allowedExtensions.includes(extension)
            ? extension
            : ".jpg";

    const randomPart =
        Math.random()
            .toString(36)
            .substring(2, 12);

    return (
        `uploads/profiles/` +
        `${Date.now()}-${randomPart}` +
        `${safeExtension}`
    );
};

/*
==========================================================
UPLOAD PROFILE IMAGE TO R2
==========================================================
*/

const uploadProfileImageToR2 = async (
    file
) => {

    if (
        !file ||
        !file.buffer
    ) {
        throw new Error(
            "Invalid profile image upload."
        );
    }

    const key =
        createProfileImageKey(file);

    const result =
        await uploadToR2({

            key,

            buffer:
                file.buffer,

            contentType:
                file.mimetype,

            cacheControl:
                "public, max-age=31536000, immutable"

        });

    /*
     * Keep metadata available to
     * userController.js.
     */

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

    /*
     * Buffer is no longer needed.
     */

    file.buffer = null;

    return file;
};

/*
==========================================================
MULTER
==========================================================
*/

const multerUpload =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize:
                5 * 1024 * 1024,

            files: 1,

        },

    });

/*
==========================================================
PROFILE UPLOAD MIDDLEWARE
==========================================================
*/

const upload = {

    single: (fieldName) => {

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
                            (error) => {

                                if (error) {
                                    reject(
                                        error
                                    );
                                    return;
                                }

                                resolve();

                            }
                        );

                    }
                );

                if (req.file) {

                    await uploadProfileImageToR2(
                        req.file
                    );

                }

                next();

            } catch (error) {

                console.error(
                    "PROFILE IMAGE R2 UPLOAD ERROR:",
                    error
                );

                next(error);

            }

        };

    },

};

module.exports = upload;
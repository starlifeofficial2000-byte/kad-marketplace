const multer = require("multer");
const path = require("path");
const fs = require("fs");

/*
==========================================================
PROFILE UPLOAD DIRECTORY
==========================================================
*/

const uploadPath = path.join(
    __dirname,
    "..",
    "uploads"
);

/*
 * Make sure uploads directory exists.
 */
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {
        recursive: true,
    });
}

/*
==========================================================
MULTER STORAGE
==========================================================
*/

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadPath);

    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();

        const uniqueName =
            `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${extension}`;

        cb(
            null,
            uniqueName
        );

    },

});

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
            file.originalname
        ).toLowerCase();

    /*
     * Check both MIME type and extension.
     */
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
MULTER
==========================================================
*/

const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize:
            5 * 1024 * 1024,

        files: 1,
    },

});

module.exports = upload;
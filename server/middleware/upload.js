const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* =====================================================
   UPLOAD DIRECTORY
===================================================== */

const uploadDir = path.join(
    __dirname,
    "..",
    "uploads"
);

/* =====================================================
   MAKE SURE UPLOAD DIRECTORY EXISTS
===================================================== */

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}

/* =====================================================
   STORAGE
===================================================== */

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9);

        const extension =
            path
                .extname(file.originalname)
                .toLowerCase();

        cb(
            null,
            uniqueName + extension
        );
    }

});

/* =====================================================
   FILE FILTER
===================================================== */

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

/* =====================================================
   MULTER
===================================================== */

const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});

/* =====================================================
   EXPORT
===================================================== */

module.exports = upload;
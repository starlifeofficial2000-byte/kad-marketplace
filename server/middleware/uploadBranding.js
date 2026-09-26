const multer = require("multer");
const path = require("path");

/* =========================================================
   BRANDING UPLOAD
   IMPORTANT:
   Use memoryStorage because Cloudflare R2 requires
   req.file.buffer.
========================================================= */

const storage = multer.memoryStorage();

/* =========================================================
   FILE FILTER
========================================================= */

const fileFilter = (req, file, cb) => {

    const allowedExtensions =
        /\.(jpeg|jpg|png|gif|webp|svg|ico)$/i;

    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/x-icon",
        "image/vnd.microsoft.icon"
    ];

    const extensionValid =
        allowedExtensions.test(
            path.extname(file.originalname)
        );

    const mimeValid =
        allowedMimeTypes.includes(
            file.mimetype
        );

    if (
        extensionValid &&
        mimeValid
    ) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only JPG, JPEG, PNG, GIF, WEBP, SVG and ICO image files are allowed."
            )
        );

    }

};

/* =========================================================
   MULTER
========================================================= */

const uploadBranding = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:
            5 * 1024 * 1024

    }

});

module.exports = uploadBranding;
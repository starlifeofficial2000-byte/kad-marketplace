const multer = require("multer");
const path = require("path");
const imageQualityService = require("../services/imageQualityService");

// Storage Configuration
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1E9);

        cb(
            null,
            uniqueName + path.extname(file.originalname)
        );

    }

});

const fileFilter = (req, file, cb) => {

    const allowedMimeTypes = [

        "image/jpeg",

        "image/png",

        "image/webp"

    ];

    const allowedExtensions = /\.(jpg|jpeg|png|webp)$/i;

    if (

        allowedMimeTypes.includes(file.mimetype) &&

        allowedExtensions.test(file.originalname)

    ) {

        return cb(null, true);

    }

    cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed."));

};

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 5 * 1024 * 1024 // 5MB

    }

});

module.exports = upload;
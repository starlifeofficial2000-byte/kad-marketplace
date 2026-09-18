const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ==========================================
   CREATE FOLDERS
========================================== */

const imageFolder = "uploads/chat/images";
const audioFolder = "uploads/chat/audio";

if (!fs.existsSync(imageFolder)) {
    fs.mkdirSync(imageFolder, { recursive: true });
}

if (!fs.existsSync(audioFolder)) {
    fs.mkdirSync(audioFolder, { recursive: true });
}

/* ==========================================
   STORAGE
========================================== */

const storage = multer.diskStorage({

    destination(req, file, cb) {

        if (file.mimetype.startsWith("image")) {

            cb(null, imageFolder);

        } else if (file.mimetype.startsWith("audio")) {

            cb(null, audioFolder);

        } else {

            cb(new Error("Unsupported file type"));

        }

    },

    filename(req, file, cb) {

        cb(

            null,

            Date.now() +
            "-" +
            Math.round(Math.random() * 1000000) +
            path.extname(file.originalname)

        );

    }

});

/* ==========================================
   FILTER
========================================== */

const fileFilter = (req, file, cb) => {

    const allowedImages = [

        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg"

    ];

    const allowedAudio = [

        "audio/webm",
        "audio/mp3",
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/x-m4a"

    ];

    if (

        allowedImages.includes(file.mimetype) ||

        allowedAudio.includes(file.mimetype)

    ) {

        cb(null, true);

    } else {

        cb(new Error("Invalid file type"));

    }

};

module.exports = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 20 * 1024 * 1024

    }

});
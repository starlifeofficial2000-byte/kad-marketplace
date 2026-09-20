const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* =========================================================
   CHAT UPLOAD DIRECTORIES
========================================================= */

const chatRoot = path.join(
    __dirname,
    "..",
    "uploads",
    "chat"
);

const imageDir = path.join(
    chatRoot,
    "images"
);

const audioDir = path.join(
    chatRoot,
    "audio"
);

fs.mkdirSync(imageDir, {
    recursive: true
});

fs.mkdirSync(audioDir, {
    recursive: true
});


/* =========================================================
   MULTER STORAGE
========================================================= */

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        console.log(
            "CHAT UPLOAD FIELD:",
            file.fieldname
        );

        if (file.fieldname === "image") {
            return cb(null, imageDir);
        }

        if (file.fieldname === "audio") {
            return cb(null, audioDir);
        }

        return cb(
            new Error(
                `Unsupported upload field: ${file.fieldname}`
            )
        );
    },

    filename: (req, file, cb) => {

        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        const filename =
            `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${extension}`;

        cb(null, filename);
    }

});


/* =========================================================
   FILE FILTER
========================================================= */

const fileFilter = (req, file, cb) => {

    console.log(
        "CHAT UPLOAD FIELD:",
        file.fieldname
    );

    console.log(
        "CHAT UPLOAD MIME:",
        file.mimetype
    );


    /* =====================================================
       IMAGE
    ===================================================== */

    if (file.fieldname === "image") {

        const allowedImages = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (
            allowedImages.includes(
                file.mimetype
            )
        ) {
            return cb(null, true);
        }

        return cb(
            new Error(
                "Only JPG, JPEG, PNG, WEBP and GIF images are allowed."
            )
        );
    }


    /* =====================================================
       AUDIO
    ===================================================== */

    if (file.fieldname === "audio") {

        const allowedAudio = [
            "audio/webm",
            "audio/ogg",
            "audio/mp4",
            "audio/mpeg",
            "audio/wav",
            "audio/x-wav"
        ];

        if (
            allowedAudio.includes(
                file.mimetype
            )
        ) {
            return cb(null, true);
        }

        return cb(
            new Error(
                `Unsupported audio format: ${file.mimetype}`
            )
        );
    }


    /* =====================================================
       UNKNOWN FIELD
    ===================================================== */

    return cb(
        new Error(
            `Unsupported upload field: ${file.fieldname}`
        )
    );
};


/* =========================================================
   MULTER CONFIGURATION
========================================================= */

const chatUpload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024
    }

});


module.exports = chatUpload;
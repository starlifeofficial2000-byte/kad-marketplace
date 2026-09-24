const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const { uploadToR2 } = require("../config/r2");

/* =========================================================
   MEMORY STORAGE

   Files stay in memory temporarily and are uploaded
   directly to Cloudflare R2.
========================================================= */

const storage = multer.memoryStorage();

/* =========================================================
   FILE FILTER
========================================================= */

const fileFilter = (req, file, cb) => {
    console.log("====================================");
    console.log("CHAT UPLOAD");
    console.log("Field:", file.fieldname);
    console.log("Original name:", file.originalname);
    console.log("MIME:", file.mimetype);
    console.log("====================================");

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

        if (allowedImages.includes(file.mimetype)) {
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

        if (allowedAudio.includes(file.mimetype)) {
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

const multerUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

/* =========================================================
   R2 UPLOAD MIDDLEWARE

   Multer first puts the file in memory.
   This middleware then uploads it to Cloudflare R2.
========================================================= */

const uploadToCloudflareR2 = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        const extension = path
            .extname(req.file.originalname || "")
            .toLowerCase();

        const randomName = crypto
            .randomBytes(16)
            .toString("hex");

        let folder;

        if (req.file.fieldname === "image") {
            folder = "uploads/chat/images";
        } else if (req.file.fieldname === "audio") {
            folder = "uploads/chat/audio";
        } else {
            throw new Error(
                `Unsupported chat upload field: ${req.file.fieldname}`
            );
        }

        const key =
            `${folder}/${Date.now()}-${randomName}${extension}`;

        const result = await uploadToR2({
            key,
            buffer: req.file.buffer,
            contentType: req.file.mimetype,
            cacheControl: "public, max-age=31536000, immutable"
        });

        /* =================================================
           ATTACH R2 INFORMATION TO req.file

           Controllers can now use:
           req.file.r2Key
           req.file.key
           req.file.url
           req.file.location
        ================================================= */

        req.file.r2Key = result.key;
        req.file.key = result.key;
        req.file.url = result.url;
        req.file.location = result.url;
        req.file.filename = result.key;
        req.file.storage = "r2";

        /* Buffer is no longer needed */
        req.file.buffer = undefined;

        console.log("CHAT FILE UPLOADED TO R2");
        console.log("R2 Key:", req.file.r2Key);
        console.log("R2 URL:", req.file.url);

        return next();

    } catch (error) {
        console.error(
            "CHAT R2 UPLOAD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to upload chat file."
        });
    }
};

/* =========================================================
   WRAPPER

   Keeps the existing route unchanged:

   chatUpload.single("image")
   chatUpload.single("audio")
========================================================= */

const chatUpload = {
    single(fieldName) {
        return [
            multerUpload.single(fieldName),
            uploadToCloudflareR2
        ];
    },

    array(fieldName, maxCount) {
        return [
            multerUpload.array(fieldName, maxCount)
        ];
    },

    fields(fields) {
        return [
            multerUpload.fields(fields)
        ];
    },

    any() {
        return [
            multerUpload.any()
        ];
    },

    none() {
        return [
            multerUpload.none()
        ];
    }
};

module.exports = chatUpload;
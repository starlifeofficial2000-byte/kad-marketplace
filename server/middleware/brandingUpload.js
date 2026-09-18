const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/branding");

    },

    filename: (req, file, cb) => {

        cb(

            null,

            Date.now() +

            path.extname(file.originalname)

        );

    }

});

const fileFilter = (req, file, cb) => {

    const allowed = /jpg|jpeg|png|svg|ico|webp/;

    const ext = allowed.test(

        path.extname(file.originalname).toLowerCase()

    );

    const mime = allowed.test(file.mimetype);

    if (ext && mime) {

        return cb(null, true);

    }

    cb(new Error("Only image files are allowed."));

};

module.exports = multer({

    storage,

    fileFilter

});
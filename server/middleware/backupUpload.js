const multer = require("multer");
const path = require("path");
const fs = require("fs");

const restoreDirectory = path.join(
    __dirname,
    "../temp/restores"
);


if (!fs.existsSync(restoreDirectory)) {

    fs.mkdirSync(
        restoreDirectory,
        { recursive: true }
    );

}


const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, restoreDirectory);

    },

    filename: (req, file, cb) => {

        const uniqueName =

            Date.now() +

            "-" +

            Math.round(Math.random() * 1E9) +

            path.extname(file.originalname);

        cb(null, uniqueName);

    }

});


const fileFilter = (req, file, cb) => {

    const allowedExtensions = [

        ".json",

        ".zip"

    ];


    const extension = path.extname(

        file.originalname

    ).toLowerCase();


    if (

        allowedExtensions.includes(extension)

    ) {

        cb(null, true);

    }

    else {

        cb(

            new Error(

                "Only JSON and ZIP backup files are allowed."

            )

        );

    }

};


const backupUpload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 500 * 1024 * 1024

    }

});


module.exports = backupUpload;
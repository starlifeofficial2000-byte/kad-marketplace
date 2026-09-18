const multer = require("multer");

const path = require("path");

const fs = require("fs");


const uploadPath =

    path.join(

        __dirname,

        "../uploads/branding"

    );


/* =====================================
   CREATE FOLDER IF IT DOES NOT EXIST
===================================== */

if (!fs.existsSync(uploadPath)) {

    fs.mkdirSync(

        uploadPath,

        {

            recursive: true

        }

    );

}


/* =====================================
   STORAGE
===================================== */

const storage = multer.diskStorage({

    destination: (

        req,

        file,

        cb

    ) => {

        cb(

            null,

            uploadPath

        );

    },


    filename: (

        req,

        file,

        cb

    ) => {

        const uniqueName =

            Date.now() +

            "-" +

            Math.round(

                Math.random() * 1e9

            );


        cb(

            null,

            file.fieldname +

            "-" +

            uniqueName +

            path.extname(

                file.originalname

            )

        );

    }

});


/* =====================================
   FILE FILTER
===================================== */

const fileFilter = (

    req,

    file,

    cb

) => {

    const allowedTypes =

        /jpeg|jpg|png|gif|webp|svg|ico/;


    const extension =

        allowedTypes.test(

            path.extname(

                file.originalname

            ).toLowerCase()

        );


    const mimeType =

        allowedTypes.test(

            file.mimetype

        );


    if (

        extension &&

        mimeType

    ) {

        cb(

            null,

            true

        );

    }

    else {

        cb(

            new Error(

                "Only image files are allowed."

            )

        );

    }

};


const uploadBranding = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:

            5 *

            1024 *

            1024

    }

});


module.exports = uploadBranding;
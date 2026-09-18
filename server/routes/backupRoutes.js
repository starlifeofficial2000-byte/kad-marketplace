const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const checkPermission = require("../middleware/checkPermission");

const backupController = require(
    "../controllers/backupController"
);

const multer = require("multer");
const path = require("path");
const fs = require("fs");


/* =====================================================
   BACKUP UPLOAD DIRECTORY
===================================================== */

const restoreDirectory = path.join(
    __dirname,
    "../temp/uploads"
);


if (!fs.existsSync(restoreDirectory)) {

    fs.mkdirSync(
        restoreDirectory,
        {
            recursive: true
        }
    );

}


/* =====================================================
   MULTER STORAGE
===================================================== */

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            restoreDirectory
        );

    },


    filename: (req, file, cb) => {

        const uniqueName =

            `${Date.now()}-${Math.round(
                Math.random() * 1E9
            )}`

            +

            path.extname(
                file.originalname
            );


        cb(
            null,
            uniqueName
        );

    }

});


/* =====================================================
   FILE VALIDATION
===================================================== */

const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedExtensions =

        /json|zip/;


    const extension =

        path.extname(
            file.originalname
        )
        .toLowerCase();


    if (

        allowedExtensions.test(
            extension
        )

    ) {

        cb(
            null,
            true
        );

    }

    else {

        cb(

            new Error(
                "Only JSON and ZIP backup files are allowed."
            ),

            false

        );

    }

};


/* =====================================================
   MULTER CONFIGURATION
===================================================== */

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:

            500 * 1024 * 1024

    }

});


/* =====================================================
   SECURITY MIDDLEWARE
===================================================== */

const protectBackupRoutes = [

    auth,

    admin,

    checkPermission(
        "manage_security"
    )

];


/* =====================================================
   EXPORT SETTINGS
===================================================== */

router.get(

    "/export-settings",

    ...protectBackupRoutes,

    backupController.exportSettings

);


/* =====================================================
   EXPORT DATABASE
===================================================== */

router.get(

    "/export-database",

    ...protectBackupRoutes,

    backupController.exportDatabase

);


/* =====================================================
   CREATE FULL BACKUP
===================================================== */

router.get(

    "/full-backup",

    ...protectBackupRoutes,

    backupController.createFullBackup

);


/* =====================================================
   RESTORE DATABASE
===================================================== */

router.post(

    "/restore-database",

    ...protectBackupRoutes,

    upload.single(
        "backup"
    ),

    backupController.restoreDatabase

);


/* =====================================================
   RESTORE FULL BACKUP
===================================================== */

router.post(

    "/restore-full",

    ...protectBackupRoutes,

    upload.single(
        "backup"
    ),

    backupController.restoreFullBackup

);


/* =====================================================
   MULTER ERROR HANDLER
===================================================== */

router.use(

    (
        error,
        req,
        res,
        next
    ) => {

        if (
            error instanceof multer.MulterError
        ) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }


        if (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message ||
                    "File upload error."

            });

        }


        next();

    }

);


module.exports = router;
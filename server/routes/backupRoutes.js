const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const checkPermission = require("../middleware/checkPermission");

const backupController = require("../controllers/backupController");

const multer = require("multer");
const path = require("path");
const fs = require("fs");


/* =====================================================
   RESTORE DIRECTORY
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

        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();

        const safeName =
            `backup-${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${extension}`;

        cb(
            null,
            safeName
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

    const extension =
        path.extname(
            file.originalname
        ).toLowerCase();

    const allowedExtensions = [
        ".json",
        ".zip"
    ];

    if (
        allowedExtensions.includes(
            extension
        )
    ) {

        return cb(
            null,
            true
        );

    }

    return cb(
        new Error(
            "Only JSON and ZIP backup files are allowed."
        ),
        false
    );

};


/* =====================================================
   MULTER CONFIGURATION
===================================================== */

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:
            500 * 1024 * 1024,

        files: 1

    }

});


/* =====================================================
   BACKUP SECURITY
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

    upload.single("backup"),

    backupController.restoreDatabase

);


/* =====================================================
   RESTORE FULL BACKUP
===================================================== */

router.post(

    "/restore-full",

    ...protectBackupRoutes,

    upload.single("backup"),

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
            error instanceof
            multer.MulterError
        ) {

            let message =
                error.message;

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                message =
                    "Backup file is too large. Maximum allowed size is 500 MB.";

            }

            if (
                error.code ===
                "LIMIT_FILE_COUNT"
            ) {

                message =
                    "Only one backup file can be uploaded at a time.";

            }

            return res.status(400).json({

                success: false,

                message

            });

        }


        if (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message ||
                    "Backup upload error."

            });

        }


        next();

    }

);


module.exports = router;
const express = require("express");

const router = express.Router();

/* =========================================================
   MIDDLEWARE
========================================================= */

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const checkPermission = require("../middleware/checkPermission");

const brandingUpload = require("../middleware/brandingUpload");
const importSettings = require("../middleware/importSettings");


/* =========================================================
   CONTROLLER
========================================================= */

const settingsController =
    require("../controllers/settingsController");


/* =========================================================
   CONTROLLER SAFETY
========================================================= */

const controllerHandler = (controller, name) => {

    if (typeof controller !== "function") {

        console.error(
            `SETTINGS ROUTE ERROR: ${name} is not a function`
        );

        return (req, res) => {

            return res.status(501).json({

                success: false,

                message:
                    `${name} controller is not implemented.`

            });

        };
    }

    return controller;
};


/* =========================================================
   CONTROLLER HANDLERS
========================================================= */

const getPublicSettings =
    controllerHandler(
        settingsController.getPublicSettings,
        "settingsController.getPublicSettings"
    );


const getSettings =
    controllerHandler(
        settingsController.getSettings,
        "settingsController.getSettings"
    );


const getSettingsByCategory =
    controllerHandler(
        settingsController.getSettingsByCategory,
        "settingsController.getSettingsByCategory"
    );


const saveSettings =
    controllerHandler(
        settingsController.saveSettings,
        "settingsController.saveSettings"
    );


const saveSingleSetting =
    controllerHandler(
        settingsController.saveSingleSetting,
        "settingsController.saveSingleSetting"
    );


const uploadLogo =
    controllerHandler(
        settingsController.uploadLogo,
        "settingsController.uploadLogo"
    );


const deleteBranding =
    controllerHandler(
        settingsController.deleteBranding,
        "settingsController.deleteBranding"
    );


const testEmail =
    controllerHandler(
        settingsController.testEmail,
        "settingsController.testEmail"
    );


const exportSettings =
    controllerHandler(
        settingsController.exportSettings,
        "settingsController.exportSettings"
    );


const importSettingsController =
    controllerHandler(
        settingsController.importSettings,
        "settingsController.importSettings"
    );


const deleteSetting =
    controllerHandler(
        settingsController.deleteSetting,
        "settingsController.deleteSetting"
    );


/* =========================================================
   PUBLIC SETTINGS
========================================================= */

/*
    GET /api/settings/public

    This endpoint MUST remain public.

    Used by:
    - Frontend SEO
    - Google Search Console verification
    - Dynamic favicon
    - Public marketplace branding
    - Public marketplace configuration
*/

router.get(
    "/public",
    getPublicSettings
);


/* =========================================================
   ADMIN SETTINGS
========================================================= */

/*
    GET /api/settings

    Administrator only.
*/

router.get(
    "/",
    auth,
    admin,
    checkPermission("manage_security"),
    getSettings
);


/* =========================================================
   SETTINGS BY CATEGORY
========================================================= */

/*
    GET /api/settings/category/:category
*/

router.get(
    "/category/:category",
    auth,
    admin,
    checkPermission("manage_security"),
    getSettingsByCategory
);


/* =========================================================
   UPDATE ALL SETTINGS
========================================================= */

/*
    PUT /api/settings
*/

router.put(
    "/",
    auth,
    admin,
    checkPermission("manage_security"),
    saveSettings
);


/* =========================================================
   UPDATE SINGLE SETTING
========================================================= */

/*
    POST /api/settings/single
*/

router.post(
    "/single",
    auth,
    admin,
    checkPermission("manage_security"),
    saveSingleSetting
);


/* =========================================================
   BRANDING UPLOAD
========================================================= */

/*
    POST /api/settings/upload-logo

    Form field:
    image
*/

router.post(
    "/upload-logo",
    auth,
    admin,
    checkPermission("manage_security"),
    brandingUpload.single("image"),
    uploadLogo
);


/* =========================================================
   DELETE BRANDING
========================================================= */

/*
    DELETE /api/settings/branding/:type

    Examples:
    /api/settings/branding/logo
    /api/settings/branding/favicon
    /api/settings/branding/admin_logo
*/

router.delete(
    "/branding/:type",
    auth,
    admin,
    checkPermission("manage_security"),
    deleteBranding
);


/* =========================================================
   TEST EMAIL
========================================================= */

/*
    POST /api/settings/test-email
*/

router.post(
    "/test-email",
    auth,
    admin,
    checkPermission("manage_security"),
    testEmail
);


/* =========================================================
   EXPORT SETTINGS
========================================================= */

/*
    GET /api/settings/export
*/

router.get(
    "/export",
    auth,
    admin,
    checkPermission("manage_security"),
    exportSettings
);


/* =========================================================
   IMPORT SETTINGS
========================================================= */

/*
    POST /api/settings/import

    Form field:
    settings
*/

router.post(
    "/import",
    auth,
    admin,
    checkPermission("manage_security"),
    importSettings.single("settings"),
    importSettingsController
);


/* =========================================================
   DELETE SINGLE SETTING
========================================================= */

/*
    DELETE /api/settings/:key

    IMPORTANT:
    This route is intentionally LAST.

    Otherwise a dynamic route could interfere with
    specific routes such as /public, /export, etc.
*/

router.delete(
    "/:key",
    auth,
    admin,
    checkPermission("manage_security"),
    deleteSetting
);


/* =========================================================
   EXPORT ROUTER
========================================================= */

module.exports = router;
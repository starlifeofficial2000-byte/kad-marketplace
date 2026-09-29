const express = require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const admin =
    require("../middleware/admin");

const checkPermission =
    require("../middleware/checkPermission");

const settingsController =
    require("../controllers/settingsController");

const brandingUpload =
    require("../middleware/brandingUpload");

const importSettings =
    require("../middleware/importSettings");


/* =========================================================
   PUBLIC SETTINGS
========================================================= */

router.get(
    "/public",
    settingsController.getPublicSettings
);


/* =========================================================
   ADMIN SETTINGS
========================================================= */

router.get(
    "/",
    auth,
    admin,
    checkPermission("manage_security"),
    settingsController.getSettings
);


/* =========================================================
   SETTINGS BY CATEGORY
========================================================= */

router.get(
    "/category/:category",
    auth,
    admin,
    checkPermission("manage_security"),
    settingsController.getSettingsByCategory
);


/* =========================================================
   UPDATE SETTINGS
========================================================= */

router.put(
    "/",
    auth,
    admin,
    checkPermission("manage_security"),
    settingsController.saveSettings
);


/* =========================================================
   UPDATE SINGLE SETTING
========================================================= */

router.post(
    "/single",
    auth,
    admin,
    checkPermission("manage_security"),
    settingsController.saveSingleSetting
);


/* =========================================================
   BRANDING UPLOAD
========================================================= */

router.post(
    "/upload-logo",
    auth,
    admin,
    checkPermission("manage_security"),
    brandingUpload.single("image"),
    settingsController.uploadLogo
);


/* =========================================================
   DELETE BRANDING
========================================================= */

router.delete(
    "/branding/:type",
    auth,
    admin,
    checkPermission("manage_security"),
    settingsController.deleteBranding
);


/* =========================================================
   TEST EMAIL
========================================================= */

router.post(
    "/test-email",
    auth,
    admin,
    checkPermission("manage_security"),
    settingsController.testEmail
);


/* =========================================================
   EXPORT
========================================================= */

router.get(
    "/export",
    auth,
    admin,
    checkPermission("manage_security"),
    settingsController.exportSettings
);


/* =========================================================
   IMPORT
========================================================= */

router.post(
    "/import",
    auth,
    admin,
    checkPermission("manage_security"),
    importSettings.single("settings"),
    settingsController.importSettings
);


/* =========================================================
   DELETE SETTING
========================================================= */

router.delete(
    "/:key",
    auth,
    admin,
    checkPermission("manage_security"),
    settingsController.deleteSetting
);


module.exports = router;
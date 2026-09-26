const express = require("express");

const router = express.Router();

const auth =
    require("../middleware/auth");

const admin =
    require("../middleware/admin");

const uploadBranding =
    require("../middleware/uploadBranding");

const controller =
    require("../controllers/adminSettingsController");


/* =========================================================
   GET MARKETPLACE SETTINGS
========================================================= */

router.get(
    "/",
    auth,
    admin,
    controller.getSettings
);


/* =========================================================
   UPDATE MARKETPLACE SETTINGS
========================================================= */

router.put(
    "/",
    auth,
    admin,
    controller.saveSettings
);


/* =========================================================
   BACKWARD COMPATIBILITY
========================================================= */

router.post(
    "/",
    auth,
    admin,
    controller.saveSettings
);


/* =========================================================
   UPLOAD BRANDING
========================================================= */

router.post(
    "/branding/upload",
    auth,
    admin,
    uploadBranding.single("file"),
    controller.uploadBranding
);


module.exports = router;
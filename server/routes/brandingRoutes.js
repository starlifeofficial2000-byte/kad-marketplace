const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const uploadBranding = require("../middleware/uploadBranding");

const brandingController = require(
    "../controllers/brandingController"
);

/*
=========================================================
   UPLOAD BRANDING
=========================================================
*/

router.post(
    "/upload",
    auth,
    admin,
    uploadBranding.single("image"),
    brandingController.uploadBranding
);

/*
=========================================================
   DELETE BRANDING
=========================================================
*/

router.delete(
    "/:type",
    auth,
    admin,
    brandingController.deleteBranding
);

module.exports = router;
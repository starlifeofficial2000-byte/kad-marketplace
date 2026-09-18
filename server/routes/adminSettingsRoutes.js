const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const controller = require("../controllers/adminSettingsController");

/* ==========================================
   GET SETTINGS
========================================== */

router.get(

    "/",

    auth,

    admin,

    controller.getSettings

);

/* ==========================================
   SAVE SETTINGS
========================================== */

router.post(

    "/",

    auth,

    admin,

    controller.saveSettings

);

module.exports = router;
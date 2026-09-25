const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const admin =
    require("../middleware/admin");

const controller =
    require("../controllers/adminSettingsController");


/*
=====================================================
 ADMIN MARKETPLACE SETTINGS
=====================================================
*/


/*
 GET SETTINGS
*/

router.get(
    "/",
    auth,
    admin,
    controller.getSettings
);


/*
 UPDATE SETTINGS
*/

router.put(
    "/",
    auth,
    admin,
    controller.saveSettings
);


/*
 BACKWARD COMPATIBILITY
*/

router.post(
    "/",
    auth,
    admin,
    controller.saveSettings
);


module.exports =
    router;
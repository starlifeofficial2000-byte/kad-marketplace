const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const controller = require("../controllers/adminNotificationController");

router.get(

    "/users",

    auth,

    admin,

    controller.getUsers

);

router.post(

    "/send",

    auth,

    admin,

    controller.sendNotification

);

module.exports = router;
const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const checkPermission =
    require("../middleware/checkPermission");

const auditLogController =
    require("../controllers/auditLogController");


router.get(

    "/",

    auth,

    admin,

    checkPermission("manage_security"),

    auditLogController.getAuditLogs

);


module.exports = router;
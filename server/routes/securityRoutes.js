const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const securityController =
    require("../controllers/securityController");


/* ==========================================
   SECURITY DASHBOARD
========================================== */

router.get(

    "/",

    auth,

    admin,

    securityController.getSecurityDashboard

);


/* ==========================================
   SECURITY ALERTS
========================================== */

router.get(

    "/alerts",

    auth,

    admin,

    securityController.getSecurityAlerts

);


module.exports = router;
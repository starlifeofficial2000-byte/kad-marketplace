const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
    getSecurityOverview
} = require("../controllers/adminSecurityController");


/* ==========================================
   SECURITY OVERVIEW
========================================== */

router.get(
    "/security/overview",
    auth,
    admin,
    getSecurityOverview
);


module.exports = router;
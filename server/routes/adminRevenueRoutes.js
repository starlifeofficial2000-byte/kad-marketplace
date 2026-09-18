const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const controller = require("../controllers/adminRevenueController");

router.get(

    "/revenue",

    auth,

    admin,

    controller.getRevenueDashboard

);
router.get(

"/revenue/chart",

auth,

admin,

controller.getRevenueChart

);
module.exports = router;
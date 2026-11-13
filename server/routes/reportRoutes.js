const express = require("express");

const router = express.Router();

const reportController = require("../controllers/reportController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.post(

    "/",

    auth,

    reportController.createReport

);

router.get("/admin",auth,admin,reportController.getAllReports);
router.put("/admin/:id",auth,admin,reportController.updateReport);
router.delete("/admin/:id",auth,admin,reportController.deleteReport);
module.exports = router;
const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const controller = require("../controllers/adminPaymentController");


/* ==========================================
   GET PAYMENT SUMMARY
========================================== */

router.get(
    "/payments/summary",
    auth,
    admin,
    controller.getPaymentSummary
);


/* ==========================================
   GET ALL PAYMENTS
========================================== */

router.get(
    "/payments",
    auth,
    admin,
    controller.getPayments
);


/* ==========================================
   GET SINGLE PAYMENT
   IMPORTANT: Dynamic route must be last
========================================== */

router.get(
    "/payments/:id",
    auth,
    admin,
    controller.getPayment
);


module.exports = router;
const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const paymentController = require("../controllers/paymentController");
console.log("initializePayment:", typeof paymentController.initializePayment);
console.log("verifyPayment:", typeof paymentController.verifyPayment);
console.log("createPayment:", typeof paymentController.createPayment);
console.log("getMyPayments:", typeof paymentController.getMyPayments);
console.log("getPayment:", typeof paymentController.getPayment);
console.log("getPaymentHistory:", typeof paymentController.getPaymentHistory);
console.log("deletePayment:", typeof paymentController.deletePayment);



/* ==========================================
   USER
========================================== */

router.post(

    "/initialize",

    auth,

    paymentController.initializePayment

);

router.get(

    "/verify/:reference",

    auth,

    paymentController.verifyPayment

);

router.post(

    "/create",

    auth,

    paymentController.createPayment

);

router.get(

    "/my-payments",

    auth,

    paymentController.getMyPayments

);

router.get(

    "/:id",

    auth,

    paymentController.getPayment

);

/* ==========================================
   ADMIN
========================================== */

router.get(

    "/history",

    auth,

    paymentController.getPaymentHistory

);

router.delete(

    "/:id",

    auth,

    paymentController.deletePayment

);

module.exports = router;
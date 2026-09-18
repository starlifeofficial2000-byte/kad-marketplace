const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const controller = require("../controllers/reviewController");

/* ==========================================
   CREATE REVIEW
========================================== */

router.post(

    "/",

    auth,

    controller.createReview

);

/* ==========================================
   GET PRODUCT REVIEWS
========================================== */

router.get(

    "/product/:productId",

    controller.getReviews

);

/* ==========================================
   REVIEW SUMMARY
========================================== */

router.get(

    "/product/:productId/summary",

    controller.getReviewSummary

);

/* ==========================================
   UPDATE REVIEW
========================================== */

router.put(

    "/:id",

    auth,

    controller.updateReview

);

/* ==========================================
   DELETE REVIEW
========================================== */

router.delete(

    "/:id",

    auth,

    controller.deleteReview

);

module.exports = router;
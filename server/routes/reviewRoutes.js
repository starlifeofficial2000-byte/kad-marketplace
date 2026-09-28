const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const controller = require("../controllers/reviewController");


/* =========================================================
   CREATE REVIEW
   POST /api/reviews
========================================================= */

router.post(
    "/",
    auth,
    controller.createReview
);


/* =========================================================
   GET PRODUCT REVIEWS
   GET /api/reviews/product/:productId
========================================================= */

router.get(
    "/product/:productId",
    controller.getReviews
);


/* =========================================================
   GET REVIEW SUMMARY
   GET /api/reviews/product/:productId/summary
========================================================= */

router.get(
    "/product/:productId/summary",
    controller.getReviewSummary
);


/* =========================================================
   UPDATE REVIEW
   PUT /api/reviews/:id
========================================================= */

router.put(
    "/:id",
    auth,
    controller.updateReview
);


/* =========================================================
   DELETE REVIEW
   DELETE /api/reviews/:id
========================================================= */

router.delete(
    "/:id",
    auth,
    controller.deleteReview
);


module.exports = router;
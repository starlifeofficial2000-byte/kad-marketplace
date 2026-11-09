const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const leadController = require(
    "../controllers/leadController"
);


/* ==========================================
   CREATE LEAD
========================================== */

router.post(

    "/",

    auth,

    leadController.createLead

);


/* ==========================================
   SELLER ANALYTICS

   MUST COME BEFORE /:id
========================================== */

router.get(

    "/seller/analytics",

    auth,

    leadController.getLeadAnalytics

);

router.get(
    "/seller/products-analytics",
    auth,
    leadController.getSellerProductAnalytics
);


/* ==========================================
   GET SELLER LEADS
========================================== */

router.get(

    "/seller",

    auth,

    leadController.getSellerLeads

);


/* ==========================================
   UPDATE LEAD
========================================== */

router.put(

    "/:id",

    auth,

    leadController.updateLeadStatus

);


/* ==========================================
   DELETE LEAD
========================================== */

router.delete(

    "/:id",

    auth,

    leadController.deleteLead

);


module.exports = router;
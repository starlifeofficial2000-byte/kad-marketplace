const express = require("express");

const router = express.Router();

const auth =
    require("../middleware/auth");

const promotionController =
    require("../controllers/promotionController");


/* ==========================================
   INITIALIZE PROMOTION
========================================== */

router.post(

    "/initialize",

    auth,

    promotionController.initializePromotion

);


/* ==========================================
   VERIFY PAYMENT
========================================== */

router.get(

    "/verify/:reference",

    auth,

    promotionController.verifyPromotion

);


/* ==========================================
   MY PROMOTION HISTORY
========================================== */

router.get(

    "/my-promotions",

    auth,

    promotionController.getMyPromotions

);


module.exports = router;
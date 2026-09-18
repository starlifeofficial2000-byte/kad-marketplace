const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const controller = require("../controllers/wishlistController");

/* ==========================================
   ADD TO WISHLIST
========================================== */

router.post(

    "/",

    auth,

    controller.addToWishlist

);

/* ==========================================
   GET MY WISHLIST
========================================== */

router.get(

    "/",

    auth,

    controller.getWishlist

);

/* ==========================================
   REMOVE FROM WISHLIST
========================================== */

router.delete(

    "/:productId",

    auth,

    controller.removeFromWishlist

);

/* ==========================================
   CHECK WISHLIST
========================================== */

router.get(

    "/check/:productId",

    auth,

    controller.checkWishlist

);

/* ==========================================
   WISHLIST COUNT
========================================== */

router.get(

    "/count",

    auth,

    controller.getWishlistCount

);

module.exports = router;
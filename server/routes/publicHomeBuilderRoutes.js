const express = require("express");

const router = express.Router();

const homeBuilderController =
    require("../controllers/homeBuilderController");


/* =====================================================
   PUBLIC HOMEPAGE ROUTES
===================================================== */


/* =====================================================
   HERO BANNERS
===================================================== */

router.get(
    "/banners",
    homeBuilderController.getPublicHeroBanners
);


/* =====================================================
   FEATURED PRODUCTS
===================================================== */

router.get(
    "/featured",
    homeBuilderController.getFeaturedProducts
);


/* =====================================================
   TRENDING PRODUCTS
===================================================== */

router.get(
    "/trending",
    homeBuilderController.getTrendingProducts
);


/* =====================================================
   RECOMMENDED PRODUCTS
===================================================== */

router.get(
    "/recommended",
    homeBuilderController.getRecommendedProducts
);


module.exports = router;
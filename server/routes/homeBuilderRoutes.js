const express = require("express");

const router = express.Router();

const homeBuilderController =
    require("../controllers/homeBuilderController");

/* =====================================================
   PUBLIC HOME BUILDER
===================================================== */

router.get(
    "/banners",
    homeBuilderController.getHeroBanners
);

router.get(
    "/featured",
    homeBuilderController.getPublicFeaturedProducts
);

router.get(
    "/trending",
    homeBuilderController.getPublicTrendingProducts
);

router.get(
    "/recommended",
    homeBuilderController.getPublicRecommendedProducts
);

module.exports = router;
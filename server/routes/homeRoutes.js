const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");

router.get("/hero", homeController.getHeroBanners);

router.get("/featured", homeController.getFeaturedProducts);

router.get("/trending", homeController.getTrendingProducts);

router.get("/recommended", homeController.getRecommendedProducts);

module.exports = router;
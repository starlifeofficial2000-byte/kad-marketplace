const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/upload");

const homeBuilderController =
    require("../controllers/homeBuilderController");


/* =====================================================
   ADMIN HOME BUILDER ROUTES
===================================================== */


/* =====================================================
   HERO BANNERS
===================================================== */

// Admin get all banners
router.get(

    "/banners",

    auth,

    admin,

    homeBuilderController.getAdminHeroBanners

);


// Create banner
router.post(

    "/banners",

    auth,

    admin,

    upload.single("image"),

    homeBuilderController.createHeroBanner

);


// Update banner
router.put(

    "/banners/:id",

    auth,

    admin,

    upload.single("image"),

    homeBuilderController.updateHeroBanner

);


// Delete banner
router.delete(

    "/banners/:id",

    auth,

    admin,

    homeBuilderController.deleteHeroBanner

);


// Pause / Resume banner
router.patch(

    "/banners/:id/status",

    auth,

    admin,

    homeBuilderController.toggleHeroBanner

);


// Reject banner
router.patch(

    "/banners/:id/reject",

    auth,

    admin,

    homeBuilderController.rejectHeroBanner

);


/* =====================================================
   ADMIN FEATURED PRODUCTS
===================================================== */

router.get(

    "/featured",

    auth,

    admin,

    homeBuilderController.getFeaturedProducts

);


/* =====================================================
   ADMIN TRENDING PRODUCTS
===================================================== */

router.get(

    "/trending",

    auth,

    admin,

    homeBuilderController.getTrendingProducts

);


/* =====================================================
   ADMIN RECOMMENDED / BOOSTED PRODUCTS
===================================================== */

router.get(

    "/recommended",

    auth,

    admin,

    homeBuilderController.getRecommendedProducts

);


/* =====================================================
   HOMEPAGE CONTROLS
===================================================== */

// Show / Hide product
router.patch(

    "/promotion/:id/visibility",

    auth,

    admin,

    homeBuilderController.toggleHomepageVisibility

);


// Change homepage order
router.patch(

    "/promotion/:id/order",

    auth,

    admin,

    homeBuilderController.updateHomepageOrder

);


module.exports = router;
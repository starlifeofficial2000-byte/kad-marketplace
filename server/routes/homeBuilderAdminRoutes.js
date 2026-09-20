const express = require("express");

const router = express.Router();

const auth =
    require("../middleware/auth");

const admin =
    require("../middleware/admin");

const upload =
    require("../middleware/upload");

const homeBuilderController =
    require("../controllers/homeBuilderController");

/* =====================================================
   ADMIN AUTHENTICATION
===================================================== */

router.use(auth);
router.use(admin);

/* =====================================================
   ADMIN HERO BANNERS
===================================================== */

router.get(
    "/banners",
    homeBuilderController.getAdminHeroBanners
);

router.post(
    "/banners",
    upload.single("image"),
    homeBuilderController.createHeroBanner
);

router.put(
    "/banners/:id",
    upload.single("image"),
    homeBuilderController.updateHeroBanner
);

router.delete(
    "/banners/:id",
    homeBuilderController.deleteHeroBanner
);

router.patch(
    "/banners/:id/status",
    homeBuilderController.toggleHeroBanner
);

router.patch(
    "/banners/:id/reject",
    homeBuilderController.rejectHeroBanner
);

/* =====================================================
   ADMIN HOMEPAGE PRODUCTS
===================================================== */

router.get(
    "/featured",
    homeBuilderController.getFeaturedProducts
);

router.get(
    "/trending",
    homeBuilderController.getTrendingProducts
);

router.get(
    "/recommended",
    homeBuilderController.getRecommendedProducts
);

/* =====================================================
   HOMEPAGE VISIBILITY
===================================================== */

router.patch(
    "/promotion/:id/visibility",
    homeBuilderController.toggleHomepageVisibility
);

/* =====================================================
   HOMEPAGE ORDER
===================================================== */

router.patch(
    "/promotion/:id/order",
    homeBuilderController.updateHomepageOrder
);

module.exports = router;
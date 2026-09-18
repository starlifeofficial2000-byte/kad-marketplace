const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const upload = require("../middleware/storeUpload");

const storeController = require("../controllers/storeController");


/* ==========================================
   DEBUG CONTROLLER FUNCTIONS
========================================== */

console.log("===== STORE CONTROLLER FUNCTIONS =====");

console.log({
    getMyStore: typeof storeController.getMyStore,
    updateStore: typeof storeController.updateStore,
    uploadLogo: typeof storeController.uploadLogo,
    uploadBanner: typeof storeController.uploadBanner,
    getPublicStore: typeof storeController.getPublicStore,
    getFeaturedStores: typeof storeController.getFeaturedStores,
    followStore: typeof storeController.followStore,
    unfollowStore: typeof storeController.unfollowStore,
    getStoreReviews: typeof storeController.getStoreReviews,
    getStoreProducts: typeof storeController.getStoreProducts
});


/* ==========================================
   MY STORE
========================================== */

router.get(
    "/my-store",
    auth,
    storeController.getMyStore
);


router.put(
    "/my-store",
    auth,
    storeController.updateStore
);


/* ==========================================
   STORE LOGO
========================================== */

router.post(
    "/upload-logo",
    auth,
    upload.single("logo"),
    storeController.uploadLogo
);


/* ==========================================
   STORE BANNER
========================================== */

router.post(
    "/upload-banner",
    auth,
    upload.single("banner"),
    storeController.uploadBanner
);


/* ==========================================
   FEATURED STORES

   MUST COME BEFORE /:storeSlug
========================================== */

router.get(
    "/featured",
    storeController.getFeaturedStores
);


/* ==========================================
   STORE FOLLOW
========================================== */

router.post(
    "/follow/:id",
    auth,
    storeController.followStore
);


router.delete(
    "/follow/:id",
    auth,
    storeController.unfollowStore
);


/* ==========================================
   STORE REVIEWS
========================================== */

router.get(
    "/reviews/:id",
    storeController.getStoreReviews
);


/* ==========================================
   STORE PRODUCTS
========================================== */

router.get(
    "/products/:id",
    storeController.getStoreProducts
);


/* ==========================================
   PUBLIC STORE

   MUST ALWAYS BE LAST
========================================== */

router.get(
    "/:storeSlug",
    storeController.getPublicStore
);


module.exports = router;
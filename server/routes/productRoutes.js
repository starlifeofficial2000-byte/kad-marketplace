const express = require("express");

const router = express.Router();

const productController =
    require("../controllers/productController");

const auth =
    require("../middleware/auth");

const upload =
    require("../middleware/upload");

const {
    uploadLimiter
} = require("../middleware/rateLimiter");


/* ==========================================
   CREATE PRODUCT
========================================== */

router.post(
    "/",
    auth,
    uploadLimiter,
    upload.array("images", 5),
    productController.createProduct
);


/* ==========================================
   PUBLIC PRODUCT ROUTES
========================================== */

router.get(
    "/search",
    productController.searchProducts
);

router.get(
    "/featured",
    productController.getFeaturedProducts
);

router.get(
    "/express",
    productController.getExpressProducts
);

router.get(
    "/trending",
    productController.getTrendingProducts
);

router.get(
    "/recommended",
    productController.getRecommendedProducts
);

router.get(
    "/related/:id",
    productController.getRelatedProducts
);


/* ==========================================
   AUTHENTICATED PRODUCT ROUTES
========================================== */

router.get(
    "/nearby",
    auth,
    productController.getNearbyProducts
);

router.get(
    "/seller/my-products",
    auth,
    productController.getMyProducts
);


/* ==========================================
   ALL PUBLIC PRODUCTS

   IMPORTANT:
   This must come after named routes.
========================================== */

router.get(
    "/",
    productController.getProducts
);


/* ==========================================
   PRODUCT ACTIONS
========================================== */

router.post(
    "/:id/view",
    productController.recordProductView
);

router.post(
    "/:id/share",
    productController.recordShare
);

router.post(
    "/:id/chat",
    auth,
    productController.recordChat
);

router.post(
    "/:id/wishlist",
    auth,
    productController.addToWishlist
);

router.delete(
    "/:id/wishlist",
    auth,
    productController.removeFromWishlist
);


/* ==========================================
   PROMOTIONS
========================================== */

router.post(
    "/:id/boost",
    auth,
    productController.boostProduct
);

router.post(
    "/:id/feature",
    auth,
    productController.featureProduct
);

router.post(
    "/:id/express",
    auth,
    productController.expressProduct
);


/* ==========================================
   UPDATE PRODUCT
========================================== */

router.put(
    "/:id",
    auth,
    upload.array("images", 5),
    productController.updateProduct
);


/* ==========================================
   DELETE PRODUCT
========================================== */

router.delete(
    "/:id",
    auth,
    productController.deleteProduct
);


/* ==========================================
   SINGLE PRODUCT

   MUST ALWAYS BE LAST
========================================== */

router.get(
    "/:id",
    productController.getProductById
);


module.exports = router;
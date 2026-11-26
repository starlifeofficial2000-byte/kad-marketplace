const express = require("express");

const router = express.Router();

const productController = require("../controllers/productController");
const auth = require("../middleware/auth");
const sellerProfileComplete = require("../middleware/sellerProfileComplete");
const upload = require("../middleware/upload");

const { uploadLimiter } = require("../middleware/rateLimiter");

/* ==========================================
   CREATE PRODUCT
   Product images receive the KAD watermark.
========================================== */

router.post(
    "/",
    auth,
    sellerProfileComplete,
    uploadLimiter,
    upload.array("images", 5, {
        watermark: true
    }),
    productController.createProduct
);

/* ==========================================
   PUBLIC PRODUCT ROUTES
========================================== */

router.get("/search", productController.searchProducts);

router.get("/featured", productController.getFeaturedProducts);

router.get("/express", productController.getExpressProducts);

router.get("/trending", productController.getTrendingProducts);

router.get("/recommended", productController.getRecommendedProducts);

router.get("/related/:id", productController.getRelatedProducts);

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

   Keep this after the named public routes.
========================================== */

router.get("/", productController.getProducts);

/* ==========================================
   PRODUCT ACTIONS
========================================== */

router.post("/:id/view", productController.recordProductView);

router.post("/:id/share", productController.recordShare);

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
   SELLER AVAILABILITY STATUS
========================================== */

router.patch(
    "/:id/seller-status",
    auth,
    productController.changeProductStatus
);

/* ==========================================
   UPDATE PRODUCT
   Newly uploaded product images receive
   the KAD watermark.
========================================== */

router.put(
    "/:id",
    auth,
    sellerProfileComplete,
    upload.array("images", 5, {
        watermark: true
    }),
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
   Keep this route last to avoid intercepting
   named routes such as /search or /featured.
========================================== */

router.get("/:id", productController.getProductById);

module.exports = router;

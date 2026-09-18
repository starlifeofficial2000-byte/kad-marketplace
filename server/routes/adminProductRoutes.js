const express = require("express");

const router = express.Router();

const auth =
    require("../middleware/auth");

const admin =
    require("../middleware/admin");

const controller =
    require("../controllers/adminProductController");


/* ==========================================
   GET ALL PRODUCTS
========================================== */

router.get(

    "/products",

    auth,

    admin,

    controller.getProducts

);


/* ==========================================
   GET PENDING PRODUCTS

   IMPORTANT:
   Must come before /products/:id
========================================== */

router.get(

    "/products/pending",

    auth,

    admin,

    controller.getPendingProducts

);


/* ==========================================
   GET SINGLE PRODUCT
========================================== */

router.get(

    "/products/:id",

    auth,

    admin,

    controller.getProduct

);


/* ==========================================
   APPROVE PRODUCT
========================================== */

router.put(

    "/products/:id/approve",

    auth,

    admin,

    controller.approveProduct

);


/* ==========================================
   REJECT PRODUCT
========================================== */

router.put(

    "/products/:id/reject",

    auth,

    admin,

    controller.rejectProduct

);


/* ==========================================
   DELETE PRODUCT
========================================== */

router.delete(

    "/products/:id",

    auth,

    admin,

    controller.deleteProduct

);


module.exports = router;
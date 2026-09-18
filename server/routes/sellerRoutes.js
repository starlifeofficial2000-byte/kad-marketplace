const express = require("express");

const router = express.Router();
const auth = require("../middleware/auth");
const sellerController = require("../controllers/sellerController");


router.get("/dashboard", auth, sellerController.getDashboard);

router.get("/products", auth, sellerController.getMyProducts);

module.exports = router;
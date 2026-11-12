const express = require("express");
const router = express.Router();
const controller = require("../controllers/categoryController");

// Public read-only endpoint used by the marketplace and admin category picker.
router.get("/", controller.getCategories);

module.exports = router;

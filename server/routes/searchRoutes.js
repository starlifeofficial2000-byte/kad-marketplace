const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const searchController = require("../controllers/searchController");

router.post(

    "/save",

    auth,

    searchController.saveSearch

);

module.exports = router;
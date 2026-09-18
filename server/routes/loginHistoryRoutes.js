const express = require("express");

const router = express.Router();

const auth = require(
    "../middleware/auth"
);

const loginHistoryController = require(
    "../controllers/loginHistoryController"
);


/* GET CURRENT USER LOGIN HISTORY */

router.get(

    "/my-history",

    auth,

    loginHistoryController.getMyLoginHistory

);


/* GET SPECIFIC USER LOGIN HISTORY */

router.get(

    "/user/:userId",

    auth,

    loginHistoryController.getUserLoginHistory

);


module.exports = router;
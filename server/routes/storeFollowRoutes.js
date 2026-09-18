const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const storeFollowController = require("../controllers/storeFollowController");

router.post(
    "/follow",
    auth,
    storeFollowController.followStore
);

router.delete(
    "/unfollow",
    auth,
    storeFollowController.unfollowStore
);

router.get(
    "/status/:storeId",
    auth,
    storeFollowController.checkFollowStatus
);

module.exports = router;
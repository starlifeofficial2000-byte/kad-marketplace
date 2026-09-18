const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const controller = require("../controllers/adminStoreController");

router.get(
    "/stores",
    auth,
    admin,
    controller.getStores
);

router.put(
    "/stores/:id/verify",
    auth,
    admin,
    controller.verifyStore
);

router.put(
    "/stores/:id/suspend",
    auth,
    admin,
    controller.suspendStore
);

router.delete(
    "/stores/:id",
    auth,
    admin,
    controller.deleteStore
);
router.put(
    "/stores/:id/activate",
    auth,
    admin,
    controller.activateStore
);router.get(

    "/stores/:id",

    auth,

    admin,

    controller.getStore

);

module.exports = router;
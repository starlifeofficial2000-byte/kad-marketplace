const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/upload");

const controller =
    require("../controllers/advertisementController");


/* PUBLIC RUNNING ADVERTISEMENTS */

router.get(
    "/active",
    controller.getAdvertisements
);


/* PUBLIC APPROVED/RUNNING ADS */

router.get(
    "/approved",
    controller.getApprovedAdvertisements
);


/* ADMIN / ALL MANAGEMENT ROUTES */

router.post(
    "/",
    auth,
    admin,
    upload.single("image"),
    controller.createAdvertisement
);


router.put(
    "/:id",
    auth,
    admin,
    upload.single("image"),
    controller.updateAdvertisement
);


router.delete(
    "/:id",
    auth,
    admin,
    controller.deleteAdvertisement
);


module.exports = router;
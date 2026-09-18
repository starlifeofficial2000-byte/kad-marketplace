const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
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
    upload.single("image"),
    controller.createAdvertisement
);


router.put(
    "/:id",
    auth,
    upload.single("image"),
    controller.updateAdvertisement
);


router.delete(
    "/:id",
    auth,
    controller.deleteAdvertisement
);


module.exports = router;
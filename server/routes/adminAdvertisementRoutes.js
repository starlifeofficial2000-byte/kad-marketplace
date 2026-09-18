const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const controller = require("../controllers/adminAdvertisementController");

/* ==========================================
   GET ALL ADVERTISEMENTS
========================================== */

router.get(
    "/advertisements",
    auth,
    admin,
    controller.getAdvertisements
);

/* ==========================================
   APPROVE ADVERTISEMENT
========================================== */

router.put(
    "/advertisements/:id/approve",
    auth,
    admin,
    controller.approveAdvertisement
);

/* ==========================================
   REJECT ADVERTISEMENT
========================================== */

router.put(
    "/advertisements/:id/reject",
    auth,
    admin,
    controller.rejectAdvertisement
);

/* ==========================================
   PAUSE ADVERTISEMENT
========================================== */

router.put(
    "/advertisements/:id/pause",
    auth,
    admin,
    controller.pauseAdvertisement
);

/* ==========================================
   RESUME ADVERTISEMENT
========================================== */

router.put(
    "/advertisements/:id/resume",
    auth,
    admin,
    controller.resumeAdvertisement
);

/* ==========================================
   DELETE ADVERTISEMENT
========================================== */

router.delete(
    "/advertisements/:id",
    auth,
    admin,
    controller.deleteAdvertisement
);
router.get(

"/advertisements/analytics",

auth,

admin,

controller.getAdvertisementAnalytics

);
module.exports = router;
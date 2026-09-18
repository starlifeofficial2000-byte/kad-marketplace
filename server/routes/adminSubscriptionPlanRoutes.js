const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const controller = require("../controllers/adminSubscriptionPlanController");

/* ==========================================
   GET ALL PLANS
========================================== */

router.get(
    "/subscription-plans",
    auth,
    admin,
    controller.getPlans
);

/* ==========================================
   GET SINGLE PLAN
========================================== */

router.get(
    "/subscription-plans/:id",
    auth,
    admin,
    controller.getPlan
);

/* ==========================================
   CREATE PLAN
========================================== */

router.post(
    "/subscription-plans",
    auth,
    admin,
    controller.createPlan
);

/* ==========================================
   UPDATE PLAN
========================================== */

router.put(
    "/subscription-plans/:id",
    auth,
    admin,
    controller.updatePlan
);

/* ==========================================
   ACTIVATE PLAN
========================================== */

router.put(
    "/subscription-plans/:id/activate",
    auth,
    admin,
    controller.activatePlan
);

/* ==========================================
   SUSPEND PLAN
========================================== */

router.put(
    "/subscription-plans/:id/suspend",
    auth,
    admin,
    controller.suspendPlan
);

/* ==========================================
   DELETE PLAN
========================================== */

router.delete(
    "/subscription-plans/:id",
    auth,
    admin,
    controller.deletePlan
);

module.exports = router;
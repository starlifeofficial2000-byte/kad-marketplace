const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const subscriptionPlanController = require(
    "../controllers/subscriptionPlanController"
);


/* ==========================================
   DEBUG
========================================== */

console.log(
    "SUBSCRIPTION PLAN CONTROLLER:",
    subscriptionPlanController
);


/* ==========================================
   GET ALL PLANS
========================================== */

router.get(
    "/",
    auth,
    admin,
    subscriptionPlanController.getPlans
);


/* ==========================================
   GET SINGLE PLAN
========================================== */

router.get(
    "/:id",
    auth,
    admin,
    subscriptionPlanController.getPlan
);


/* ==========================================
   CREATE PLAN
========================================== */

router.post(
    "/",
    auth,
    admin,
    subscriptionPlanController.createPlan
);


/* ==========================================
   UPDATE PLAN
========================================== */

router.put(
    "/:id",
    auth,
    admin,
    subscriptionPlanController.updatePlan
);


/* ==========================================
   TOGGLE PLAN STATUS
   Active ↔ Suspended
========================================== */

router.put(
    "/:id/toggle",
    auth,
    admin,
    subscriptionPlanController.togglePlan
);


/* ==========================================
   DELETE PLAN
========================================== */

router.delete(
    "/:id",
    auth,
    admin,
    subscriptionPlanController.deletePlan
);


module.exports = router;
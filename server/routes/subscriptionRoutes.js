const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const subscriptionController = require(
    "../controllers/subscriptionController"
);


/* GET AVAILABLE PLANS */

router.get(

    "/plans",

    auth,

    subscriptionController.getPlans

);


/* GET USER SUBSCRIPTION */

router.get(

    "/my-subscription",

    auth,

    subscriptionController.getMySubscription

);


/* GET SUBSCRIPTION STATUS */

router.get(

    "/status",

    auth,

    subscriptionController.getSubscriptionStatus

);


/* SUBSCRIBE TO PLAN */

router.post(

    "/subscribe/:planId",

    auth,

    subscriptionController.subscribeToPlan

);


/* CANCEL SUBSCRIPTION */

router.put(

    "/cancel",

    auth,

    subscriptionController.cancelSubscription

);


/* SUBSCRIPTION HISTORY */

router.get(

    "/history",

    auth,

    subscriptionController.subscriptionHistory

);


module.exports = router;
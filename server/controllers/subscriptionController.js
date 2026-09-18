const {
    Subscription,
    SubscriptionPlan
} = require("../models");


/* =====================================================
   HELPER: VALIDATE AUTHENTICATED USER
===================================================== */

const getAuthenticatedUserId = (req) => {

    if (!req.user || !req.user.id) {
        return null;
    }

    return Number(req.user.id);

};


/* =====================================================
   HELPER: CALCULATE DAYS LEFT
===================================================== */

const calculateDaysLeft = (endDate) => {

    const now = new Date();

    const end = new Date(endDate);

    const difference = end.getTime() - now.getTime();

    return Math.max(
        0,
        Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        )
    );

};


/* =====================================================
   HELPER: FORMAT PLAN
===================================================== */

const formatPlan = (plan) => {

    if (!plan) {
        return null;
    }

    return {

        id: plan.id,

        name: plan.name,

        price: Number(plan.price || 0),

        duration: Number(plan.duration || 0),

        maxProducts: Number(plan.maxProducts || 0),

        boostCredits: Number(plan.boostCredits || 0),

        featuredCredits: Number(plan.featuredCredits || 0),

        expressCredits: Number(plan.expressCredits || 0),

        description: plan.description || "",

        features: Array.isArray(plan.features)
            ? plan.features
            : [],

        isActive: Boolean(plan.isActive)

    };

};


/* =====================================================
   HELPER: FORMAT SUBSCRIPTION
===================================================== */

const formatSubscription = (subscription) => {

    if (!subscription) {
        return null;
    }

    const plan = subscription.subscriptionPlan;

    return {

        id: subscription.id,

        userId: subscription.userId,

        subscriptionPlanId:
            subscription.subscriptionPlanId,

        status: subscription.status,

        startDate: subscription.startDate,

        endDate: subscription.endDate,

        daysLeft:
            calculateDaysLeft(subscription.endDate),


        /* =============================================
           PLAN DETAILS
        ============================================= */

        plan:
            formatPlan(plan),


        /* =============================================
           USAGE DETAILS
        ============================================= */

        usage: {

            uploadsUsed:
                Number(subscription.uploadsUsed || 0),

            boostsUsed:
                Number(subscription.boostsUsed || 0),

            featuredUsed:
                Number(subscription.featuredUsed || 0),

            expressUsed:
                Number(subscription.expressUsed || 0)

        }

    };

};


/* =====================================================
   HELPER: GET LATEST ACTIVE SUBSCRIPTION
===================================================== */

const getActiveSubscription = async (userId) => {

    const subscription =
        await Subscription.findOne({

            where: {

                userId,

                status: "active"

            },

            include: [

                {

                    model: SubscriptionPlan,

                    as: "subscriptionPlan",

                    required: false

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });


    if (!subscription) {
        return null;
    }


    /* =============================================
       CHECK EXPIRATION
    ============================================= */

    const now = new Date();

    const endDate =
        new Date(subscription.endDate);


    if (endDate <= now) {

        await subscription.update({

            status: "expired"

        });

        return null;

    }


    return subscription;

};


/* =====================================================
   GET AVAILABLE SUBSCRIPTION PLANS
===================================================== */

const getPlans = async (req, res) => {

    try {

        const plans =
            await SubscriptionPlan.findAll({

                where: {

                    isActive: true

                },

                order: [

                    ["price", "ASC"]

                ]

            });


        return res.status(200).json({

            success: true,

            plans:
                plans.map(formatPlan)

        });

    }

    catch (error) {

        console.error(
            "GET SUBSCRIPTION PLANS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch subscription plans."

        });

    }

};


/* =====================================================
   GET LOGGED-IN USER'S SUBSCRIPTION
===================================================== */

const getMySubscription = async (req, res) => {

    try {

        console.log(
            "========================================"
        );

        console.log(
            "GET MY SUBSCRIPTION REQUEST"
        );


        const userId =
            getAuthenticatedUserId(req);


        console.log(
            "USER ID:",
            userId
        );


        /* =============================================
           VALIDATE USER
        ============================================= */

        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Unauthorized user."

            });

        }


        /* =============================================
           GET ACTIVE SUBSCRIPTION
        ============================================= */

        const subscription =
            await getActiveSubscription(userId);


        /* =============================================
           NO SUBSCRIPTION
        ============================================= */

        if (!subscription) {

            console.log(
                "NO ACTIVE SUBSCRIPTION FOUND"
            );


            return res.status(200).json({

                success: true,

                hasSubscription: false,

                subscription: null,

                message:
                    "You do not have an active subscription."

            });

        }


        /* =============================================
           PLAN VALIDATION
        ============================================= */

        if (
            !subscription.subscriptionPlanId
        ) {

            console.warn(
                "SUBSCRIPTION HAS NO PLAN ID:",
                subscription.id
            );

        }


        if (
            !subscription.subscriptionPlan
        ) {

            console.warn(
                "SUBSCRIPTION PLAN NOT FOUND FOR:",
                subscription.subscriptionPlanId
            );

        }


        /* =============================================
           FORMAT DATA
        ============================================= */

        const formattedSubscription =
            formatSubscription(subscription);


        console.log(
            "ACTIVE SUBSCRIPTION FOUND:"
        );

        console.log(
            JSON.stringify(
                formattedSubscription,
                null,
                2
            )
        );


        return res.status(200).json({

            success: true,

            hasSubscription: true,

            subscription:
                formattedSubscription

        });

    }

    catch (error) {

        console.error(
            "GET MY SUBSCRIPTION ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to fetch subscription."

        });

    }

};


/* =====================================================
   GET SUBSCRIPTION STATUS
===================================================== */

const getSubscriptionStatus = async (req, res) => {

    try {

        const userId =
            getAuthenticatedUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Unauthorized user."

            });

        }


        const subscription =
            await getActiveSubscription(userId);


        /* =============================================
           NO ACTIVE SUBSCRIPTION
        ============================================= */

        if (!subscription) {

            return res.status(200).json({

                success: true,

                active: false,

                hasSubscription: false,

                subscription: null

            });

        }


        const formattedSubscription =
            formatSubscription(subscription);


        return res.status(200).json({

            success: true,

            active: true,

            hasSubscription: true,

            subscription:
                formattedSubscription

        });

    }

    catch (error) {

        console.error(
            "GET SUBSCRIPTION STATUS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to fetch subscription status."

        });

    }

};


/* =====================================================
   SUBSCRIBE TO PLAN
===================================================== */

const subscribeToPlan = async (req, res) => {

    try {

        const userId =
            getAuthenticatedUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Unauthorized user."

            });

        }


        const planId =
            Number(req.params.planId);


        /* =============================================
           VALIDATE PLAN ID
        ============================================= */

        if (!planId || planId <= 0) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid subscription plan."

            });

        }


        /* =============================================
           FIND PLAN
        ============================================= */

        const plan =
            await SubscriptionPlan.findOne({

                where: {

                    id: planId,

                    isActive: true

                }

            });


        if (!plan) {

            return res.status(404).json({

                success: false,

                message:
                    "Subscription plan not found or inactive."

            });

        }


        /* =============================================
           CANCEL ALL OLD ACTIVE SUBSCRIPTIONS
        ============================================= */

        await Subscription.update(

            {

                status: "cancelled"

            },

            {

                where: {

                    userId,

                    status: "active"

                }

            }

        );


        /* =============================================
           CREATE DATES
        ============================================= */

        const startDate =
            new Date();


        const endDate =
            new Date();


        endDate.setDate(

            endDate.getDate() +

            Number(plan.duration)

        );


        /* =============================================
           CREATE NEW SUBSCRIPTION
        ============================================= */

        const subscription =
            await Subscription.create({

                userId,

                subscriptionPlanId:
                    plan.id,

                status:
                    "active",

                startDate,

                endDate,

                uploadsUsed:
                    0,

                boostsUsed:
                    0,

                featuredUsed:
                    0,

                expressUsed:
                    0

            });


        /* =============================================
           RELOAD WITH PLAN
        ============================================= */

        const completeSubscription =
            await Subscription.findByPk(

                subscription.id,

                {

                    include: [

                        {

                            model:
                                SubscriptionPlan,

                            as:
                                "subscriptionPlan"

                        }

                    ]

                }

            );


        return res.status(201).json({

            success: true,

            message:
                "Subscription activated successfully.",

            subscription:
                formatSubscription(
                    completeSubscription
                )

        });

    }

    catch (error) {

        console.error(
            "SUBSCRIBE TO PLAN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to activate subscription."

        });

    }

};


/* =====================================================
   CANCEL SUBSCRIPTION
===================================================== */

const cancelSubscription = async (req, res) => {

    try {

        const userId =
            getAuthenticatedUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Unauthorized user."

            });

        }


        const subscription =
            await Subscription.findOne({

                where: {

                    userId,

                    status:
                        "active"

                },

                order: [

                    ["createdAt", "DESC"]

                ]

            });


        if (!subscription) {

            return res.status(404).json({

                success: false,

                message:
                    "No active subscription found."

            });

        }


        await subscription.update({

            status:
                "cancelled"

        });


        return res.status(200).json({

            success: true,

            message:
                "Subscription cancelled successfully."

        });

    }

    catch (error) {

        console.error(
            "CANCEL SUBSCRIPTION ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to cancel subscription."

        });

    }

};


/* =====================================================
   SUBSCRIPTION HISTORY
===================================================== */

const subscriptionHistory = async (req, res) => {

    try {

        const userId =
            getAuthenticatedUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Unauthorized user."

            });

        }


        const subscriptions =
            await Subscription.findAll({

                where: {

                    userId

                },

                include: [

                    {

                        model:
                            SubscriptionPlan,

                        as:
                            "subscriptionPlan",

                        required:
                            false

                    }

                ],

                order: [

                    ["createdAt", "DESC"]

                ]

            });


        return res.status(200).json({

            success: true,

            subscriptions:
                subscriptions.map(
                    formatSubscription
                )

        });

    }

    catch (error) {

        console.error(
            "SUBSCRIPTION HISTORY ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to fetch subscription history."

        });

    }

};


/* =====================================================
   EXPORT CONTROLLER FUNCTIONS
===================================================== */

module.exports = {

    getPlans,

    getMySubscription,

    getSubscriptionStatus,

    subscribeToPlan,

    cancelSubscription,

    subscriptionHistory

};
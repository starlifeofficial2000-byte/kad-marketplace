const Payment = require("../models/Payment");
const Subscription = require("../models/Subscription");
const SubscriptionPlan = require("../models/SubscriptionPlan");

const axios = require("axios");
const { v4: uuidv4 } = require("uuid");


/* ============================================================
   PAYSTACK CONFIGURATION
============================================================ */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_CALLBACK = process.env.PAYSTACK_CALLBACK;


/* ============================================================
   GET ACTIVE PLAN
============================================================ */

async function getPlan(planId) {

    if (!planId) {
        return null;
    }

    const plan = await SubscriptionPlan.findOne({

        where: {
            id: Number(planId),
            isActive: true
        }

    });

    return plan;
}


/* ============================================================
   INITIALIZE PAYMENT
============================================================ */

exports.initializePayment = async (req, res) => {

    try {

        console.log("========================================");
        console.log("PAYMENT INITIALIZATION STARTED");
        console.log("USER:", req.user);
        console.log("BODY:", req.body);
        console.log("========================================");


        /* ----------------------------------------
           VALIDATE USER
        ----------------------------------------- */

        if (!req.user?.id) {

            return res.status(401).json({

                success: false,
                message: "Unauthorized user."

            });

        }


        const { planId } = req.body;


        /* ----------------------------------------
           VALIDATE PLAN
        ----------------------------------------- */

        if (!planId) {

            return res.status(400).json({

                success: false,
                message: "Subscription plan ID is required."

            });

        }


        /* ----------------------------------------
           CHECK PAYSTACK
        ----------------------------------------- */

        if (!PAYSTACK_SECRET_KEY) {

            console.error("PAYSTACK_SECRET_KEY IS MISSING");

            return res.status(500).json({

                success: false,
                message: "Payment gateway configuration is missing."

            });

        }


        /* ----------------------------------------
           GET PLAN
        ----------------------------------------- */

        const plan = await getPlan(planId);


        if (!plan) {

            return res.status(404).json({

                success: false,
                message: "Subscription plan not found or inactive."

            });

        }


        console.log("SELECTED PLAN:", plan.toJSON());


        /* ----------------------------------------
           GENERATE PAYMENT REFERENCE
        ----------------------------------------- */

        const reference =
            `SUB-${Date.now()}-${uuidv4().substring(0, 8)}`;


        /* ----------------------------------------
           CREATE PAYMENT RECORD
        ----------------------------------------- */

        const payment = await Payment.create({

            userId: req.user.id,

            planId: plan.id,

            planName: plan.name,

            amount: Number(plan.price),

            currency: "GHS",

            reference,

            paymentMethod: "Paystack",

            status: "Pending"

        });


        console.log("PAYMENT CREATED:", payment.toJSON());


        /* ----------------------------------------
           CONVERT TO PESEWAS
        ----------------------------------------- */

        const amountInPesewas =
            Math.round(Number(plan.price) * 100);


        /* ----------------------------------------
           PAYSTACK INITIALIZATION
        ----------------------------------------- */

        const response = await axios.post(

            "https://api.paystack.co/transaction/initialize",

            {

                email: req.user.email,

                amount: amountInPesewas,

                currency: "GHS",

                reference,

                callback_url: PAYSTACK_CALLBACK,

                metadata: {

                    userId: req.user.id,

                    planId: plan.id,

                    planName: plan.name,

                    paymentType: "subscription"

                }

            },

            {

                headers: {

                    Authorization:
                        `Bearer ${PAYSTACK_SECRET_KEY}`,

                    "Content-Type":
                        "application/json"

                }

            }

        );


        console.log(
            "PAYSTACK RESPONSE:",
            response.data
        );


        /* ----------------------------------------
           VALIDATE PAYSTACK RESPONSE
        ----------------------------------------- */

        if (

            !response.data?.status ||

            !response.data?.data?.authorization_url

        ) {

            return res.status(500).json({

                success: false,

                message:
                    "Paystack authorization URL was not received."

            });

        }


        /* ----------------------------------------
           SUCCESS RESPONSE
        ----------------------------------------- */

        return res.status(200).json({

            success: true,

            message:
                "Payment initialized successfully.",

            authorization_url:
                response.data.data.authorization_url,

            access_code:
                response.data.data.access_code,

            reference

        });

    }

    catch (error) {

        console.error(
            "PAYMENT INITIALIZATION ERROR:",
            error.response?.data || error.message
        );


        return res.status(500).json({

            success: false,

            message:
                error.response?.data?.message ||
                error.message ||
                "Payment initialization failed."

        });

    }

};


/* ============================================================
   VERIFY PAYMENT
============================================================ */

exports.verifyPayment = async (req, res) => {

    try {

        console.log("========================================");
        console.log("PAYMENT VERIFICATION STARTED");
        console.log("REFERENCE:", req.params.reference);
        console.log("USER:", req.user);
        console.log("========================================");


        /* ----------------------------------------
           VALIDATE USER
        ----------------------------------------- */

        if (!req.user?.id) {

            return res.status(401).json({

                success: false,
                message: "Unauthorized user."

            });

        }


        const { reference } = req.params;


        /* ----------------------------------------
           VALIDATE REFERENCE
        ----------------------------------------- */

        if (!reference) {

            return res.status(400).json({

                success: false,
                message: "Payment reference is required."

            });

        }


        /* ----------------------------------------
           FIND PAYMENT
        ----------------------------------------- */

        const payment = await Payment.findOne({

            where: {
                reference
            }

        });


        if (!payment) {

            return res.status(404).json({

                success: false,
                message: "Payment record not found."

            });

        }


        /* ----------------------------------------
           SECURITY CHECK
        ----------------------------------------- */

        if (

            Number(payment.userId) !==
            Number(req.user.id)

        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not authorized to verify this payment."

            });

        }


        console.log(
            "PAYMENT FOUND:",
            payment.toJSON()
        );


        /* =====================================================
           GET PLAN FIRST
        ===================================================== */

        const plan = await SubscriptionPlan.findByPk(
            payment.planId
        );


        if (!plan) {

            return res.status(404).json({

                success: false,

                message:
                    "Subscription plan no longer exists."

            });

        }


        /* =====================================================
           IF PAYMENT ALREADY VERIFIED
        ===================================================== */

        if (payment.status === "Successful") {

            const existingSubscription =
                await Subscription.findOne({

                    where: {

                        userId: payment.userId,

                        subscriptionPlanId: plan.id

                    },

                    include: [

                        {

                            model: SubscriptionPlan,

                            as: "subscriptionPlan"

                        }

                    ],

                    order: [
                        ["createdAt", "DESC"]
                    ]

                });


            return res.status(200).json({

                success: true,

                alreadyVerified: true,

                message:
                    "Payment has already been verified successfully.",

                subscription:
                    existingSubscription

            });

        }


        /* =====================================================
           VERIFY WITH PAYSTACK
        ===================================================== */

        if (!PAYSTACK_SECRET_KEY) {

            return res.status(500).json({

                success: false,

                message:
                    "Paystack configuration is missing."

            });

        }


        const paystackResponse = await axios.get(

            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,

            {

                headers: {

                    Authorization:
                        `Bearer ${PAYSTACK_SECRET_KEY}`

                }

            }

        );


        console.log(
            "PAYSTACK VERIFICATION:",
            paystackResponse.data
        );


        const paystackData =
            paystackResponse.data?.data;


        /* ----------------------------------------
           VERIFY STATUS
        ----------------------------------------- */

        if (

            !paystackResponse.data?.status ||

            !paystackData ||

            paystackData.status !== "success"

        ) {

            payment.status = "Failed";

            await payment.save();


            return res.status(400).json({

                success: false,

                message:
                    "Payment was not successful."

            });

        }


        /* ----------------------------------------
           VERIFY AMOUNT
        ----------------------------------------- */

        const expectedAmount =
            Math.round(Number(payment.amount) * 100);


        if (

            Number(paystackData.amount) !==
            expectedAmount

        ) {

            console.error(
                "PAYMENT AMOUNT MISMATCH"
            );

            console.log(
                "Expected:",
                expectedAmount
            );

            console.log(
                "Received:",
                paystackData.amount
            );


            return res.status(400).json({

                success: false,

                message:
                    "Payment amount verification failed."

            });

        }


        /* =====================================================
           MARK PAYMENT SUCCESSFUL
        ===================================================== */

        payment.status = "Successful";

        payment.paymentMethod = "Paystack";

        payment.paidAt = new Date();

        await payment.save();


        console.log(
            "PAYMENT MARKED SUCCESSFUL"
        );


        /* =====================================================
           CALCULATE SUBSCRIPTION DATES
        ===================================================== */

        const startDate = new Date();

        const endDate = new Date();

        endDate.setDate(

            startDate.getDate() +

            Number(plan.duration || 30)

        );


        /* =====================================================
           FIND CURRENT SUBSCRIPTION

           IMPORTANT:
           We only look for the user's latest subscription.
        ===================================================== */

        let subscription =
            await Subscription.findOne({

                where: {

                    userId: payment.userId

                },

                order: [

                    ["createdAt", "DESC"]

                ]

            });


        /* =====================================================
           CORRECT SUBSCRIPTION DATA

           ONLY fields that exist in Subscription.js
        ===================================================== */

        const subscriptionData = {

            subscriptionPlanId: plan.id,

            status: "active",

            startDate,

            endDate,

            uploadsUsed: 0,

            boostsUsed: 0,

            featuredUsed: 0,

            expressUsed: 0

        };


        /* =====================================================
           UPDATE EXISTING SUBSCRIPTION
        ===================================================== */

        if (subscription) {

            await subscription.update(
                subscriptionData
            );


            console.log(
                "EXISTING SUBSCRIPTION UPDATED:"
            );

            console.log(
                subscription.toJSON()
            );

        }


        /* =====================================================
           CREATE NEW SUBSCRIPTION
        ===================================================== */

        else {

            subscription =
                await Subscription.create({

                    userId:
                        payment.userId,

                    ...subscriptionData

                });


            console.log(
                "NEW SUBSCRIPTION CREATED:"
            );

            console.log(
                subscription.toJSON()
            );

        }


        /* =====================================================
           RELOAD SUBSCRIPTION WITH PLAN
        ===================================================== */

        subscription =
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


        console.log(
            "FINAL SUBSCRIPTION WITH PLAN:"
        );

        console.log(
            subscription.toJSON()
        );


        /* =====================================================
           SUCCESS RESPONSE
        ===================================================== */

        return res.status(200).json({

            success: true,

            message:
                "Subscription activated successfully.",

            payment: {

                id:
                    payment.id,

                reference:
                    payment.reference,

                status:
                    payment.status

            },

            subscription

        });

    }

    catch (error) {

        console.error(
            "VERIFY PAYMENT ERROR:",
            error.response?.data ||
            error.message ||
            error
        );


        return res.status(500).json({

            success: false,

            message:

                error.response?.data?.message ||

                error.message ||

                "Payment verification failed."

        });

    }

};


/* ============================================================
   CREATE PAYMENT MANUALLY
============================================================ */

exports.createPayment = async (req, res) => {

    try {

        if (!req.user?.id) {

            return res.status(401).json({

                success: false,
                message: "Unauthorized user."

            });

        }


        const { planId } = req.body;


        if (!planId) {

            return res.status(400).json({

                success: false,

                message:
                    "Plan ID is required."

            });

        }


        const plan =
            await getPlan(planId);


        if (!plan) {

            return res.status(404).json({

                success: false,

                message:
                    "Subscription plan not found or inactive."

            });

        }


        const payment =
            await Payment.create({

                userId:
                    req.user.id,

                planId:
                    plan.id,

                planName:
                    plan.name,

                amount:
                    Number(plan.price),

                currency:
                    "GHS",

                paymentMethod:
                    "Paystack",

                reference:
                    `SUB-${Date.now()}-${uuidv4().substring(0, 8)}`,

                status:
                    "Pending"

            });


        return res.status(201).json({

            success: true,

            message:
                "Payment record created successfully.",

            payment

        });

    }

    catch (error) {

        console.error(
            "CREATE PAYMENT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to create payment."

        });

    }

};


/* ============================================================
   GET MY PAYMENTS
============================================================ */

exports.getMyPayments = async (req, res) => {

    try {

        if (!req.user?.id) {

            return res.status(401).json({

                success: false,
                message: "Unauthorized user."

            });

        }


        const payments =
            await Payment.findAll({

                where: {

                    userId:
                        req.user.id

                },

                order: [

                    ["createdAt", "DESC"]

                ]

            });


        return res.status(200).json({

            success: true,

            payments

        });

    }

    catch (error) {

        console.error(
            "GET MY PAYMENTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load payments."

        });

    }

};


/* ============================================================
   GET SINGLE PAYMENT
============================================================ */

exports.getPayment = async (req, res) => {

    try {

        const payment =
            await Payment.findByPk(
                req.params.id
            );


        if (!payment) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment not found."

            });

        }


        if (

            Number(payment.userId) !==
            Number(req.user.id)

        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Unauthorized access."

            });

        }


        return res.status(200).json({

            success: true,

            payment

        });

    }

    catch (error) {

        console.error(
            "GET PAYMENT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to retrieve payment."

        });

    }

};


/* ============================================================
   GET PAYMENT HISTORY
============================================================ */

exports.getPaymentHistory = async (req, res) => {

    try {

        const payments =
            await Payment.findAll({

                order: [

                    ["createdAt", "DESC"]

                ]

            });


        return res.status(200).json({

            success: true,

            payments

        });

    }

    catch (error) {

        console.error(
            "GET PAYMENT HISTORY ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load payment history."

        });

    }

};


/* ============================================================
   DELETE PAYMENT
============================================================ */

exports.deletePayment = async (req, res) => {

    try {

        const payment =
            await Payment.findByPk(
                req.params.id
            );


        if (!payment) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment not found."

            });

        }


        await payment.destroy();


        return res.status(200).json({

            success: true,

            message:
                "Payment deleted successfully."

        });

    }

    catch (error) {

        console.error(
            "DELETE PAYMENT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to delete payment."

        });

    }

};
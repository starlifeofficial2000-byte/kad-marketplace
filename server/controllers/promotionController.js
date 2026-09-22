const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const {
    Product,
    Subscription,
    SubscriptionPlan,
    PromotionPayment,
    ProductPromotion
} = require("../models");

/* ===========================================================
   PROMOTION CONFIGURATION
=========================================================== */

const PROMOTION_CONFIG = {
    Boost: {
        days: 3,
        usedField: "boostsUsed",
        creditField: "boostCredits",
        productField: "boosted",
        expiryField: "boostExpiresAt",
        promotionType: "BOOST"
    },

    Feature: {
        days: 7,
        usedField: "featuredUsed",
        creditField: "featuredCredits",
        productField: "featured",
        expiryField: "featuredUntil",
        promotionType: "FEATURED"
    },

    Express: {
        days: 7,
        usedField: "expressUsed",
        creditField: "expressCredits",
        productField: "express",
        expiryField: "expressUntil",
        promotionType: "EXPRESS"
    }
};

/* ===========================================================
   GET USER ACTIVE SUBSCRIPTION
=========================================================== */

async function getUserPlan(userId) {
    const subscription = await Subscription.findOne({
        where: {
            userId,
            status: "Active"
        },
        order: [["createdAt", "DESC"]]
    });

    if (!subscription) {
        return {
            subscription: null,
            plan: null
        };
    }

    const planId =
        subscription.subscriptionPlanId ||
        subscription.planId;

    if (!planId) {
        return {
            subscription,
            plan: null
        };
    }

    const plan = await SubscriptionPlan.findByPk(planId);

    return {
        subscription,
        plan
    };
}

/* ===========================================================
   PROMOTION PRICE
=========================================================== */

function getPromotionPrice(plan, promotionType) {
    const defaultPrices = {
        Boost: 10,
        Feature: 20,
        Express: 15
    };

    if (!plan) {
        return defaultPrices[promotionType] || 0;
    }

    switch (promotionType) {
        case "Boost":
            return Number(
                plan.boostPrice ||
                defaultPrices.Boost
            );

        case "Feature":
            return Number(
                plan.featurePrice ||
                plan.featuredPrice ||
                defaultPrices.Feature
            );

        case "Express":
            return Number(
                plan.expressPrice ||
                defaultPrices.Express
            );

        default:
            return 0;
    }
}

/* ===========================================================
   PROMOTION DATES
=========================================================== */

function getPromotionDates(promotionType) {
    const config = PROMOTION_CONFIG[promotionType];

    if (!config) {
        throw new Error("Invalid promotion type.");
    }

    const startsAt = new Date();

    const expiresAt = new Date();

    expiresAt.setDate(
        expiresAt.getDate() + config.days
    );

    return {
        startsAt,
        expiresAt
    };
}

/* ===========================================================
   CHECK FREE PROMOTION CREDIT
=========================================================== */

function canUseFreeCredit(
    subscription,
    plan,
    promotionType
) {
    const config = PROMOTION_CONFIG[promotionType];

    if (!config || !subscription || !plan) {
        return false;
    }

    const allowedCredits = Number(
        plan[config.creditField] || 0
    );

    const usedCredits = Number(
        subscription[config.usedField] || 0
    );

    if (allowedCredits === -1) {
        return true;
    }

    return usedCredits < allowedCredits;
}

/* ===========================================================
   USE PROMOTION CREDIT
=========================================================== */

async function usePromotionCredit(
    subscription,
    plan,
    promotionType
) {
    const config = PROMOTION_CONFIG[promotionType];

    if (!config) {
        return;
    }

    const allowedCredits = Number(
        plan[config.creditField] || 0
    );

    if (allowedCredits === -1) {
        return;
    }

    subscription[config.usedField] =
        Number(subscription[config.usedField] || 0) + 1;

    await subscription.save();
}

/* ===========================================================
   GET REMAINING CREDITS
=========================================================== */

function getRemainingCredits(
    subscription,
    plan,
    promotionType
) {
    const config = PROMOTION_CONFIG[promotionType];

    if (!config || !plan) {
        return 0;
    }

    const allowedCredits = Number(
        plan[config.creditField] || 0
    );

    if (allowedCredits === -1) {
        return "Unlimited";
    }

    const usedCredits = Number(
        subscription[config.usedField] || 0
    );

    return Math.max(
        0,
        allowedCredits - usedCredits
    );
}

/* ===========================================================
   APPLY PROMOTION TO PRODUCT
=========================================================== */

async function applyPromotionToProduct(
    product,
    promotionType,
    expiresAt
) {
    const now = new Date();

    if (promotionType === "Boost") {
        product.boosted = true;

        product.boostCount =
            Number(product.boostCount || 0) + 1;

        product.lastBoost = now;

        product.boostExpiresAt = expiresAt;

        product.listingPriority = Math.max(
            Number(product.listingPriority || 1),
            5
        );

        product.listingScore =
            Number(product.listingScore || 100) + 50;

        product.displayDate = now;
    }

    if (promotionType === "Feature") {
        product.featured = true;

        if (
            Object.prototype.hasOwnProperty.call(
                product.dataValues,
                "isFeatured"
            )
        ) {
            product.isFeatured = true;
        }

        product.featuredUntil = expiresAt;

        product.homepagePriority = Math.max(
            Number(product.homepagePriority || 1),
            10
        );

        product.listingPriority = Math.max(
            Number(product.listingPriority || 1),
            8
        );

        product.listingScore =
            Number(product.listingScore || 100) + 100;
    }

    if (promotionType === "Express") {
        product.express = true;

        product.expressUntil = expiresAt;

        product.listingPriority = Math.max(
            Number(product.listingPriority || 1),
            7
        );

        product.listingScore =
            Number(product.listingScore || 100) + 75;

        product.displayDate = now;
    }

    await product.save();
}

/* ===========================================================
   CREATE OR UPDATE PRODUCT PROMOTION
=========================================================== */

async function createProductPromotion({
    product,
    sellerId,
    promotionType,
    amount,
    startsAt,
    expiresAt
}) {
    const config = PROMOTION_CONFIG[promotionType];

    if (!config) {
        throw new Error("Invalid promotion type.");
    }

    const existingPromotion =
        await ProductPromotion.findOne({
            where: {
                productId: product.id,
                promotionType: config.promotionType,
                status: "APPROVED"
            },
            order: [["createdAt", "DESC"]]
        });

    if (existingPromotion) {
        await existingPromotion.update({
            sellerId,
            paymentStatus: "PAID",
            status: "APPROVED",
            amount,
            startDate: startsAt,
            endDate: expiresAt,

            // Admin controls homepage visibility.
            showOnHomepage:
                existingPromotion.showOnHomepage,

            homepageOrder:
                existingPromotion.homepageOrder || 0
        });

        return existingPromotion;
    }

    const promotion =
        await ProductPromotion.create({
            productId: product.id,
            sellerId,
            promotionType: config.promotionType,
            amount,
            paymentStatus: "PAID",
            status: "APPROVED",
            startDate: startsAt,
            endDate: expiresAt,

            // Admin must manually enable homepage visibility.
            showOnHomepage: false,

            homepageOrder: 0
        });

    return promotion;
}

/* ===========================================================
   INITIALIZE PROMOTION
=========================================================== */

exports.initializePromotion = async (req, res) => {
    try {
        const {
            productId,
            promotionType
        } = req.body;

        if (!productId || !promotionType) {
            return res.status(400).json({
                success: false,
                message:
                    "Product ID and promotion type are required."
            });
        }

        if (!PROMOTION_CONFIG[promotionType]) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid promotion type."
            });
        }

        const product =
            await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message:
                    "Product not found."
            });
        }

        if (
            Number(product.userId) !==
            Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only promote your own products."
            });
        }

        if (product.status !== "Approved") {
            return res.status(400).json({
                success: false,
                message:
                    "Only approved products can be promoted."
            });
        }

        const {
            subscription,
            plan
        } = await getUserPlan(req.user.id);

        const {
            startsAt,
            expiresAt
        } = getPromotionDates(promotionType);

        /* =====================================================
           FREE SUBSCRIPTION PROMOTION
        ===================================================== */

        if (
            subscription &&
            plan &&
            canUseFreeCredit(
                subscription,
                plan,
                promotionType
            )
        ) {
            await usePromotionCredit(
                subscription,
                plan,
                promotionType
            );

            await applyPromotionToProduct(
                product,
                promotionType,
                expiresAt
            );

            const promotion =
                await createProductPromotion({
                    product,
                    sellerId: req.user.id,
                    promotionType,
                    amount: 0,
                    startsAt,
                    expiresAt
                });

            const remaining =
                getRemainingCredits(
                    subscription,
                    plan,
                    promotionType
                );

            return res.json({
                success: true,
                freePromotion: true,
                message:
                    `${promotionType} promotion activated successfully using subscription credits.`,
                remaining,
                promotion
            });
        }

        /* =====================================================
           PAID PROMOTION
        ===================================================== */

        const amount =
            getPromotionPrice(
                plan,
                promotionType
            );

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid promotion price."
            });
        }

        const reference =
            `PROMO-${uuidv4()}`;

        const payment =
            await PromotionPayment.create({
                userId: req.user.id,
                productId,
                promotionType,
                amount,
                reference,
                currency: "GHS",
                paymentMethod: "Paystack",
                status: "Pending",
                startsAt,
                expiresAt
            });

        try {
            const response =
                await axios.post(
                    "https://api.paystack.co/transaction/initialize",
                    {
                        email: req.user.email,
                        amount:
                            Math.round(
                                Number(amount) * 100
                            ),
                        currency: "GHS",
                        reference,
                        callback_url:
                            process.env.PROMOTION_CALLBACK,
                        metadata: {
                            paymentType: "promotion",
                            promotionPaymentId:
                                payment.id,
                            productId,
                            promotionType,
                            userId: req.user.id
                        }
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                            "Content-Type":
                                "application/json"
                        }
                    }
                );

            if (
                !response.data?.status ||
                !response.data?.data?.authorization_url
            ) {
                payment.status = "Failed";
                await payment.save();

                return res.status(400).json({
                    success: false,
                    message:
                        "Unable to initialize payment."
                });
            }

            return res.json({
                success: true,
                freePromotion: false,
                message:
                    "Promotion payment initialized successfully.",
                authorization_url:
                    response.data.data.authorization_url,
                access_code:
                    response.data.data.access_code,
                reference,
                paymentId: payment.id
            });
        } catch (paystackError) {
            payment.status = "Failed";
            await payment.save();

            throw paystackError;
        }
    } catch (error) {
        console.error(
            "PROMOTION INITIALIZATION ERROR:",
            error.response?.data ||
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                error.response?.data?.message ||
                error.message ||
                "Unable to initialize promotion."
        });
    }
};

/* ===========================================================
   VERIFY PROMOTION PAYMENT
=========================================================== */

exports.verifyPromotion = async (req, res) => {
    try {
        const { reference } = req.params;

        if (!reference) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment reference is required."
            });
        }

        const payment =
            await PromotionPayment.findOne({
                where: {
                    reference
                }
            });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "Promotion payment not found."
            });
        }

        /* =====================================================
           SECURITY CHECK
        ===================================================== */

        if (
            Number(payment.userId) !==
            Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Unauthorized payment verification."
            });
        }

        /* =====================================================
           ALREADY VERIFIED
        ===================================================== */

        if (payment.status === "Successful") {
            return res.status(200).json({
                success: true,
                alreadyVerified: true,
                message:
                    "Promotion was already activated."
            });
        }

        if (
            payment.status === "Failed"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This promotion payment has already been marked as failed."
            });
        }

        /* =====================================================
           PAYSTACK CONFIGURATION
        ===================================================== */

        if (!process.env.PAYSTACK_SECRET_KEY) {
            return res.status(500).json({
                success: false,
                message:
                    "Paystack configuration is missing."
            });
        }

        /* =====================================================
           VERIFY WITH PAYSTACK
        ===================================================== */

        const response =
            await axios.get(
                `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                    }
                }
            );

        const transaction =
            response.data?.data;

        /* =====================================================
           IMPORTANT:
           DO NOT MARK PENDING AS FAILED.
        ===================================================== */

        if (!transaction) {
            return res.status(202).json({
                success: false,
                pending: true,
                message:
                    "Payment is still being processed. Please wait a moment and try again."
            });
        }

        if (
            transaction.status !== "success"
        ) {
            const pendingStatuses = [
                "pending",
                "processing",
                "ongoing"
            ];

            if (
                pendingStatuses.includes(
                    String(transaction.status).toLowerCase()
                )
            ) {
                return res.status(202).json({
                    success: false,
                    pending: true,
                    paymentStatus:
                        transaction.status,
                    message:
                        "Payment is still being processed. Please wait a moment and try again."
                });
            }

            return res.status(400).json({
                success: false,
                pending: false,
                paymentStatus:
                    transaction.status,
                message:
                    "Payment was not successful."
            });
        }

        /* =====================================================
           VERIFY REFERENCE
        ===================================================== */

        if (
            transaction.reference &&
            transaction.reference !== payment.reference
        ) {
            console.error(
                "PROMOTION REFERENCE MISMATCH",
                {
                    databaseReference:
                        payment.reference,
                    paystackReference:
                        transaction.reference
                }
            );

            return res.status(400).json({
                success: false,
                message:
                    "Payment reference verification failed."
            });
        }

        /* =====================================================
           VERIFY CURRENCY
        ===================================================== */

        if (
            transaction.currency &&
            String(transaction.currency).toUpperCase() !==
            String(payment.currency || "GHS").toUpperCase()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment currency verification failed."
            });
        }

        /* =====================================================
           VERIFY AMOUNT
        ===================================================== */

        const expectedAmount =
            Math.round(
                Number(payment.amount) * 100
            );

        if (
            Number(transaction.amount) !==
            expectedAmount
        ) {
            console.error(
                "PROMOTION PAYMENT AMOUNT MISMATCH",
                {
                    expectedAmount,
                    receivedAmount:
                        transaction.amount
                }
            );

            return res.status(400).json({
                success: false,
                message:
                    "Payment amount verification failed."
            });
        }

        /* =====================================================
           FIND PRODUCT
        ===================================================== */

        const product =
            await Product.findByPk(
                payment.productId
            );

        if (!product) {
            return res.status(404).json({
                success: false,
                message:
                    "Product no longer exists."
            });
        }

        /* =====================================================
           VERIFY PRODUCT OWNERSHIP
        ===================================================== */

        if (
            Number(product.userId) !==
            Number(payment.userId)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Product ownership verification failed."
            });
        }

        /* =====================================================
           PRODUCT MUST STILL BE APPROVED
        ===================================================== */

        if (product.status !== "Approved") {
            return res.status(400).json({
                success: false,
                message:
                    "This product is no longer approved for promotion."
            });
        }

        /* =====================================================
           GET PROMOTION DATES
        ===================================================== */

        const {
            startsAt,
            expiresAt
        } = getPromotionDates(
            payment.promotionType
        );

        /* =====================================================
           MARK PAYMENT SUCCESSFUL
        ===================================================== */

        payment.status = "Successful";
        payment.paymentMethod = "Paystack";
        payment.paymentChannel =
            transaction.channel || null;

        payment.authorizationCode =
            transaction.authorization?.authorization_code ||
            null;

        payment.customerCode =
            transaction.customer?.customer_code ||
            null;

        payment.paidAt = new Date();

        payment.startsAt = startsAt;
        payment.expiresAt = expiresAt;

        payment.gatewayResponse =
            JSON.stringify(transaction);

        await payment.save();

        /* =====================================================
           APPLY PROMOTION
        ===================================================== */

        await applyPromotionToProduct(
            product,
            payment.promotionType,
            expiresAt
        );

        /* =====================================================
           CREATE PRODUCT PROMOTION
        ===================================================== */

        const promotion =
            await createProductPromotion({
                product,
                sellerId: payment.userId,
                promotionType:
                    payment.promotionType,
                amount: payment.amount,
                startsAt,
                expiresAt
            });

        return res.status(200).json({
            success: true,
            message:
                `${payment.promotionType} promotion activated successfully.`,
            payment,
            promotion
        });
    } catch (error) {
        console.error(
            "PROMOTION VERIFICATION ERROR:",
            error.response?.data ||
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                error.response?.data?.message ||
                error.message ||
                "Promotion verification failed."
        });
    }
};

/* ===========================================================
   GET MY PROMOTION HISTORY
=========================================================== */

exports.getMyPromotions = async (req, res) => {
    try {
        const promotions =
            await ProductPromotion.findAll({
                where: {
                    sellerId: req.user.id
                },

                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: [
                            "id",
                            "title",
                            "images",
                            "price"
                        ]
                    }
                ],

                order: [
                    ["createdAt", "DESC"]
                ]
            });

        return res.json({
            success: true,
            promotions
        });
    } catch (error) {
        console.error(
            "GET PROMOTIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
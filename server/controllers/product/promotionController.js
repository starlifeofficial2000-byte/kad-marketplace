const Product = require("../../models/Product");
const Subscription = require("../../models/Subscription");
const ProductPromotion = require("../../models/ProductPromotion");

/* ==========================================
   BOOST PRODUCT
========================================== */

exports.boostProduct = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        if (product.userId !== req.user.id) {

            return res.status(403).json({

                success: false,

                message: "Unauthorized."

            });

        }

        const subscription = await Subscription.findOne({

            where: {

                userId: req.user.id,

                status: "Active"

            }

        });

        if (!subscription) {

            return res.status(400).json({

                success: false,

                message: "Active subscription required."

            });

        }

        let hours = 24;

        switch (subscription.plan) {

            case "Express":

                hours = 12;
                break;

            case "Bossman":

                hours = 6;
                break;

            case "VIP Bossman":

                hours = 3;
                break;

            case "Enterprise":

                hours = 1;
                break;

        }

        const now = new Date();

        if (

            product.nextBoost &&

            new Date(product.nextBoost) > now

        ) {

            return res.status(400).json({

                success: false,

                message: `Next boost available on ${product.nextBoost}`

            });

        }

        const nextBoost = new Date();

        nextBoost.setHours(nextBoost.getHours() + hours);

        await product.update({

            boosted: true,

            lastBoost: now,

            nextBoost,

            displayDate: now,

            boostCount: product.boostCount + 1,

            listingScore: product.listingScore + 50

        });

        const expiry = new Date(nextBoost);

        let promotion = await ProductPromotion.findOne({

            where: {

                productId: product.id,

                promotionType: "BOOST"

            }

        });

        if (promotion) {

            await promotion.update({

                paymentStatus: "PAID",

                status: "APPROVED",

                startDate: now,

                endDate: expiry

            });

        } else {

            await ProductPromotion.create({

                productId: product.id,

                sellerId: req.user.id,

                promotionType: "BOOST",

                paymentStatus: "PAID",

                status: "APPROVED",

                amount: 0,

                startDate: now,

                endDate: expiry,

                showOnHomepage: false,

                homepageOrder: 0

            });

        }

        return res.json({

            success: true,

            message: "Product boosted successfully.",

            nextBoost

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};/* ==========================================
   FEATURE PRODUCT
========================================== */

exports.featureProduct = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        if (product.userId !== req.user.id) {

            return res.status(403).json({

                success: false,

                message: "Unauthorized."

            });

        }

        const subscription = await Subscription.findOne({

            where: {

                userId: req.user.id,

                status: "Active"

            }

        });

        if (

            !subscription ||

            !["Bossman", "VIP Bossman", "Enterprise"].includes(subscription.plan)

        ) {

            return res.status(403).json({

                success: false,

                message: "Your subscription does not include Featured Products."

            });

        }

        const startDate = new Date();

        const expiry = new Date();

        expiry.setDate(expiry.getDate() + 30);

        await product.update({

            featured: true,

            featuredUntil: expiry,

            listingScore: product.listingScore + 100

        });

        let promotion = await ProductPromotion.findOne({

            where: {

                productId: product.id,

                promotionType: "FEATURED"

            }

        });

        if (promotion) {

            await promotion.update({

                paymentStatus: "PAID",

                status: "APPROVED",

                startDate,

                endDate: expiry

            });

        } else {

            await ProductPromotion.create({

                productId: product.id,

                sellerId: req.user.id,

                promotionType: "FEATURED",

                paymentStatus: "PAID",

                status: "APPROVED",

                amount: 0,

                startDate,

                endDate: expiry,

                showOnHomepage: false,

                homepageOrder: 0

            });

        }

        return res.json({

            success: true,

            message: "Product featured successfully."

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};/* ==========================================
   EXPRESS PRODUCT
========================================== */

exports.expressProduct = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        if (product.userId !== req.user.id) {

            return res.status(403).json({

                success: false,

                message: "Unauthorized."

            });

        }

        const subscription = await Subscription.findOne({

            where: {

                userId: req.user.id,

                status: "Active"

            }

        });

        if (

            !subscription ||

            !["Express", "Bossman", "VIP Bossman", "Enterprise"].includes(subscription.plan)

        ) {

            return res.status(403).json({

                success: false,

                message: "Your subscription does not include Express Listing."

            });

        }

        const startDate = new Date();

        const expiry = new Date();

        expiry.setDate(expiry.getDate() + 30);

        await product.update({

            express: true,

            expressUntil: expiry,

            listingScore: product.listingScore + 80

        });

        let promotion = await ProductPromotion.findOne({

            where: {

                productId: product.id,

                promotionType: "EXPRESS"

            }

        });

        if (promotion) {

            await promotion.update({

                paymentStatus: "PAID",

                status: "APPROVED",

                startDate,

                endDate: expiry

            });

        } else {

            await ProductPromotion.create({

                productId: product.id,

                sellerId: req.user.id,

                promotionType: "EXPRESS",

                paymentStatus: "PAID",

                status: "APPROVED",

                amount: 0,

                startDate,

                endDate: expiry,

                showOnHomepage: false,

                homepageOrder: 0

            });

        }

        return res.json({

            success: true,

            message: "Product promoted to Express successfully."

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
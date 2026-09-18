const Product = require("../models/Product");
const ProductPromotion = require("../models/ProductPromotion");

class PromotionService {

    /* ==========================================
       ACTIVATE PROMOTION
    ========================================== */

    static async activatePromotion(payment) {

        const product = await Product.findByPk(payment.productId);

        if (!product) {

            throw new Error("Product not found.");

        }

        let promotionType = "";

        switch (payment.promotionType) {

            case "Feature":
                promotionType = "FEATURED";
                break;

            case "Express":
                promotionType = "EXPRESS";
                break;

            case "Boost":
                promotionType = "BOOST";
                break;

            default:
                throw new Error("Invalid promotion type.");

        }

        const now = new Date();

        let expiresAt = new Date(now);

        switch (payment.promotionType) {

            case "Boost":

                expiresAt.setDate(expiresAt.getDate() + 1);
                break;

            case "Feature":

                expiresAt.setDate(expiresAt.getDate() + 7);
                break;

            case "Express":

                expiresAt.setDate(expiresAt.getDate() + 7);
                break;

        }

        payment.status = "Successful";
        payment.paymentMethod = "Paystack";
        payment.paidAt = now;
        payment.expiresAt = expiresAt;

        await payment.save();

        await product.update({

            boosted: payment.promotionType === "Boost",

            featured: payment.promotionType === "Feature",

            express: payment.promotionType === "Express",

            boostExpiresAt:

                payment.promotionType === "Boost"

                    ? expiresAt

                    : product.boostExpiresAt,

            featuredUntil:

                payment.promotionType === "Feature"

                    ? expiresAt

                    : product.featuredUntil,

            expressUntil:

                payment.promotionType === "Express"

                    ? expiresAt

                    : product.expressUntil

        });

        let promotion = await ProductPromotion.findOne({

            where: {

                productId: product.id,

                promotionType

            }

        });

        if (promotion) {

            await promotion.update({

                paymentStatus: "PAID",

                status: "APPROVED",

                amount: payment.amount,

                startDate: now,

                endDate: expiresAt

            });

        } else {

            promotion = await ProductPromotion.create({

                productId: product.id,

                sellerId: product.userId,

                promotionType,

                paymentStatus: "PAID",

                status: "APPROVED",

                amount: payment.amount,

                startDate: now,

                endDate: expiresAt,

                showOnHomepage: false,

                homepageOrder: 0

            });

        }

        return {

            product,

            promotion

        };

    }

    /* ==========================================
       REMOVE EXPIRED PROMOTIONS
    ========================================== */

    static async removeExpiredPromotions() {

        try {

            const now = new Date();

            const products = await Product.findAll();

            for (const product of products) {

                let updated = false;

                /* BOOST */

                if (

                    product.boosted &&
                    product.boostExpiresAt &&
                    new Date(product.boostExpiresAt) <= now

                ) {

                    product.boosted = false;
                    product.boostExpiresAt = null;

                    product.listingScore = Math.max(

                        0,

                        product.listingScore - 100

                    );

                    updated = true;

                }

                /* FEATURED */

                if (

                    product.featured &&
                    product.featuredUntil &&
                    new Date(product.featuredUntil) <= now

                ) {

                    product.featured = false;
                    product.featuredUntil = null;

                    product.listingScore = Math.max(

                        0,

                        product.listingScore - 200

                    );

                    updated = true;

                }

                /* EXPRESS */

                if (

                    product.express &&
                    product.expressUntil &&
                    new Date(product.expressUntil) <= now

                ) {

                    product.express = false;
                    product.expressUntil = null;

                    product.listingScore = Math.max(

                        0,

                        product.listingScore - 150

                    );

                    updated = true;

                }

                if (updated) {

                    await product.save();

                }

            }

            console.log("Promotion expiry check completed.");

        }

        catch (error) {

            console.log(error);

        }

    }

}

module.exports = PromotionService;
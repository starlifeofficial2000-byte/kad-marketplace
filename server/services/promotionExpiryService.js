const Product = require("../models/Product");

class PromotionExpiryService {

    static async removeExpiredPromotions() {

        try {

            const now = new Date();

            const products = await Product.findAll();

            for (const product of products) {

                let updated = false;

                /* =====================================
                   BOOST
                ===================================== */

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

                /* =====================================
                   FEATURED
                ===================================== */

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

                /* =====================================
                   EXPRESS
                ===================================== */

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

module.exports = PromotionExpiryService;
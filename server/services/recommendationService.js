const Product = require("../models/Product");
const User = require("../models/User");
const Subscription = require("../models/Subscription");

/* ==========================================
   AI RECOMMENDATION ENGINE
========================================== */

exports.getRecommendations = async (userId) => {

    try {

        const products = await Product.findAll({

            where: {

                status: "Approved"

            },

            include: [

                {

                    model: User,

                    as: "seller",

                    attributes: [

                        "id",
                        "name"

                    ]

                }

            ]

        });

        const recommendations = products.map(product => {

            let score = 0;

            /* Featured */

            if (product.featured)

                score += 50;

            /* Express */

            if (product.express)

                score += 40;

            /* Boosted */

            if (product.boosted)

                score += 30;

            /* Views */

            score += Math.min(product.views || 0, 100);

            /* Favourites */

            score += (product.favourites || 0) * 5;

            /* Listing Score */

            score += product.listingScore || 0;

            return {

                ...product.toJSON(),

                aiScore: score

            };

        });

        recommendations.sort(

            (a,b)=>b.aiScore-a.aiScore

        );

        return recommendations.slice(0,20);

    }

    catch(error){

        throw error;

    }

};
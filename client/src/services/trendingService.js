const Product = require("../models/Product");

exports.getTrendingProducts = async () => {

    try {

        const products = await Product.findAll({

            where: {

                status: "Approved"

            }

        });

        for (const product of products) {

            const score =

                (product.views || 0) * 1 +

                (product.wishlist || 0) * 4 +

                (product.chats || 0) * 5 +

                (product.shares || 0) * 3 +

                (product.listingPriority || 1) * 10 +

                (product.featured ? 50 : 0) +

                (product.express ? 30 : 0);

            product.trendingScore = score;

            await product.save();

        }

        return await Product.findAll({

            where: {

                status: "Approved"

            },

            order: [

                ["trendingScore", "DESC"]

            ],

            limit: 20

        });

    }

    catch (error) {

        console.log(error);

        return [];

    }

};
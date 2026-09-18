const Product = require("../models/Product");

exports.getTrendingProducts = async () => {

    return await Product.findAll({

        where: {

            status: "Approved"

        },

        order: [

            ["listingScore", "DESC"],

            ["displayDate", "DESC"]

        ],

        limit: 20

    });

};
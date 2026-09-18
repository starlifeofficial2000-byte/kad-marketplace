const Product = require("../models/Product");
const Subscription = require("../models/Subscription");
const Message = require("../models/Message");

exports.getDashboard = async (req, res) => {

    try {

        const userId = req.user.id;

        const totalProducts = await Product.count({

            where: {

                userId

            }

        });

        const pendingProducts = await Product.count({

            where: {

                userId,

                status: "Pending"

            }

        });

        const approvedProducts = await Product.count({

            where: {

                userId,

                status: "Approved"

            }

        });

        const rejectedProducts = await Product.count({

            where: {

                userId,

                status: "Rejected"

            }

        });

        const subscription = await Subscription.findOne({

            where: {

                userId

            }

        });

        res.json({

            totalProducts,

            pendingProducts,

            approvedProducts,

            rejectedProducts,

            subscription

        });

    }

    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};
/* ==========================================
   GET MY PRODUCTS
========================================== */

exports.getMyProducts = async (req, res) => {

    try {

        const userId = req.user.id;

        const products = await Product.findAll({

            where: {

                userId

            },

            order: [

                ["createdAt", "DESC"]

            ]

        });

        res.json(products);

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};
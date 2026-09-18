const Product = require("../models/Product");
const ProductStatistic = require("../models/ProductStatistic");
const Subscription = require("../models/Subscription");
const Review = require("../models/Review");

exports.getAnalytics = async (req, res) => {

    try {

        const userId = req.user.id;

        // 👇 PUT ALL THE REAL STATISTICS CODE HERE





        const totalProducts = await Product.count({
            where: { userId }
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
            where: { userId }
        });

        const statistics = await ProductStatistic.findAll({
            include: [
                {
                    model: Product,
                    as: "product",
                    where: { userId }
                }
            ]
        });

        const totalViews = statistics.reduce(
            (sum, item) => sum + (item.views || 0),
            0
        );

        // Send everything back to the frontend
        res.json({
            totalProducts,
            pendingProducts,
            approvedProducts,
            rejectedProducts,
            totalViews,
            subscription
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
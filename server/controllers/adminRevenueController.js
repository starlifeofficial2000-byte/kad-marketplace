const Payment = require("../models/Payment");

exports.getRevenueDashboard = async (req, res) => {

    try {

        const payments = await Payment.findAll();

        let totalRevenue = 0;
        let todayRevenue = 0;
        let monthRevenue = 0;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        payments.forEach(payment => {

            if (payment.status !== "Paid") return;

            const amount = Number(payment.amount);

            totalRevenue += amount;

            const paymentDate = new Date(payment.createdAt);

            if (
                paymentDate.toDateString() === today.toDateString()
            ) {
                todayRevenue += amount;
            }

            if (
                paymentDate.getMonth() === currentMonth &&
                paymentDate.getFullYear() === currentYear
            ) {
                monthRevenue += amount;
            }

        });

        res.json({

            totalRevenue,

            todayRevenue,

            monthRevenue,

            totalTransactions: payments.length

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
exports.getRevenueChart = async (req, res) => {

    try {

        const Payment = require("../models/Payment");

        const payments = await Payment.findAll({

            where: {

                status: "Paid"

            }

        });

        const months = Array(12).fill(0);

        payments.forEach(payment => {

            const month = new Date(

                payment.createdAt

            ).getMonth();

            months[month] += Number(payment.amount);

        });

        res.json(months);

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
const Payment = require("../models/Payment");
const User = require("../models/User");

/* ==========================================
   GET ALL PAYMENTS
========================================== */

exports.getPayments = async (req, res) => {

    try {

        const payments = await Payment.findAll({

            include: [

    {

        model: User,

        as: "user",

        attributes: [

            "id",

            "name",

            "email",

            "phone"

        ]

    }

],

            order: [

                ["createdAt", "DESC"]

            ]

        });

        res.json(payments);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
exports.getPayment = async (req,res)=>{

    try{

        const payment = await Payment.findByPk(

            req.params.id,

            {

                include:[

                    {

                        model:User,

                        as:"user"

                    }

                ]

            }

        );

        if(!payment){

            return res.status(404).json({

                success:false,

                message:"Payment not found."

            });

        }

        res.json(payment);

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};
exports.getPaymentSummary = async (req, res) => {

    try {

        const payments = await Payment.findAll();

        let totalRevenue = 0;
        let subscriptions = 0;
        let promotions = 0;
        let advertisements = 0;

        payments.forEach(payment => {

            totalRevenue += Number(payment.amount);

            switch (payment.type) {

                case "Subscription":
                    subscriptions += Number(payment.amount);
                    break;

                case "Promotion":
                    promotions += Number(payment.amount);
                    break;

                case "Advertisement":
                    advertisements += Number(payment.amount);
                    break;

                default:
                    break;

            }

        });

        res.json({

            totalRevenue,

            subscriptions,

            promotions,

            advertisements,

            totalTransactions: payments.length

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

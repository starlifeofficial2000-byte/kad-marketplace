const Payment = require("../models/Payment");
const User = require("../models/User");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const { getR2PublicUrl } = require("../config/r2");

const formatPayment = (payment) => {
    const data = payment && typeof payment.toJSON === "function" ? payment.toJSON() : { ...payment };
    if (data.user && data.user.profileImage) {
        const image = String(data.user.profileImage).trim();
        data.user.profileImageUrl = /^https?:\/\//i.test(image) ? image : (image.startsWith("uploads/") ? (getR2PublicUrl(image) || `/${image}`) : (image === "default.png" ? null : (getR2PublicUrl(`uploads/profiles/${image}`) || `/uploads/${image}`)));
    }
    return data;
};

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

            "phone",
            "profileImage"

        ]

    }

],

            order: [

                ["createdAt", "DESC"]

            ]

        });

        res.json(payments.map(formatPayment));

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
                        model: User,
                        as: "user"
                    },
                    {
                        model: SubscriptionPlan,
                        as: "subscriptionPlan",
                        required: false
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

        res.json(formatPayment(payment));

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

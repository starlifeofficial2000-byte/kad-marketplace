const Payment = require("../models/Payment");
const PromotionPayment = require("../models/PromotionPayment");

class PaymentService {

    static async verify(reference) {

        const payment = await Payment.findOne({

            where: {

                reference

            }

        });

        if (payment) {

            return {

                type: "subscription",

                payment

            };

        }

        const promotionPayment = await PromotionPayment.findOne({

            where: {

                reference

            }

        });

        if (promotionPayment) {

            return {

                type: "promotion",

                payment: promotionPayment

            };

        }

        return null;

    }

}

module.exports = PaymentService;
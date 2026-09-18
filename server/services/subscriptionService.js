const Subscription = require("../models/Subscription");

/* ==========================================
   CHECK EXPIRED SUBSCRIPTIONS
========================================== */

exports.checkExpiredSubscriptions = async () => {

    try {

        const now = new Date();

        const subscriptions = await Subscription.findAll({

            where: {

                status: "Active"

            }

        });

        for (const subscription of subscriptions) {

            if (

                subscription.endDate &&
                new Date(subscription.endDate) < now

            ) {

                subscription.status = "Expired";

                subscription.plan = "Basic";

                subscription.amount = 0;

                subscription.boostHours = 0;

                subscription.listingPriority = 1;

                subscription.homepagePriority = 1;

                subscription.searchPriority = 1;

                subscription.featuredPriority = 1;

                subscription.boostsUsed = 0;

                subscription.expressUsed = 0;

                subscription.featuredUsed = 0;

                await subscription.save();

            }

        }

        console.log("Subscription expiry check completed.");

    }

    catch (error) {

        console.log(error.message);

    }

};
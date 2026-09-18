const cron = require("node-cron");

const {

    checkExpiredSubscriptions

} = require("../services/subscriptionService");

cron.schedule(

    "0 * * * *",

    async () => {

        console.log("Checking subscriptions...");

        await checkExpiredSubscriptions();

    }

);
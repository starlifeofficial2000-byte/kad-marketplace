const cron = require("node-cron");
const { removeExpiredPromotions } = require("../services/promotionService");

/* ==========================================
   CHECK EXPIRED PROMOTIONS EVERY HOUR
========================================== */

cron.schedule("0 * * * *", async () => {

    console.log("Checking expired promotions...");

    await removeExpiredPromotions();

});
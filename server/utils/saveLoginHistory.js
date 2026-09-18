const { LoginHistory } = require("../models");

const saveLoginHistory = async ({

    userId,

    req,

    success

}) => {

    try {

        await LoginHistory.create({

            userId,

            ipAddress: req.ip || req.connection.remoteAddress,

            userAgent: req.headers["user-agent"],

            browser: req.headers["user-agent"],

            success

        });

    }

    catch (error) {

        console.log("Login History Error:", error.message);

    }

};

module.exports = saveLoginHistory;
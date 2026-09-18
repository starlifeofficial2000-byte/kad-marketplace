const LoginHistory = require("../models/LoginHistory");

exports.saveLoginHistory = async ({

    userId,

    req,

    success = true

}) => {

    try {

        await LoginHistory.create({

            userId,

            ipAddress:

                req.headers["x-forwarded-for"] ||

                req.socket.remoteAddress ||

                req.ip,

            browser:

                req.headers["user-agent"],

            device:

                req.headers["user-agent"],

            operatingSystem:

                req.headers["user-agent"],

            location: "Unknown",

            success

        });

    }

    catch (error) {

        console.log(

            "Login History Error:",

            error.message

        );

    }

};
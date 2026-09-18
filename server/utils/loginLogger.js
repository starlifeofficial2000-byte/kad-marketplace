const { LoginHistory } = require("../models");


const logLogin = async (

    req,

    userId,

    status = "success",

    loginMethod = "password"

) => {

    try {

        const forwardedFor =
            req.headers["x-forwarded-for"];


        const ipAddress =

            forwardedFor
                ? forwardedFor.split(",")[0].trim()
                : req.ip ||
                  req.socket?.remoteAddress ||
                  null;


        const userAgent =

            req.headers["user-agent"] ||
            null;


        await LoginHistory.create({

            userId,

            ipAddress,

            userAgent,

            status,

            loginMethod

        });


        console.log(

            `LOGIN HISTORY RECORDED: User ${userId} - ${status}`

        );

    }

    catch (error) {

        console.error(

            "LOGIN HISTORY ERROR:",

            error.message

        );

    }

};


module.exports = logLogin;
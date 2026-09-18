const { SecurityAlert } = require("../models");

exports.createAlert = async ({

    userId,

    title,

    description,

    riskLevel

}) => {

    try {

        await SecurityAlert.create({

            userId,

            title,

            description,

            riskLevel,

            status: "Open"

        });

    }

    catch (error) {

        console.log("Security Alert Error:", error.message);

    }

};
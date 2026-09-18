const Report = require("../models/Report");

/* ==========================================
   CREATE REPORT
========================================== */

exports.createReport = async (req, res) => {

    try {

        const {

            userId,

            productId,

            reason,

            description

        } = req.body;

        const report = await Report.create({

            userId,

            productId,

            reason,

            description,

            status: "Pending"

        });

        res.status(201).json({

            success: true,

            report

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};
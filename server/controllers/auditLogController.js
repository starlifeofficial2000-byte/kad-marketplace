const AuditLog = require("../models/AuditLog");
const User = require("../models/User");

exports.getAuditLogs = async (req, res) => {

    try {

        const logs = await AuditLog.findAll({

            include: [

                {

                    model: User,

                    as: "admin",

                    attributes: [

                        "id",
                        "name",
                        "email"

                    ],

                    required: false

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });


        return res.status(200).json({

            success: true,

            logs

        });

    }

    catch (error) {

        console.error(
            "GET AUDIT LOGS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load audit logs.",

            error:
                error.message

        });

    }

};


/* ==========================================
   CREATE AUDIT LOG
========================================== */

exports.createAuditLog = async (data) => {

    try {

        const log = await AuditLog.create({

            adminId: data.adminId,

            action: data.action,

            entity: data.entity,

            entityId: data.entityId || null,

            description: data.description || null,

            ipAddress: data.ipAddress || null

        });

        return log;

    }

    catch (error) {

        console.error(
            "CREATE AUDIT LOG ERROR:",
            error.message
        );

        return null;

    }

};
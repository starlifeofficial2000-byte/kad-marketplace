const { Op } = require("sequelize");

const User = require("../models/User");
const LoginHistory = require("../models/LoginHistory");
const AuditLog = require("../models/AuditLog");


/* ==========================================
   GET SECURITY OVERVIEW
========================================== */

exports.getSecurityOverview = async (req, res) => {

    try {

        const today = new Date();

        today.setHours(0, 0, 0, 0);


        /* ======================================
           USERS
        ====================================== */

        const totalUsers = await User.count();


        const totalAdmins = await User.count({

            where: {
                role: "Admin"
            }

        });


        const blockedUsers = await User.count({

            where: {
                status: "blocked"
            }

        });


        /* ======================================
           LOGIN STATISTICS
        ====================================== */

        const successfulLogins = await LoginHistory.count({

            where: {
                success: true
            }

        });


        const failedLogins = await LoginHistory.count({

            where: {
                success: false
            }

        });


        const todayLogins = await LoginHistory.count({

            where: {

                createdAt: {

                    [Op.gte]: today

                }

            }

        });


        const todayFailed = await LoginHistory.count({

            where: {

                success: false,

                createdAt: {

                    [Op.gte]: today

                }

            }

        });


        /* ======================================
           AUDIT LOGS
        ====================================== */

        const auditLogs = await AuditLog.count();


        /* ======================================
           PASSWORD RESET COUNT
        ====================================== */

        const passwordResets = await AuditLog.count({

            where: {
                action: "PASSWORD_RESET"
            }

        });


        /* ======================================
           ADMIN LOGINS
        ====================================== */

        const adminLogins = await LoginHistory.count({

            where: {
                success: true
            },

            include: [

                {

                    model: User,

                    as: "user",

                    where: {
                        role: "Admin"
                    }

                }

            ]

        });


        /* ======================================
           LATEST LOGINS
        ====================================== */

        const latestLogins = await LoginHistory.findAll({

            limit: 10,

            order: [

                ["createdAt", "DESC"]

            ],

            include: [

                {

                    model: User,

                    as: "user",

                    attributes: [

                        "id",
                        "name",
                        "email",
                        "role"

                    ]

                }

            ]

        });


        /* ======================================
           LATEST AUDIT LOGS
        ====================================== */

        const latestAuditLogs = await AuditLog.findAll({

            limit: 10,

            order: [

                ["createdAt", "DESC"]

            ]

        });


        /* ======================================
           RESPONSE
        ====================================== */

        return res.json({

            success: true,

            statistics: {

                totalUsers,

                totalAdmins,

                blockedUsers,

                successfulLogins,

                failedLogins,

                todayLogins,

                todayFailed,

                auditLogs,

                passwordResets,

                adminLogins

            },

            latestLogins,

            latestAuditLogs

        });

    }

    catch (error) {

        console.error(

            "SECURITY OVERVIEW ERROR:",

            error
        );


        return res.status(500).json({

            success: false,

            message:

                "Unable to load security overview."

        });

    }

};
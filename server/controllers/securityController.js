const { Op } = require("sequelize");

const User = require("../models/User");
const LoginHistory = require("../models/LoginHistory");
const AuditLog = require("../models/AuditLog");


/* ==========================================
   SECURITY DASHBOARD
========================================== */

exports.getSecurityDashboard = async (req, res) => {

    try {

        const today = new Date();

        today.setHours(0, 0, 0, 0);


        const [

            totalUsers,
            totalAdmins,
            blockedUsers,
            successfulLogins,
            failedLogins,
            todayLogins,
            todayFailed,
            auditLogs,
            passwordResets,
            latestLogins,
            latestAuditLogs

        ] = await Promise.all([

            User.count(),

            User.count({
                where: {
                    role: "admin"
                }
            }),

            User.count({
                where: {
                    status: "blocked"
                }
            }),

            LoginHistory.count({
                where: {
                    success: true
                }
            }),

            LoginHistory.count({
                where: {
                    success: false
                }
            }),

            LoginHistory.count({
                where: {
                    createdAt: {
                        [Op.gte]: today
                    }
                }
            }),

            LoginHistory.count({
                where: {
                    success: false,
                    createdAt: {
                        [Op.gte]: today
                    }
                }
            }),

            AuditLog.count(),

            AuditLog.count({
                where: {
                    action: {
                        [Op.like]: "%PASSWORD%"
                    }
                }
            }),

            LoginHistory.findAll({

                limit: 15,

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

            }),

            AuditLog.findAll({

                limit: 10,

                order: [
                    ["createdAt", "DESC"]
                ]

            })

        ]);


        const adminLogins = await LoginHistory.count({

            include: [
                {
                    model: User,

                    as: "user",

                    where: {
                        role: "admin"
                    },

                    required: true
                }
            ],

            where: {
                success: true
            }

        });


        return res.status(200).json({

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
            "SECURITY DASHBOARD ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load security dashboard.",

            error:
                error.message

        });

    }

};


/* ==========================================
   SECURITY ALERTS
========================================== */

exports.getSecurityAlerts = async (req, res) => {

    try {

        const alerts = [];


        /* ======================================
           FAILED LOGIN ATTACKS
        ====================================== */

        const failedLogins = await LoginHistory.count({

            where: {
                success: false
            }

        });


        if (failedLogins > 0) {

            alerts.push({

                id: "failed-logins",

                title: "Failed Login Attempts",

                description:
                    `${failedLogins} failed login attempts detected.`,

                level:
                    failedLogins > 10
                        ? "high"
                        : "medium",

                status: "active",

                createdAt: new Date()

            });

        }


        /* ======================================
           BLOCKED USERS
        ====================================== */

        const blockedUsers = await User.count({

            where: {
                status: "blocked"
            }

        });


        if (blockedUsers > 0) {

            alerts.push({

                id: "blocked-users",

                title: "Blocked User Accounts",

                description:
                    `${blockedUsers} user account(s) are currently blocked.`,

                level: "medium",

                status: "active",

                createdAt: new Date()

            });

        }


        /* ======================================
           RECENT FAILED LOGINS
        ====================================== */

        const recentFailedLogins =
            await LoginHistory.findAll({

                where: {

                    success: false

                },

                include: [

                    {

                        model: User,

                        as: "user",

                        attributes: [
                            "id",
                            "name",
                            "email"
                        ]

                    }

                ],

                limit: 10,

                order: [
                    ["createdAt", "DESC"]
                ]

            });


        recentFailedLogins.forEach(login => {

            alerts.push({

                id: `login-${login.id}`,

                title: "Suspicious Login Attempt",

                description:
                    `Failed login attempt for ${login.user?.email || "unknown user"}`,

                level: "high",

                status: "active",

                createdAt:
                    login.createdAt,

                user:
                    login.user

            });

        });


        return res.status(200).json({

            success: true,

            alerts

        });

    }

    catch (error) {

        console.error(
            "SECURITY ALERT ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load security alerts.",

            error:
                error.message

        });

    }

};
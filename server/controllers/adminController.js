const {
    User,
    Product,
    Store,
    Subscription,
    Advertisement,
    PromotionPayment,
    AuditLog,
    LoginHistory
} = require("../models");

const {
    createAuditLog
} = require("../services/auditService");


/* =========================================================
   HELPER: START OF TODAY
========================================================= */

const getStartOfToday = () => {

    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    return today;

};


/* =========================================================
   ADMIN DASHBOARD STATISTICS

   GET /api/admin/stats
========================================================= */

exports.getStats = async (req, res) => {

    try {

        const today = getStartOfToday();


        const [
            users,
            products,
            stores,
            pending,
            reports,
            salesToday
        ] = await Promise.all([


            /* USERS */

            User.count(),


            /* PRODUCTS */

            Product.count(),


            /* STORES */

            Store.count(),


            /* PENDING PRODUCTS */

            Product.count({

                where: {

                    status: "Pending"

                }

            }),


            /* REPORTS */

            0,


            /* TODAY'S SALES */

            PromotionPayment.sum(

                "amount",

                {

                    where: {

                        status: "Successful",

                        createdAt: {

                            $gte: today

                        }

                    }

                }

            )

        ]);


        return res.status(200).json({

            success: true,

            data: {

                users,

                products,

                stores,

                pending,

                reports,

                salesToday:

                    Number(
                        salesToday || 0
                    )

            }

        });

    }

    catch (error) {

        console.error(

            "GET ADMIN STATS ERROR:",

            error

        );


        return res.status(500).json({

            success: false,

            message:

                "Failed to load dashboard statistics.",

            error:

                error.message

        });

    }

};


/* =========================================================
   ADMIN DASHBOARD

   GET /api/admin/dashboard

   More detailed dashboard information
========================================================= */

exports.dashboard = async (req, res) => {

    try {

        const [

            users,

            products,

            stores,

            subscriptions,

            advertisements,

            pendingProducts,

            pendingStores,

            promotionRevenue,

            subscriptionRevenue

        ] = await Promise.all([


            User.count(),


            Product.count(),


            Store.count(),


            Subscription.count({

                where: {

                    status: "Active"

                }

            }),


            Advertisement.count({

                where: {

                    status: "Running"

                }

            }),


            Product.count({

                where: {

                    status: "Pending"

                }

            }),


            Store.count({

                where: {

                    status: "Pending"

                }

            }),


            PromotionPayment.sum(

                "amount",

                {

                    where: {

                        status: "Successful"

                    }

                }

            ),


            Subscription.sum(

                "amount"

            )

        ]);


        const revenue =

            Number(
                promotionRevenue || 0
            )

            +

            Number(
                subscriptionRevenue || 0
            );


        return res.status(200).json({

            success: true,

            data: {

                users,

                products,

                stores,

                subscriptions,

                advertisements,

                pendingProducts,

                pendingStores,

                revenue

            }

        });

    }

    catch (error) {

        console.error(

            "ADMIN DASHBOARD ERROR:",

            error

        );


        return res.status(500).json({

            success: false,

            message:

                "Failed to load dashboard.",

            error:

                error.message

        });

    }

};


/* =========================================================
   REVENUE CHART

   GET /api/admin/revenue/chart
========================================================= */

exports.getRevenueChart = async (req, res) => {

    try {

        /*
            Basic chart structure.

            Later we can connect this to
            real daily payment analytics.
        */

        const chart = [

            {
                date: "Mon",
                revenue: 0
            },

            {
                date: "Tue",
                revenue: 0
            },

            {
                date: "Wed",
                revenue: 0
            },

            {
                date: "Thu",
                revenue: 0
            },

            {
                date: "Fri",
                revenue: 0
            },

            {
                date: "Sat",
                revenue: 0
            },

            {
                date: "Sun",
                revenue: 0
            }

        ];


        return res.status(200).json({

            success: true,

            data: chart

        });

    }

    catch (error) {

        console.error(

            "GET REVENUE CHART ERROR:",

            error

        );


        return res.status(500).json({

            success: false,

            message:

                "Failed to load revenue chart.",

            error:

                error.message

        });

    }

};


/* =========================================================
   GET ALL AUDIT LOGS
========================================================= */

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

                [

                    "createdAt",

                    "DESC"

                ]

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

                "Failed to load audit logs."

        });

    }

};


/* =========================================================
   GET LOGIN HISTORY
========================================================= */

exports.getLoginHistory = async (req, res) => {

    try {

        const history = await LoginHistory.findAll({

            include: [

                {

                    model: User,

                    as: "user",

                    attributes: [

                        "id",

                        "name",

                        "email",

                        "role"

                    ],

                    required: false

                }

            ],

            order: [

                [

                    "createdAt",

                    "DESC"

                ]

            ]

        });


        return res.status(200).json({

            success: true,

            history

        });

    }

    catch (error) {

        console.error(

            "GET LOGIN HISTORY ERROR:",

            error

        );


        return res.status(500).json({

            success: false,

            message:

                "Failed to load login history."

        });

    }

};


/* =========================================================
   TEST AUDIT LOG
========================================================= */

exports.testAuditLog = async (req, res) => {

    try {

        if (!req.user?.id) {

            return res.status(401).json({

                success: false,

                message:

                    "Unauthorized."

            });

        }


        const log = await createAuditLog({

            adminId:

                req.user.id,

            action:

                "TEST_AUDIT",

            entity:

                "System",

            entityId:

                null,

            description:

                `Administrator ${req.user.id} tested the audit logging system.`,

            req

        });


        return res.status(200).json({

            success: true,

            message:

                "Audit log created successfully.",

            log

        });

    }

    catch (error) {

        console.error(

            "TEST AUDIT ERROR:",

            error

        );


        return res.status(500).json({

            success: false,

            message:

                "Failed to create audit log."

        });

    }

};


/* =========================================================
   ADMIN ACTIVITY SUMMARY
========================================================= */

exports.getAdminActivitySummary = async (req, res) => {

    try {

        const [

            totalAuditLogs,

            totalLogins,

            successfulLogins,

            failedLogins

        ] = await Promise.all([


            AuditLog.count(),


            LoginHistory.count(),


            LoginHistory.count({

                where: {

                    success: true

                }

            }),


            LoginHistory.count({

                where: {

                    success: false

                }

            })

        ]);


        return res.status(200).json({

            success: true,

            summary: {

                totalAuditLogs,

                totalLogins,

                successfulLogins,

                failedLogins

            }

        });

    }

    catch (error) {

        console.error(

            "ADMIN ACTIVITY SUMMARY ERROR:",

            error

        );


        return res.status(500).json({

            success: false,

            message:

                "Failed to load activity summary."

        });

    }

};
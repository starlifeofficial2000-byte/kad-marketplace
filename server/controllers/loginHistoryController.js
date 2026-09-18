const {
    LoginHistory,
    User
} = require("../models");


/* ==========================================
   GET MY LOGIN HISTORY
========================================== */

exports.getMyLoginHistory = async (req, res) => {

    try {

        if (!req.user || !req.user.id) {

            return res.status(401).json({

                success: false,

                message: "Unauthorized access."

            });

        }


        const history = await LoginHistory.findAll({

            where: {

                userId: req.user.id

            },

            attributes: [

                "id",

                "userId",

                "ipAddress",

                "userAgent",

                "browser",

                "device",

                "operatingSystem",

                "location",

                "success",

                "createdAt",

                "updatedAt"

            ],

            order: [

                ["createdAt", "DESC"]

            ],

            limit: 50

        });


        return res.status(200).json({

            success: true,

            history

        });

    }

    catch (error) {

        console.error(
            "GET MY LOGIN HISTORY ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to load login history.",

            error: error.message

        });

    }

};


/* ==========================================
   ADMIN GET SPECIFIC USER LOGIN HISTORY
========================================== */

exports.getUserLoginHistory = async (req, res) => {

    try {

        const userId = Number(req.params.userId);


        if (!userId) {

            return res.status(400).json({

                success: false,

                message: "Invalid user ID."

            });

        }


        /* ======================================
           CHECK IF USER EXISTS
        ====================================== */

        const user = await User.findByPk(userId, {

            attributes: [

                "id",

                "name",

                "email"

            ]

        });


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }


        /* ======================================
           GET LOGIN HISTORY
        ====================================== */

        const history = await LoginHistory.findAll({

            where: {

                userId: userId

            },

            attributes: [

                "id",

                "userId",

                "ipAddress",

                "userAgent",

                "browser",

                "device",

                "operatingSystem",

                "location",

                "success",

                "createdAt",

                "updatedAt"

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });


        return res.status(200).json({

            success: true,

            user,

            history

        });

    }

    catch (error) {

        console.error(
            "GET USER LOGIN HISTORY ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to load user login history.",

            error: error.message

        });

    }

};
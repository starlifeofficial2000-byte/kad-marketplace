const Notification = require("../models/Notification");
const User = require("../models/User");

/* ==========================================
   GET USERS
========================================== */

exports.getUsers = async (req, res) => {

    try {

        const users = await User.findAll({

            attributes: [

                "id",

                "name",

                "email",

                "role"

            ],

            order: [["name", "ASC"]]

        });

        res.json(users);

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   SEND NOTIFICATION
========================================== */

exports.sendNotification = async (req, res) => {

    try {

        const {

            title,

            message,

            recipient,

            userId

        } = req.body;

        let users = [];

        if (recipient === "Everyone") {

            users = await User.findAll();

        }

        else if (recipient === "Buyers") {

            users = await User.findAll({

                where: {

                    role: "user"

                }

            });

        }

        else if (recipient === "Sellers") {

            users = await User.findAll({

                where: {

                    role: "seller"

                }

            });

        }

        else if (recipient === "Administrators") {

            users = await User.findAll({

                where: {

                    role: "admin"

                }

            });

        }

        else {

            users = [

                await User.findByPk(userId)

            ];

        }

        for (const user of users) {

            if (!user) continue;

            await Notification.create({

                userId: user.id,

                title,

                message,

                type: "System"

            });

        }

        res.json({

            success: true,

            message: "Notification sent successfully."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
const Notification = require("../models/Notification");

// Get Notifications
exports.getNotifications = async (req, res) => {

    try {

        const notifications = await Notification.findAll({

           where: {
    userId: req.user.id
},

            order: [["createdAt", "DESC"]]

        });

        res.json(notifications);

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

// Mark as Read
exports.markAsRead = async (req, res) => {

    try {

       const notification = await Notification.findOne({

    where: {

        id: req.params.id,

        userId: req.user.id

    }

});

        if (!notification) {

            return res.status(404).json({
                message: "Notification not found"
            });

        }

        notification.isRead = true;

        await notification.save();

        res.json({

            success: true

        });

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};exports.getUnreadCount = async (req, res) => {

    try {

        const count = await Notification.count({

            where: {

                userId: req.user.id,

                isRead: false

            }

        });

        res.json({

            success: true,

            count

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};exports.markAllAsRead = async (req, res) => {

    try {

        await Notification.update(

            {

                isRead: true

            },

            {

                where: {

                    userId: req.user.id,

                    isRead: false

                }

            }

        );

        res.json({

            success: true

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
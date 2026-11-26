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
exports.deleteNotification = async (req,res)=>{try{const row=await Notification.findOne({where:{id:req.params.id,userId:req.user.id}});if(!row)return res.status(404).json({success:false,message:"Notification not found."});await row.destroy();return res.json({success:true,message:"Notification deleted."});}catch(error){console.error("DELETE NOTIFICATION ERROR:",error);return res.status(500).json({success:false,message:"Unable to delete notification."});}};


/* Register this authenticated user's FCM token for push notifications. */
exports.registerDeviceToken = async (req, res) => {
    try {
        const token = String(req.body.token || "").trim();
        const platform = String(req.body.platform || "").trim().slice(0, 24);

        if (!token || token.length < 20) {
            return res.status(400).json({
                success: false,
                message: "A valid device notification token is required."
            });
        }

        const DeviceToken = require("../models/DeviceToken");
        const existing = await DeviceToken.findOne({ where: { token } });

        if (existing) {
            await existing.update({ userId: req.user.id, platform: platform || existing.platform });
        } else {
            await DeviceToken.create({ userId: req.user.id, token, platform: platform || null });
        }

        return res.json({ success: true, message: "Notification device registered." });
    } catch (error) {
        console.error("REGISTER DEVICE TOKEN ERROR:", error);
        return res.status(500).json({ success: false, message: "Unable to register notification device." });
    }
};

exports.unregisterDeviceToken = async (req, res) => {
    try {
        const token = String(req.body.token || "").trim();
        if (!token) return res.status(400).json({ success: false, message: "Device token is required." });

        const DeviceToken = require("../models/DeviceToken");
        await DeviceToken.destroy({ where: { userId: req.user.id, token } });
        return res.json({ success: true, message: "Notification device unregistered." });
    } catch (error) {
        console.error("UNREGISTER DEVICE TOKEN ERROR:", error);
        return res.status(500).json({ success: false, message: "Unable to unregister notification device." });
    }
};

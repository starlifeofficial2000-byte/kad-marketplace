const express = require("express");
const router = express.Router();

const User = require("../models/User");

// IMPORTANT: adjust this import to match your existing middleware file
const auth = require("../middleware/auth");


// ==========================================
// GET USER SETTINGS
// ==========================================

router.get("/", auth, async (req, res) => {
    try {

        const user = await User.findByPk(req.user.id, {
            attributes: {
                exclude: [
                    "password",
                    "loginOTP",
                    "loginOTPExpires",
                    "twoFactorCode",
                    "twoFactorExpires",
                    "resetOTP",
                    "resetOTPExpires"
                ]
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.status(200).json({
            success: true,
            settings: {
                name: user.name,
                email: user.email,
                phone: user.phone,

                emailNotifications: user.emailNotifications,
                smsNotifications: user.smsNotifications,
                pushNotifications: user.pushNotifications,

                showPhone: user.showPhone,
                showOnline: user.showOnline
            }
        });

    } catch (error) {

        console.error("GET SETTINGS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load settings."
        });

    }
});


// ==========================================
// UPDATE USER SETTINGS
// ==========================================

router.put("/", auth, async (req, res) => {

    try {

        const {
            name,
            email,
            phone,

            emailNotifications,
            smsNotifications,
            pushNotifications,

            showPhone,
            showOnline

        } = req.body;


        const user = await User.findByPk(req.user.id);


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }


        // Update only allowed fields

        if (name !== undefined) {
            user.name = name;
        }

        if (email !== undefined) {
            user.email = email;
        }

        if (phone !== undefined) {
            user.phone = phone;
        }

        if (emailNotifications !== undefined) {
            user.emailNotifications = emailNotifications;
        }

        if (smsNotifications !== undefined) {
            user.smsNotifications = smsNotifications;
        }

        if (pushNotifications !== undefined) {
            user.pushNotifications = pushNotifications;
        }

        if (showPhone !== undefined) {
            user.showPhone = showPhone;
        }

        if (showOnline !== undefined) {
            user.showOnline = showOnline;
        }


        await user.save();


        res.status(200).json({

            success: true,

            message: "Settings updated successfully.",

            settings: {

                name: user.name,
                email: user.email,
                phone: user.phone,

                emailNotifications: user.emailNotifications,
                smsNotifications: user.smsNotifications,
                pushNotifications: user.pushNotifications,

                showPhone: user.showPhone,
                showOnline: user.showOnline

            }

        });

    }

    catch (error) {

        console.error("UPDATE SETTINGS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update settings."
        });

    }

});


module.exports = router;
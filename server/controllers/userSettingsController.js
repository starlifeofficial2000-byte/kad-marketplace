const User = require("../models/User");


/* ==========================================
   GET USER SETTINGS
========================================== */

exports.getUserSettings = async (req, res) => {

    try {

        const userId = req.user.id;


        const user = await User.findByPk(userId, {

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


        return res.status(200).json({

            success: true,

            settings: {

                name: user.name || "",

                email: user.email || "",

                phone: user.phone || "",

                emailNotifications:
                    user.emailNotifications ?? true,

                smsNotifications:
                    user.smsNotifications ?? false,

                pushNotifications:
                    user.pushNotifications ?? true,

                showPhone:
                    user.showPhone ?? true,

                showOnline:
                    user.showOnline ?? true

            }

        });

    }

    catch (error) {

        console.error(
            "GET USER SETTINGS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Unable to load user settings."

        });

    }

};


/* ==========================================
   UPDATE USER SETTINGS
========================================== */

exports.updateUserSettings = async (req, res) => {

    try {

        const userId = req.user.id;


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


        const user = await User.findByPk(userId);


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }


        /* =====================================
           CHECK EMAIL IF CHANGED
        ===================================== */

        if (email && email !== user.email) {

            const existingUser =
                await User.findOne({

                    where: {

                        email: email

                    }

                });


            if (existingUser) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This email address is already in use."

                });

            }

        }


        /* =====================================
           UPDATE USER
        ===================================== */

        await user.update({

            name:

                name !== undefined

                    ? name

                    : user.name,


            email:

                email !== undefined

                    ? email

                    : user.email,


            phone:

                phone !== undefined

                    ? phone

                    : user.phone,


            emailNotifications:

                emailNotifications !== undefined

                    ? emailNotifications

                    : user.emailNotifications,


            smsNotifications:

                smsNotifications !== undefined

                    ? smsNotifications

                    : user.smsNotifications,


            pushNotifications:

                pushNotifications !== undefined

                    ? pushNotifications

                    : user.pushNotifications,


            showPhone:

                showPhone !== undefined

                    ? showPhone

                    : user.showPhone,


            showOnline:

                showOnline !== undefined

                    ? showOnline

                    : user.showOnline

        });


        return res.status(200).json({

            success: true,

            message:

                "Settings updated successfully.",


            settings: {

                name: user.name,

                email: user.email,

                phone: user.phone,

                emailNotifications:
                    user.emailNotifications,

                smsNotifications:
                    user.smsNotifications,

                pushNotifications:
                    user.pushNotifications,

                showPhone:
                    user.showPhone,

                showOnline:
                    user.showOnline

            }

        });

    }

    catch (error) {

        console.error(
            "UPDATE USER SETTINGS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Unable to update settings."

        });

    }

};
exports.verifyLoginOTP = async (req, res) => {

    try {

        const { email, otp } = req.body;

        // Validate request
        if (!email || !otp) {

            return res.status(400).json({

                success: false,
                message: "Email and verification code are required."

            });

        }

        // Find user
        const user = await User.findOne({

            where: {

                email: email.trim().toLowerCase()

            },

            include: [

    {
        model: Subscription,
        as: "subscription",
        include: [
            {
                model: SubscriptionPlan,
                as: "subscriptionPlan"
            }
        ]
    },

    {
        model: Role,
        as: "roles",
        include: [
            {
                model: Permission,
                as: "permissions"
            }
        ]
    }

]
        });

        if (!user) {

            return res.status(404).json({

                success: false,
                message: "User not found."

            });

        }

        // Check if OTP exists
        if (!user.loginOTP) {

            return res.status(400).json({

                success: false,
                message: "No verification code found. Please request a new one."

            });

        }

        // Check expiry
        if (

            !user.loginOTPExpires ||

            user.loginOTPExpires < new Date()

        ) {

            return res.status(400).json({

                success: false,
                message: "Verification code has expired. Please request a new one."

            });

        }

        // Compare entered OTP with hashed OTP
        const validOTP = await bcrypt.compare(

            otp.trim(),

            user.loginOTP

        );

        if (!validOTP) {

            return res.status(400).json({

                success: false,
                message: "Invalid verification code."

            });

        }

        // Clear OTP after successful verification
        user.loginOTP = null;
        user.loginOTPExpires = null;

        // Reset failed login attempts
        user.loginAttempts = 0;
        user.lockUntil = null;

        await user.save();

        // Save login history
        await saveLoginHistory({

            userId: user.id,

            req,

            success: true

        });

        // Create JWT
        const token = jwt.sign(

    {

        id: user.id,

        email: user.email

    },

    process.env.JWT_SECRET,

    {

        expiresIn: "7d"

    }

);
        return res.json({

            success: true,

            token,

            user,

            message: "Login successful."

        });

    }

    catch (error) {

        console.error("VERIFY LOGIN OTP ERROR:", error);

        return res.status(500).json({

            success: false,

            message: "Server error."

        });

    }

};
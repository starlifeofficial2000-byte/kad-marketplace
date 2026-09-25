const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
    User,
    Role,
    Permission,
    LoginHistory,
    SecurityAlert,
    Setting,
    AuditLog
} = require("../models");

const sendEmail = require("../utils/sendEmail");

const {
    getSetting,
    toBoolean
} = require("../services/marketplaceSettingsService");


/* =========================================================
   CONFIGURATION
========================================================= */

const OTP_EXPIRY_MINUTES = 5;
const RESET_OTP_EXPIRY_MINUTES = 10;

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 30;


/* =========================================================
   ADMINISTRATIVE PERMISSIONS

   Users with administrative permissions or an admin role
   are required to complete 2FA.
========================================================= */

const ADMIN_PERMISSIONS = [
    "manage_users",
    "manage_roles",
    "manage_permissions",

    "manage_products",
    "approve_products",
    "reject_products",
    "delete_products",

    "manage_subscriptions",
    "manage_payments",

    "manage_promotions",

    "manage_reports",

    "manage_settings",

    "view_analytics",

    "view_security_alerts",
    "manage_security",

    "view_audit_logs",

    "admin_access",
    "super_admin"
];


/* =========================================================
   GENERATE OTP
========================================================= */

const generateOTP = () => {
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
};


/* =========================================================
   GENERATE JWT TOKEN
========================================================= */

const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};


/* =========================================================
   FIND USER WITH ROLES AND PERMISSIONS
========================================================= */

const findUserWithAccess = async (email) => {
    return await User.findOne({
        where: {
            email
        },

        include: [
            {
                model: Role,
                as: "roles",

                through: {
                    attributes: []
                },

                include: [
                    {
                        model: Permission,
                        as: "permissions",

                        through: {
                            attributes: []
                        }
                    }
                ]
            }
        ]
    });
};


/* =========================================================
   GET USER ACCESS
========================================================= */

const getUserAccess = (user) => {
    const roles = [];
    const permissions = [];

    if (
        user &&
        Array.isArray(user.roles)
    ) {
        user.roles.forEach((role) => {

            if (role && role.name) {
                roles.push(role.name);
            }

            if (
                role &&
                Array.isArray(role.permissions)
            ) {
                role.permissions.forEach(
                    (permission) => {

                        if (
                            permission &&
                            permission.name &&
                            !permissions.includes(
                                permission.name
                            )
                        ) {
                            permissions.push(
                                permission.name
                            );
                        }
                    }
                );
            }
        });
    }

    return {
        roles,
        permissions
    };
};


/* =========================================================
   CHECK ADMINISTRATIVE ACCESS / 2FA
========================================================= */

const requiresTwoFactorAuthentication = (user) => {

    const {
        roles,
        permissions
    } = getUserAccess(user);

    const normalizedPermissions =
        permissions.map(
            (permission) =>
                String(permission)
                    .trim()
                    .toLowerCase()
        );

    const normalizedAdminPermissions =
        ADMIN_PERMISSIONS.map(
            (permission) =>
                permission
                    .trim()
                    .toLowerCase()
        );

    const hasAdminPermission =
        normalizedPermissions.some(
            (permission) =>
                normalizedAdminPermissions.includes(
                    permission
                )
        );

    const normalizedRoles =
        roles.map(
            (role) =>
                String(role)
                    .trim()
                    .toLowerCase()
        );

    const hasAdminRole =
        normalizedRoles.some(
            (role) =>
                role === "admin" ||
                role === "super admin" ||
                role === "super_admin"
        );

    return (
        hasAdminPermission ||
        hasAdminRole
    );
};


/* =========================================================
   FORMAT USER RESPONSE
========================================================= */

const formatUserResponse = (user) => {

    const {
        roles,
        permissions
    } = getUserAccess(user);

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        role: user.role,
        status: user.status,

        roles,
        permissions,

        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
    };
};


/* =========================================================
   SAVE LOGIN HISTORY
========================================================= */

const saveLoginHistory = async ({
    userId,
    req,
    success
}) => {

    try {

        if (!LoginHistory) {
            return;
        }

        await LoginHistory.create({
            userId,

            ipAddress:
                req.ip ||
                req.headers["x-forwarded-for"] ||
                "Unknown",

            userAgent:
                req.headers["user-agent"] ||
                "Unknown",

            success
        });

    } catch (error) {

        console.error(
            "LOGIN HISTORY ERROR:",
            error.message
        );
    }
};


/* =========================================================
   CREATE SECURITY ALERT
========================================================= */

const createAlert = async ({
    userId,
    title,
    description,
    riskLevel = "Low"
}) => {

    try {

        if (!SecurityAlert) {
            return;
        }

        await SecurityAlert.create({
            userId,
            title,
            description,
            riskLevel
        });

    } catch (error) {

        console.error(
            "SECURITY ALERT ERROR:",
            error.message
        );
    }
};


/* =========================================================
   REGISTER USER
========================================================= */

exports.register = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            ghanaCard,
            region,
            city,
            address,
            password
        } = req.body;


        /* ==========================================
           CENTRALIZED REGISTRATION SETTING
        ========================================== */

        const registrationEnabled =
            toBoolean(
                await getSetting(
                    "registration_enabled",
                    true
                ),
                true
            );

        if (!registrationEnabled) {

            return res.status(403).json({
                success: false,

                message:
                    "New user registration is currently disabled by the administrator."
            });
        }


        /* ==========================================
           GET PASSWORD SETTINGS

           Kept compatible with the existing Setting
           model until password settings are migrated
           to MarketplaceSetting.
        ========================================== */

        let minimumPasswordLength = 8;

        try {

            const passwordSetting =
                await Setting.findOne({
                    where: {
                        settingKey:
                            "minimum_password_length"
                    }
                });

            if (
                passwordSetting &&
                passwordSetting.settingValue
            ) {
                const configuredLength =
                    Number(
                        passwordSetting.settingValue
                    );

                if (
                    Number.isFinite(
                        configuredLength
                    ) &&
                    configuredLength >= 6
                ) {
                    minimumPasswordLength =
                        configuredLength;
                }
            }

        } catch (settingError) {

            console.error(
                "PASSWORD SETTING ERROR:",
                settingError.message
            );

            /*
             * Do not stop registration simply because
             * the legacy password setting cannot be read.
             */
        }


        /* ==========================================
           VALIDATE REQUIRED FIELDS
        ========================================== */

        if (
            !name ||
            !email ||
            !ghanaCard ||
            !region ||
            !city ||
            !password
        ) {

            return res.status(400).json({
                success: false,

                message:
                    "Please fill in all required fields."
            });
        }


        /* ==========================================
           VALIDATE PASSWORD LENGTH
        ========================================== */

        if (
            String(password).length <
            minimumPasswordLength
        ) {

            return res.status(400).json({
                success: false,

                message:
                    `Password must be at least ${minimumPasswordLength} characters long.`
            });
        }


        /* ==========================================
           NORMALIZE INPUT
        ========================================== */

        const normalizedName =
            String(name).trim();

        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();

        const normalizedPhone =
            phone
                ? String(phone).trim()
                : null;

        const normalizedGhanaCard =
            String(ghanaCard)
                .trim()
                .toUpperCase();

        const normalizedRegion =
            String(region).trim();

        const normalizedCity =
            String(city).trim();

        const normalizedAddress =
            address
                ? String(address).trim()
                : null;


        /* ==========================================
           CHECK EXISTING EMAIL
        ========================================== */

        const existingUser =
            await User.findOne({
                where: {
                    email:
                        normalizedEmail
                }
            });

        if (existingUser) {

            return res.status(400).json({
                success: false,

                message:
                    "An account with this email already exists."
            });
        }


        /* ==========================================
           CHECK GHANA CARD
        ========================================== */

        const existingGhanaCard =
            await User.findOne({
                where: {
                    ghanaCard:
                        normalizedGhanaCard
                }
            });

        if (existingGhanaCard) {

            return res.status(400).json({
                success: false,

                message:
                    "This Ghana Card is already registered."
            });
        }


        /* ==========================================
           HASH PASSWORD
        ========================================== */

        const hashedPassword =
            await bcrypt.hash(
                String(password),
                10
            );


        /* ==========================================
           CREATE USER
        ========================================== */

        const user =
            await User.create({

                name:
                    normalizedName,

                email:
                    normalizedEmail,

                phone:
                    normalizedPhone,

                ghanaCard:
                    normalizedGhanaCard,

                region:
                    normalizedRegion,

                city:
                    normalizedCity,

                address:
                    normalizedAddress,

                password:
                    hashedPassword,

                role:
                    "user",

                status:
                    "Active"
            });


        /* ==========================================
           CREATE AUDIT LOG
        ========================================== */

        try {

            if (AuditLog) {

                await AuditLog.create({

                    adminId:
                        user.id,

                    action:
                        "USER_REGISTERED",

                    entity:
                        "User",

                    entityId:
                        user.id,

                    description:
                        `New user registered: ${user.email}`,

                    ipAddress:
                        req.ip ||
                        req.headers["x-forwarded-for"] ||
                        "Unknown"
                });
            }

        } catch (auditError) {

            console.error(
                "AUDIT LOG ERROR:",
                auditError.message
            );
        }


        /* ==========================================
           RESPONSE
        ========================================== */

        return res.status(201).json({

            success: true,

            message:
                "Account created successfully.",

            user:
                formatUserResponse(user)
        });

    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Registration failed."
        });
    }
};


/* =========================================================
   LOGIN
========================================================= */

exports.login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        /* =========================================
           VALIDATION
        ========================================= */

        if (!email || !password) {

            return res.status(400).json({
                success: false,

                message:
                    "Email and password are required."
            });
        }


        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        /* =========================================
           FIND USER
        ========================================= */

        const user =
            await findUserWithAccess(
                normalizedEmail
            );

        if (!user) {

            return res.status(401).json({
                success: false,

                message:
                    "Invalid email or password."
            });
        }


        /* =========================================
           CHECK ACCOUNT STATUS
        ========================================= */

        if (
            String(user.status || "")
                .toLowerCase() ===
            "blocked"
        ) {

            return res.status(403).json({
                success: false,

                message:
                    "Your account has been blocked. Please contact support."
            });
        }


        /* =========================================
           CHECK ACCOUNT LOCK
        ========================================= */

        if (
            user.lockUntil &&
            new Date(user.lockUntil) >
                new Date()
        ) {

            const remainingMinutes =
                Math.ceil(
                    (
                        new Date(
                            user.lockUntil
                        ).getTime() -
                        Date.now()
                    ) / 60000
                );

            return res.status(423).json({
                success: false,

                message:
                    `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`
            });
        }


        /* =========================================
           RESET EXPIRED LOCK
        ========================================= */

        if (
            user.lockUntil &&
            new Date(user.lockUntil) <=
                new Date()
        ) {

            user.loginAttempts = 0;
            user.lockUntil = null;

            await user.save();
        }


        /* =========================================
           VERIFY PASSWORD
        ========================================= */

        const validPassword =
            await bcrypt.compare(
                String(password),
                user.password
            );


        /* =========================================
           INVALID PASSWORD
        ========================================= */

        if (!validPassword) {

            user.loginAttempts =
                (user.loginAttempts || 0) + 1;

            if (
                user.loginAttempts >=
                MAX_LOGIN_ATTEMPTS
            ) {

                user.lockUntil =
                    new Date(
                        Date.now() +
                        LOCK_TIME_MINUTES *
                        60 *
                        1000
                    );

                await createAlert({
                    userId:
                        user.id,

                    title:
                        "Account Locked",

                    description:
                        `Account locked after ${MAX_LOGIN_ATTEMPTS} failed login attempts.`,

                    riskLevel:
                        "High"
                });
            }

            await user.save();

            await saveLoginHistory({
                userId:
                    user.id,

                req,

                success:
                    false
            });

            return res.status(401).json({
                success: false,

                message:
                    "Invalid email or password."
            });
        }


        /* =========================================
           PASSWORD CORRECT
        ========================================= */

        user.loginAttempts = 0;
        user.lockUntil = null;


        /* =========================================
           CHECK ADMINISTRATIVE ACCESS
        ========================================= */

        const requires2FA =
            requiresTwoFactorAuthentication(
                user
            );


        /* =========================================
           REQUIRE TWO FACTOR AUTHENTICATION
        ========================================= */

        if (requires2FA) {

            const otp =
                generateOTP();

            const hashedOTP =
                await bcrypt.hash(
                    otp,
                    10
                );

            user.twoFactorCode =
                hashedOTP;

            user.twoFactorExpires =
                new Date(
                    Date.now() +
                    OTP_EXPIRY_MINUTES *
                    60 *
                    1000
                );

            await user.save();

            try {

                await sendEmail(

                    user.email,

                    "KAD Marketplace Administrator Verification",

                    `
                    <div style="
                        font-family:Arial,sans-serif;
                        padding:20px;
                    ">

                        <h2>
                            KAD Marketplace
                        </h2>

                        <p>
                            Hello ${user.name},
                        </p>

                        <p>
                            Your administrator
                            login verification code is:
                        </p>

                        <h1 style="
                            font-size:32px;
                            letter-spacing:6px;
                            color:#0562be;
                        ">
                            ${otp}
                        </h1>

                        <p>
                            This code expires in
                            ${OTP_EXPIRY_MINUTES}
                            minutes.
                        </p>

                        <p>
                            Never share this code
                            with anyone.
                        </p>

                    </div>
                    `
                );

            } catch (emailError) {

                console.error(
                    "EMAIL ERROR:",
                    emailError
                );

                /*
                 * Remove the temporary OTP so
                 * an unusable code is not left active.
                 */

                user.twoFactorCode = null;
                user.twoFactorExpires = null;

                await user.save();

                return res.status(500).json({
                    success: false,

                    message:
                        "Unable to send verification code."
                });
            }

            return res.status(200).json({

                success: true,

                requiresTwoFactor:
                    true,

                requiresOTP:
                    true,

                email:
                    user.email,

                message:
                    "Verification code sent to your email."
            });
        }


        /* =========================================
           NORMAL USER LOGIN
        ========================================= */

        await user.save();

        const token =
            generateToken(user);

        await saveLoginHistory({
            userId:
                user.id,

            req,

            success:
                true
        });

        await createAlert({
            userId:
                user.id,

            title:
                "Successful Login",

            description:
                `${user.email} successfully logged in.`,

            riskLevel:
                "Low"
        });

        return res.status(200).json({

            success: true,

            requiresTwoFactor:
                false,

            requiresOTP:
                false,

            token,

            user:
                formatUserResponse(user)
        });

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Login failed."
        });
    }
};


/* =========================================================
   VERIFY LOGIN OTP
========================================================= */

exports.verifyLoginOTP = async (req, res) => {

    try {

        const {
            email,
            otp
        } = req.body;


        if (!email || !otp) {

            return res.status(400).json({
                success: false,

                message:
                    "Email and verification code are required."
            });
        }


        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        const user =
            await findUserWithAccess(
                normalizedEmail
            );


        if (!user) {

            return res.status(404).json({
                success: false,

                message:
                    "User not found."
            });
        }


        const requires2FA =
            requiresTwoFactorAuthentication(
                user
            );


        if (!requires2FA) {

            return res.status(403).json({
                success: false,

                message:
                    "This account does not require two-factor authentication."
            });
        }


        if (
            !user.twoFactorCode ||
            !user.twoFactorExpires
        ) {

            return res.status(400).json({
                success: false,

                message:
                    "No active verification code found. Please log in again."
            });
        }


        if (
            new Date(
                user.twoFactorExpires
            ) < new Date()
        ) {

            user.twoFactorCode = null;
            user.twoFactorExpires = null;

            await user.save();

            return res.status(400).json({
                success: false,

                message:
                    "Verification code has expired. Please log in again."
            });
        }


        const validOTP =
            await bcrypt.compare(
                String(otp).trim(),
                user.twoFactorCode
            );


        if (!validOTP) {

            return res.status(400).json({
                success: false,

                message:
                    "Invalid verification code."
            });
        }


        /* =========================================
           CLEAR OTP
        ========================================= */

        user.twoFactorCode = null;
        user.twoFactorExpires = null;

        user.loginAttempts = 0;
        user.lockUntil = null;

        await user.save();


        /* =========================================
           GENERATE TOKEN
        ========================================= */

        const token =
            generateToken(user);


        await saveLoginHistory({
            userId:
                user.id,

            req,

            success:
                true
        });


        await createAlert({
            userId:
                user.id,

            title:
                "Two-Factor Authentication Successful",

            description:
                `${user.email} successfully completed administrator verification.`,

            riskLevel:
                "Low"
        });


        return res.status(200).json({

            success: true,

            message:
                "Verification successful.",

            token,

            user:
                formatUserResponse(user)
        });

    } catch (error) {

        console.error(
            "VERIFY LOGIN OTP ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to verify authentication code."
        });
    }
};


/* =========================================================
   RESEND LOGIN OTP
========================================================= */

exports.resendLoginOTP = async (req, res) => {

    try {

        const {
            email
        } = req.body;


        if (!email) {

            return res.status(400).json({
                success: false,

                message:
                    "Email is required."
            });
        }


        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        const user =
            await findUserWithAccess(
                normalizedEmail
            );


        if (!user) {

            return res.status(404).json({
                success: false,

                message:
                    "User not found."
            });
        }


        const requires2FA =
            requiresTwoFactorAuthentication(
                user
            );


        if (!requires2FA) {

            return res.status(403).json({
                success: false,

                message:
                    "This account does not require two-factor authentication."
            });
        }


        const otp =
            generateOTP();

        const hashedOTP =
            await bcrypt.hash(
                otp,
                10
            );


        user.twoFactorCode =
            hashedOTP;

        user.twoFactorExpires =
            new Date(
                Date.now() +
                OTP_EXPIRY_MINUTES *
                60 *
                1000
            );


        await user.save();


        await sendEmail(

            user.email,

            "KAD Marketplace New Verification Code",

            `
            <div style="
                font-family:Arial,sans-serif;
                padding:20px;
            ">

                <h2>
                    KAD Marketplace
                </h2>

                <p>
                    Hello ${user.name},
                </p>

                <p>
                    Your new verification code is:
                </p>

                <h1 style="
                    font-size:32px;
                    letter-spacing:6px;
                    color:#0562be;
                ">
                    ${otp}
                </h1>

                <p>
                    This code expires in
                    ${OTP_EXPIRY_MINUTES}
                    minutes.
                </p>

            </div>
            `
        );


        return res.status(200).json({

            success: true,

            message:
                "A new verification code has been sent."
        });

    } catch (error) {

        console.error(
            "RESEND OTP ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to resend verification code."
        });
    }
};


/* =========================================================
   FORGOT PASSWORD
========================================================= */

exports.forgotPassword = async (req, res) => {

    try {

        const {
            email
        } = req.body;


        if (!email) {

            return res.status(400).json({
                success: false,

                message:
                    "Email is required."
            });
        }


        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        const user =
            await User.findOne({
                where: {
                    email:
                        normalizedEmail
                }
            });


        if (!user) {

            return res.status(404).json({
                success: false,

                message:
                    "No account found with this email."
            });
        }


        const otp =
            generateOTP();

        const hashedOTP =
            await bcrypt.hash(
                otp,
                10
            );


        user.resetOTP =
            hashedOTP;

        user.resetOTPExpires =
            new Date(
                Date.now() +
                RESET_OTP_EXPIRY_MINUTES *
                60 *
                1000
            );

        user.resetVerified =
            false;


        await user.save();


        await sendEmail(

            user.email,

            "KAD Marketplace Password Reset",

            `
            <div style="
                font-family:Arial,sans-serif;
                padding:20px;
            ">

                <h2>
                    Password Reset Request
                </h2>

                <p>
                    Hello ${user.name},
                </p>

                <p>
                    Your password reset code is:
                </p>

                <h1 style="
                    font-size:32px;
                    letter-spacing:6px;
                    color:#0562be;
                ">
                    ${otp}
                </h1>

                <p>
                    This code expires in
                    ${RESET_OTP_EXPIRY_MINUTES}
                    minutes.
                </p>

            </div>
            `
        );


        return res.status(200).json({

            success: true,

            message:
                "Password reset code sent to your email."
        });

    } catch (error) {

        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to process password reset request."
        });
    }
};


/* =========================================================
   VERIFY RESET OTP
========================================================= */

exports.verifyResetOTP = async (req, res) => {

    try {

        const {
            email,
            otp
        } = req.body;


        if (!email || !otp) {

            return res.status(400).json({
                success: false,

                message:
                    "Email and verification code are required."
            });
        }


        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        const user =
            await User.findOne({
                where: {
                    email:
                        normalizedEmail
                }
            });


        if (!user) {

            return res.status(404).json({
                success: false,

                message:
                    "User not found."
            });
        }


        if (
            !user.resetOTP ||
            !user.resetOTPExpires
        ) {

            return res.status(400).json({
                success: false,

                message:
                    "No password reset request found."
            });
        }


        if (
            new Date(
                user.resetOTPExpires
            ) < new Date()
        ) {

            return res.status(400).json({
                success: false,

                message:
                    "Password reset code has expired."
            });
        }


        const validOTP =
            await bcrypt.compare(
                String(otp).trim(),
                user.resetOTP
            );


        if (!validOTP) {

            return res.status(400).json({
                success: false,

                message:
                    "Invalid verification code."
            });
        }


        user.resetVerified =
            true;

        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Verification successful."
        });

    } catch (error) {

        console.error(
            "VERIFY RESET OTP ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to verify reset code."
        });
    }
};


/* =========================================================
   RESET PASSWORD
========================================================= */

exports.resetPassword = async (req, res) => {

    try {

        const {
            email,
            newPassword
        } = req.body;


        if (!email || !newPassword) {

            return res.status(400).json({
                success: false,

                message:
                    "Email and new password are required."
            });
        }


        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        const user =
            await User.findOne({
                where: {
                    email:
                        normalizedEmail
                }
            });


        if (!user) {

            return res.status(404).json({
                success: false,

                message:
                    "User not found."
            });
        }


        if (!user.resetVerified) {

            return res.status(403).json({
                success: false,

                message:
                    "Password reset verification is required."
            });
        }


        if (
            String(newPassword).length < 8
        ) {

            return res.status(400).json({
                success: false,

                message:
                    "Password must be at least 8 characters long."
            });
        }


        const hashedPassword =
            await bcrypt.hash(
                String(newPassword),
                10
            );


        user.password =
            hashedPassword;

        user.resetOTP =
            null;

        user.resetOTPExpires =
            null;

        user.resetVerified =
            false;


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Password reset successfully."
        });

    } catch (error) {

        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to reset password."
        });
    }
};


/* =========================================================
   GET CURRENT USER
========================================================= */

exports.getCurrentUser = async (req, res) => {

    try {

        const user =
            await User.findByPk(
                req.user.id,
                {
                    include: [
                        {
                            model: Role,
                            as: "roles",

                            through: {
                                attributes: []
                            },

                            include: [
                                {
                                    model: Permission,
                                    as: "permissions",

                                    through: {
                                        attributes: []
                                    }
                                }
                            ]
                        }
                    ]
                }
            );


        if (!user) {

            return res.status(404).json({
                success: false,

                message:
                    "User not found."
            });
        }


        return res.status(200).json({

            success: true,

            user:
                formatUserResponse(user)
        });

    } catch (error) {

        console.error(
            "GET CURRENT USER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to retrieve user."
        });
    }
};
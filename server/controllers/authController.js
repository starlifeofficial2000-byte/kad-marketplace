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

const {
    sendEmail
} = require("../services/emailService");
const {
    getMarketplaceSettings,
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
   SECURITY CONFIGURATION
========================================================= */

const getSecurityConfiguration = async () => {

    try {

        const marketplaceSettings =
            await getMarketplaceSettings();

        const security =
            marketplaceSettings?.configuration?.security || {};

        return {

            maxFailedLoginAttempts: Math.max(
                1,
                Number(
                    security.maxFailedLoginAttempts
                ) || 5
            ),

            accountLockDuration: Math.max(
                1,
                Number(
                    security.accountLockDuration
                ) || 30
            ),

            sessionTimeout: Math.max(
                5,
                Number(
                    security.sessionTimeout
                ) || 120
            ),

            twoFactorEnabled:
                security.twoFactorEnabled === true,

            requireAdminTwoFactor:
                security.requireAdminTwoFactor !== false,

            securityAlerts:
                security.securityAlerts !== false,

            securityAlertFailedLogin:
                security.securityAlertFailedLogin !== false,

            securityAlertAccountLock:
                security.securityAlertAccountLock !== false,

            securityAlertAdminLogin:
                security.securityAlertAdminLogin !== false
        };

    } catch (error) {

        console.error(
            "SECURITY CONFIGURATION ERROR:",
            error.message
        );

        return {

            maxFailedLoginAttempts: 5,
            accountLockDuration: 30,
            sessionTimeout: 120,

            twoFactorEnabled: false,
            requireAdminTwoFactor: true,

            securityAlerts: true,
            securityAlertFailedLogin: true,
            securityAlertAccountLock: true,
            securityAlertAdminLogin: true
        };
    }
};
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

        const marketplaceSettings =
    await getMarketplaceSettings();

const emailConfig =
    marketplaceSettings
        ?.configuration
        ?.email || {};

const registrationEmailEnabled =
    emailConfig.registrationEmail !== false;

        if (!registrationEnabled) {

            return res.status(403).json({

                success: false,

                message:
                    "New user registration is currently disabled by the administrator."

            });

        }


        /* ==========================================
           GET PASSWORD SETTINGS
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
           SEND WELCOME EMAIL
        ========================================== */

        try {

            /*
             * Read the registration email setting.
             *
             * If the setting is missing, default to true.
             */

            const registrationEmailEnabled =
                toBoolean(
                    await getSetting(
                        "registrationEmail",
                        true
                    ),
                    true
                );


            if (registrationEmailEnabled) {

                const marketplaceSettings =
                    await getMarketplaceSettings();


                const marketplaceName =
                    marketplaceSettings?.marketplace_name ||
                    marketplaceSettings?.marketplaceName ||
                    "KAD Marketplace";


                const supportEmail =
                    marketplaceSettings?.support_email ||
                    "";


                const supportPhone =
                    marketplaceSettings?.support_phone ||
                    "";


                const html = `

                    <!DOCTYPE html>

                    <html>

                    <head>

                        <meta
                            charset="UTF-8"
                        />

                        <meta
                            name="viewport"
                            content="width=device-width, initial-scale=1.0"
                        />

                        <title>
                            Welcome to ${marketplaceName}
                        </title>

                    </head>


                    <body
                        style="
                            margin:0;
                            padding:0;
                            background:#f4f7fb;
                            font-family:Arial,Helvetica,sans-serif;
                            color:#1f2937;
                        "
                    >

                        <div
                            style="
                                max-width:600px;
                                margin:40px auto;
                                background:#ffffff;
                                border-radius:14px;
                                overflow:hidden;
                                box-shadow:0 4px 20px rgba(0,0,0,0.08);
                            "
                        >

                            <!-- HEADER -->

                            <div
                                style="
                                    background:#0562be;
                                    padding:30px;
                                    text-align:center;
                                "
                            >

                                <h1
                                    style="
                                        margin:0;
                                        color:#ffffff;
                                        font-size:28px;
                                    "
                                >
                                    ${marketplaceName}
                                </h1>

                            </div>


                            <!-- CONTENT -->

                            <div
                                style="
                                    padding:35px 30px;
                                "
                            >

                                <h2
                                    style="
                                        margin-top:0;
                                        color:#111827;
                                    "
                                >
                                    Welcome, ${normalizedName}!
                                </h2>


                                <p
                                    style="
                                        font-size:16px;
                                        line-height:1.7;
                                    "
                                >
                                    Thank you for creating an account
                                    with ${marketplaceName}.
                                </p>


                                <p
                                    style="
                                        font-size:16px;
                                        line-height:1.7;
                                    "
                                >
                                    Your account has been successfully
                                    created and you can now log in to
                                    start using the marketplace.
                                </p>


                                <div
                                    style="
                                        margin:25px 0;
                                        padding:20px;
                                        background:#f3f7fc;
                                        border-radius:10px;
                                    "
                                >

                                    <p
                                        style="
                                            margin:0 0 10px;
                                        "
                                    >
                                        <strong>
                                            Account Email:
                                        </strong>
                                    </p>

                                    <p
                                        style="
                                            margin:0;
                                        "
                                    >
                                        ${normalizedEmail}
                                    </p>

                                </div>


                                <p
                                    style="
                                        font-size:15px;
                                        line-height:1.7;
                                    "
                                >
                                    Please keep your account credentials
                                    secure and do not share your password
                                    with anyone.
                                </p>


                                <p
                                    style="
                                        margin-top:30px;
                                        font-size:15px;
                                    "
                                >
                                    Welcome to ${marketplaceName}.
                                </p>


                                <p
                                    style="
                                        margin-bottom:0;
                                        font-size:15px;
                                    "
                                >
                                    Regards,<br />

                                    <strong>
                                        ${marketplaceName}
                                    </strong>
                                </p>


                            </div>


                            <!-- FOOTER -->

                            <div
                                style="
                                    padding:20px 30px;
                                    background:#f8fafc;
                                    border-top:1px solid #e5e7eb;
                                "
                            >

                                ${
                                    supportEmail
                                        ? `
                                            <p
                                                style="
                                                    margin:0 0 5px;
                                                    font-size:13px;
                                                    color:#6b7280;
                                                "
                                            >
                                                Email:
                                                ${supportEmail}
                                            </p>
                                        `
                                        : ""
                                }


                                ${
                                    supportPhone
                                        ? `
                                            <p
                                                style="
                                                    margin:0;
                                                    font-size:13px;
                                                    color:#6b7280;
                                                "
                                            >
                                                Phone:
                                                ${supportPhone}
                                            </p>
                                        `
                                        : ""
                                }


                                <p
                                    style="
                                        margin:12px 0 0;
                                        font-size:12px;
                                        color:#9ca3af;
                                    "
                                >
                                    This is an automated message from
                                    ${marketplaceName}.
                                </p>

                            </div>

                        </div>

                    </body>

                    </html>

                `;


                const text = `

Welcome to ${marketplaceName}!

Hello ${normalizedName},

Thank you for creating an account with ${marketplaceName}.

Your account has been successfully created.

Account Email:
${normalizedEmail}

Please keep your account credentials secure and do not share your password with anyone.

Regards,
${marketplaceName}

                `.trim();


                await sendEmail(

                    normalizedEmail,

                    `Welcome to ${marketplaceName}`,

                    html,

                    text

                );


                console.log(
                    `WELCOME EMAIL SENT: ${normalizedEmail}`
                );

            }


        } catch (emailError) {

            /*
             * IMPORTANT:
             *
             * Registration must NOT fail simply because
             * the email provider is temporarily unavailable.
             */

            console.error(
                "WELCOME EMAIL ERROR:",
                emailError
            );

        }


        /* ==========================================
           RESPONSE
        ========================================== */

        return res.status(201).json({

            success: true,

            message:
                "Account created successfully. A welcome email has been sent to your email address.",

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

        console.log("\n========================================");
        console.log("LOGIN REQUEST");
        console.log("========================================");


        /* =================================================
           GET REQUEST DATA
        ================================================= */

        const {
            email,
            password
        } = req.body;


        /* =================================================
           VALIDATE INPUT
        ================================================= */

        if (!email || !password) {

            console.warn(
                "LOGIN VALIDATION FAILED"
            );

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        /* =================================================
           NORMALIZE EMAIL
        ================================================= */

        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        console.log(
            "LOGIN EMAIL:",
            normalizedEmail
        );


        /* =================================================
           LOAD SECURITY CONFIGURATION
        ================================================= */

        const security =
            await getSecurityConfiguration();


        /*
         * Normalize boolean settings.
         *
         * This protects against settings being returned
         * as either:
         *
         * true / false
         *
         * or:
         *
         * "true" / "false"
         */

        const toSafeBoolean = (
            value,
            defaultValue = false
        ) => {

            if (
                value === true ||
                value === "true" ||
                value === 1 ||
                value === "1"
            ) {

                return true;

            }

            if (
                value === false ||
                value === "false" ||
                value === 0 ||
                value === "0"
            ) {

                return false;

            }

            return defaultValue;

        };


        const twoFactorEnabled =
            toSafeBoolean(
                security.twoFactorEnabled,
                false
            );


        const requireAdminTwoFactor =
            toSafeBoolean(
                security.requireAdminTwoFactor,
                true
            );


        const securityAlerts =
            toSafeBoolean(
                security.securityAlerts,
                true
            );


        const securityAlertAccountLock =
            toSafeBoolean(
                security.securityAlertAccountLock,
                true
            );


        console.log(
            "LOGIN SECURITY CONFIG:",
            {
                twoFactorEnabled,
                requireAdminTwoFactor,
                maxFailedLoginAttempts:
                    security.maxFailedLoginAttempts,
                accountLockDuration:
                    security.accountLockDuration
            }
        );


        /* =================================================
           FIND USER
        ================================================= */

        const user =
            await findUserWithAccess(
                normalizedEmail
            );


        /* =================================================
           USER NOT FOUND
        ================================================= */

        if (!user) {

            console.warn(
                "LOGIN FAILED - USER NOT FOUND:",
                normalizedEmail
            );

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        console.log(
            "LOGIN USER FOUND:",
            {
                id:
                    user.id,

                email:
                    user.email,

                status:
                    user.status
            }
        );


        /* =================================================
           CHECK ACCOUNT STATUS
        ================================================= */

        if (
            String(user.status || "")
                .trim()
                .toLowerCase() ===
            "blocked"
        ) {

            console.warn(
                "LOGIN BLOCKED - ACCOUNT STATUS:",
                user.email
            );

            return res.status(403).json({

                success: false,

                message:
                    "Your account has been blocked. Please contact support."

            });

        }


        /* =================================================
           CHECK ACTIVE ACCOUNT LOCK
        ================================================= */

        if (
            user.lockUntil &&
            new Date(user.lockUntil).getTime() >
                Date.now()
        ) {

            const remainingMilliseconds =
                new Date(user.lockUntil).getTime() -
                Date.now();


            const remainingMinutes =
                Math.max(
                    1,
                    Math.ceil(
                        remainingMilliseconds /
                        60000
                    )
                );


            console.warn(
                "LOGIN BLOCKED - ACCOUNT TEMPORARILY LOCKED:",
                {
                    email:
                        user.email,

                    lockUntil:
                        user.lockUntil,

                    remainingMinutes
                }
            );


            return res.status(423).json({

                success: false,

                message:
                    `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`

            });

        }


        /* =================================================
           CLEAR EXPIRED ACCOUNT LOCK
        ================================================= */

        if (
            user.lockUntil &&
            new Date(user.lockUntil).getTime() <=
                Date.now()
        ) {

            console.log(
                "LOGIN - EXPIRED ACCOUNT LOCK CLEARED:",
                user.email
            );


            user.loginAttempts =
                0;

            user.lockUntil =
                null;


            await user.save();

        }


        /* =================================================
           VERIFY PASSWORD
        ================================================= */

        let validPassword = false;


        try {

            validPassword =
                await bcrypt.compare(
                    String(password),
                    user.password
                );

        } catch (passwordError) {

            console.error(
                "LOGIN PASSWORD VERIFICATION ERROR:",
                passwordError
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to verify login credentials."

            });

        }


        /* =================================================
           INVALID PASSWORD
        ================================================= */

        if (!validPassword) {

            user.loginAttempts =
                Number(
                    user.loginAttempts || 0
                ) + 1;


            const maxAttempts =
                Math.max(
                    1,
                    Number(
                        security.maxFailedLoginAttempts
                    ) || 5
                );


            const lockDuration =
                Math.max(
                    1,
                    Number(
                        security.accountLockDuration
                    ) || 30
                );


            console.warn(
                "LOGIN FAILED - INVALID PASSWORD:",
                {
                    email:
                        user.email,

                    loginAttempts:
                        user.loginAttempts,

                    maxAttempts
                }
            );


            /* =============================================
               ACCOUNT LOCK
            ============================================= */

            if (
                user.loginAttempts >=
                maxAttempts
            ) {

                user.lockUntil =
                    new Date(
                        Date.now() +
                        lockDuration *
                        60 *
                        1000
                    );


                console.warn(
                    "ACCOUNT LOCKED:",
                    {
                        email:
                            user.email,

                        lockUntil:
                            user.lockUntil
                    }
                );


                /* =========================================
                   SECURITY ALERT
                ========================================= */

                if (
                    securityAlerts &&
                    securityAlertAccountLock
                ) {

                    try {

                        await createAlert({

                            userId:
                                user.id,

                            title:
                                "Account Locked",

                            description:
                                `Account locked after ${maxAttempts} failed login attempts.`,

                            riskLevel:
                                "High"

                        });

                    } catch (alertError) {

                        console.error(
                            "ACCOUNT LOCK ALERT ERROR:",
                            alertError
                        );

                    }

                }

            }


            await user.save();


            /* =============================================
               SAVE FAILED LOGIN HISTORY
            ============================================= */

            try {

                await saveLoginHistory({

                    userId:
                        user.id,

                    req,

                    success:
                        false

                });

            } catch (historyError) {

                console.error(
                    "FAILED LOGIN HISTORY ERROR:",
                    historyError
                );

            }


            /*
             * Return the same generic message whether
             * the account exists or the password is wrong.
             */

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        /* =================================================
           PASSWORD CORRECT
        ================================================= */

        console.log(
            "PASSWORD VERIFIED:",
            user.email
        );


        /*
         * Reset failed attempts after a successful
         * password verification.
         */

        user.loginAttempts =
            0;

        user.lockUntil =
            null;


        /* =================================================
           DETERMINE ADMIN ACCESS
        ================================================= */

        let isAdmin = false;


        try {

            isAdmin =
                requiresTwoFactorAuthentication(
                    user
                );

        } catch (adminCheckError) {

            console.error(
                "ADMIN ACCESS CHECK ERROR:",
                adminCheckError
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to determine account security requirements."

            });

        }


        console.log(
            "LOGIN ADMIN CHECK:",
            {
                email:
                    user.email,

                isAdmin
            }
        );


        /* =================================================
           DETERMINE 2FA REQUIREMENT
        ================================================= */

        /*
         * Rules:
         *
         * 2FA OFF
         * ----------------
         * Nobody receives OTP.
         *
         *
         * 2FA ON +
         * Require Admin 2FA ON
         * ----------------
         * Only administrators receive OTP.
         *
         *
         * 2FA ON +
         * Require Admin 2FA OFF
         * ----------------
         * All users receive OTP.
         */

        const requires2FA =
            twoFactorEnabled &&
            (
                !requireAdminTwoFactor ||
                isAdmin
            );


        console.log(
            "LOGIN 2FA DECISION:",
            {
                email:
                    user.email,

                isAdmin,

                twoFactorEnabled,

                requireAdminTwoFactor,

                requires2FA
            }
        );


        /* =================================================
           REQUIRE OTP
        ================================================= */

        if (requires2FA) {

            console.log(
                "OTP REQUIRED FOR:",
                user.email
            );


            /* =============================================
               GENERATE OTP
            ============================================= */

            let otp;


            try {

                otp =
                    generateOTP();

            } catch (otpGenerationError) {

                console.error(
                    "OTP GENERATION ERROR:",
                    otpGenerationError
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to generate verification code."

                });

            }


            /* =============================================
               HASH OTP
            ============================================= */

            let hashedOTP;


            try {

                hashedOTP =
                    await bcrypt.hash(
                        String(otp),
                        10
                    );

            } catch (hashError) {

                console.error(
                    "OTP HASH ERROR:",
                    hashError
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to prepare verification code."

                });

            }


            /* =============================================
               OTP EXPIRATION
            ============================================= */

            const otpExpiryMinutes =
                Math.max(
                    1,
                    Number(
                        OTP_EXPIRY_MINUTES
                    ) || 10
                );


            user.twoFactorCode =
                hashedOTP;


            user.twoFactorExpires =
                new Date(
                    Date.now() +
                    otpExpiryMinutes *
                    60 *
                    1000
                );


            await user.save();


            console.log(
                "OTP STORED:",
                {
                    email:
                        user.email,

                    expires:
                        user.twoFactorExpires
                }
            );


            /* =============================================
               SEND OTP EMAIL
            ============================================= */

            try {

                await sendEmail(

                    user.email,

                    "KAD Marketplace Login Verification",

                    `
                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 30px;
                        background: #f7f9fc;
                    ">

                        <div style="
                            background: #ffffff;
                            padding: 30px;
                            border-radius: 12px;
                            border: 1px solid #e5e7eb;
                        ">

                            <h2 style="
                                margin-top: 0;
                                color: #0562be;
                            ">
                                KAD Marketplace
                            </h2>

                            <p>
                                Hello ${user.name || "User"},
                            </p>

                            <p>
                                A login attempt was made on
                                your KAD Marketplace account.
                            </p>

                            <p>
                                Your verification code is:
                            </p>

                            <div style="
                                margin: 25px 0;
                                padding: 20px;
                                text-align: center;
                                background: #f1f5f9;
                                border-radius: 10px;
                            ">

                                <span style="
                                    font-size: 34px;
                                    font-weight: bold;
                                    letter-spacing: 8px;
                                    color: #0562be;
                                ">
                                    ${otp}
                                </span>

                            </div>

                            <p>
                                This verification code will
                                expire in
                                <strong>
                                    ${otpExpiryMinutes} minutes
                                </strong>.
                            </p>

                            <p>
                                If you did not attempt to log
                                in, please secure your account
                                immediately.
                            </p>

                            <p style="
                                color: #6b7280;
                                font-size: 13px;
                            ">
                                Never share this verification
                                code with anyone.
                            </p>

                        </div>

                    </div>
                    `
                );

            } catch (emailError) {

                console.error(
                    "LOGIN OTP EMAIL ERROR:",
                    emailError
                );


                /*
                 * Remove unusable OTP.
                 */

                user.twoFactorCode =
                    null;

                user.twoFactorExpires =
                    null;


                await user.save();


                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to send verification code."

                });

            }


            /* =============================================
               OTP LOGIN RESPONSE
            ============================================= */

            console.log(
                "OTP SENT SUCCESSFULLY:",
                user.email
            );


            return res.status(200).json({

                success:
                    true,

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


        /* =================================================
           NORMAL LOGIN
        ================================================= */

        console.log(
            "NORMAL LOGIN - NO OTP REQUIRED:",
            user.email
        );


        /* =================================================
           SAVE USER CHANGES
        ================================================= */

        await user.save();


        /* =================================================
           GENERATE JWT
        ================================================= */

        let token;


        try {

            token =
                generateToken(user);

        } catch (tokenError) {

            console.error(
                "LOGIN TOKEN GENERATION ERROR:",
                tokenError
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to create login session."

            });

        }


        /* =================================================
           SAVE LOGIN HISTORY
        ================================================= */

        try {

            await saveLoginHistory({

                userId:
                    user.id,

                req,

                success:
                    true

            });

        } catch (historyError) {

            console.error(
                "SUCCESSFUL LOGIN HISTORY ERROR:",
                historyError
            );

        }


        /* =================================================
           SECURITY ALERT
        ================================================= */

        if (securityAlerts) {

            try {

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

            } catch (alertError) {

                console.error(
                    "SUCCESSFUL LOGIN ALERT ERROR:",
                    alertError
                );

            }

        }


        /* =================================================
           NORMAL LOGIN RESPONSE
        ================================================= */

        console.log(
            "LOGIN SUCCESS:",
            user.email
        );


        console.log(
            "========================================"
        );


        return res.status(200).json({

            success:
                true,

            requiresTwoFactor:
                false,

            requiresOTP:
                false,

            token,

            user:
                formatUserResponse(user)

        });


    } catch (error) {

        /* =================================================
           GLOBAL LOGIN ERROR
        ================================================= */

        console.error(
            "\n========================================"
        );

        console.error(
            "LOGIN ERROR"
        );

        console.error(
            "========================================"
        );

        console.error(
            "MESSAGE:",
            error?.message
        );

        console.error(
            "STACK:",
            error?.stack
        );


        return res.status(500).json({

            success:
                false,

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

        /* =========================================
           GET REQUEST DATA
        ========================================= */

        const {
            email,
            otp
        } = req.body;


        /* =========================================
           VALIDATION
        ========================================= */

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


        const normalizedOTP =
            String(otp)
                .trim();


        /* =========================================
           BASIC OTP VALIDATION
        ========================================= */

        if (!/^\d{6}$/.test(normalizedOTP)) {

            return res.status(400).json({

                success: false,

                message:
                    "Verification code must be 6 digits."

            });

        }


        /* =========================================
           LOAD SECURITY CONFIGURATION
        ========================================= */

        const security =
            await getSecurityConfiguration();


        console.log(
            "VERIFY LOGIN OTP - SECURITY CONFIG:",
            {
                email:
                    normalizedEmail,

                twoFactorEnabled:
                    security.twoFactorEnabled,

                requireAdminTwoFactor:
                    security.requireAdminTwoFactor
            }
        );


        /* =========================================
           FIND USER
        ========================================= */

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


        /* =========================================
           DETERMINE ADMIN STATUS
        ========================================= */

        const isAdmin =
            requiresTwoFactorAuthentication(
                user
            );


        /* =========================================
           DETERMINE WHETHER THIS USER
           CURRENTLY REQUIRES 2FA
        ========================================= */

        const requires2FA =
            security.twoFactorEnabled &&
            (
                !security.requireAdminTwoFactor ||
                isAdmin
            );


        console.log(
            "VERIFY LOGIN OTP - 2FA DECISION:",
            {
                email:
                    user.email,

                isAdmin,

                twoFactorEnabled:
                    security.twoFactorEnabled,

                requireAdminTwoFactor:
                    security.requireAdminTwoFactor,

                requires2FA
            }
        );


        /* =========================================
           2FA NOT REQUIRED
        ========================================= */

        if (!requires2FA) {

            return res.status(403).json({

                success: false,

                message:
                    "This account does not require two-factor authentication."

            });

        }


        /* =========================================
           CHECK OTP EXISTS
        ========================================= */

        if (!user.twoFactorCode) {

            console.warn(
                "VERIFY LOGIN OTP - NO OTP FOUND:",
                user.email
            );

            return res.status(400).json({

                success: false,

                message:
                    "No active verification code found. Please log in again."

            });

        }


        /* =========================================
           CHECK OTP EXPIRATION
        ========================================= */

        if (!user.twoFactorExpires) {

            console.warn(
                "VERIFY LOGIN OTP - NO OTP EXPIRATION:",
                user.email
            );


            user.twoFactorCode =
                null;

            user.twoFactorExpires =
                null;

            await user.save();


            return res.status(400).json({

                success: false,

                message:
                    "No active verification code found. Please log in again."

            });

        }


        const otpExpiration =
            new Date(
                user.twoFactorExpires
            );


        if (
            Number.isNaN(
                otpExpiration.getTime()
            )
        ) {

            console.error(
                "VERIFY LOGIN OTP - INVALID OTP EXPIRATION:",
                {
                    email:
                        user.email,

                    twoFactorExpires:
                        user.twoFactorExpires
                }
            );


            user.twoFactorCode =
                null;

            user.twoFactorExpires =
                null;

            await user.save();


            return res.status(400).json({

                success: false,

                message:
                    "Invalid verification session. Please log in again."

            });

        }


        if (
            otpExpiration <
            new Date()
        ) {

            console.warn(
                "VERIFY LOGIN OTP - OTP EXPIRED:",
                user.email
            );


            user.twoFactorCode =
                null;

            user.twoFactorExpires =
                null;

            await user.save();


            return res.status(400).json({

                success: false,

                message:
                    "Verification code has expired. Please log in again."

            });

        }


        /* =========================================
           VERIFY OTP
        ========================================= */

        console.log(
            "VERIFY LOGIN OTP - CHECKING CODE:",
            {
                email:
                    user.email,

                otpLength:
                    normalizedOTP.length,

                expiresAt:
                    otpExpiration.toISOString()
            }
        );


        let validOTP = false;


        try {

            validOTP =
                await bcrypt.compare(
                    normalizedOTP,
                    user.twoFactorCode
                );

        } catch (otpError) {

            console.error(
                "VERIFY LOGIN OTP - BCRYPT ERROR:",
                otpError
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to verify authentication code."

            });

        }


        console.log(
            "VERIFY LOGIN OTP - OTP RESULT:",
            {
                email:
                    user.email,

                validOTP
            }
        );


        /* =========================================
           INVALID OTP
        ========================================= */

        if (!validOTP) {

            await saveLoginHistory({

                userId:
                    user.id,

                req,

                success:
                    false

            });


            return res.status(400).json({

                success: false,

                message:
                    "Invalid verification code."

            });

        }


        /* =========================================
           CLEAR OTP
        ========================================= */

        user.twoFactorCode =
            null;

        user.twoFactorExpires =
            null;

        user.loginAttempts =
            0;

        user.lockUntil =
            null;


        await user.save();


        console.log(
            "VERIFY LOGIN OTP - OTP CLEARED:",
            user.email
        );


        /* =========================================
           GENERATE JWT TOKEN
        ========================================= */

        let token;


        try {

            token =
                generateToken(user);

        } catch (tokenError) {

            console.error(
                "VERIFY LOGIN OTP - TOKEN ERROR:",
                tokenError
            );


            return res.status(500).json({

                success: false,

                message:
                    "Authentication completed, but we could not create your login session."

            });

        }


        console.log(
            "VERIFY LOGIN OTP - TOKEN GENERATED:",
            user.email
        );


        /* =========================================
           SAVE LOGIN HISTORY
        ========================================= */

        try {

            await saveLoginHistory({

                userId:
                    user.id,

                req,

                success:
                    true

            });

        } catch (historyError) {

            console.error(
                "VERIFY LOGIN OTP - LOGIN HISTORY ERROR:",
                historyError
            );

        }


        /* =========================================
           SECURITY ALERT
        ========================================= */

        try {

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

        } catch (alertError) {

            console.error(
                "VERIFY LOGIN OTP - SECURITY ALERT ERROR:",
                alertError
            );

        }


        /* =========================================
           SUCCESS RESPONSE
        ========================================= */

        return res.status(200).json({

            success:
                true,

            message:
                "Verification successful.",

            requiresTwoFactor:
                true,

            requiresOTP:
                true,

            token,

            user:
                formatUserResponse(user)

        });


    } catch (error) {

        /* =========================================
           UNEXPECTED ERROR
        ========================================= */

        console.error(
            "VERIFY LOGIN OTP ERROR:",
            error
        );


        console.error(
            "VERIFY LOGIN OTP ERROR MESSAGE:",
            error?.message
        );


        console.error(
            "VERIFY LOGIN OTP ERROR STACK:",
            error?.stack
        );


        return res.status(500).json({

            success:
                false,

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


       const {
    requires2FA
} = await shouldRequireTwoFactor(user);

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
        max-width:600px;
        margin:0 auto;
        padding:30px;
        background:#f8fafc;
        border-radius:12px;
    ">

        <h2 style="
            color:#0562be;
            margin-bottom:20px;
        ">
            KAD Marketplace
        </h2>

        <p>
            Hello ${user.name},
        </p>

        <p>
            Your new login verification code is:
        </p>

        <div style="
            margin:25px 0;
            padding:20px;
            text-align:center;
            background:#ffffff;
            border-radius:10px;
        ">

            <h1 style="
                font-size:36px;
                letter-spacing:8px;
                color:#0562be;
                margin:0;
            ">
                ${otp}
            </h1>

        </div>

        <p>
            This code expires in
            <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
        </p>

        <p>
            Never share this verification code with anyone.
        </p>

        <p style="
            color:#64748b;
            font-size:13px;
            margin-top:30px;
        ">
            This is an automated message from KAD Marketplace.
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
        max-width:600px;
        margin:0 auto;
        padding:30px;
        background:#f8fafc;
        border-radius:12px;
    ">

        <h2 style="
            color:#0562be;
            margin-bottom:20px;
        ">
            KAD Marketplace
        </h2>

        <h3>
            Password Reset Request
        </h3>

        <p>
            Hello ${user.name},
        </p>

        <p>
            We received a request to reset the password
            for your KAD Marketplace account.
        </p>

        <p>
            Your password reset code is:
        </p>

        <div style="
            margin:25px 0;
            padding:20px;
            text-align:center;
            background:#ffffff;
            border-radius:10px;
        ">

            <h1 style="
                font-size:36px;
                letter-spacing:8px;
                color:#0562be;
                margin:0;
            ">
                ${otp}
            </h1>

        </div>

        <p>
            This code expires in
            <strong>${RESET_OTP_EXPIRY_MINUTES} minutes</strong>.
        </p>

        <p>
            If you did not request a password reset,
            you can safely ignore this email.
        </p>

        <p style="
            color:#64748b;
            font-size:13px;
            margin-top:30px;
        ">
            This is an automated message from KAD Marketplace.
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
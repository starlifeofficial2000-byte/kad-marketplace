const jwt = require("jsonwebtoken");

const {
    User,
    Role,
    Permission
} = require("../models");

const {
    getBooleanSetting
} = require("../services/settingsService");


/* =========================================================
   ADMINISTRATIVE PERMISSIONS

   Users with any of these permissions can continue
   using administrative features during maintenance.
========================================================= */

const ADMINISTRATIVE_PERMISSIONS = [

    "manage_users",

    "manage_roles",

    "manage_permissions",

    "manage_security",

    "manage_settings",

    "manage_products",

    "manage_stores",

    "manage_advertisements",

    "manage_payments",

    "manage_subscriptions",

    "manage_support",

    "manage_notifications",

    "view_analytics",

    "view_audit_logs",

    "manage_backups",

    "manage_marketplace"

];


/* =========================================================
   MAINTENANCE MODE MIDDLEWARE
========================================================= */

const maintenanceMode = async (
    req,
    res,
    next
) => {

    try {

        /* =============================================
           GET MAINTENANCE STATUS
        ============================================= */

       const enabled = await getBooleanSetting(
    "developer_mode",
    false
);

        console.log(

            "[MAINTENANCE CHECK]",

            req.originalUrl,

            "| Enabled:",

            enabled

        );


        /* =============================================
           MAINTENANCE OFF

           Everyone continues normally.
        ============================================= */

        if (!enabled) {

            return next();

        }


        /* =============================================
           ALWAYS ALLOW AUTHENTICATION ROUTES

           Login and password recovery must remain
           available during maintenance.
        ============================================= */

        if (

            req.originalUrl.startsWith("/api/auth")

        ) {

            return next();

        }


        /* =============================================
           GET TOKEN

           Maintenance middleware cannot depend on
           req.user because it runs globally before
           route-level auth middleware.

           Therefore we verify the JWT here.
        ============================================= */

        const authHeader =
            req.headers.authorization;


        if (

            !authHeader ||

            !authHeader.startsWith("Bearer ")

        ) {

            /*
               No authenticated user.

               This is a normal marketplace visitor,
               so block access.
            */

            return res.status(503).json({

                success: false,

                maintenance: true,

                message:
                    "The marketplace is currently under maintenance. Please try again later."

            });

        }


        const token =
            authHeader.split(" ")[1];


        if (!token) {

            return res.status(503).json({

                success: false,

                maintenance: true,

                message:
                    "The marketplace is currently under maintenance. Please try again later."

            });

        }


        /* =============================================
           VERIFY JWT
        ============================================= */

        let decoded;


        try {

            decoded = jwt.verify(

                token,

                process.env.JWT_SECRET

            );

        }

        catch (error) {

            /*
               Invalid token should not bypass
               maintenance mode.
            */

            return res.status(503).json({

                success: false,

                maintenance: true,

                message:
                    "The marketplace is currently under maintenance. Please try again later."

            });

        }


        /* =============================================
           SUPPORT BOTH TOKEN FORMATS

           { id: user.id }

           OR

           { userId: user.id }
        ============================================= */

        const userId =

            decoded.id ||

            decoded.userId;


        if (!userId) {

            return res.status(503).json({

                success: false,

                maintenance: true,

                message:
                    "The marketplace is currently under maintenance. Please try again later."

            });

        }


        /* =============================================
           LOAD USER WITH ROLES AND PERMISSIONS
        ============================================= */

        const user = await User.findByPk(

            userId,

            {

                include: [

                    {

                        model: Role,

                        as: "roles",

                        required: false,

                        through: {

                            attributes: []

                        },

                        include: [

                            {

                                model: Permission,

                                as: "permissions",

                                required: false,

                                through: {

                                    attributes: []

                                }

                            }

                        ]

                    }

                ]

            }

        );


        /* =============================================
           USER NOT FOUND
        ============================================= */

        if (!user) {

            return res.status(503).json({

                success: false,

                maintenance: true,

                message:
                    "The marketplace is currently under maintenance. Please try again later."

            });

        }


        /* =============================================
           BLOCKED USERS

           Never allow blocked users to bypass
           maintenance mode.
        ============================================= */

        if (user.status === "blocked") {

            return res.status(403).json({

                success: false,

                message:
                    "Your account has been blocked."

            });

        }


        /* =============================================
           EXTRACT ROLES
        ============================================= */

        const roleNames = [];


        const roles =

            Array.isArray(user.roles)

                ? user.roles

                : [];


        roles.forEach((role) => {

            if (role?.name) {

                roleNames.push(

                    role.name

                );

            }

        });


        /* =============================================
           EXTRACT PERMISSIONS
        ============================================= */

        const permissionNames = [];


        roles.forEach((role) => {

            const permissions =

                Array.isArray(role.permissions)

                    ? role.permissions

                    : [];


            permissions.forEach((permission) => {

                if (

                    permission?.name &&

                    !permissionNames.includes(
                        permission.name
                    )

                ) {

                    permissionNames.push(
                        permission.name
                    );

                }

            });

        });


        /* =============================================
           ROLE-BASED ADMIN ACCESS
        ============================================= */

        const isAdministrativeRole =

            user.role === "admin" ||

            roleNames.includes("Super Admin") ||

            roleNames.includes("Administrator") ||

            roleNames.includes("Admin");


        /* =============================================
           PERMISSION-BASED ADMIN ACCESS

           Only real administrative permissions count.
           Having a random permission does NOT bypass
           maintenance mode.
        ============================================= */

        const hasAdministrativePermission =

            permissionNames.some(

                (permission) =>

                    ADMINISTRATIVE_PERMISSIONS.includes(
                        permission
                    )

            );


        /* =============================================
           ALLOW ADMINISTRATIVE USER
        ============================================= */

        if (

            isAdministrativeRole ||

            hasAdministrativePermission

        ) {

            console.log(

                "🛡 MAINTENANCE BYPASS:",

                user.email,

                "| Roles:",

                roleNames,

                "| Permissions:",

                permissionNames

            );


            return next();

        }


        /* =============================================
           BLOCK NORMAL USER
        ============================================= */

        console.log(

            "🚫 MAINTENANCE BLOCK:",

            user.email

        );


        return res.status(503).json({

            success: false,

            maintenance: true,

            message:
                "The marketplace is currently under maintenance. Please try again later."

        });

    }

    catch (error) {

        console.error(

            "MAINTENANCE MODE ERROR:",

            error

        );


        /*
           Important:

           If something unexpected happens,
           do not accidentally take down
           the entire marketplace.
        */

        return next();

    }

};


module.exports = maintenanceMode;
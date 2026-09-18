const jwt = require("jsonwebtoken");

const {
    User,
    Role,
    Permission
} = require("../models");


const auth = async (req, res, next) => {

    try {

        /* ==========================================
           GET AUTHORIZATION HEADER
        ========================================== */

        const authHeader =
            req.headers.authorization;


        if (

            !authHeader ||

            !authHeader.startsWith("Bearer ")

        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication token is missing."

            });

        }


        /* ==========================================
           EXTRACT TOKEN
        ========================================== */

        const token =
            authHeader.split(" ")[1];


        if (!token) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication token is missing."

            });

        }


        /* ==========================================
           VERIFY JWT
        ========================================== */

        let decoded;

        try {

            decoded = jwt.verify(

                token,

                process.env.JWT_SECRET

            );

        }

        catch (error) {

            console.log(
                "JWT ERROR:",
                error.message
            );

            return res.status(401).json({

                success: false,

                message:
                    "Invalid or expired token."

            });

        }


        /* ==========================================
           SUPPORT DIFFERENT TOKEN FORMATS

           { id: user.id }

           OR

           { userId: user.id }
        ========================================== */

        const userId =
            decoded.id ||
            decoded.userId;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid authentication token."

            });

        }


        /* ==========================================
           FIND USER WITH ROLES & PERMISSIONS
        ========================================== */

        const user = await User.findByPk(

            userId,

            {

                attributes: {

                    exclude: [

                        "password",

                        "loginOTP",

                        "loginOTPExpires",

                        "resetOTP",

                        "resetOTPExpires",

                        "twoFactorCode",

                        "twoFactorExpires"

                    ]

                },

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


        /* ==========================================
           USER NOT FOUND
        ========================================== */

        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "User not found."

            });

        }


        /* ==========================================
           ACCOUNT STATUS CHECK
        ========================================== */

        if (user.status === "blocked") {

            return res.status(403).json({

                success: false,

                message:
                    "Your account has been blocked."

            });

        }


        /* ==========================================
           EXTRACT ROLES & PERMISSIONS SAFELY
        ========================================== */

        const roleNames = [];

        const permissionNames = [];


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


        /* ==========================================
           FALLBACK TO USER ROLE

           Your User model has:

           role: "user" | "admin"

           So this ensures the admin system
           continues working even if Role tables
           have not been assigned yet.
        ========================================== */

        if (

            user.role === "admin" &&

            !roleNames.includes("admin")

        ) {

            roleNames.push("admin");

        }


        if (

            user.role === "user" &&

            !roleNames.includes("user")

        ) {

            roleNames.push("user");

        }


        /* ==========================================
           ATTACH USER TO REQUEST
        ========================================== */

        req.user = {

            id: user.id,

            name: user.name,

            email: user.email,

            phone: user.phone,

            profileImage: user.profileImage,

            role: user.role,

            status: user.status,

            roles: roleNames,

            permissions: permissionNames,

            user

        };


        if (process.env.NODE_ENV === "development") {

    console.log(
        "AUTH SUCCESS:",
        user.email
    );

}

        next();

    }

    catch (error) {

        console.error(
            "AUTH ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Authentication failed."

        });

    }

};


module.exports = auth;
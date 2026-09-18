const createAuditLog = require("../utils/auditLogger");
const {

    User,

    Product,

    Review,

    Role,

    UserRole,

    LoginHistory,

    SecurityAlert

} = require("../models");

/* ==========================================
   GET LOGGED IN USER PROFILE
========================================== */

exports.getProfile = async (req, res) => {

    try {

        const user = await User.findByPk(

            req.user.id,

            {

                attributes: {

                    exclude: ["password"]

                }

            }

        );

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        res.json(user);

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   UPDATE PROFILE
========================================== */

exports.updateProfile = async (req, res) => {

    try {

        const user = await User.findByPk(req.user.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        let profileImage = user.profileImage;

        if (req.file) {

            profileImage = req.file.filename;

        }

        await user.update({

            name: sanitize(req.body.name),

            email: req.body.email,

            phone: req.body.phone,

            ghanaCard: req.body.ghanaCard,

            region: req.body.region,

            city: req.body.city,

            address: req.body.address,

            profileImage

        });

        const updatedUser = await User.findByPk(

            req.user.id,

            {

                attributes: {

                    exclude: ["password"]

                }

            }

        );

        res.json({

            success: true,

            message: "Profile updated successfully.",

            user: updatedUser

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   GET SELLER PROFILE
========================================== */

exports.getSellerProfile = async (req, res) => {

    try {

        const seller = await User.findByPk(

            req.params.id,

            {

                attributes: {

                    exclude: ["password"]

                }

            }

        );

        if (!seller) {

            return res.status(404).json({

                success: false,

                message: "Seller not found."

            });

        }

        const products = await Product.findAll({

            where: {

                userId: seller.id,

                status: "Approved"

            },

            order: [["createdAt", "DESC"]]

        });

        const formattedProducts = products.map(product => {

            const p = product.toJSON();

            try {

                p.images = p.images

                    ? JSON.parse(p.images)

                    : [];

            }

            catch {

                p.images = [];

            }

            return p;

        });

        const reviews = await Review.findAll({

            where: {

                sellerId: seller.id

            }

        });

        let averageRating = 0;

        if (reviews.length > 0) {

            averageRating = (

                reviews.reduce(

                    (sum, review) => sum + review.rating,

                    0

                ) / reviews.length

            ).toFixed(1);

        }

        const sellerData = seller.toJSON();

        sellerData.averageRating = averageRating;

        sellerData.totalReviews = reviews.length;

        sellerData.totalProducts = formattedProducts.length;

        sellerData.lastSeen = seller.lastSeen || "Recently Active";

        sellerData.verified = seller.verified || false;

        res.json({

            success: true,

            seller: sellerData,

            products: formattedProducts

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/*
=========================================
ADMIN - GET ALL USERS
=========================================
*/

exports.getAllUsers = async (req, res) => {

    try {

        const users = await User.findAll({

            attributes: {

                exclude: [

                    "password",

                    "loginOTP",

                    "resetOTP"

                ]

            },

            include: [

                {

                    model: Role,

                    as: "roles",

                    through: {

                        attributes: []

                    }

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });

        res.json({

            success: true,

            users

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/*
=========================================
CHANGE USER ROLE
=========================================
*/

exports.changeUserRole = async (req, res) => {

    try {

        const { roleId } = req.body;

        const user = await User.findByPk(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        const role = await Role.findByPk(roleId);

        if (!role) {

            return res.status(404).json({

                success: false,

                message: "Role not found."

            });

        }

        await UserRole.destroy({

            where: {

                userId: user.id

            }

        });

        await UserRole.create({

            userId: user.id,

            roleId: role.id

        });

        await createAuditLog(

            req.user.id,

            "Changed User Role",

            `Changed ${user.name}'s role to ${role.name}`,

            req

        );

        const updatedUser = await User.findByPk(

            user.id,

            {

                include: [

                    {

                        model: Role,

                        as: "roles"

                    }

                ]

            }

        );

        res.json({

            success: true,

            message: "Role updated successfully.",

            user: updatedUser

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/*
=========================================
ADMIN - BLOCK USER
=========================================
*/

exports.blockUser = async (req, res) => {

    try {

        const user = await User.findByPk(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        user.status = "blocked";

        await user.save();

        await createAuditLog(

            req.user.id,

            "Blocked User",

            `Blocked user ${user.name}`,

            req

        );

        res.json({

            success: true,

            message: "User blocked."

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

}; 
/*
=========================================
ADMIN - UNBLOCK USER
=========================================
*/

exports.unblockUser = async (req, res) => {

    try {

        const user = await User.findByPk(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        user.status = "active";

        user.loginAttempts = 0;

        user.lockUntil = null;

        await user.save();

        await createAuditLog(

            req.user.id,

            "Unblocked User",

            `Unblocked user ${user.name}`,

            req

        );

        res.json({

            success: true,

            message: "User unblocked."

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/*
=========================================
ADMIN - DELETE USER
=========================================
*/

exports.deleteUser = async (req, res) => {

    try {

        const user = await User.findByPk(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        const deletedUser = user.name;

        await user.destroy();

        await createAuditLog(

            req.user.id,

            "Deleted User",

            `Deleted user ${deletedUser}`,

            req

        );

        res.json({

            success: true,

            message: "User deleted."

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/*
=========================================
ADMIN - GET USER DETAILS
=========================================
*/

exports.getUserDetails = async (req, res) => {

    try {

        const user = await User.findByPk(

            req.params.id,

            {

                attributes: {

                    exclude: [

                        "password",

                        "loginOTP",

                        "resetOTP"

                    ]

                },

                include: [

                    {

                        model: Role,

                        as: "roles"

                    },

                    {

                        model: LoginHistory,

                        as: "loginHistory",

                        limit: 10,

                        separate: true,

                        order: [

                            ["createdAt", "DESC"]

                        ]

                    },

                    {

                        model: SecurityAlert,

                        as: "securityAlerts",

                        limit: 10,

                        separate: true,

                        order: [

                            ["createdAt", "DESC"]

                        ]

                    }

                ]

            }

        );

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        res.json({

            success: true,

            user

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};exports.getRoles = async (req, res) => {

    try {

        const roles = await Role.findAll({

            include: [

                {

                    model: Permission,

                    as: "permissions",

                    through: {

                        attributes: []

                    }

                },

                {

                    model: User,

                    as: "users",

                    attributes: [

                        "id",

                        "name",

                        "email"

                    ],

                    through: {

                        attributes: []

                    }

                }

            ],

            order: [

                ["name", "ASC"]

            ]

        });

        res.json({

            success: true,

            roles

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
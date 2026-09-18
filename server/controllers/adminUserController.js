const User = require("../models/User");
const Product = require("../models/Product");
const Subscription = require("../models/Subscription");
const Store = require("../models/Store");




/* ==========================================
   GET ALL USERS
========================================== */

exports.getUsers = async (req, res) => {

    try {

        const users = await User.findAll({

            attributes: {

                exclude: ["password"]

            },

            order: [

                ["createdAt", "DESC"]

            ]

        });

        return res.json(users);

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};/* ==========================================
   GET SINGLE USER
========================================== */

exports.getUser = async (req, res) => {

    try {

        const user = await User.findByPk(

            req.params.id,

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

        /* ===============================
           PRODUCTS
        =============================== */

        const products = await Product.findAll({

            where: {

                userId: user.id

            },

            order: [

                ["createdAt", "DESC"]

            ]

        });

        /* ===============================
           STORE
        =============================== */

        const store = await Store.findOne({

            where: {

                userId: user.id

            }

        });

        /* ===============================
           SUBSCRIPTION
        =============================== */

        const subscription = await Subscription.findOne({

            where: {

                userId: user.id

            }

        });

        /* ===============================
           STATISTICS
        =============================== */

        const stats = {

            totalProducts: products.length,

            approvedProducts:

                products.filter(

                    p => p.status === "Approved"

                ).length,

            pendingProducts:

                products.filter(

                    p => p.status === "Pending"

                ).length,

            rejectedProducts:

                products.filter(

                    p => p.status === "Rejected"

                ).length,

            featuredProducts:

                products.filter(

                    p => p.featured === true

                ).length,

            expressProducts:

                products.filter(

                    p => p.express === true

                ).length,

            boostedProducts:

                products.filter(

                    p => p.boosted === true

                ).length,

            totalViews:

                products.reduce(

                    (total, product) =>

                        total + (product.views || 0),

                    0

                )

        };

        return res.json({

            success: true,

            user,

            store,

            subscription,

            products,

            stats

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};/* ==========================================
   BLOCK USER
========================================== */

exports.blockUser = async (req, res) => {

    try {

        const user = await User.findByPk(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        if (user.permissions.some(
    permission => permission.name === "manage_users"
)) {

            return res.status(400).json({

                success: false,

                message: "Administrators cannot be blocked."

            });

        }

        user.status = "blocked";

        await user.save();
await createAuditLog({

    adminId: req.user.id,

    action: "BLOCK USER",

    entity: "User",

    entityId: user.id,

    description: `Blocked user ${user.name}`,

    ipAddress: req.ip

});
        return res.json({

            success: true,

            message: "User blocked successfully."

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   UNBLOCK USER
========================================== */

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

        await user.save();

        return res.json({

            success: true,

            message: "User unblocked successfully."

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   MAKE ADMIN
========================================== */

exports.makeAdmin = async (req, res) => {

    try {

        const user = await User.findByPk(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        if (user.roles?.some(
    role =>
        role.name === "Admin" ||
        user.permissions.some(
    permission => permission.name === "manage_users"
)
)) {

            return res.status(400).json({

                success: false,

                message: "User is already an administrator."

            });

        }

        user.role = "admin";

        await user.save();

        return res.json({

            success: true,

            message: "User promoted to administrator."

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};/* ==========================================
   REMOVE ADMIN
========================================== */

exports.removeAdmin = async (req, res) => {

    try {

        const user = await User.findByPk(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        if (user.id === req.user.id) {

            return res.status(400).json({

                success: false,

                message: "You cannot remove your own administrator privileges."

            });

        }

        user.role = "user";

        await user.save();

        return res.json({

            success: true,

            message: "Administrator rights removed successfully."

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};/* ==========================================
   DELETE USER
========================================== */

exports.deleteUser = async (req, res) => {

    try {

        const user = await User.findByPk(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        if (user.id === req.user.id) {

            return res.status(400).json({

                success: false,

                message: "You cannot delete your own account."

            });

        }

        await user.destroy();
await createAuditLog({

    adminId: req.user.id,

    action: "DELETE USER",

    entity: "User",

    entityId: user.id,

    description: `Deleted user ${user.name}`,

    ipAddress: req.ip

});
        return res.json({

            success: true,

            message: "User deleted successfully."

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
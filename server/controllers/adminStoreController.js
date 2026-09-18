const Store = require("../models/Store");
const User = require("../models/User");
const Product = require("../models/Product");

/* ==========================================
   GET ALL STORES
========================================== */

exports.getStores = async (req, res) => {

    try {

        const stores = await Store.findAll({

          include: [

    {

        model: User,

        as: "owner",

        attributes: [

            "id",
            "name",
            "email",
            "phone"

        ]

    }

],

            order: [

                ["createdAt", "DESC"]

            ]

        });

        const results = [];

        for (const store of stores) {

            const productCount = await Product.count({

                where: {

                    userId: store.userId

                }

            });

            results.push({

                ...store.toJSON(),

                productCount

            });

        }

        res.json(results);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
exports.verifyStore = async (req, res) => {

    try {

        const store = await Store.findByPk(req.params.id);

        if (!store) {

            return res.status(404).json({

                success: false,

                message: "Store not found."

            });

        }
store.verified = true;
store.status = "Active";

await store.save();

        res.json({

            success: true,

            message: "Store verified."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
exports.suspendStore = async (req, res) => {

    try {

        const store = await Store.findByPk(req.params.id);

        if (!store) {

            return res.status(404).json({

                success: false,

                message: "Store not found."

            });

        }

        store.status = "Suspended";

        await store.save();

        res.json({

            success: true,

            message: "Store suspended."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
exports.deleteStore = async (req, res) => {

    try {

        const store = await Store.findByPk(req.params.id);

        if (!store) {

            return res.status(404).json({

                success: false,

                message: "Store not found."

            });

        }

        await store.destroy();

        res.json({

            success: true,

            message: "Store deleted."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
exports.activateStore = async (req, res) => {

    try {

        const store = await Store.findByPk(req.params.id);

        if (!store) {

            return res.status(404).json({

                success: false,

                message: "Store not found."

            });

        }

        store.status = "Active";

        await store.save();

        res.json({

            success: true,

            message: "Store activated successfully."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};exports.getStore = async (req, res) => {

    try {

        const store = await Store.findByPk(req.params.id, {

            include: [

                {
                    model: User,
                    as: "owner",
                    attributes: [
                        "id",
                        "name",
                        "email",
                        "phone"
                    ]
                }

            ]

        });

        if (!store) {

            return res.status(404).json({

                success: false,

                message: "Store not found."

            });

        }

        const products = await Product.findAll({

            where: {

                userId: store.userId

            },

            order: [

                ["createdAt", "DESC"]

            ]

        });

        res.json({

            ...store.toJSON(),

            products

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
const Store = require("../models/Store");
const User = require("../models/User");
const Product = require("../models/Product");
const { getR2PublicUrl } = require("../config/r2");

const publicStoreImage = (value, folder) => {
    if (!value) return null;
    const clean = String(value).trim();
    if (/^https?:\/\//i.test(clean)) return clean;
    const key = clean.replace(/^\/+/, "");
    if (key.startsWith("uploads/")) return getR2PublicUrl(key) || `/${key}`;
    return getR2PublicUrl(`uploads/${folder}/${key}`) || `/uploads/${folder}/${key}`;
};

const formatStore = (store) => {
    const data = store && typeof store.toJSON === "function" ? store.toJSON() : { ...store };
    data.logoUrl = publicStoreImage(data.logo, "stores");
    data.bannerUrl = publicStoreImage(data.banner, "stores");
    return data;
};

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
                ...formatStore(store),
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
            ...formatStore(store),
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
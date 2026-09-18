const { Op } = require("sequelize");

const Product = require("../../models/Product");

const User = require("../../models/User");

const Subscription = require("../../models/Subscription");

/* ==========================================
   FEATURED PRODUCTS
========================================== */

exports.getFeaturedProducts = async (req, res) => {

    try {

        const products = await Product.findAll({
where: {

    status: "Approved",

    featured: true,

    available: true

},
            where: {

                status: "Approved",

                featured: true

            },

            include: [

                {

                    model: User,

                    as: "seller",

                    attributes: ["id", "name"],

                    include: [

                        {

                            model: Subscription,

                            as: "subscription",

                            attributes: ["plan"]

                        }

                    ]

                }

            ],

            order: [

                ["listingScore", "DESC"],

                ["displayDate", "DESC"]

            ],

            limit: 20

        });

        res.json(products);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   EXPRESS PRODUCTS
========================================== */

exports.getExpressProducts = async (req, res) => {

    try {

        const products = await Product.findAll({

            where: {

                status: "Approved",

                express: true

            },

            include: [

                {

                    model: User,

                    as: "seller",

                    attributes: ["id", "name"]

                }

            ],

            order: [

                ["listingScore", "DESC"]

            ],

            limit: 20

        });

        res.json(products);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   TRENDING PRODUCTS
========================================== */

exports.getTrendingProducts = async (req, res) => {

    try {

        const products = await Product.findAll({

            where: {

                status: "Approved"

            },

            order: [

                ["views", "DESC"],

                ["shares", "DESC"],

                ["favourites", "DESC"],

                ["listingScore", "DESC"]

            ],

            limit: 20

        });

        res.json(products);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   RELATED PRODUCTS
========================================== */

exports.getRelatedProducts = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        const related = await Product.findAll({

            where: {

                status: "Approved",

                id: {

                    [Op.ne]: product.id

                },

                category: product.category

            },

            order: [

                ["listingScore", "DESC"]

            ],

            limit: 12

        });

        res.json(related);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   NEARBY PRODUCTS
========================================== */

exports.getNearbyProducts = async (req, res) => {

    try {

        const region = req.user.region;

        const city = req.user.city;

        const products = await Product.findAll({

            where: {

                status: "Approved",

                [Op.or]: [

                    {

                        city

                    },

                    {

                        region

                    }

                ]

            },

            order: [

                ["listingScore", "DESC"]

            ],

            limit: 20

        });

        res.json(products);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   RECOMMENDED PRODUCTS
========================================== */

exports.getRecommendedProducts = async (req, res) => {

    try {

        const recent = await Product.findAll({

            where: {

                status: "Approved"

            },

            order: [

                ["listingScore", "DESC"],

                ["views", "DESC"],

                ["createdAt", "DESC"]

            ],

            limit: 20

        });

        res.json(recent);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
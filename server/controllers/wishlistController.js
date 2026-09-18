const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const User = require("../models/User");

/* ==========================================
   ADD TO WISHLIST
========================================== */

exports.addToWishlist = async (req, res) => {

    try {

        const { productId } = req.body;

        const exists = await Wishlist.findOne({

            where: {

                userId: req.user.id,

                productId

            }

        });

        if (exists) {

            return res.status(400).json({

                success: false,

                message: "Product is already in your wishlist."

            });

        }

        await Wishlist.create({

            userId: req.user.id,

            productId

        });

        res.json({

            success: true,

            message: "Added to wishlist."

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

/* ==========================================
   GET MY WISHLIST
========================================== */

exports.getWishlist = async (req, res) => {

    try {

        const wishlist = await Wishlist.findAll({

            where: {

                userId: req.user.id

            },

            include: [

                {

                    model: Product,

                    as: "product"

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });

        res.json(wishlist);

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
   REMOVE FROM WISHLIST
========================================== */

exports.removeFromWishlist = async (req, res) => {

    try {

        const item = await Wishlist.findOne({

            where: {

                userId: req.user.id,

                productId: req.params.productId

            }

        });

        if (!item) {

            return res.status(404).json({

                success: false,

                message: "Wishlist item not found."

            });

        }

        await item.destroy();

        res.json({

            success: true,

            message: "Removed from wishlist."

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

/* ==========================================
   CHECK IF PRODUCT IS WISHLISTED
========================================== */

exports.checkWishlist = async (req, res) => {

    try {

        const exists = await Wishlist.findOne({

            where: {

                userId: req.user.id,

                productId: req.params.productId

            }

        });

        res.json({

            success: true,

            wishlisted: !!exists

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

/* ==========================================
   WISHLIST COUNT
========================================== */

exports.getWishlistCount = async (req, res) => {

    try {

        const count = await Wishlist.count({

            where: {

                userId: req.user.id

            }

        });

        res.json({

            success: true,

            count

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
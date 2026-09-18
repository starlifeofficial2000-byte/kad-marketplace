const Product = require("../../models/Product");
const ProductStatistic = require("../../models/ProductStatistic");

/* ==========================================
   RECORD PRODUCT VIEW
========================================== */

exports.recordView = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        product.views += 1;

        await product.save();

        const stats = await ProductStatistic.findOne({

            where: {

                productId: product.id

            }

        });

        if (stats) {

            stats.views += 1;

            await stats.save();

        }

        res.json({

            success: true

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
   RECORD SHARE
========================================== */

exports.recordShare = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        product.shares += 1;

        await product.save();

        const stats = await ProductStatistic.findOne({

            where: {

                productId: product.id

            }

        });

        if (stats) {

            stats.shares += 1;

            await stats.save();

        }

        res.json({

            success: true

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
   RECORD CHAT CLICK
========================================== */

exports.recordChat = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        product.chats += 1;

        await product.save();

        const stats = await ProductStatistic.findOne({

            where: {

                productId: product.id

            }

        });

        if (stats) {

            stats.chats += 1;

            await stats.save();

        }

        res.json({

            success: true

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
   TOGGLE WISHLIST
========================================== */

exports.toggleWishlist = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        product.favourites += 1;

        await product.save();

        const stats = await ProductStatistic.findOne({

            where: {

                productId: product.id

            }

        });

        if (stats) {

            stats.wishlist += 1;

            await stats.save();

        }

        res.json({

            success: true,

            favourites: product.favourites

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
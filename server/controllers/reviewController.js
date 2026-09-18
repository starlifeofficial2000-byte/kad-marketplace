const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");

/* ==========================================
   CREATE REVIEW
========================================== */

exports.createReview = async (req, res) => {

    try {

        const {

            productId,

            rating,

            title,

            comment

        } = req.body;

        const product = await Product.findByPk(productId);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        const exists = await Review.findOne({

            where: {

                buyerId: req.user.id,

                productId

            }

        });

        if (exists) {

            return res.status(400).json({

                success: false,

                message: "You have already reviewed this product."

            });

        }

        const review = await Review.create({

            buyerId: req.user.id,

            sellerId: product.userId,

            productId,

            rating,

            title,

            comment

        });

        res.status(201).json({

            success: true,

            review

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
   GET PRODUCT REVIEWS
========================================== */

exports.getReviews = async (req, res) => {

    try {

        const reviews = await Review.findAll({

            where: {

                productId: req.params.productId

            },

            include: [

                {

                    model: User,

                    as: "buyer",

                    attributes: [

                        "id",

                        "name",

                        "profileImage"

                    ]

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });

        res.json(reviews);

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
   UPDATE REVIEW
========================================== */

exports.updateReview = async (req, res) => {

    try {

        const review = await Review.findByPk(req.params.id);

        if (!review) {

            return res.status(404).json({

                success: false,

                message: "Review not found."

            });

        }

        if (review.buyerId !== req.user.id) {

            return res.status(403).json({

                success: false,

                message: "Access denied."

            });

        }

        review.rating = req.body.rating;
        review.title = req.body.title;
        review.comment = req.body.comment;

        await review.save();

        res.json({

            success: true,

            review

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
   DELETE REVIEW
========================================== */

exports.deleteReview = async (req, res) => {

    try {

        const review = await Review.findByPk(req.params.id);

        if (!review) {

            return res.status(404).json({

                success: false,

                message: "Review not found."

            });

        }

        if (

            review.buyerId !== req.user.id &&

            req.user.role !== "admin"

        ) {

            return res.status(403).json({

                success: false,

                message: "Access denied."

            });

        }

        await review.destroy();

        res.json({

            success: true,

            message: "Review deleted."

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
   REVIEW SUMMARY
========================================== */

exports.getReviewSummary = async (req, res) => {

    try {

        const reviews = await Review.findAll({

            where: {

                productId: req.params.productId

            }

        });

        const totalReviews = reviews.length;

        const totalRating = reviews.reduce(

            (sum, review) => sum + review.rating,

            0

        );

        const averageRating =

            totalReviews === 0

            ? 0

            : Number((totalRating / totalReviews).toFixed(1));

        const stars = {

            5: 0,

            4: 0,

            3: 0,

            2: 0,

            1: 0

        };

        reviews.forEach(review => {

            stars[review.rating]++;

        });

        res.json({

            averageRating,

            totalReviews,

            stars

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
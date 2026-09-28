const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");

/* =========================================================
   CREATE REVIEW
   POST /api/reviews
========================================================= */

exports.createReview = async (req, res) => {
    try {
        const { productId, rating, title, comment } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required."
            });
        }

        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5."
            });
        }

        if (!comment || !String(comment).trim()) {
            return res.status(400).json({
                success: false,
                message: "Review comment is required."
            });
        }

        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        const existingReview = await Review.findOne({
            where: {
                buyerId: req.user.id,
                productId
            }
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product."
            });
        }

        const review = await Review.create({
            buyerId: req.user.id,
            sellerId: product.userId,
            productId,
            rating: numericRating,
            title: title ? String(title).trim() : null,
            comment: String(comment).trim()
        });

        const createdReview = await Review.findByPk(review.id, {
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
            ]
        });

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully.",
            review: createdReview || review
        });

    } catch (error) {
        console.error("CREATE REVIEW ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to create review."
        });
    }
};


/* =========================================================
   GET PRODUCT REVIEWS
   GET /api/reviews/product/:productId
========================================================= */

exports.getReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required."
            });
        }

        const reviews = await Review.findAll({
            where: {
                productId
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

        return res.json({
            success: true,
            reviews
        });

    } catch (error) {
        console.error("GET REVIEWS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to load reviews."
        });
    }
};


/* =========================================================
   GET REVIEW SUMMARY
   GET /api/reviews/product/:productId/summary
========================================================= */

exports.getReviewSummary = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required."
            });
        }

        const reviews = await Review.findAll({
            where: {
                productId
            },
            attributes: [
                "rating"
            ]
        });

        const totalReviews = reviews.length;

        const stars = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        };

        let totalRating = 0;

        reviews.forEach((review) => {
            const rating = Number(review.rating);

            if (stars[rating] !== undefined) {
                stars[rating]++;
                totalRating += rating;
            }
        });

        const averageRating =
            totalReviews === 0
                ? 0
                : Number(
                    (totalRating / totalReviews).toFixed(1)
                );

        return res.json({
            success: true,
            averageRating,
            totalReviews,
            stars
        });

    } catch (error) {
        console.error(
            "GET REVIEW SUMMARY ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to load review summary."
        });
    }
};


/* =========================================================
   UPDATE REVIEW
   PUT /api/reviews/:id
========================================================= */

exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            rating,
            title,
            comment
        } = req.body;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found."
            });
        }

        if (String(review.buyerId) !== String(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: "Access denied."
            });
        }

        if (rating !== undefined) {
            const numericRating = Number(rating);

            if (
                !Number.isInteger(numericRating) ||
                numericRating < 1 ||
                numericRating > 5
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5."
                });
            }

            review.rating = numericRating;
        }

        if (title !== undefined) {
            review.title = title
                ? String(title).trim()
                : null;
        }

        if (comment !== undefined) {
            if (!String(comment).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Review comment cannot be empty."
                });
            }

            review.comment = String(comment).trim();
        }

        await review.save();

        return res.json({
            success: true,
            message: "Review updated successfully.",
            review
        });

    } catch (error) {
        console.error(
            "UPDATE REVIEW ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to update review."
        });
    }
};


/* =========================================================
   DELETE REVIEW
   DELETE /api/reviews/:id
========================================================= */

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found."
            });
        }

        const isOwner =
            String(review.buyerId) ===
            String(req.user.id);

        const isAdmin =
            req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied."
            });
        }

        await review.destroy();

        return res.json({
            success: true,
            message: "Review deleted successfully."
        });

    } catch (error) {
        console.error(
            "DELETE REVIEW ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to delete review."
        });
    }
};
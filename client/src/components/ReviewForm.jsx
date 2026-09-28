import { useState } from "react";
import api from "../config/axios";
import "./ReviewForm.css";

function ReviewForm({ productId, onReviewSubmitted }) {

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    /* =========================================
       SUBMIT REVIEW
    ========================================= */

    const submitReview = async (e) => {

        e.preventDefault();

        /* -----------------------------------------
           CHECK PRODUCT
        ----------------------------------------- */

        if (!productId) {

            alert(
                "Product information is missing. Please refresh the page."
            );

            return;
        }

        /* -----------------------------------------
           CHECK LOGIN
        ----------------------------------------- */

        const user = JSON.parse(
            localStorage.getItem("user") || "null"
        );

        if (!user) {

            alert("Please login first.");

            return;
        }

        /* -----------------------------------------
           VALIDATE COMMENT
        ----------------------------------------- */

        if (!comment.trim()) {

            alert("Please write your review.");

            return;
        }

        if (comment.trim().length < 3) {

            alert(
                "Your review must contain at least 3 characters."
            );

            return;
        }

        try {

            setLoading(true);

            console.log(
                "========== SUBMITTING REVIEW =========="
            );

            console.log(
                "Product ID:",
                productId
            );

            console.log(
                "Rating:",
                rating
            );

            console.log(
                "Comment:",
                comment.trim()
            );

            console.log(
                "========================================"
            );

            /* -----------------------------------------
               SEND REVIEW
            ----------------------------------------- */

            const response = await api.post(
                "/reviews",
                {
                    productId: Number(productId),
                    rating: Number(rating),
                    comment: comment.trim()
                }
            );

            console.log(
                "REVIEW RESPONSE:",
                response.data
            );

            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            alert(
                response.data?.message ||
                "Review submitted successfully."
            );

            /* -----------------------------------------
               RESET FORM
            ----------------------------------------- */

            setComment("");
            setRating(5);

            /* -----------------------------------------
               REFRESH REVIEW LIST
            ----------------------------------------- */

            if (
                typeof onReviewSubmitted === "function"
            ) {

                onReviewSubmitted(
                    response.data?.review
                );

            }

        }

        catch (error) {

            console.error(
                "========================================"
            );

            console.error(
                "REVIEW SUBMISSION ERROR"
            );

            console.error(
                "STATUS:",
                error.response?.status
            );

            console.error(
                "DATA:",
                error.response?.data
            );

            console.error(
                "ERROR:",
                error.message
            );

            console.error(
                "========================================"
            );

            alert(
                error.response?.data?.message ||
                "Unable to submit review. Please try again."
            );

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================
       RENDER
    ========================================= */

    return (

        <section className="review-form">

            <div className="review-form-header">

                <div>

                    <span className="review-eyebrow">
                        CUSTOMER FEEDBACK
                    </span>

                    <h2>
                        Leave a Review
                    </h2>

                    <p>
                        Share your experience with this product
                        and help other buyers.
                    </p>

                </div>

            </div>


            <form
                className="review-form-content"
                onSubmit={submitReview}
            >

                {/* =================================
                   RATING
                ================================= */}

                <div className="review-field">

                    <label htmlFor="rating">
                        Rating
                    </label>

                    <select
                        id="rating"
                        value={rating}
                        disabled={loading}
                        onChange={(e) =>
                            setRating(
                                Number(e.target.value)
                            )
                        }
                    >

                        <option value={5}>
                            ⭐⭐⭐⭐⭐ Excellent
                        </option>

                        <option value={4}>
                            ⭐⭐⭐⭐ Very Good
                        </option>

                        <option value={3}>
                            ⭐⭐⭐ Average
                        </option>

                        <option value={2}>
                            ⭐⭐ Poor
                        </option>

                        <option value={1}>
                            ⭐ Very Poor
                        </option>

                    </select>

                </div>


                {/* =================================
                   COMMENT
                ================================= */}

                <div className="review-field">

                    <label htmlFor="review-comment">
                        Your Review
                    </label>

                    <textarea
                        id="review-comment"
                        value={comment}
                        disabled={loading}
                        required
                        maxLength={1000}
                        rows={6}
                        placeholder="Tell other buyers about your experience with this product..."
                        onChange={(e) =>
                            setComment(
                                e.target.value
                            )
                        }
                    />

                    <div className="review-character-count">

                        {comment.length}/1000 characters

                    </div>

                </div>


                {/* =================================
                   SUBMIT
                ================================= */}

                <button
                    type="submit"
                    className="review-submit-btn"
                    disabled={
                        loading ||
                        !comment.trim() ||
                        !productId
                    }
                >

                    {loading ? (

                        <>

                            <span className="review-spinner"></span>

                            Submitting...

                        </>

                    ) : (

                        <>

                            Submit Review

                            <span>
                                →
                            </span>

                        </>

                    )}

                </button>

            </form>

        </section>

    );

}

export default ReviewForm;
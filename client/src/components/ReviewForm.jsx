import { useState } from "react";
import api from "../config/axios";
import "./ReviewForm.css";

function ReviewForm({ sellerId, productId, onReviewSubmitted }) {
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const submitReview = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            setError("Please login first.");
            return;
        }

        let user;

        try {
            user = JSON.parse(storedUser);
        } catch (err) {
            console.error("USER DATA ERROR:", err);
            setError("Your login session is invalid. Please login again.");
            return;
        }

        const buyerId = user?.id || user?._id || user?.userId;

        if (!buyerId) {
            setError("Unable to identify your account. Please login again.");
            return;
        }

        if (!sellerId) {
            setError("Seller information is missing.");
            return;
        }

        if (!productId) {
            setError("Product information is missing.");
            return;
        }

        const cleanReview = review.trim();

        if (!cleanReview) {
            setError("Please write your review.");
            return;
        }

        if (cleanReview.length < 5) {
            setError("Your review must contain at least 5 characters.");
            return;
        }

        if (cleanReview.length > 1000) {
            setError("Your review cannot exceed 1000 characters.");
            return;
        }

        if (rating < 1 || rating > 5) {
            setError("Please select a valid rating.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/reviews", {
                sellerId: Number(sellerId) || sellerId,
                buyerId: Number(buyerId) || buyerId,
                productId: Number(productId) || productId,
                rating: Number(rating),
                review: cleanReview
            });

            console.log(
                "REVIEW SUBMISSION RESPONSE:",
                response.data
            );

            setMessage(
                response.data?.message ||
                "Review submitted successfully."
            );

            setReview("");
            setRating(5);

            if (typeof onReviewSubmitted === "function") {
                onReviewSubmitted(response.data);
            }
        } catch (err) {
            console.error(
                "REVIEW SUBMISSION ERROR:",
                err.response?.data || err.message
            );

            if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    err.response?.data?.message ||
                    "You are not allowed to submit this review."
                );
            } else if (err.response?.status === 409) {
                setError(
                    err.response?.data?.message ||
                    "You have already reviewed this product or seller."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to submit your review. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="review-form">

            <div className="review-form-header">
                <div>
                    <h2>Leave a Review</h2>

                    <p>
                        Share your experience with this seller.
                    </p>
                </div>

                <div className="review-rating-preview">
                    {"★".repeat(rating)}
                    {"☆".repeat(5 - rating)}
                </div>
            </div>

            {message && (
                <div
                    className="review-message review-success"
                    role="alert"
                >
                    ✓ {message}
                </div>
            )}

            {error && (
                <div
                    className="review-message review-error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            <form
                className="review-form-content"
                onSubmit={submitReview}
            >

                <div className="review-field">

                    <label htmlFor="review-rating">
                        Rating
                    </label>

                    <select
                        id="review-rating"
                        value={rating}
                        disabled={loading}
                        onChange={(e) => {
                            setRating(Number(e.target.value));
                            setError("");
                        }}
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

                <div className="review-field">

                    <div className="review-label-row">

                        <label htmlFor="review-message">
                            Your Review
                        </label>

                        <span>
                            {review.length}/1000
                        </span>

                    </div>

                    <textarea
                        id="review-message"
                        value={review}
                        disabled={loading}
                        rows={5}
                        maxLength={1000}
                        required
                        placeholder="Tell other buyers about your experience..."
                        onChange={(e) => {
                            setReview(e.target.value);
                            setError("");
                            setMessage("");
                        }}
                    />

                </div>

                <button
                    className="review-submit-btn"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="review-spinner"></span>
                            Submitting...
                        </>
                    ) : (
                        <>
                            Submit Review
                            <span>→</span>
                        </>
                    )}
                </button>

            </form>

        </section>
    );
}

export default ReviewForm;
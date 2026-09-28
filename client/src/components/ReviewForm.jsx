import { useState } from "react";
import api from "../config/axios";
import "./ReviewForm.css";

function ReviewForm({
    sellerId,
    seller,
    productId
}) {

    const [rating, setRating] = useState(5);
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);

    /*
    =====================================================
    RESOLVE SELLER ID
    =====================================================
    */

    const resolvedSellerId =
        sellerId ||
        seller?.id ||
        seller?.userId ||
        seller?._id ||
        seller?.user?.id ||
        seller?.user?.userId ||
        null;


    /*
    =====================================================
    SUBMIT REVIEW
    =====================================================
    */

    const submitReview = async (e) => {

        e.preventDefault();

        const user = JSON.parse(
            localStorage.getItem("user") || "null"
        );


        /*
        LOGIN CHECK
        */

        if (!user) {

            alert("Please login first.");

            return;
        }


        /*
        SELLER CHECK
        */

        if (!resolvedSellerId) {

            console.error(
                "REVIEW ERROR: Seller ID is missing",
                {
                    sellerId,
                    seller,
                    productId,
                    user
                }
            );

            alert(
                "Unable to identify the seller. Please refresh the product page and try again."
            );

            return;
        }


        /*
        REVIEW CHECK
        */

        if (!review.trim()) {

            alert(
                "Please write your review."
            );

            return;
        }


        try {

            setLoading(true);


            /*
            SEND REVIEW
            */

            const response = await api.post(
                "/reviews",
                {
                    sellerId: resolvedSellerId,

                    buyerId:
                        user.id ||
                        user.userId ||
                        user._id,

                    productId:
                        productId || null,

                    rating: Number(rating),

                    review:
                        review.trim()
                }
            );


            /*
            SUCCESS
            */

            alert(
                response.data?.message ||
                "Review submitted successfully."
            );


            /*
            RESET FORM
            */

            setReview("");

            setRating(5);


        } catch (error) {

            console.error(
                "REVIEW SUBMISSION ERROR:",
                error.response?.data ||
                error
            );


            alert(
                error.response?.data?.message ||
                "Unable to submit review."
            );


        } finally {

            setLoading(false);

        }
    };


    return (

        <section className="review-form">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="review-form-header">

                <div>

                    <span className="review-eyebrow">
                        CUSTOMER FEEDBACK
                    </span>

                    <h2>
                        Leave a Review
                    </h2>

                    <p>
                        Share your experience with this seller.
                    </p>

                </div>

            </div>


            {/* =========================================
                FORM
            ========================================= */}

            <form
                className="review-form-content"
                onSubmit={submitReview}
            >


                {/* =====================================
                    RATING
                ===================================== */}

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


                {/* =====================================
                    REVIEW
                ===================================== */}

                <div className="review-field">

                    <label htmlFor="review">
                        Your Review
                    </label>

                    <textarea
                        id="review"
                        value={review}
                        disabled={loading}
                        required
                        maxLength={1000}
                        rows={6}
                        placeholder="Tell other buyers about your experience with this seller..."
                        onChange={(e) =>
                            setReview(e.target.value)
                        }
                    />

                    <div className="review-character-count">
                        {review.length}/1000 characters
                    </div>

                </div>


                {/* =====================================
                    SUBMIT BUTTON
                ===================================== */}

                <button
                    type="submit"
                    className="review-submit-btn"
                    disabled={
                        loading ||
                        !review.trim() ||
                        !resolvedSellerId
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
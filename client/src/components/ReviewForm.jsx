import { useState } from "react";
import api from "../config/axios";
import "./ReviewForm.css";

function ReviewForm({ sellerId, productId }) {

    /* =========================================
       STATES
    ========================================= */

    const [rating, setRating] = useState(5);
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);


    /* =========================================
       SUBMIT REVIEW
    ========================================= */

    const submitReview = async (e) => {

        e.preventDefault();


        const user = JSON.parse(
            localStorage.getItem("user") || "null"
        );


        /* CHECK LOGIN */

        if (!user) {

            alert("Please login first.");

            return;

        }


        /* VALIDATE REVIEW */

        if (!review.trim()) {

            alert("Please write your review.");

            return;

        }


        if (!sellerId) {

            alert("Seller information is missing.");

            return;

        }


        try {

            setLoading(true);


            const response = await api.post(

                "/reviews",

                {

                    sellerId,

                    buyerId: user.id,

                    productId,

                    rating,

                    review: review.trim()

                }

            );


            alert(

                response.data.message ||

                "Review submitted successfully."

            );


            /* RESET FORM */

            setReview("");

            setRating(5);

        }

        catch (error) {

            console.error(

                "REVIEW SUBMISSION ERROR:",

                error.response?.data || error.message

            );


            alert(

                error.response?.data?.message ||

                "Unable to submit review."

            );

        }

        finally {

            setLoading(false);

        }

    };


    return (

        <div className="review-form">

            <h2>
                Leave a Review
            </h2>


            <form onSubmit={submitReview}>


                {/* =====================================
                   RATING
                ===================================== */}

                <label>
                    Rating
                </label>

                <select

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


                {/* =====================================
                   REVIEW MESSAGE
                ===================================== */}

                <label>
                    Your Review
                </label>

                <textarea

                    placeholder="Write your review..."

                    value={review}

                    disabled={loading}

                    required

                    rows="5"

                    maxLength="1000"

                    onChange={(e) =>

                        setReview(e.target.value)

                    }

                />


                <small>

                    {review.length}/1000 Characters

                </small>


                {/* =====================================
                   SUBMIT BUTTON
                ===================================== */}

                <button

                    type="submit"

                    disabled={loading}

                >

                    {

                        loading

                            ? "Submitting..."

                            : "Submit Review"

                    }

                </button>


            </form>

        </div>

    );

}

export default ReviewForm;
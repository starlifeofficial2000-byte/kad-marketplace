import { useEffect, useState } from "react";
import api from "../config/axios";

import {
    FaStar,
    FaRegStar
} from "react-icons/fa";

import ReviewCard from "./ReviewCard";

import "./ReviewList.css";


function ReviewList({ productId, refresh }) {

    const [reviews, setReviews] = useState([]);

    const [loading, setLoading] = useState(true);

    const [summary, setSummary] = useState({

        averageRating: 0,

        totalReviews: 0,

        stars: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        }

    });


    /* =========================================
       LOAD REVIEWS AND SUMMARY
    ========================================= */

    useEffect(() => {

        if (!productId) {

            setReviews([]);

            return;

        }

        loadReviewData();

    }, [productId, refresh]);


    const loadReviewData = async () => {

        try {

            setLoading(true);

            await Promise.all([
                loadReviews(),
                loadSummary()
            ]);

        }

        catch (error) {

            console.error(
                "REVIEW LOAD ERROR:",
                error
            );

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================
       LOAD PRODUCT REVIEWS
    ========================================= */

    const loadReviews = async () => {

        try {

            const res = await api.get(

                `/reviews/product/${productId}`

            );


            setReviews(

                Array.isArray(res.data)

                    ? res.data

                    : res.data.reviews || []

            );

        }

        catch (error) {

            console.error(
                "LOAD REVIEWS ERROR:",
                error
            );

            setReviews([]);

        }

    };


    /* =========================================
       LOAD REVIEW SUMMARY
    ========================================= */

    const loadSummary = async () => {

        try {

            const res = await api.get(

                `/reviews/product/${productId}/summary`

            );


            setSummary({

                averageRating:

                    Number(
                        res.data?.averageRating
                    ) || 0,

                totalReviews:

                    Number(
                        res.data?.totalReviews
                    ) || 0,

                stars: {

                    5:
                        Number(
                            res.data?.stars?.[5]
                        ) || 0,

                    4:
                        Number(
                            res.data?.stars?.[4]
                        ) || 0,

                    3:
                        Number(
                            res.data?.stars?.[3]
                        ) || 0,

                    2:
                        Number(
                            res.data?.stars?.[2]
                        ) || 0,

                    1:
                        Number(
                            res.data?.stars?.[1]
                        ) || 0

                }

            });

        }

        catch (error) {

            console.error(
                "LOAD REVIEW SUMMARY ERROR:",
                error
            );

        }

    };


    /* =========================================
       CALCULATE STAR PERCENTAGE
    ========================================= */

    const percentage = (count) => {

        if (!summary.totalReviews) {

            return 0;

        }


        return Math.min(

            100,

            (count / summary.totalReviews) * 100

        );

    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="review-list">

                <div className="no-reviews">

                    Loading reviews...

                </div>

            </div>

        );

    }


    /* =========================================
       PAGE
    ========================================= */

    return (

        <div className="review-list">


            {/* =====================================
               REVIEW SUMMARY
            ===================================== */}

            <div className="review-summary">


                {/* LEFT SIDE */}

                <div className="rating-left">

                    <h1>

                        {summary.averageRating.toFixed(1)}

                    </h1>


                    <div className="summary-stars">

                        {

                            [1, 2, 3, 4, 5].map(

                                (star) =>

                                    star <=
                                    Math.round(
                                        summary.averageRating
                                    )

                                        ?

                                        <FaStar
                                            key={star}
                                            className="filled-star"
                                        />

                                        :

                                        <FaRegStar
                                            key={star}
                                            className="empty-star"
                                        />

                            )

                        }

                    </div>


                    <p>

                        {summary.totalReviews}

                        {" "}

                        {summary.totalReviews === 1

                            ? "Review"

                            : "Reviews"

                        }

                    </p>

                </div>


                {/* RIGHT SIDE */}

                <div className="rating-right">

                    {

                        [5, 4, 3, 2, 1].map(

                            (star) => (

                                <div
                                    key={star}
                                    className="rating-row"
                                >


                                    <span className="rating-number">

                                        {star} ★

                                    </span>


                                    <div className="rating-bar">

                                        <div

                                            className="rating-fill"

                                            style={{

                                                width:

                                                    `${percentage(

                                                        summary.stars?.[star] || 0

                                                    )}%`

                                            }}

                                        />

                                    </div>


                                    <span className="rating-count">

                                        {

                                            summary.stars?.[star] || 0

                                        }

                                    </span>


                                </div>

                            )

                        )

                    }

                </div>


            </div>


            {/* =====================================
               REVIEW LIST
            ===================================== */}

            {

                reviews.length === 0

                    ?

                    <div className="no-reviews">

                        ⭐ No customer reviews yet.

                        <br />

                        Be the first to leave a review!

                    </div>

                    :

                    reviews.map(

                        (review) => (

                            <ReviewCard

                                key={review.id}

                                review={review}

                                onRefresh={loadReviewData}

                            />

                        )

                    )

            }


        </div>

    );

}


export default ReviewList;
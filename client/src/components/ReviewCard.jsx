import {
    FaStar,
    FaRegStar,
    FaUserCircle,
    FaEdit,
    FaTrash
} from "react-icons/fa";

import { useState } from "react";
import api from "../config/axios";

import "./ReviewCard.css";


function ReviewCard({ review, onRefresh }) {

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );


    /* =========================================
       STATES
    ========================================= */

    const [editing, setEditing] = useState(false);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({

        rating: review.rating || 1,

        title: review.title || "",

        comment: review.comment || ""

    });


    /* =========================================
       CHECK PERMISSION
    ========================================= */

    const isOwner =

        user &&

        Number(user.id) === Number(review.buyerId);


    const canManageReviews =

        user?.permissions?.some(

            permission =>
                permission.name === "manage_users"

        ) || false;


    const canEditReview =

        isOwner || canManageReviews;


    /* =========================================
       RENDER STARS
    ========================================= */

    const renderStars = (rating) => {

        const stars = [];

        for (let i = 1; i <= 5; i++) {

            stars.push(

                i <= rating

                    ? (

                        <FaStar
                            key={i}
                            className="filled-star"
                        />

                    )

                    : (

                        <FaRegStar
                            key={i}
                            className="empty-star"
                        />

                    )

            );

        }

        return stars;

    };


    /* =========================================
       UPDATE REVIEW
    ========================================= */

    const saveReview = async () => {

        if (!form.title.trim()) {

            alert("Review title is required.");

            return;

        }


        if (!form.comment.trim()) {

            alert("Review comment is required.");

            return;

        }


        try {

            setLoading(true);


            await api.put(

                `/reviews/${review.id}`,

                {

                    rating: form.rating,

                    title: form.title.trim(),

                    comment: form.comment.trim()

                }

            );


            alert(
                "Review updated successfully."
            );


            setEditing(false);


            if (onRefresh) {

                onRefresh();

            }

        }

        catch (error) {

            console.error(

                "UPDATE REVIEW ERROR:",

                error.response?.data || error.message

            );


            alert(

                error.response?.data?.message ||

                "Unable to update review."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================
       DELETE REVIEW
    ========================================= */

    const deleteReview = async () => {

        const confirmed = window.confirm(

            "Are you sure you want to delete this review?"

        );


        if (!confirmed) {

            return;

        }


        try {

            setLoading(true);


            await api.delete(

                `/reviews/${review.id}`

            );


            alert(
                "Review deleted successfully."
            );


            if (onRefresh) {

                onRefresh();

            }

        }

        catch (error) {

            console.error(

                "DELETE REVIEW ERROR:",

                error.response?.data || error.message

            );


            alert(

                error.response?.data?.message ||

                "Unable to delete review."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================
       CANCEL EDIT
    ========================================= */

    const cancelEdit = () => {

        setForm({

            rating: review.rating || 1,

            title: review.title || "",

            comment: review.comment || ""

        });


        setEditing(false);

    };


    /* =========================================
       COMPONENT
    ========================================= */

    return (

        <div className="review-card">


            {/* =====================================
               REVIEW HEADER
            ===================================== */}

            <div className="review-header">


                {/* BUYER IMAGE */}

                {

                    review.buyer?.profileImage

                        ? (

                            <img

                                src={
                                    `/uploads/${review.buyer.profileImage}`
                                }

                                alt={
                                    review.buyer?.name ||
                                    "Reviewer"
                                }

                                className="review-avatar"

                            />

                        )

                        : (

                            <FaUserCircle
                                className="review-avatar-icon"
                            />

                        )

                }


                {/* BUYER INFORMATION */}

                <div>

                    <h3>

                        {

                            review.buyer?.name ||

                            "Anonymous"

                        }

                    </h3>


                    <div className="review-stars">

                        {

                            renderStars(

                                editing

                                    ? form.rating

                                    : review.rating

                            )

                        }

                    </div>

                </div>

            </div>


            {/* =====================================
               EDIT MODE
            ===================================== */}

            {

                editing

                    ? (

                        <div className="review-edit-section">


                            {/* STAR PICKER */}

                            <div className="star-picker">

                                {

                                    [1, 2, 3, 4, 5].map(

                                        (star) => (

                                            <button

                                                key={star}

                                                type="button"

                                                className={

                                                    star <= form.rating

                                                        ? "selected-star"

                                                        : "normal-star"

                                                }

                                                onClick={() =>

                                                    setForm((prev) => ({

                                                        ...prev,

                                                        rating: star

                                                    }))

                                                }

                                            >

                                                ★

                                            </button>

                                        )

                                    )

                                }

                            </div>


                            {/* TITLE */}

                            <input

                                type="text"

                                value={form.title}

                                placeholder="Review title"

                                disabled={loading}

                                onChange={(e) =>

                                    setForm((prev) => ({

                                        ...prev,

                                        title: e.target.value

                                    }))

                                }

                            />


                            {/* COMMENT */}

                            <textarea

                                rows="5"

                                value={form.comment}

                                placeholder="Write your review..."

                                disabled={loading}

                                maxLength="1000"

                                onChange={(e) =>

                                    setForm((prev) => ({

                                        ...prev,

                                        comment: e.target.value

                                    }))

                                }

                            />


                            <small>

                                {form.comment.length}/1000 Characters

                            </small>


                            {/* EDIT BUTTONS */}

                            <div className="review-edit-actions">

                                <button

                                    type="button"

                                    className="reply-btn"

                                    onClick={saveReview}

                                    disabled={loading}

                                >

                                    {

                                        loading

                                            ? "Saving..."

                                            : "Save Changes"

                                    }

                                </button>


                                <button

                                    type="button"

                                    className="cancel-review-btn"

                                    onClick={cancelEdit}

                                    disabled={loading}

                                >

                                    Cancel

                                </button>

                            </div>

                        </div>

                    )

                    : (

                        <>


                            {/* REVIEW CONTENT */}

                            <h3 className="review-title">

                                {review.title}

                            </h3>


                            <p className="review-comment">

                                {review.comment}

                            </p>

                        </>

                    )

            }


            {/* =====================================
               VERIFIED PURCHASE
            ===================================== */}

            {

                review.isVerifiedPurchase && (

                    <span className="verified-badge">

                        ✔ Verified Purchase

                    </span>

                )

            }


            {/* =====================================
               REVIEW FOOTER
            ===================================== */}

            <div className="review-footer">


                {/* DATE */}

                <span>

                    {

                        review.createdAt

                            ? new Date(

                                review.createdAt

                            ).toLocaleDateString()

                            : ""

                    }

                </span>


                {/* EDIT / DELETE ACTIONS */}

                {

                    canEditReview && (

                        <div className="review-actions">


                            <button

                                type="button"

                                onClick={() =>

                                    editing

                                        ? cancelEdit()

                                        : setEditing(true)

                                }

                                disabled={loading}

                                title="Edit Review"

                            >

                                <FaEdit />

                            </button>


                            <button

                                type="button"

                                onClick={deleteReview}

                                disabled={loading}

                                title="Delete Review"

                            >

                                <FaTrash />

                            </button>


                        </div>

                    )

                }

            </div>

        </div>

    );

}


export default ReviewCard;
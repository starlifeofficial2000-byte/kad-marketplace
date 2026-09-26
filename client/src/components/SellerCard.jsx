import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../config/axios";
import "./SellerCard.css";

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL || "";

const R2_PUBLIC_URL =
    import.meta.env.VITE_R2_PUBLIC_URL || "";


/* ==========================================
   IMAGE URL HELPER
========================================== */

const getImageUrl = (image, fallback = null) => {
    if (!image || typeof image !== "string") {
        return fallback;
    }

    const value = image.trim();

    if (!value) {
        return fallback;
    }

    /* Already a complete URL */
    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("data:")
    ) {
        return value;
    }

    /* Remove duplicate leading slashes */
    const cleanPath = value.replace(/^\/+/, "");

    /*
     * Cloudflare R2 public URL.
     *
     * This allows:
     * uploads/profiles/abc.jpg
     * uploads/products/abc.jpg
     * profiles/abc.jpg
     * products/abc.jpg
     */
    if (R2_PUBLIC_URL) {
        if (
            cleanPath.startsWith("uploads/") ||
            cleanPath.startsWith("profiles/") ||
            cleanPath.startsWith("products/")
        ) {
            return `${R2_PUBLIC_URL.replace(/\/+$/, "")}/${cleanPath}`;
        }
    }

    /*
     * Existing absolute API/static path
     */
    if (value.startsWith("/")) {
        return `${SERVER_URL}${value}`;
    }

    /*
     * If backend has already returned an uploads path
     */
    if (cleanPath.startsWith("uploads/")) {
        return `${SERVER_URL}/${cleanPath}`;
    }

    /*
     * Legacy images stored only as filename
     */
    return `${SERVER_URL}/uploads/${cleanPath}`;
};


/* ==========================================
   AVATAR FALLBACK
========================================== */

const getAvatarUrl = (name = "Seller") => {
    return (
        "https://ui-avatars.com/api/?" +
        new URLSearchParams({
            name,
            background: "0D8ABC",
            color: "ffffff",
            size: "200",
            bold: "true"
        }).toString()
    );
};


/* ==========================================
   SELLER CARD
========================================== */

function SellerCard({ sellerId }) {

    const [seller, setSeller] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* ==========================================
       LOAD SELLER
    ========================================== */

    useEffect(() => {

        if (!sellerId) {
            setSeller(null);
            setLoading(false);
            return;
        }

        loadSeller();

    }, [sellerId]);


    const loadSeller = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                `/users/${sellerId}`
            );

            console.log(
                "SELLER CARD RESPONSE:",
                response.data
            );

            const sellerData =
                response.data?.seller ||
                response.data?.user ||
                response.data?.data?.seller ||
                response.data?.data ||
                response.data ||
                null;

            if (!sellerData) {
                throw new Error(
                    "Seller information was not returned."
                );
            }

            setSeller(sellerData);

        } catch (error) {

            console.error(
                "SELLER CARD ERROR:",
                error.response?.data ||
                error.message
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Unable to load seller."
            );

        } finally {

            setLoading(false);

        }
    };


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (
            <div className="seller-card loading">

                <div className="seller-card-spinner">
                    Loading seller...
                </div>

            </div>
        );
    }


    /* ==========================================
       ERROR
    ========================================== */

    if (error || !seller) {

        return (
            <div className="seller-card error">

                <p>
                    {error || "Seller information unavailable."}
                </p>

            </div>
        );
    }


    const sellerName =
        seller.name ||
        seller.fullName ||
        seller.username ||
        "Seller";


    const sellerImage =
        getImageUrl(
            seller.profileImage,
            getAvatarUrl(sellerName)
        );


    const sellerIdValue =
        seller.id ||
        seller._id ||
        seller.userId ||
        sellerId;


    return (

        <div className="seller-card">

            {/* ======================================
                SELLER HEADER
            ====================================== */}

            <div className="seller-card-header">

                <img
                    className="seller-card-image"
                    src={sellerImage}
                    alt={sellerName}
                    onError={(event) => {

                        event.currentTarget.onerror = null;

                        event.currentTarget.src =
                            getAvatarUrl(sellerName);

                    }}
                />


                <div className="seller-card-info">

                    <h3>
                        {sellerName}

                        {seller.verified && (
                            <span
                                className="seller-verified"
                                title="Verified Seller"
                            >
                                ✓
                            </span>
                        )}

                    </h3>


                    {seller.location && (

                        <p className="seller-location">
                            📍 {seller.location}
                        </p>

                    )}


                    {!seller.location &&
                        seller.city && (

                            <p className="seller-location">
                                📍 {seller.city}
                            </p>

                        )}


                    <p className="seller-status">

                        <span className="status-dot">
                            ●
                        </span>

                        {seller.lastSeen
                            ? " Active"
                            : " Recently Active"}

                    </p>

                </div>

            </div>


            {/* ======================================
                SELLER DETAILS
            ====================================== */}

            <div className="seller-card-details">

                {seller.averageRating !== undefined && (

                    <div className="seller-stat">

                        <strong>
                            ⭐{" "}
                            {Number(
                                seller.averageRating || 0
                            ).toFixed(1)}
                        </strong>

                        <span>
                            Rating
                        </span>

                    </div>

                )}


                {seller.totalReviews !== undefined && (

                    <div className="seller-stat">

                        <strong>
                            {seller.totalReviews || 0}
                        </strong>

                        <span>
                            Reviews
                        </span>

                    </div>

                )}


                {seller.totalProducts !== undefined && (

                    <div className="seller-stat">

                        <strong>
                            {seller.totalProducts || 0}
                        </strong>

                        <span>
                            Products
                        </span>

                    </div>

                )}

            </div>


            {/* ======================================
                VIEW PROFILE
            ====================================== */}

            <Link
                to={`/seller/${sellerIdValue}`}
                className="visit-profile"
            >
                View Seller Profile
            </Link>

        </div>

    );
}


export default SellerCard;
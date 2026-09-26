import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import api from "../config/axios";
import ReviewList from "../components/ReviewList";

import "./SellerProfile.css";


const SERVER_URL =
    import.meta.env.VITE_SERVER_URL || "";

const R2_PUBLIC_URL =
    import.meta.env.VITE_R2_PUBLIC_URL || "";


/* ==========================================
   IMAGE URL HELPER
========================================== */

const getImageUrl = (
    image,
    fallback = null
) => {

    if (!image || typeof image !== "string") {
        return fallback;
    }

    const value = image.trim();

    if (!value) {
        return fallback;
    }


    /* ======================================
       COMPLETE URL
    ====================================== */

    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("data:")
    ) {
        return value;
    }


    /* ======================================
       CLEAN PATH
    ====================================== */

    const cleanPath =
        value.replace(/^\/+/, "");


    /* ======================================
       R2 PUBLIC URL
    ====================================== */

    if (R2_PUBLIC_URL) {

        if (
            cleanPath.startsWith("uploads/") ||
            cleanPath.startsWith("profiles/") ||
            cleanPath.startsWith("products/")
        ) {

            return (
                `${R2_PUBLIC_URL.replace(
                    /\/+$/,
                    ""
                )}/${cleanPath}`
            );

        }

    }


    /* ======================================
       SERVER STATIC PATH
    ====================================== */

    if (value.startsWith("/")) {

        return `${SERVER_URL}${value}`;

    }


    /* ======================================
       UPLOAD PATH
    ====================================== */

    if (
        cleanPath.startsWith("uploads/")
    ) {

        return `${SERVER_URL}/${cleanPath}`;

    }


    /* ======================================
       LEGACY FILENAME
    ====================================== */

    return `${SERVER_URL}/uploads/${cleanPath}`;
};


/* ==========================================
   AVATAR FALLBACK
========================================== */

const getAvatarUrl = (
    name = "Seller"
) => {

    return (
        "https://ui-avatars.com/api/?" +
        new URLSearchParams({

            name,

            background: "0D8ABC",

            color: "ffffff",

            size: "300",

            bold: "true"

        }).toString()
    );
};


/* ==========================================
   PARSE PRODUCT IMAGES
========================================== */

const parseImages = (images) => {

    if (!images) {
        return [];
    }


    /* Already array */

    if (Array.isArray(images)) {

        return images.filter(Boolean);

    }


    /* JSON string */

    if (typeof images === "string") {

        try {

            const parsed =
                JSON.parse(images);

            if (Array.isArray(parsed)) {

                return parsed.filter(Boolean);

            }

            if (
                typeof parsed === "string" &&
                parsed.trim()
            ) {

                return [parsed];

            }

        } catch {

            /*
             * Sometimes old records contain
             * one filename rather than JSON.
             */

            return [images];

        }

    }


    return [];
};


/* ==========================================
   SELLER PROFILE
========================================== */

function SellerProfile() {

    const { id } = useParams();


    const [seller, setSeller] =
        useState(null);

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /* ==========================================
       LOAD SELLER
    ========================================== */

    useEffect(() => {

        if (!id) {

            setError(
                "Seller ID is missing."
            );

            setLoading(false);

            return;
        }

        loadSeller();

    }, [id]);


    const loadSeller = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await api.get(
                    `/users/${id}`
                );


            console.log(
                "SELLER PROFILE RESPONSE:",
                response.data
            );


            /* ======================================
               SELLER DATA
            ====================================== */

            const sellerData =
                response.data?.seller ||
                response.data?.user ||
                response.data?.data?.seller ||
                response.data?.data ||
                null;


            /* ======================================
               PRODUCTS
            ====================================== */

            const productsData =
                response.data?.products ||
                response.data?.data?.products ||
                [];


            if (!sellerData) {

                throw new Error(
                    "Seller information was not returned."
                );

            }


            setSeller(
                sellerData
            );


            setProducts(

                Array.isArray(
                    productsData
                )
                    ? productsData
                    : []

            );

        } catch (error) {

            console.error(
                "LOAD SELLER ERROR:",
                error.response?.data ||
                error.message
            );


            setSeller(null);
            setProducts([]);


            setError(

                error.response?.data?.message ||
                error.message ||
                "Failed to load seller profile."

            );

        } finally {

            setLoading(false);

        }
    };


    /* ==========================================
       SELLER INFORMATION
    ========================================== */

    const sellerName =
        seller?.name ||
        seller?.fullName ||
        seller?.username ||
        "Seller";


    const sellerImage =
        getImageUrl(

            seller?.profileImage,

            getAvatarUrl(
                sellerName
            )

        );


    /* ==========================================
       PRODUCT IMAGE
    ========================================== */

    const getProductImage = (
        product
    ) => {

        const images =
            parseImages(
                product?.images
            );


        if (
            images.length === 0
        ) {

            return "https://via.placeholder.com/400x300?text=No+Image";

        }


        return getImageUrl(

            images[0],

            "https://via.placeholder.com/400x300?text=No+Image"

        );

    };


    /* ==========================================
       PRODUCT IMAGE ERROR
    ========================================== */

    const handleProductImageError = (
        event
    ) => {

        event.currentTarget.onerror =
            null;

        event.currentTarget.src =
            "https://via.placeholder.com/400x300?text=Image+Unavailable";

    };


    /* ==========================================
       SELLER IMAGE ERROR
    ========================================== */

    const handleSellerImageError = (
        event
    ) => {

        event.currentTarget.onerror =
            null;

        event.currentTarget.src =
            getAvatarUrl(
                sellerName
            );

    };


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="seller-profile-loading">

                <div className="seller-loading-spinner">
                    <div></div>
                </div>

                <h2>
                    Loading Seller...
                </h2>

                <p>
                    Please wait while we load
                    the seller profile.
                </p>

            </div>

        );

    }


    /* ==========================================
       ERROR
    ========================================== */

    if (error) {

        return (

            <div className="seller-profile-loading">

                <h2>
                    Unable to Load Seller
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={loadSeller}
                    className="seller-retry-btn"
                >
                    Try Again
                </button>

            </div>

        );

    }


    /* ==========================================
       SELLER NOT FOUND
    ========================================== */

    if (!seller) {

        return (

            <div className="seller-profile-loading">

                <h2>
                    Seller Not Found
                </h2>

                <p>
                    This seller may no longer
                    exist.
                </p>

            </div>

        );

    }


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="seller-profile">


            {/* ======================================
               SELLER COVER
            ====================================== */}

            <div className="seller-cover">

                <div className="seller-card">


                    {/* SELLER IMAGE */}

                    <img

                        className="seller-image"

                        src={sellerImage}

                        alt={sellerName}

                        onError={
                            handleSellerImageError
                        }

                    />


                    {/* SELLER DETAILS */}

                    <div className="seller-details">

                        <h1>

                            {sellerName}


                            {seller.verified && (

                                <span className="verified">

                                    ✔ Verified Seller

                                </span>

                            )}

                        </h1>


                        <p>

                            📧{" "}

                            {seller.email ||
                                "Not Available"}

                        </p>


                        <p>

                            📞{" "}

                            {seller.phone ||
                                "Not Available"}

                        </p>


                        <p>

                            📍{" "}

                            {seller.location ||
                                seller.city ||
                                "Ghana"}

                        </p>


                        <p>

                            📅 Joined{" "}

                            {seller.createdAt

                                ? new Date(
                                    seller.createdAt
                                ).toLocaleDateString()

                                : "Not Available"

                            }

                        </p>


                        <p>

                            🟢{" "}

                            {seller.lastSeen

                                ? (
                                    typeof seller.lastSeen ===
                                    "string" &&
                                    seller.lastSeen
                                        .includes("Recently")
                                )
                                    ? seller.lastSeen
                                    : new Date(
                                        seller.lastSeen
                                    ).toLocaleString()

                                : "Recently Active"

                            }

                        </p>


                    </div>

                </div>

            </div>


            {/* ======================================
               SELLER STATISTICS
            ====================================== */}

            <div className="seller-stats">


                <div className="stat-box">

                    <h2>
                        {products.length}
                    </h2>

                    <p>
                        Active Listings
                    </p>

                </div>


                <div className="stat-box">

                    <h2>

                        {Number(
                            seller.averageRating ||
                            0
                        ).toFixed(1)}

                    </h2>

                    <p>
                        Average Rating
                    </p>

                </div>


                <div className="stat-box">

                    <h2>
                        {seller.totalReviews || 0}
                    </h2>

                    <p>
                        Buyer Reviews
                    </p>

                </div>


            </div>


            {/* ======================================
               PRODUCTS
            ====================================== */}

            <h2 className="section-title">

                Products From This Seller

            </h2>


            {products.length === 0 ? (

                <div className="no-seller-products">

                    <p>
                        This seller currently has
                        no products available.
                    </p>

                </div>

            ) : (

                <div className="seller-products">

                    {products.map(
                        (product) => {

                            const productImage =
                                getProductImage(
                                    product
                                );


                            return (

                                <Link

                                    key={
                                        product.id
                                    }

                                    to={
                                        `/product/${product.id}`
                                    }

                                    className="seller-product"

                                >

                                    {/* PRODUCT IMAGE */}

                                    <img

                                        src={
                                            productImage
                                        }

                                        alt={
                                            product.title ||
                                            "Product"
                                        }

                                        loading="lazy"

                                        onError={
                                            handleProductImageError
                                        }

                                    />


                                    {/* PRODUCT TITLE */}

                                    <h3>

                                        {product.title ||
                                            "Untitled Product"}

                                    </h3>


                                    {/* PRODUCT PRICE */}

                                    <h2>

                                        GH₵{" "}

                                        {Number(
                                            product.price ||
                                            0
                                        ).toLocaleString(
                                            "en-GH",
                                            {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2
                                            }
                                        )}

                                    </h2>


                                    {/* PRODUCT CONDITION */}

                                    <span>

                                        {product.condition ||
                                            product.status ||
                                            "Not specified"}

                                    </span>

                                </Link>

                            );

                        }

                    )}

                </div>

            )}


            {/* ======================================
               REVIEWS
            ====================================== */}

            <ReviewList
                sellerId={seller.id}
            />


        </div>

    );

}


export default SellerProfile;
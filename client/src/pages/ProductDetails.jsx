import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProductCard.css";

function ProductCard({ product }) {
    const navigate = useNavigate();

    if (!product) return null;

    const productId = product.id;

    /* =========================================
       IMAGE HANDLING
    ========================================= */

    const getImageUrl = () => {
        let images = [];

        try {
            if (Array.isArray(product.images)) {
                images = product.images;
            } else if (typeof product.images === "string") {
                const value = product.images.trim();

                if (value) {
                    try {
                        const parsed = JSON.parse(value);

                        if (Array.isArray(parsed)) {
                            images = parsed;
                        } else if (parsed) {
                            images = [parsed];
                        }
                    } catch {
                        images = value.includes(",")
                            ? value
                                  .split(",")
                                  .map((item) => item.trim())
                                  .filter(Boolean)
                            : [value];
                    }
                }
            }
        } catch (error) {
            console.error("PRODUCT IMAGE ERROR:", error);
        }

        if (!images.length) {
            return "/default-product.png";
        }

        let image = images[0];

        if (
            typeof image === "object" &&
            image !== null
        ) {
            image =
                image.url ||
                image.imageUrl ||
                image.src ||
                image.path ||
                image.location ||
                image.filename ||
                image.key ||
                image.fileName ||
                "";
        }

        if (typeof image !== "string") {
            return "/default-product.png";
        }

        image = image.trim();

        if (!image) {
            return "/default-product.png";
        }

        /* Already complete URL */
        if (/^https?:\/\//i.test(image)) {
            return image;
        }

        const CDN_URL = (
            import.meta.env.VITE_R2_PUBLIC_URL ||
            "https://cdn.kadmarket.com"
        ).replace(/\/+$/, "");

        image = image.replace(/^\/+/, "");

        while (image.startsWith("uploads/uploads/")) {
            image = image.replace(/^uploads\//, "");
        }

        if (image.startsWith("uploads/")) {
            return `${CDN_URL}/${image}`;
        }

        return `${CDN_URL}/uploads/${image}`;
    };

    /* =========================================
       IMAGE ERROR
    ========================================= */

    const handleImageError = (event) => {
        if (
            event.currentTarget.dataset.fallback === "true"
        ) {
            return;
        }

        event.currentTarget.dataset.fallback = "true";
        event.currentTarget.src = "/default-product.png";
    };

    /* =========================================
       PRICE
    ========================================= */

    const formattedPrice = Number(
        product.price || 0
    ).toLocaleString("en-GH");

    /* =========================================
       LOCATION
    ========================================= */

    const location =
        product.location ||
        product.city ||
        product.region ||
        "Location not specified";

    /* =========================================
       CONDITION
    ========================================= */

    const condition =
        product.condition ||
        product.statusText ||
        product.productCondition ||
        "Available";

    /* =========================================
       SELLER ID
    ========================================= */

    const sellerId =
        product.userId ||
        product.sellerId ||
        product.seller?.id ||
        product.user?.id;

    /* =========================================
       VIEWS
    ========================================= */

    const views =
        product.views ??
        product.viewCount ??
        0;

    /* =========================================
       TITLE
    ========================================= */

    const title =
        product.title ||
        product.name ||
        "Untitled Product";

    /* =========================================
       SAVE PRODUCT
    ========================================= */

    const handleSave = () => {
        /*
         * Keep this action ready for the wishlist system.
         * If wishlist functionality already exists,
         * replace this with the existing handler.
         */

        const savedProducts =
            JSON.parse(
                localStorage.getItem(
                    "kad_saved_products"
                ) || "[]"
            );

        const alreadySaved =
            savedProducts.includes(productId);

        let updatedProducts;

        if (alreadySaved) {
            updatedProducts =
                savedProducts.filter(
                    (id) => id !== productId
                );
        } else {
            updatedProducts = [
                ...savedProducts,
                productId
            ];
        }

        localStorage.setItem(
            "kad_saved_products",
            JSON.stringify(updatedProducts)
        );

        window.dispatchEvent(
            new Event("kadWishlistChanged")
        );
    };

    const isSaved = () => {
        try {
            const savedProducts =
                JSON.parse(
                    localStorage.getItem(
                        "kad_saved_products"
                    ) || "[]"
                );

            return savedProducts.includes(productId);
        } catch {
            return false;
        }
    };

    /* =========================================
       SELLER PROFILE
    ========================================= */

    const handleSellerProfile = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!sellerId) {
            return;
        }

        navigate(`/seller/${sellerId}`);
    };

    return (
        <article className="product-card">

            {/* =================================
                IMAGE
            ================================= */}

            <Link
                to={`/product/${productId}`}
                className="product-image-link"
            >
                <div className="product-image-wrapper">

                    <img
                        src={getImageUrl()}
                        alt={title}
                        className="product-image"
                        onError={handleImageError}
                        loading="lazy"
                    />

                    {/* Featured */}
                    {product.featured && (
                        <span className="product-badge featured-badge">
                            Featured
                        </span>
                    )}

                    {/* Condition */}
                    {condition && (
                        <span className="product-badge condition-badge">
                            {condition}
                        </span>
                    )}

                    {/* Image overlay */}
                    <div className="image-overlay">
                        <span>
                            View Product
                        </span>
                    </div>
                </div>
            </Link>

            {/* =================================
                PRODUCT CONTENT
            ================================= */}

            <div className="product-content">

                {/* CATEGORY */}
                {product.category && (
                    <div className="product-category">
                        {product.category}
                    </div>
                )}

                {/* TITLE */}
                <Link
                    to={`/product/${productId}`}
                    className="product-title"
                >
                    {title}
                </Link>

                {/* PRICE */}
                <div className="product-price">
                    <span className="currency">
                        GH₵
                    </span>

                    <span>
                        {formattedPrice}
                    </span>
                </div>

                {/* LOCATION + CONDITION */}
                <div className="product-meta">

                    <span
                        className="product-meta-item"
                        title={location}
                    >
                        <span className="meta-icon">
                            📍
                        </span>

                        <span>
                            {location}
                        </span>
                    </span>

                    <span
                        className="product-meta-item"
                    >
                        <span className="meta-icon">
                            👁
                        </span>

                        <span>
                            {views} views
                        </span>
                    </span>

                </div>

                {/* =================================
                    ACTIONS
                ================================= */}

                <div className="product-actions">

                    <Link
                        to={`/product/${productId}`}
                        className="product-action primary-action"
                    >
                        <span>
                            View Details
                        </span>

                        <span className="action-arrow">
                            →
                        </span>
                    </Link>

                    {sellerId ? (
                        <button
                            type="button"
                            className="product-action seller-action"
                            onClick={
                                handleSellerProfile
                            }
                        >
                            <span>
                                View Seller
                            </span>
                        </button>
                    ) : (
                        <span className="product-action seller-action disabled-action">
                            Seller
                        </span>
                    )}

                    <button
                        type="button"
                        className={`save-action ${
                            isSaved()
                                ? "saved"
                                : ""
                        }`}
                        onClick={handleSave}
                        aria-label={
                            isSaved()
                                ? "Remove from saved"
                                : "Save product"
                        }
                    >
                        {isSaved()
                            ? "♥"
                            : "♡"}
                    </button>

                </div>

            </div>

        </article>
    );
}

export default ProductCard;
import { Link } from "react-router-dom";
import "./ProductCard.css";
import getImageUrl from "../utils/imageUrl";

function ProductCard({ product }) {
    /* =========================================================
       SAFETY CHECK
    ========================================================= */

    if (!product) {
        return null;
    }

    /* =========================================================
       PRODUCT ID
    ========================================================= */

    const productId = product.id || product._id;

    /* =========================================================
       NORMALIZE PRODUCT IMAGES
       Supports:
       - Array
       - JSON string
       - Single filename
       - Full R2/CDN URL
    ========================================================= */

    const getProductImages = (value) => {
        if (!value) {
            return [];
        }

        // Already an array
        if (Array.isArray(value)) {
            return value
                .filter(
                    (image) =>
                        typeof image === "string" &&
                        image.trim() !== ""
                )
                .map((image) => image.trim());
        }

        // String
        if (typeof value === "string") {
            const trimmedValue = value.trim();

            if (!trimmedValue) {
                return [];
            }

            // Try JSON
            try {
                const parsed = JSON.parse(trimmedValue);

                if (Array.isArray(parsed)) {
                    return parsed
                        .filter(
                            (image) =>
                                typeof image === "string" &&
                                image.trim() !== ""
                        )
                        .map((image) => image.trim());
                }

                // JSON string containing one filename/URL
                if (
                    typeof parsed === "string" &&
                    parsed.trim() !== ""
                ) {
                    return [parsed.trim()];
                }
            } catch {
                // Not JSON.
                // Treat as a normal filename/path/URL.
                return [trimmedValue];
            }
        }

        return [];
    };

    const images = getProductImages(product.images);

    /* =========================================================
       FIRST IMAGE
    ========================================================= */

    const firstImage =
        images.length > 0 ? images[0] : null;

    /*
     * getImageUrl() is the single image resolver used
     * throughout the application.
     *
     * It supports:
     * - https://cdn.kadmarket.com/...
     * - https://...
     * - /uploads/...
     * - uploads/...
     * - database filenames
     */
    const imageUrl = firstImage
        ? getImageUrl(firstImage)
        : "/images/product-placeholder.png";

    /* =========================================================
       SELLER SUBSCRIPTION
    ========================================================= */

    const activeSubscription =
        product.seller?.subscriptions?.[0];

    const planName =
        activeSubscription?.subscriptionPlan?.name ||
        product.seller?.subscriptionPlan?.name ||
        "New User";

    /* =========================================================
       PLAN BADGE
    ========================================================= */

    const getPlanBadge = () => {
        const plan = String(planName).toLowerCase();

        if (plan.includes("premium")) {
            return {
                text: `👑 ${planName}`,
                className: "premium"
            };
        }

        if (plan.includes("business")) {
            return {
                text: `🏢 ${planName}`,
                className: "business"
            };
        }

        if (plan.includes("pro")) {
            return {
                text: `⭐ ${planName}`,
                className: "pro"
            };
        }

        if (plan.includes("basic")) {
            return {
                text: `🔹 ${planName}`,
                className: "basic"
            };
        }

        return {
            text: `🆕 ${planName}`,
            className: "new-user"
        };
    };

    const planBadge = getPlanBadge();

    /* =========================================================
       PROMOTION STATUS
    ========================================================= */

    const isFeatured =
        product.featured === true ||
        product.isFeatured === true;

    const isExpress =
        product.express === true ||
        product.isExpress === true;

    const isBoosted =
        product.boosted === true ||
        product.isBoosted === true;

    /* =========================================================
       IMAGE ERROR HANDLER
    ========================================================= */

    const handleImageError = (event) => {
        const image = event.currentTarget;

        /*
         * Prevent an infinite loop if the placeholder itself
         * cannot be loaded.
         */
        if (
            image.dataset.fallbackApplied === "true"
        ) {
            return;
        }

        image.dataset.fallbackApplied = "true";

        console.error(
            "PRODUCT IMAGE FAILED:",
            image.src
        );

        image.src =
            "/images/product-placeholder.png";
    };

    /* =========================================================
       IMAGE LOADED
    ========================================================= */

    const handleImageLoad = (event) => {
        console.log(
            "PRODUCT IMAGE LOADED:",
            event.currentTarget.currentSrc ||
                event.currentTarget.src
        );
    };

    /* =========================================================
       RETURN
    ========================================================= */

    return (
        <article className="product-card">

            {/* =================================================
                PRODUCT IMAGE
            ================================================= */}

            <Link
                to={`/product/${productId}`}
                className="product-image-container"
                aria-label={`View ${product.title || "product"}`}
            >
                <img
                    src={imageUrl}
                    alt={
                        product.title ||
                        product.name ||
                        "Product"
                    }
                    className="product-image"
                    loading="lazy"
                    decoding="async"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />

                {/* =================================================
                    PROMOTION BADGES
                ================================================= */}

                <div className="promotion-badges">

                    {isFeatured && (
                        <span className="featured-badge">
                            ⭐ Featured
                        </span>
                    )}

                    {isExpress && (
                        <span className="express-badge">
                            ⚡ Express
                        </span>
                    )}

                    {isBoosted && (
                        <span className="boosted-badge">
                            🚀 Boosted
                        </span>
                    )}

                </div>
            </Link>

            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <div className="product-info">

                {/* =================================================
                    SELLER SUBSCRIPTION PLAN
                ================================================= */}

                <div
                    className={`seller-plan ${planBadge.className}`}
                >
                    {planBadge.text}
                </div>

                {/* =================================================
                    PRICE
                ================================================= */}

                <div className="product-price">
                    GH₵{" "}
                    {Number(
                        product.price || 0
                    ).toLocaleString()}
                </div>

                {/* =================================================
                    PRODUCT TITLE
                ================================================= */}

                <Link
                    to={`/product/${productId}`}
                    className="product-title"
                >
                    {product.title ||
                        product.name ||
                        "Untitled Product"}
                </Link>

                {/* =================================================
                    CONDITION
                ================================================= */}

                <div className="product-condition">
                    {product.condition === "New"
                        ? "✨ Brand New"
                        : product.condition
                        ? `♻️ ${product.condition}`
                        : "Condition not specified"}
                </div>

                {/* =================================================
                    LOCATION
                ================================================= */}

                <div className="product-location">
                    📍{" "}
                    {product.city || "Unknown"}
                    {product.region
                        ? `, ${product.region}`
                        : ", Ghana"}
                </div>

                {/* =================================================
                    VIEWS
                ================================================= */}

                <div className="product-stats">
                    👁 {product.views || 0} views
                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="product-actions">

                    <Link
                        to={`/product/${productId}`}
                        className="details-btn"
                    >
                        View Details
                    </Link>

                    {product.seller?.store?.storeSlug && (
                        <Link
                            to={`/store/${product.seller.store.storeSlug}`}
                            className="store-btn"
                        >
                            🏪 View Store
                        </Link>
                    )}

                </div>

            </div>
        </article>
    );
}

export default ProductCard;
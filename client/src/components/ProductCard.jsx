import { Link } from "react-router-dom";
import "./ProductCard.css";
import getImageUrl from "../utils/imageUrl";

function ProductCard({ product }) {
    /* ==========================================
       SAFETY CHECK
    ========================================== */

    if (!product) {
        return null;
    }


    /* ==========================================
       PRODUCT ID
    ========================================== */

    const productId =
        product.id ||
        product._id;


    /* ==========================================
       PRODUCT IMAGES
    ========================================== */

    let images = [];

    if (Array.isArray(product.images)) {
        images = product.images;
    }

    else if (typeof product.images === "string") {
        try {
            const parsedImages =
                JSON.parse(product.images);

            images = Array.isArray(parsedImages)
                ? parsedImages
                : [product.images];
        }

        catch {
            images = [product.images];
        }
    }


    /* ==========================================
       FIRST PRODUCT IMAGE
    ========================================== */

    const imageUrl =
        images.length > 0
            ? getImageUrl(images[0])
            : getImageUrl(null);


    /* ==========================================
       SELLER SUBSCRIPTION
    ========================================== */

    const activeSubscription =
        product.seller?.subscriptions?.[0];

    const planName =
        activeSubscription?.subscriptionPlan?.name ||
        product.seller?.subscriptionPlan?.name ||
        "New User";


    /* ==========================================
       PLAN BADGE
    ========================================== */

    const getPlanBadge = () => {
        const plan =
            String(planName).toLowerCase();

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


    const planBadge =
        getPlanBadge();


    /* ==========================================
       PROMOTION STATUS
    ========================================== */

    const isFeatured =
        product.featured === true ||
        product.isFeatured === true;

    const isExpress =
        product.express === true ||
        product.isExpress === true;

    const isBoosted =
        product.boosted === true ||
        product.isBoosted === true;


    /* ==========================================
       IMAGE ERROR HANDLER
    ========================================== */

    const handleImageError = (event) => {
        const image =
            event.currentTarget;

        /*
         * Prevent infinite fallback loops.
         */

        if (
            image.dataset.fallbackApplied === "true"
        ) {
            return;
        }

        image.dataset.fallbackApplied = "true";

        image.src =
            "/images/product-placeholder.png";
    };


    /* ==========================================
       RETURN
    ========================================== */

    return (
        <div className="product-card">

            {/* =====================================
                PRODUCT IMAGE
            ===================================== */}

            <Link
                to={`/product/${productId}`}
                className="product-image-container"
            >

                <img
                    src={imageUrl}
                    alt={
                        product.title ||
                        "Product"
                    }
                    className="product-image"
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                />


                {/* =================================
                    PROMOTION BADGES
                ================================= */}

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


            {/* =====================================
                PRODUCT INFORMATION
            ===================================== */}

            <div className="product-info">


                {/* ================================
                    SUBSCRIPTION PLAN
                ================================= */}

                <div
                    className={`seller-plan ${planBadge.className}`}
                >
                    {planBadge.text}
                </div>


                {/* ================================
                    PRICE
                ================================= */}

                <div className="product-price">
                    GH₵{" "}
                    {Number(
                        product.price || 0
                    ).toLocaleString()}
                </div>


                {/* ================================
                    PRODUCT TITLE
                ================================= */}

                <Link
                    to={`/product/${productId}`}
                    className="product-title"
                >
                    {product.title ||
                        "Untitled Product"}
                </Link>


                {/* ================================
                    CONDITION
                ================================= */}

                <div className="product-condition">

                    {product.condition === "New"
                        ? "✨ Brand New"
                        : product.condition
                        ? `♻️ ${product.condition}`
                        : "Condition not specified"}

                </div>


                {/* ================================
                    LOCATION
                ================================= */}

                <div className="product-location">

                    📍{" "}

                    {product.city ||
                        "Unknown"}

                    {product.region
                        ? `, ${product.region}`
                        : ", Ghana"}

                </div>


                {/* ================================
                    VIEWS
                ================================= */}

                <div className="product-stats">
                    👁 {product.views || 0} views
                </div>


                {/* ================================
                    ACTION BUTTONS
                ================================= */}

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

        </div>
    );
}

export default ProductCard;
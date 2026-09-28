import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../config/axios";

import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import ReportForm from "../components/ReportForm";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";

import "./ProductDetails.css";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const token = localStorage.getItem("token");

    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offer, setOffer] = useState("");
    const [refresh, setRefresh] = useState(false);
    const [saved, setSaved] = useState(false);

    /* =====================================================
       BACKEND URL
    ===================================================== */

    const backendUrl = (
        import.meta.env.VITE_API_URL || "/api"
    ).replace(/\/api\/?$/, "");

    /* =====================================================
       IMAGE URL
    ===================================================== */

    const getImageUrl = (image) => {
        if (!image) {
            return "/default-product.png";
        }

        let value = image;

        if (typeof value === "object" && value !== null) {
            value =
                value.url ||
                value.imageUrl ||
                value.src ||
                value.path ||
                value.location ||
                value.filename ||
                value.fileName ||
                value.key ||
                "";
        }

        if (typeof value !== "string") {
            return "/default-product.png";
        }

        value = value.trim();

        if (!value) {
            return "/default-product.png";
        }

        if (/^https?:\/\//i.test(value)) {
            return value;
        }

        const cdnUrl = (
            import.meta.env.VITE_R2_PUBLIC_URL ||
            "https://cdn.kadmarket.com"
        ).replace(/\/+$/, "");

        value = value.replace(/^\/+/, "");

        while (value.startsWith("uploads/uploads/")) {
            value = value.replace(/^uploads\//, "");
        }

        if (value.startsWith("uploads/")) {
            return `${cdnUrl}/${value}`;
        }

        /*
         * Prefer R2/CDN for marketplace images.
         */
        return `${cdnUrl}/uploads/${value}`;
    };

    /* =====================================================
       IMAGE ERROR FALLBACK
    ===================================================== */

    const handleImageError = (event) => {
        if (
            event.currentTarget.dataset.fallback === "true"
        ) {
            return;
        }

        event.currentTarget.dataset.fallback = "true";
        event.currentTarget.src = "/default-product.png";
    };

    /* =====================================================
       NORMALIZE IMAGES
    ===================================================== */

    const normalizeImages = (images) => {
        if (Array.isArray(images)) {
            return images;
        }

        if (typeof images === "string") {
            const value = images.trim();

            if (!value) {
                return [];
            }

            try {
                const parsed = JSON.parse(value);

                if (Array.isArray(parsed)) {
                    return parsed;
                }

                if (parsed) {
                    return [parsed];
                }

                return [];
            } catch {
                return value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);
            }
        }

        return [];
    };

    /* =====================================================
       LOAD PRODUCT
    ===================================================== */

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                `/products/${id}`
            );

            const item =
                response.data?.product ||
                response.data;

            if (!item) {
                setProduct(null);
                return;
            }

            const images = normalizeImages(item.images);

            const normalizedProduct = {
                ...item,
                images
            };

            setProduct(normalizedProduct);

            if (images.length > 0) {
                setSelectedImage(images[0]);
            }

            await Promise.all([
                loadRelated(),
                recordProductView()
            ]);

        } catch (error) {
            console.error(
                "LOAD PRODUCT ERROR:",
                error.response?.data || error.message
            );

            setProduct(null);

        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       RECORD PRODUCT VIEW
    ===================================================== */

    const recordProductView = async () => {
        try {
            await api.post(
                `/products/${id}/view`
            );
        } catch (error) {
            console.log(
                "VIEW RECORD ERROR:",
                error.response?.data || error.message
            );
        }
    };

    /* =====================================================
       RELATED PRODUCTS
    ===================================================== */

    const loadRelated = async () => {
        try {
            const response = await api.get(
                `/products/related/${id}`
            );

            setRelatedProducts(
                response.data?.products || []
            );

        } catch (error) {
            console.error(
                "RELATED PRODUCTS ERROR:",
                error.response?.data || error.message
            );

            setRelatedProducts([]);
        }
    };

    /* =====================================================
       REVIEWS REFRESH
    ===================================================== */

    const loadReviews = () => {
        setRefresh((previous) => !previous);
    };

    /* =====================================================
       CREATE LEAD
    ===================================================== */

    const createLead = async (
        type,
        offerPrice = 0
    ) => {
        if (!user) {
            navigate("/login");
            return false;
        }

        if (!product) {
            return false;
        }

        try {
            await api.post(
                "/leads",
                {
                    productId: product.id,
                    type,
                    offerPrice
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            return true;

        } catch (error) {
            console.error(
                "CREATE LEAD ERROR:",
                error.response?.data || error.message
            );

            return false;
        }
    };

    /* =====================================================
       CONTACT SELLER
    ===================================================== */

    const contactSeller = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        try {
            const leadCreated =
                await createLead("Chat");

            if (!leadCreated) {
                return;
            }

            const sellerId =
                product.userId ||
                product.sellerId ||
                product.seller?.id ||
                product.user?.id;

            if (!sellerId) {
                alert(
                    "Seller information is unavailable."
                );
                return;
            }

            const response = await api.post(
                "/messages",
                {
                    buyerId: user.id,
                    sellerId,
                    productId: product.id,
                    senderId: user.id,
                    message:
                        "Hello, I'm interested in this product."
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const conversationId =
                response.data?.conversation?.id ||
                response.data?.conversationId;

            if (conversationId) {
                navigate(
                    `/chat/${conversationId}`
                );
            } else {
                alert(
                    "Conversation created successfully."
                );
            }

        } catch (error) {
            console.error(
                "CONTACT SELLER ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to contact seller."
            );
        }
    };

    /* =====================================================
       WISHLIST
    ===================================================== */

    const addWishlist = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        try {
            await api.post(
                "/wishlist",
                {
                    productId: product.id
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSaved(true);

            alert("Product saved to your wishlist.");

        } catch (error) {
            console.error(
                "WISHLIST ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to save product."
            );
        }
    };

    /* =====================================================
       SHARE
    ===================================================== */

    const shareProduct = async () => {
        try {
            await api.post(
                `/products/${id}/share`
            );
        } catch (error) {
            console.log(
                "SHARE COUNT ERROR:",
                error.response?.data || error.message
            );
        }

        try {
            if (
                navigator.share &&
                typeof navigator.share === "function"
            ) {
                await navigator.share({
                    title:
                        product.title ||
                        product.name ||
                        "KAD Marketplace Product",

                    text:
                        product.description ||
                        "Check out this product on KAD Marketplace.",

                    url: window.location.href
                });

            } else {
                await navigator.clipboard.writeText(
                    window.location.href
                );

                alert("Product link copied.");
            }

        } catch (error) {
            console.log(
                "SHARE ERROR:",
                error
            );
        }
    };

    /* =====================================================
       I'M INTERESTED
    ===================================================== */

    const interested = async () => {
        const success =
            await createLead("Interested");

        if (success) {
            alert(
                "The seller has been notified of your interest."
            );
        }
    };

    /* =====================================================
       REQUEST PHONE
    ===================================================== */

    const requestPhone = async () => {
        const success =
            await createLead("Phone Request");

        if (success) {
            alert(
                "Your phone number request has been sent to the seller."
            );
        }
    };

    /* =====================================================
       REQUEST LOCATION
    ===================================================== */

    const requestLocation = async () => {
        const success =
            await createLead("Location Request");

        if (success) {
            alert(
                "Your location request has been sent to the seller."
            );
        }
    };

    /* =====================================================
       MAKE OFFER
    ===================================================== */

    const makeOffer = async () => {
        const amount = Number(offer);

        if (
            !offer ||
            Number.isNaN(amount) ||
            amount <= 0
        ) {
            alert(
                "Please enter a valid offer amount."
            );

            return;
        }

        const success =
            await createLead(
                "Offer",
                amount
            );

        if (success) {
            alert(
                "Your offer has been submitted successfully."
            );

            setOffer("");
        }
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="product-page-state">
                <div className="loading-card">
                    <div className="loading-spinner"></div>

                    <h2>
                        Loading product
                    </h2>

                    <p>
                        Please wait while we load the product details.
                    </p>
                </div>
            </div>
        );
    }

    /* =====================================================
       PRODUCT NOT FOUND
    ===================================================== */

    if (!product) {
        return (
            <div className="product-page-state">
                <div className="not-found-card">
                    <div className="not-found-icon">
                        !
                    </div>

                    <h2>
                        Product not found
                    </h2>

                    <p>
                        This product may have been removed
                        or is no longer available.
                    </p>

                    <button
                        className="back-button"
                        onClick={() => navigate(-1)}
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    /* =====================================================
       PRODUCT VARIABLES
    ===================================================== */

    const title =
        product.title ||
        product.name ||
        "Untitled Product";

    const sellerId =
        product.userId ||
        product.sellerId ||
        product.seller?.id ||
        product.user?.id;

    const price =
        Number(product.price || 0);

    const condition =
        product.condition ||
        product.statusText ||
        product.productCondition ||
        "Not specified";

    const category =
        product.category ||
        "General";

    const city =
        product.city ||
        product.location ||
        "Location unavailable";

    const region =
        product.region ||
        "Ghana";

    const views =
        product.views ??
        product.viewCount ??
        0;

    const favourites =
        product.favourites ??
        product.favoriteCount ??
        0;

    const rating =
        Number(
            product.sellerRating || 0
        ).toFixed(1);

    const canReview =
        user &&
        Number(user.id) !==
            Number(
                product.userId ||
                product.sellerId
            );

    /* =====================================================
       STRUCTURED DATA
    ===================================================== */

    const productStructuredData = {
        "@context": "https://schema.org",
        "@type": "Product",

        name: title,

        description:
            product.description ||
            `Buy ${title} on KAD Marketplace Ghana.`,

        image: product.images?.length
            ? product.images.map(
                (image) =>
                    getImageUrl(image)
            )
            : [],

        sku: String(product.id),

        category,

        brand: {
            "@type": "Brand",
            name: "KAD Marketplace"
        },

        offers: {
            "@type": "Offer",

            url:
                `https://kadmarket.com/product/${id}`,

            priceCurrency: "GHS",

            price,

            availability:
                "https://schema.org/InStock",

            itemCondition:
                product.condition === "New"
                    ? "https://schema.org/NewCondition"
                    : "https://schema.org/UsedCondition",

            seller: {
                "@type": "Organization",
                name:
                    product.seller?.name ||
                    "KAD Marketplace Seller"
            }
        }
    };

    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <div className="product-details-page">

            <SEO
                title={`${title} | KAD Marketplace`}

                description={(
                    product.description ||
                    `Buy ${title} on KAD Marketplace Ghana.`
                ).substring(0, 160)}

                keywords={[
                    title,
                    category,
                    product.subcategory,
                    city,
                    region,
                    "Ghana",
                    "KAD Marketplace"
                ]
                    .filter(Boolean)
                    .join(", ")}

                image={
                    product.images?.[0]
                        ? getImageUrl(
                            product.images[0]
                        )
                        : undefined
                }

                canonical={
                    `https://kadmarket.com/product/${id}`
                }

                structuredData={
                    productStructuredData
                }
            />

            {/* =================================================
                TOP NAVIGATION
            ================================================= */}

            <div className="product-topbar">

                <button
                    className="back-link"
                    onClick={() => navigate(-1)}
                >
                    <span>←</span>
                    Back to Marketplace
                </button>

                <div className="product-id">
                    Product #{product.id}
                </div>

            </div>


            {/* =================================================
                MAIN PRODUCT AREA
            ================================================= */}

            <main className="product-container">

                {/* =================================================
                    LEFT — GALLERY
                ================================================= */}

                <section className="gallery-section">

                    <div className="main-image">

                        <img
                            src={getImageUrl(
                                selectedImage
                            )}
                            alt={title}
                            onError={
                                handleImageError
                            }
                        />

                        <div className="image-overlay-top">

                            {product.featured && (
                                <span className="featured-tag">
                                    ★ Featured
                                </span>
                            )}

                            {product.express && (
                                <span className="express-tag">
                                    ⚡ Express
                                </span>
                            )}

                        </div>

                        <button
                            className="image-share-button"
                            onClick={shareProduct}
                            aria-label="Share product"
                        >
                            ↗
                        </button>

                    </div>


                    {/* =================================================
                        THUMBNAILS
                    ================================================= */}

                    {product.images?.length > 0 && (
                        <div className="thumbnail-list">

                            {product.images.map(
                                (image, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={
                                            selectedImage === image
                                                ? "thumbnail active-thumb"
                                                : "thumbnail"
                                        }
                                        onClick={() =>
                                            setSelectedImage(
                                                image
                                            )
                                        }
                                    >
                                        <img
                                            src={getImageUrl(
                                                image
                                            )}
                                            alt={`${title} ${index + 1}`}
                                            onError={
                                                handleImageError
                                            }
                                        />
                                    </button>
                                )
                            )}

                        </div>
                    )}

                </section>


                {/* =================================================
                    RIGHT — PRODUCT INFORMATION
                ================================================= */}

                <section className="details-section">

                    <div className="details-card">

                        {/* CATEGORY */}

                        <div className="product-category-label">
                            {category}
                        </div>


                        {/* TITLE */}

                        <h1 className="product-title">
                            {title}
                        </h1>


                        {/* PRICE */}

                        <div className="price-block">

                            <span className="price-label">
                                Price
                            </span>

                            <div className="price">
                                GH₵{" "}
                                {price.toLocaleString(
                                    "en-GH"
                                )}
                            </div>

                        </div>


                        {/* QUICK INFO */}

                        <div className="product-meta">

                            <div className="meta-item">

                                <span className="meta-icon">
                                    ✓
                                </span>

                                <div>
                                    <small>
                                        Condition
                                    </small>

                                    <strong>
                                        {condition}
                                    </strong>
                                </div>

                            </div>


                            <div className="meta-item">

                                <span className="meta-icon">
                                    ◉
                                </span>

                                <div>
                                    <small>
                                        Location
                                    </small>

                                    <strong>
                                        {city}
                                        {region
                                            ? `, ${region}`
                                            : ""}
                                    </strong>
                                </div>

                            </div>


                            <div className="meta-item">

                                <span className="meta-icon">
                                    ◷
                                </span>

                                <div>
                                    <small>
                                        Views
                                    </small>

                                    <strong>
                                        {Number(
                                            views
                                        ).toLocaleString()}
                                    </strong>
                                </div>

                            </div>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="description-box">

                            <div className="section-label">
                                Description
                            </div>

                            <p>
                                {product.description ||
                                    "No description available for this product."}
                            </p>

                        </div>


                        {/* ACTIONS */}

                        <div className="primary-actions">

                            <button
                                className="action-primary"
                                onClick={
                                    contactSeller
                                }
                            >
                                <span>💬</span>
                                Chat Seller
                            </button>

                            <button
                                className="action-secondary"
                                onClick={
                                    interested
                                }
                            >
                                <span>♡</span>
                                I'm Interested
                            </button>

                        </div>


                        {/* SECONDARY ACTIONS */}

                        <div className="secondary-actions">

                            <button
                                onClick={
                                    addWishlist
                                }
                                className={
                                    saved
                                        ? "saved"
                                        : ""
                                }
                            >
                                <span>
                                    {saved
                                        ? "♥"
                                        : "♡"}
                                </span>

                                {saved
                                    ? "Saved"
                                    : "Save"}
                            </button>


                            <button
                                onClick={
                                    shareProduct
                                }
                            >
                                <span>↗</span>
                                Share
                            </button>


                            <button
                                onClick={
                                    requestPhone
                                }
                            >
                                <span>☎</span>
                                Request Phone
                            </button>


                            <button
                                onClick={
                                    requestLocation
                                }
                            >
                                <span>⌖</span>
                                Request Location
                            </button>

                        </div>


                        {/* SELLER PROFILE BUTTON ONLY */}

                        {sellerId && (
                            <Link
                                to={`/seller/${sellerId}`}
                                className="seller-profile-button"
                            >
                                <span className="seller-profile-icon">
                                    👤
                                </span>

                                <span>
                                    View Seller Profile
                                </span>

                                <span className="seller-profile-arrow">
                                    →
                                </span>
                            </Link>
                        )}

                    </div>


                    {/* =================================================
                        OFFER CARD
                    ================================================= */}

                    <div className="offer-card">

                        <div className="offer-header">

                            <div>
                                <h2>
                                    Make an Offer
                                </h2>

                                <p>
                                    Enter the amount you'd like to offer.
                                </p>
                            </div>

                            <span className="offer-icon">
                                GH₵
                            </span>

                        </div>

                        <div className="offer-form">

                            <div className="offer-input-wrapper">

                                <span>
                                    GH₵
                                </span>

                                <input
                                    type="number"
                                    min="1"
                                    inputMode="decimal"
                                    placeholder="Enter amount"
                                    value={offer}
                                    onChange={(event) =>
                                        setOffer(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                            <button
                                className="offer-submit"
                                onClick={
                                    makeOffer
                                }
                            >
                                Submit Offer
                            </button>

                        </div>

                    </div>

                </section>

            </main>


            {/* =================================================
                PRODUCT STATISTICS
            ================================================= */}

            <section className="product-statistics">

                <div className="stat-card">

                    <span className="stat-icon">
                        👁
                    </span>

                    <div>
                        <strong>
                            {Number(
                                views
                            ).toLocaleString()}
                        </strong>

                        <small>
                            Views
                        </small>
                    </div>

                </div>


                <div className="stat-card">

                    <span className="stat-icon">
                        ♡
                    </span>

                    <div>
                        <strong>
                            {Number(
                                favourites
                            ).toLocaleString()}
                        </strong>

                        <small>
                            Saves
                        </small>
                    </div>

                </div>


                <div className="stat-card">

                    <span className="stat-icon">
                        ★
                    </span>

                    <div>
                        <strong>
                            {rating}
                        </strong>

                        <small>
                            Seller Rating
                        </small>
                    </div>

                </div>


                <div className="stat-card">

                    <span className="stat-icon">
                        ◉
                    </span>

                    <div>
                        <strong>
                            {category}
                        </strong>

                        <small>
                            Category
                        </small>
                    </div>

                </div>

            </section>


            {/* =================================================
                REVIEWS
            ================================================= */}

            <section className="product-lower-section">

                {canReview && (
                    <div className="content-card">

                        <div className="content-card-header">

                            <div>
                                <span className="eyebrow">
                                    CUSTOMER EXPERIENCE
                                </span>

                                <h2>
                                    Leave a Review
                                </h2>
                            </div>

                        </div>

                        <ReviewForm
                            productId={product.id}
                            onReviewAdded={
                                loadReviews
                            }
                        />

                    </div>
                )}


                <div className="content-card">

                    <div className="content-card-header">

                        <div>
                            <span className="eyebrow">
                                CUSTOMER FEEDBACK
                            </span>

                            <h2>
                                Product Reviews
                            </h2>
                        </div>

                    </div>

                    <ReviewList
                        productId={product.id}
                        refresh={refresh}
                    />

                </div>


                {/* REPORT */}

                <div className="report-section">

                    <ReportForm
                        productId={product.id}
                    />

                </div>

            </section>


            {/* =================================================
                RELATED PRODUCTS
            ================================================= */}

            <section className="related-products">

                <div className="related-header">

                    <div>

                        <span className="eyebrow">
                            YOU MAY ALSO LIKE
                        </span>

                        <h2>
                            Related Products
                        </h2>

                    </div>

                    {relatedProducts.length > 0 && (
                        <span className="related-count">
                            {relatedProducts.length} items
                        </span>
                    )}

                </div>


                {relatedProducts.length === 0 ? (

                    <div className="no-products">

                        <div className="no-products-icon">
                            ◌
                        </div>

                        <h3>
                            No related products
                        </h3>

                        <p>
                            We couldn't find other products
                            related to this listing.
                        </p>

                    </div>

                ) : (

                    <div className="related-grid">

                        {relatedProducts.map(
                            (item) => (
                                <ProductCard
                                    key={item.id}
                                    product={item}
                                />
                            )
                        )}

                    </div>

                )}

            </section>

        </div>
    );
}

export default ProductDetails;
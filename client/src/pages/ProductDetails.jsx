import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../config/axios";

import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import SellerCard from "../components/SellerCard";
import ReportForm from "../components/ReportForm";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";
import "./ProductDetails.css";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offer, setOffer] = useState("");
    const [refresh, setRefresh] = useState(false);

    /* =========================================
       BACKEND URL
    ========================================= */

    const backendUrl = (
        import.meta.env.VITE_API_URL ||
        "/api"
    ).replace("/api", "");


    /* =========================================
       GET IMAGE URL
    ========================================= */

    const getImageUrl = (image) => {
        if (!image) {
            return "https://via.placeholder.com/700x600?text=No+Image";
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        return `${backendUrl}/uploads/${image}`;
    };


    /* =========================================
       NORMALIZE PRODUCT IMAGES
    ========================================= */

    const normalizeImages = (images) => {
        if (Array.isArray(images)) {
            return images;
        }

        if (typeof images === "string") {
            try {
                return JSON.parse(images);
            } catch {
                return [];
            }
        }

        return [];
    };


    /* =========================================
       REFRESH REVIEWS
    ========================================= */

    const loadReviews = () => {
        setRefresh((prev) => !prev);
    };


    /* =========================================
       LOAD PRODUCT
    ========================================= */

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
                response.data.product ||
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


    /* =========================================
       RECORD PRODUCT VIEW
    ========================================= */

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


    /* =========================================
       LOAD RELATED PRODUCTS
    ========================================= */

    const loadRelated = async () => {
        try {
            const response = await api.get(
                `/products/related/${id}`
            );

            setRelatedProducts(
                response.data.products || []
            );

        } catch (error) {
            console.error(
                "RELATED PRODUCTS ERROR:",
                error.response?.data || error.message
            );

            setRelatedProducts([]);
        }
    };


    /* =========================================
       CREATE LEAD
    ========================================= */

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


    /* =========================================
       CONTACT SELLER
    ========================================= */

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
                product.seller?.id;

            if (!sellerId) {
                alert("Seller information is unavailable.");
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
                response.data.conversation?.id ||
                response.data.conversationId;

            if (conversationId) {
                navigate(`/chat/${conversationId}`);
            } else {
                alert("Conversation created successfully.");
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


    /* =========================================
       ADD TO WISHLIST
    ========================================= */

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

            alert("Added to wishlist.");

        } catch (error) {

            console.error(
                "WISHLIST ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to add product to wishlist."
            );
        }
    };


    /* =========================================
       SHARE PRODUCT
    ========================================= */

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
                    title: product.title,
                    text: product.description,
                    url: window.location.href
                });

            } else {

                await navigator.clipboard.writeText(
                    window.location.href
                );

                alert("Product link copied.");
            }

        } catch (error) {

            console.log("SHARE ERROR:", error);
        }
    };


    /* =========================================
       INTERESTED
    ========================================= */

    const interested = async () => {

        if (
            await createLead("Interested")
        ) {
            alert("Seller has been notified.");
        }
    };


    /* =========================================
       REQUEST PHONE
    ========================================= */

    const requestPhone = async () => {

        if (
            await createLead("Phone Request")
        ) {
            alert(
                "Your phone number request has been sent to the seller."
            );
        }
    };


    /* =========================================
       REQUEST LOCATION
    ========================================= */

    const requestLocation = async () => {

        if (
            await createLead("Location Request")
        ) {
            alert(
                "Your location request has been sent to the seller."
            );
        }
    };


    /* =========================================
       MAKE OFFER
    ========================================= */

    const makeOffer = async () => {

        const offerAmount = Number(offer);

        if (
            !offer ||
            Number.isNaN(offerAmount) ||
            offerAmount <= 0
        ) {
            alert(
                "Please enter a valid offer amount."
            );

            return;
        }

        if (
            await createLead(
                "Offer",
                offerAmount
            )
        ) {

            alert("Offer submitted successfully.");

            setOffer("");
        }
    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {
        return (
            <div className="loading">
                Loading Product...
            </div>
        );
    }


    /* =========================================
       PRODUCT NOT FOUND
    ========================================= */

    if (!product) {
        return (
            <div className="loading">
                Product not found.
            </div>
        );
    }


    /* =========================================
       VARIABLES
    ========================================= */

    const canReview =
        user &&
        Number(user.id) !==
        Number(
            product.userId ||
            product.sellerId
        );

    const sellerId =
        product.userId ||
        product.sellerId ||
        product.seller?.id;

const productStructuredData = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",

        name: product.title,

        description:
            product.description ||
            `Buy ${product.title} on KAD Marketplace Ghana.`,

        image: product.images?.length
            ? product.images.map((image) =>
                getImageUrl(image)
            )
            : [],

        sku: String(product.id),

        category: product.category || "General",

        brand: {
            "@type": "Brand",
            name: "KAD Marketplace"
        },

        offers: {
            "@type": "Offer",

            url: `https://kadmarket.com/product/${id}`,

            priceCurrency: "GHS",

            price: Number(product.price || 0),

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
    }
    : null;
    /* =========================================
       PAGE
    ========================================= */

    return (
        

        <div className="product-details-page">
<SEO
    title={
        product
            ? `${product.name || product.title || "Product"} | KAD Marketplace`
            : "Product | KAD Marketplace"
    }
    description={
        product
            ? (
                product.description ||
                `Buy ${product.name || product.title || "this product"} on KAD Marketplace Ghana.`
            ).substring(0, 160)
            : "View products for sale on KAD Marketplace Ghana."
    }
    keywords={
        product
            ? [
                product.name,
                product.category,
                product.subcategory,
                product.location,
                "Ghana",
                "KAD Marketplace"
            ]
                .filter(Boolean)
                .join(", ")
            : "products, marketplace, Ghana, buy and sell"
    }
    image={
        product?.images?.[0]
            ? getImageUrl(product.images[0])
            : undefined
    }
    canonical={`https://kadmarket.com/product/${id}`}
/>
            <div className="product-container">


                {/* IMAGE GALLERY */}

                <div className="gallery-section">

                    <div className="main-image">

                        <img
                            src={getImageUrl(selectedImage)}
                            alt={product.title || "Product"}
                        />

                        {product.featured && (

                            <span className="featured-tag">
                                ⭐ Featured
                            </span>

                        )}

                        {product.express && (

                            <span className="express-tag">
                                ⚡ Express
                            </span>

                        )}

                    </div>


                    {/* THUMBNAILS */}

                    {product.images?.length > 0 && (

                        <div className="thumbnail-list">

                            {product.images.map(
                                (image, index) => (

                                    <img
                                        key={index}
                                        src={getImageUrl(image)}
                                        alt={`${product.title} ${index + 1}`}
                                        className={
                                            selectedImage === image
                                                ? "active-thumb"
                                                : ""
                                        }
                                        onClick={() =>
                                            setSelectedImage(image)
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </div>


                {/* PRODUCT DETAILS */}

                <div className="details-section">

                    <h1>
                        {product.title}
                    </h1>


                    {/* PRICE */}

                    <h2 className="price">

                        GH₵{" "}

                        {Number(
                            product.price || 0
                        ).toLocaleString()}

                    </h2>


                    {/* BADGES */}

                    <div className="badges">

                        <span className="condition">
                            {product.condition || "Not specified"}
                        </span>

                        <span>
                            📦 {product.category || "General"}
                        </span>

                        <span>
                            📍 {product.city || "Unknown"},{" "}
                            {product.region || "Ghana"}
                        </span>

                    </div>


                    {/* STATISTICS */}

                    <div className="statistics">

                        <span>
                            👁 {product.views || 0} Views
                        </span>

                        <span>
                            ❤️ {product.favourites || 0}
                        </span>

                        <span>
                            ⭐ {Number(
                                product.sellerRating || 0
                            ).toFixed(1)}
                        </span>

                    </div>


                    {/* DESCRIPTION */}

                    <div className="description">

                        <h3>
                            Description
                        </h3>

                        <p>
                            {product.description ||
                                "No description available."}
                        </p>

                    </div>


                    {/* ACTION BUTTONS */}

                    <div className="action-buttons">

                        <button
                            className="contact-btn"
                            onClick={contactSeller}
                        >
                            💬 Chat Seller
                        </button>


                        <button
                            className="wishlist-btn"
                            onClick={addWishlist}
                        >
                            ❤️ Save
                        </button>


                        <button
                            className="share-btn"
                            onClick={shareProduct}
                        >
                            📤 Share
                        </button>


                        <button
                            className="interest-btn"
                            onClick={interested}
                        >
                            ❤️ I'm Interested
                        </button>


                        <button
                            className="phone-btn"
                            onClick={requestPhone}
                        >
                            📞 Request Phone
                        </button>


                        <button
                            className="location-btn"
                            onClick={requestLocation}
                        >
                            📍 Request Location
                        </button>

                    </div>


                    {/* MAKE OFFER */}

                    <div className="offer-box">

                        <h3>
                            Make an Offer
                        </h3>

                        <input
                            type="number"
                            min="1"
                            placeholder="Enter your offer"
                            value={offer}
                            onChange={(e) =>
                                setOffer(e.target.value)
                            }
                        />

                        <button
                            className="offer-btn"
                            onClick={makeOffer}
                        >
                            💰 Submit Offer
                        </button>

                    </div>

                </div>

            </div>


            {/* SELLER CARD */}

            {sellerId && (

                <SellerCard
                    sellerId={sellerId}
                />

            )}


            {/* REVIEWS */}

            {canReview && (

                <ReviewForm
                    productId={product.id}
                    onReviewAdded={loadReviews}
                />

            )}


            {/* REPORT PRODUCT */}

            <ReportForm
                productId={product.id}
            />


            {/* REVIEW LIST */}

            <ReviewList
                productId={product.id}
                refresh={refresh}
            />


            {/* RELATED PRODUCTS */}

            <section className="related-products">

                <h2>
                    Related Products
                </h2>

                {relatedProducts.length === 0 ? (

                    <div className="no-products">

                        <p>
                            No related products found.
                        </p>

                    </div>

                ) : (

                    <div className="products">

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
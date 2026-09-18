import { useEffect, useState } from "react";
import api from "../config/axios";
import "./Promotions.css";

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "";

function Promotions() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [promotingId, setPromotingId] = useState(null);

    const getImageUrl = (image) => {

        if (!image) {
            return "https://via.placeholder.com/300";
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        if (image.startsWith("/")) {
            return `${SERVER_URL}${image}`;
        }

        return `${SERVER_URL}/uploads/${image}`;
    };

    const getProductImage = (product) => {

        if (!product.images) {
            return "https://via.placeholder.com/300";
        }

        let images = [];

        try {

            if (typeof product.images === "string") {

                images = JSON.parse(product.images);

            } else if (Array.isArray(product.images)) {

                images = product.images;

            }

        } catch {

            images = [product.images];

        }

        if (!Array.isArray(images) || images.length === 0) {

            return "https://via.placeholder.com/300";

        }

        return getImageUrl(images[0]);
    };

    const loadProducts = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/products/seller/my-products"
            );

            const productsData =
                response.data?.products ||
                response.data?.data ||
                response.data ||
                [];

            setProducts(
                Array.isArray(productsData)
                    ? productsData
                    : []
            );

        } catch (error) {

            console.error(
                "LOAD PRODUCTS ERROR:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load your products."
            );

            setProducts([]);

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        loadProducts();

    }, []);

    const promote = async (
        productId,
        promotionType
    ) => {

        try {

            setPromotingId(productId);

            const response = await api.post(
                "/promotions/initialize",
                {
                    productId,
                    promotionType
                }
            );

            if (
                response.data?.freePromotion ||
                (
                    response.data?.success &&
                    response.data?.paymentRequired === false
                )
            ) {

                alert(
                    response.data.message ||
                    "Promotion activated successfully!"
                );

                await loadProducts();

                return;
            }

            const paymentUrl =
                response.data?.authorization_url ||
                response.data?.data?.authorization_url;

            if (paymentUrl) {

                window.location.href = paymentUrl;

                return;
            }

            if (response.data?.success) {

                alert(
                    response.data.message ||
                    "Promotion processed successfully."
                );

                await loadProducts();

                return;
            }

            throw new Error(
                response.data?.message ||
                "Promotion could not be initialized."
            );

        } catch (error) {

            console.error(
                "PROMOTION ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Promotion failed."
            );

        } finally {

            setPromotingId(null);

        }
    };

    if (loading) {

        return (
            <div className="promotions-page loading">
                <h2>Loading Products...</h2>
            </div>
        );

    }

    return (

        <div className="promotions-page">

            <div className="promotions-header">

                <div>
                    <h1>Product Promotions</h1>

                    <p>
                        Increase your product visibility
                        and reach more buyers.
                    </p>
                </div>

                <button
                    className="refresh-btn"
                    onClick={loadProducts}
                >
                    ↻ Refresh
                </button>

            </div>

            {error && (
                <div className="promotion-error">
                    {error}
                </div>
            )}

            {products.length === 0 ? (

                <div className="no-products">

                    <h2>No Products Found</h2>

                    <p>
                        You need to create products
                        before promoting them.
                    </p>

                </div>

            ) : (

                <div className="promotion-grid">

                    {products.map((product) => (

                        <div
                            key={product.id}
                            className="promotion-card"
                        >

                            <div className="promotion-image">

                                <img
                                    src={getProductImage(product)}
                                    alt={product.title}
                                    onError={(e) => {
                                        e.target.src =
                                            "https://via.placeholder.com/300";
                                    }}
                                />

                            </div>

                            <div className="promotion-content">

                                <h2>{product.title}</h2>

                                <p className="price">
                                    GH₵{" "}
                                    {Number(
                                        product.price || 0
                                    ).toLocaleString()}
                                </p>

                                <div className="listing-score">

                                    <span>
                                        Listing Score
                                    </span>

                                    <strong>
                                        {product.listingScore || 0}
                                    </strong>

                                </div>

                                <div className="promotion-status">

                                    <span
                                        className={
                                            product.featured
                                                ? "active"
                                                : ""
                                        }
                                    >
                                        {product.featured
                                            ? "⭐ Featured"
                                            : "☆ Not Featured"}
                                    </span>

                                    <span
                                        className={
                                            product.express
                                                ? "active"
                                                : ""
                                        }
                                    >
                                        {product.express
                                            ? "⚡ Express"
                                            : "Normal"}
                                    </span>

                                    <span
                                        className={
                                            product.boosted
                                                ? "active"
                                                : ""
                                        }
                                    >
                                        {product.boosted
                                            ? "🚀 Boosted"
                                            : "No Boost"}
                                    </span>

                                </div>

                                <div className="promotion-buttons">

                                    <button
                                        className="boost"
                                        disabled={
                                            promotingId === product.id
                                        }
                                        onClick={() =>
                                            promote(
                                                product.id,
                                                "Boost"
                                            )
                                        }
                                    >
                                        {promotingId === product.id
                                            ? "Processing..."
                                            : "🚀 Boost"}
                                    </button>

                                    <button
                                        className="feature"
                                        disabled={
                                            promotingId === product.id
                                        }
                                        onClick={() =>
                                            promote(
                                                product.id,
                                                "Feature"
                                            )
                                        }
                                    >
                                        {promotingId === product.id
                                            ? "Processing..."
                                            : "⭐ Feature"}
                                    </button>

                                    <button
                                        className="express"
                                        disabled={
                                            promotingId === product.id
                                        }
                                        onClick={() =>
                                            promote(
                                                product.id,
                                                "Express"
                                            )
                                        }
                                    >
                                        {promotingId === product.id
                                            ? "Processing..."
                                            : "⚡ Express"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default Promotions;
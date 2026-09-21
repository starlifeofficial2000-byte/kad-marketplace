import { useEffect, useState } from "react";
import api from "../config/axios";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import "./Featured.css";

function Featured() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadFeaturedProducts();
    }, []);

    const loadFeaturedProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/home-builder/featured");

            const data = response?.data;

            let promotions = [];

            if (Array.isArray(data)) {
                promotions = data;
            } else if (Array.isArray(data?.products)) {
                promotions = data.products;
            } else if (Array.isArray(data?.data)) {
                promotions = data.data;
            }

            /*
             * The public Featured API returns promotion records.
             * Each promotion contains the actual product inside:
             *
             * promotion.product
             *
             * Convert them into actual products before passing
             * them to ProductCard.
             */
            const featuredProducts = promotions
                .map((promotion) => {
                    if (promotion?.product) {
                        return promotion.product;
                    }

                    return promotion;
                })
                .filter((product) => product && product.id);

            /*
             * Remove duplicate products.
             */
            const uniqueProducts = featuredProducts.filter(
                (product, index, array) =>
                    index ===
                    array.findIndex(
                        (item) => item.id === product.id
                    )
            );

            setProducts(uniqueProducts);
        } catch (error) {
            console.error(
                "Error loading featured products:",
                error
            );

            setProducts([]);

            setError(
                error?.response?.data?.message ||
                "Unable to load featured products. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            {/* ==========================================
                FEATURED HERO
            ========================================== */}
            <section className="featured-page-hero">
                <div className="featured-overlay">
                    <h1>⭐ Featured Products</h1>

                    <p>
                        Discover premium products selected to stand out
                        on KAD Marketplace.
                    </p>
                </div>
            </section>

            {/* ==========================================
                FEATURED PRODUCTS
            ========================================== */}
            <section className="featured-page">

                {loading ? (
                    <div className="loading">
                        <h2>Loading featured products...</h2>
                    </div>
                ) : error ? (
                    <div className="empty">
                        <h2>{error}</h2>

                        <button
                            type="button"
                            onClick={loadFeaturedProducts}
                        >
                            Try Again
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty">
                        <h2>No featured products available.</h2>

                        <p>
                            There are currently no approved Featured
                            products available.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="featured-page-header">
                            <div>
                                <h2>All Featured Products</h2>

                                <p>
                                    Browse all products currently approved
                                    as Featured on KAD Marketplace.
                                </p>
                            </div>

                            <span className="featured-count">
                                {products.length}{" "}
                                {products.length === 1
                                    ? "Product"
                                    : "Products"}
                            </span>
                        </div>

                        <div className="featured-grid">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>
        </Layout>
    );
}

export default Featured;
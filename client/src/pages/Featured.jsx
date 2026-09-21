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

            let featuredProducts = [];

            if (Array.isArray(data)) {
                featuredProducts = data;
            } else if (Array.isArray(data?.products)) {
                featuredProducts = data.products;
            } else if (Array.isArray(data?.data)) {
                featuredProducts = data.data;
            }

            setProducts(featuredProducts);
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
            <section className="featured-page-hero">
                <div className="featured-overlay">
                    <h1>⭐ Featured Products</h1>

                    <p>
                        Discover premium products selected to stand out
                        on KAD Marketplace.
                    </p>
                </div>
            </section>

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
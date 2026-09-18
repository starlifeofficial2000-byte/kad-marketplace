import { useEffect, useState } from "react";
import api from "../config/axios";
import "./MyProducts.css";
import { useNavigate } from "react-router-dom";

function MyProducts() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadProducts();
    }, []);

    /* =========================================
       LOAD SELLER PRODUCTS
    ========================================= */

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await api.get(
                "/products/seller/my-products"
            );

            console.log(
                "MY PRODUCTS RESPONSE:",
                res.data
            );

            setProducts(
                res.data.products || []
            );

        } catch (error) {
            console.error(
                "LOAD MY PRODUCTS ERROR:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to load your products."
            );

        } finally {
            setLoading(false);
        }
    };


    /* =========================================
       DELETE PRODUCT
    ========================================= */

    const deleteProduct = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(
                `/products/${id}`
            );

            setProducts((currentProducts) =>
                currentProducts.filter(
                    (product) =>
                        product.id !== id
                )
            );

            alert(
                "Product deleted successfully."
            );

        } catch (error) {
            console.error(
                "DELETE PRODUCT ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete product."
            );
        }
    };


    /* =========================================
       GET PRODUCT IMAGE
    ========================================= */

    const getImageUrl = (product) => {
        let images = [];

        try {
            if (Array.isArray(product.images)) {
                images = product.images;
            } else if (
                typeof product.images === "string"
            ) {
                images = JSON.parse(
                    product.images
                );
            }
        } catch {
            images = [];
        }

        if (!images.length) {
            return "https://via.placeholder.com/300x250?text=No+Image";
        }

        const image = images[0];

        /* Full image URL */

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        /* Local uploaded image */

        return `/uploads/${image}`;
    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {
        return (
            <div className="my-products-page">
                <p>Loading products...</p>
            </div>
        );
    }


    /* =========================================
       ERROR
    ========================================= */

    if (error) {
        return (
            <div className="my-products-page">
                <p>{error}</p>

                <button
                    onClick={loadProducts}
                >
                    Try Again
                </button>
            </div>
        );
    }


    /* =========================================
       PAGE
    ========================================= */

    return (
        <div className="my-products-page">

            <h1>My Products</h1>

            {products.length === 0 ? (

                <div className="no-products">
                    <p>
                        You have not posted any products yet.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/sell")
                        }
                    >
                        Post a Product
                    </button>
                </div>

            ) : (

                <div className="seller-products">

                    {products.map((product) => (

                        <div
                            className="seller-product-card"
                            key={product.id}
                        >

                            <img
                                src={getImageUrl(product)}
                                alt={product.title || "Product"}
                                onError={(e) => {
                                    e.currentTarget.src =
                                        "https://via.placeholder.com/300x250?text=No+Image";
                                }}
                            />

                            <h2>
                                {product.title}
                            </h2>

                            <h3>
                                GH₵{" "}
                                {Number(
                                    product.price || 0
                                ).toLocaleString()}
                            </h3>

                            <p>
                                📍{" "}
                                {product.location ||
                                    product.city ||
                                    "Location not specified"}
                            </p>

                            <span
                                className={
                                    `status ${
                                        (
                                            product.status ||
                                            "pending"
                                        ).toLowerCase()
                                    }`
                                }
                            >
                                {product.status || "Pending"}
                            </span>

                            <div className="seller-actions">

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/edit-product/${product.id}`
                                        )
                                    }
                                >
                                    ✏ Edit
                                </button>

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/product/${product.id}`
                                        )
                                    }
                                >
                                    👁 View
                                </button>

                                <button
                                    onClick={() =>
                                        deleteProduct(
                                            product.id
                                        )
                                    }
                                >
                                    🗑 Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default MyProducts;
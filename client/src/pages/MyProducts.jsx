import { useEffect, useState } from "react";
import api from "../config/axios";
import "./MyProducts.css";
import { useNavigate } from "react-router-dom";

function MyProducts() {

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    /* =========================================
       LOAD SELLER PRODUCTS
    ========================================= */

    useEffect(() => {
        loadProducts();
    }, []);


    const loadProducts = async () => {

        try {

            setLoading(true);
            setError("");

            const res =
                await api.get(
                    "/products/seller/my-products"
                );

            console.log(
                "MY PRODUCTS RESPONSE:",
                res.data
            );

            setProducts(
                Array.isArray(
                    res.data?.products
                )
                    ? res.data.products
                    : []
            );

        } catch (error) {

            console.error(
                "LOAD MY PRODUCTS ERROR:",
                error.response?.data ||
                error.message
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

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this product?"
            );


        if (!confirmDelete) return;


        try {

            await api.delete(
                `/products/${id}`
            );


            setProducts(
                (currentProducts) =>
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
                error.response?.data ||
                error.message
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

            if (
                Array.isArray(
                    product?.images
                )
            ) {

                images =
                    product.images;

            } else if (
                typeof product?.images ===
                "string"
            ) {

                const value =
                    product.images.trim();


                if (value) {

                    try {

                        const parsed =
                            JSON.parse(value);


                        if (
                            Array.isArray(
                                parsed
                            )
                        ) {

                            images = parsed;

                        } else if (parsed) {

                            images = [parsed];

                        }

                    } catch {

                        images =
                            value.includes(",")
                                ? value
                                    .split(",")
                                    .map(
                                        (item) =>
                                            item.trim()
                                    )
                                    .filter(Boolean)
                                : [value];
                    }
                }
            }

        } catch (error) {

            console.error(
                "GET PRODUCT IMAGE ERROR:",
                error
            );

            images = [];
        }


        if (!images.length) {

            return "/default-product.png";
        }


        let image =
            images[0];


        // Handle image objects

        if (
            typeof image ===
            "object" &&
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


        if (
            typeof image !==
            "string"
        ) {

            return "/default-product.png";
        }


        image =
            image.trim();


        if (!image) {

            return "/default-product.png";
        }


        // Already a complete URL

        if (
            /^https?:\/\//i.test(
                image
            )
        ) {

            return image;
        }


        // Cloudflare R2 CDN

        const CDN_URL = (
            import.meta.env
                .VITE_R2_PUBLIC_URL ||
            "https://cdn.kadmarket.com"
        ).replace(
            /\/+$/,
            ""
        );


        image =
            image.replace(
                /^\/+/,
                ""
            );


        // Remove duplicate uploads prefix

        while (
            image.startsWith(
                "uploads/uploads/"
            )
        ) {

            image =
                image.replace(
                    /^uploads\//,
                    ""
                );
        }


        if (
            image.startsWith(
                "uploads/"
            )
        ) {

            return `${CDN_URL}/${image}`;
        }


        return `${CDN_URL}/uploads/${image}`;
    };


    /* =========================================
       IMAGE ERROR
    ========================================= */

    const handleImageError = (event) => {

        if (
            event.currentTarget.dataset
                .fallback === "true"
        ) {
            return;
        }


        event.currentTarget.dataset
            .fallback = "true";


        event.currentTarget.src =
            "/default-product.png";
    };


    /* =========================================
       NORMALIZE STATUS
    ========================================= */

    const getStatus = (product) => {

        return String(
            product?.status ||
            "Pending"
        ).trim();
    };


    /* =========================================
       STATUS CLASS
    ========================================= */

    const getStatusClass = (status) => {

        return String(
            status || "Pending"
        )
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );
    };


    /* =========================================
       STATUS MESSAGE
    ========================================= */

    const renderStatusMessage = (product) => {

        const status =
            getStatus(product);


        const normalized =
            status.toLowerCase();


        // -----------------------------------------
        // PENDING
        // -----------------------------------------

        if (
            normalized ===
            "pending"
        ) {

            return (
                <div className="product-status-message pending-message">

                    <strong>
                        ⏳ Awaiting Admin Approval
                    </strong>

                    <p>
                        Your product has been submitted
                        and is waiting for administrator
                        review.
                    </p>

                </div>
            );
        }


        // -----------------------------------------
        // REJECTED
        // -----------------------------------------

        if (
            normalized ===
            "rejected"
        ) {

            return (
                <div className="product-status-message rejected-message">

                    <strong>
                        ❌ Product Rejected
                    </strong>


                    <p>
                        Your product was rejected by
                        the administrator.
                    </p>


                    {product?.rejectionReason && (

                        <div className="rejection-reason">

                            <strong>
                                Reason:
                            </strong>

                            <p>
                                {
                                    product.rejectionReason
                                }
                            </p>

                        </div>

                    )}


                    <button
                        className="resubmit-btn"
                        onClick={() =>
                            navigate(
                                `/edit-product/${product.id}`
                            )
                        }
                    >
                        ✏ Edit & Resubmit
                    </button>

                </div>
            );
        }


        // -----------------------------------------
        // APPROVED
        // -----------------------------------------

        if (
            normalized ===
            "approved"
        ) {

            const sellerStatus =
                String(
                    product?.sellerStatus ||
                    "Active"
                );


            return (
                <div className="product-status-message approved-message">

                    <strong>
                        ✅ Approved
                    </strong>

                    <p>
                        Your product has been approved
                        and is available on the marketplace.
                    </p>

                    <span>
                        Availability:{" "}
                        <strong>
                            {sellerStatus}
                        </strong>
                    </span>

                </div>
            );
        }


        return null;
    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="my-products-page">

                <div className="my-products-loading">

                    <p>
                        Loading products...
                    </p>

                </div>

            </div>
        );
    }


    /* =========================================
       ERROR
    ========================================= */

    if (error) {

        return (

            <div className="my-products-page">

                <div className="my-products-error">

                    <p>
                        {error}
                    </p>


                    <button
                        onClick={
                            loadProducts
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    /* =========================================
       PAGE
    ========================================= */

    return (

        <div className="my-products-page">

            <div className="my-products-header">

                <div>

                    <h1>
                        My Products
                    </h1>

                    <p>
                        Manage your marketplace
                        products and track their
                        approval status.
                    </p>

                </div>


                <button
                    className="post-product-btn"
                    onClick={() =>
                        navigate("/sell")
                    }
                >
                    + Post a Product
                </button>

            </div>


            {products.length === 0 ? (

                <div className="no-products">

                    <div className="no-products-icon">
                        📦
                    </div>

                    <h2>
                        No Products Yet
                    </h2>

                    <p>
                        You have not posted any
                        products yet.
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

                    {products.map(
                        (product) => {

                            const status =
                                getStatus(
                                    product
                                );


                            const statusClass =
                                getStatusClass(
                                    status
                                );


                            return (

                                <div
                                    className="seller-product-card"
                                    key={
                                        product.id
                                    }
                                >

                                    {/* =========================
                                        IMAGE
                                    ========================= */}

                                    <div className="seller-product-image">

                                        <img
                                            src={
                                                getImageUrl(
                                                    product
                                                )
                                            }
                                            alt={
                                                product.title ||
                                                "Product"
                                            }
                                            onError={
                                                handleImageError
                                            }
                                        />

                                    </div>


                                    {/* =========================
                                        PRODUCT INFORMATION
                                    ========================= */}

                                    <div className="seller-product-content">

                                        <h2>
                                            {
                                                product.title ||
                                                "Untitled Product"
                                            }
                                        </h2>


                                        <h3>
                                            GH₵{" "}
                                            {Number(
                                                product.price ||
                                                0
                                            ).toLocaleString(
                                                "en-GH"
                                            )}
                                        </h3>


                                        <p className="product-location">

                                            📍{" "}

                                            {
                                                product.location ||
                                                product.city ||
                                                "Location not specified"
                                            }

                                        </p>


                                        {/* =========================
                                            APPROVAL STATUS
                                        ========================= */}

                                        <span
                                            className={
                                                `status ${statusClass}`
                                            }
                                        >
                                            {status}
                                        </span>


                                        {/* =========================
                                            STATUS INFORMATION
                                        ========================= */}

                                        {renderStatusMessage(
                                            product
                                        )}


                                        {/* =========================
                                            ACTIONS
                                        ========================= */}

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

                                </div>

                            );

                        }
                    )}

                </div>

            )}

        </div>
    );
}

export default MyProducts;
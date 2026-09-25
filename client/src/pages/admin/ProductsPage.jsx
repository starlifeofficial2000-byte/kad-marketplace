import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../config/axios";

import "./ProductsPage.css";


/* =========================================================
   CONSTANTS
========================================================= */

const CDN_URL =
    (
        import.meta.env.VITE_R2_PUBLIC_URL ||
        "https://cdn.kadmarket.com"
    ).replace(/\/+$/, "");

const FALLBACK_IMAGE = "/default-product.png";


/* =========================================================
   PRODUCTS PAGE
========================================================= */

function ProductsPage() {

    const [products, setProducts] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("All");

    const [loading, setLoading] =
        useState(true);

    const [actionLoading, setActionLoading] =
        useState({});


    /* =====================================================
       LOAD PRODUCTS
    ===================================================== */

    const loadProducts = async () => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    "/admin/products"
                );

            console.log(
                "ADMIN PRODUCTS RESPONSE:",
                response.data
            );

            const productData =
                response.data?.products ||
                response.data?.data ||
                response.data?.results ||
                (
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : []
                );

            setProducts(
                Array.isArray(productData)
                    ? productData
                    : []
            );

        } catch (error) {

            console.error(
                "LOAD PRODUCTS ERROR:",
                error
            );

            setProducts([]);

            alert(
                error.response?.data
                    ?.message ||
                "Failed to load products."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadProducts();

    }, []);


    /* =====================================================
       IMAGE PARSING
    ===================================================== */

    const parseProductImages = (
        product
    ) => {

        if (!product) {
            return [];
        }

        /*
         * Some APIs may return:
         *
         * product.images
         * product.image
         * product.imageUrl
         * product.images[]
         */

        let rawImages =
            product.images;

        /*
         * If images doesn't exist, check
         * the other possible fields.
         */

        if (
            rawImages === undefined ||
            rawImages === null
        ) {

            if (
                product.imageUrl
            ) {

                rawImages =
                    product.imageUrl;

            } else if (
                product.image
            ) {

                rawImages =
                    product.image;

            } else {

                rawImages = [];

            }

        }


        /*
         * Already an array.
         */

        if (
            Array.isArray(
                rawImages
            )
        ) {

            return rawImages
                .filter(Boolean)
                .map((image) =>
                    String(image).trim()
                )
                .filter(Boolean);

        }


        /*
         * String value.
         */

        if (
            typeof rawImages ===
            "string"
        ) {

            const value =
                rawImages.trim();

            if (!value) {
                return [];
            }


            /*
             * Try JSON.
             */

            try {

                const parsed =
                    JSON.parse(value);


                if (
                    Array.isArray(
                        parsed
                    )
                ) {

                    return parsed
                        .filter(Boolean)
                        .map(
                            (image) =>
                                String(
                                    image
                                ).trim()
                        )
                        .filter(Boolean);

                }


                if (
                    typeof parsed ===
                        "string" &&
                    parsed.trim()
                ) {

                    return [
                        parsed.trim()
                    ];

                }

            } catch {
                /*
                 * Legacy filename format.
                 */
            }


            /*
             * Some old records may contain
             * comma-separated image names.
             */

            if (
                value.includes(",")
            ) {

                return value
                    .split(",")
                    .map((image) =>
                        image.trim()
                    )
                    .filter(Boolean);

            }


            return [value];

        }


        return [];

    };


    /* =====================================================
       RESOLVE PRODUCT IMAGE URL
    ===================================================== */

    const resolveProductImage = (
        image
    ) => {

        if (!image) {
            return null;
        }

        const cleanImage =
            String(image).trim();

        if (!cleanImage) {
            return null;
        }


        /*
         * Already a complete URL.
         */

        if (
            cleanImage.startsWith(
                "http://"
            ) ||
            cleanImage.startsWith(
                "https://"
            )
        ) {

            return cleanImage;

        }


        /*
         * Normalize slashes.
         */

        let normalized =
            cleanImage
                .replace(
                    /\\/g,
                    "/"
                )
                .replace(
                    /^\/+/,
                    ""
                );


        /*
         * If the value is accidentally
         * prefixed with the CDN domain
         * without a protocol, normalize it.
         */

        normalized =
            normalized.replace(
                /^cdn\.kadmarket\.com\//i,
                ""
            );


        /*
         * R2 object key.
         *
         * Examples:
         *
         * uploads/products/a.jpg
         * uploads/a.jpg
         */

        if (
            normalized.startsWith(
                "uploads/"
            )
        ) {

            return `${CDN_URL}/${normalized}`;

        }


        /*
         * Legacy records containing only:
         *
         * image.jpg
         */

        return `${CDN_URL}/uploads/${normalized}`;

    };


    /* =====================================================
       GET FIRST PRODUCT IMAGE
    ===================================================== */

    const getProductImage = (
        product
    ) => {

        const images =
            parseProductImages(
                product
            );


        if (
            images.length === 0
        ) {

            return FALLBACK_IMAGE;

        }


        /*
         * Use the first valid image.
         */

        for (
            const image of images
        ) {

            const url =
                resolveProductImage(
                    image
                );

            if (url) {
                return url;
            }

        }


        return FALLBACK_IMAGE;

    };


    /* =====================================================
       IMAGE ERROR HANDLER
    ===================================================== */

    const handleImageError = (
        event
    ) => {

        const image =
            event.currentTarget;

        /*
         * Prevent an infinite
         * onError loop.
         */

        if (
            image.dataset.fallback ===
            "true"
        ) {

            return;

        }


        image.dataset.fallback =
            "true";

        image.src =
            FALLBACK_IMAGE;

    };


    /* =====================================================
       FILTER PRODUCTS
    ===================================================== */

    const filteredProducts =
        useMemo(() => {

            let data =
                Array.isArray(
                    products
                )
                    ? [...products]
                    : [];


            /*
             * Status filter.
             */

            if (
                status !== "All"
            ) {

                data =
                    data.filter(
                        (product) =>
                            String(
                                product.status ||
                                ""
                            )
                                .toLowerCase() ===
                            status.toLowerCase()
                    );

            }


            /*
             * Search filter.
             */

            const keyword =
                search.trim()
                    .toLowerCase();


            if (keyword) {

                data =
                    data.filter(
                        (product) => {

                            const title =
                                String(
                                    product.title ||
                                    product.name ||
                                    ""
                                )
                                    .toLowerCase();


                            const category =
                                String(
                                    product.category ||
                                    ""
                                )
                                    .toLowerCase();


                            const seller =
                                String(
                                    product.User?.name ||
                                    product.user?.name ||
                                    product.seller?.name ||
                                    ""
                                )
                                    .toLowerCase();


                            return (
                                title.includes(
                                    keyword
                                ) ||
                                category.includes(
                                    keyword
                                ) ||
                                seller.includes(
                                    keyword
                                )
                            );

                        }
                    );

            }


            return data;

        }, [
            products,
            search,
            status
        ]);


    /* =====================================================
       ACTION LOADING
    ===================================================== */

    const setActionState = (
        id,
        action,
        value
    ) => {

        setActionLoading(
            (previous) => ({
                ...previous,

                [id]: {
                    ...(previous[id] ||
                        {}),
                    [action]:
                        value,
                },

            })
        );

    };


    /* =====================================================
       APPROVE PRODUCT
    ===================================================== */

    const approveProduct = async (
        id
    ) => {

        const confirmed =
            window.confirm(
                "Approve this product?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionState(
                id,
                "approve",
                true
            );

            await api.put(
                `/admin/products/${id}/approve`
            );

            alert(
                "Product approved successfully."
            );

            await loadProducts();

        } catch (error) {

            console.error(
                "APPROVE PRODUCT ERROR:",
                error
            );

            alert(
                error.response?.data
                    ?.message ||
                "Unable to approve product."
            );

        } finally {

            setActionState(
                id,
                "approve",
                false
            );

        }

    };


    /* =====================================================
       REJECT PRODUCT
    ===================================================== */

    const rejectProduct = async (
        id
    ) => {

        const reason =
            window.prompt(
                "Enter reason for rejecting this product:"
            );

        if (
            !reason ||
            !reason.trim()
        ) {

            return;

        }


        try {

            setActionState(
                id,
                "reject",
                true
            );

            await api.put(
                `/admin/products/${id}/reject`,
                {
                    reason:
                        reason.trim(),
                }
            );

            alert(
                "Product rejected successfully."
            );

            await loadProducts();

        } catch (error) {

            console.error(
                "REJECT PRODUCT ERROR:",
                error
            );

            alert(
                error.response?.data
                    ?.message ||
                "Unable to reject product."
            );

        } finally {

            setActionState(
                id,
                "reject",
                false
            );

        }

    };


    /* =====================================================
       FEATURE PRODUCT
    ===================================================== */

    const featureProduct = async (
        id
    ) => {

        try {

            setActionState(
                id,
                "feature",
                true
            );

            await api.put(
                `/admin/products/${id}/feature`
            );

            alert(
                "Product featured successfully."
            );

            await loadProducts();

        } catch (error) {

            console.error(
                "FEATURE PRODUCT ERROR:",
                error
            );

            alert(
                error.response?.data
                    ?.message ||
                "Unable to feature product."
            );

        } finally {

            setActionState(
                id,
                "feature",
                false
            );

        }

    };


    /* =====================================================
       EXPRESS PROMOTION
    ===================================================== */

    const expressPromotion = async (
        id
    ) => {

        try {

            setActionState(
                id,
                "express",
                true
            );

            await api.put(
                `/admin/products/${id}/express`
            );

            alert(
                "Product added to express promotion."
            );

            await loadProducts();

        } catch (error) {

            console.error(
                "EXPRESS PROMOTION ERROR:",
                error
            );

            alert(
                error.response?.data
                    ?.message ||
                "Unable to promote product."
            );

        } finally {

            setActionState(
                id,
                "express",
                false
            );

        }

    };


    /* =====================================================
       DELETE PRODUCT
    ===================================================== */

    const deleteProduct = async (
        id
    ) => {

        const confirmed =
            window.confirm(
                "Delete this product permanently?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionState(
                id,
                "delete",
                true
            );

            await api.delete(
                `/admin/products/${id}`
            );

            alert(
                "Product deleted successfully."
            );

            await loadProducts();

        } catch (error) {

            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );

            alert(
                error.response?.data
                    ?.message ||
                "Unable to delete product."
            );

        } finally {

            setActionState(
                id,
                "delete",
                false
            );

        }

    };


    /* =====================================================
       STATISTICS
    ===================================================== */

    const totalProducts =
        products.length;

    const pendingProducts =
        products.filter(
            (product) =>
                String(
                    product.status ||
                    ""
                ).toLowerCase() ===
                "pending"
        ).length;

    const approvedProducts =
        products.filter(
            (product) =>
                String(
                    product.status ||
                    ""
                ).toLowerCase() ===
                "approved"
        ).length;

    const rejectedProducts =
        products.filter(
            (product) =>
                String(
                    product.status ||
                    ""
                ).toLowerCase() ===
                "rejected"
        ).length;


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="products-page">

                <div className="products-loading">

                    <div className="loading-spinner" />

                    <h2>
                        Loading Products...
                    </h2>

                </div>

            </div>

        );

    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="products-page">


            {/* =================================================
               HEADER
            ================================================= */}

            <div className="products-header">

                <div>

                    <h1>
                        📦 Products Management
                    </h1>

                    <p>
                        Manage all marketplace products.
                    </p>

                </div>


                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                />

            </div>


            {/* =================================================
               STATISTICS
            ================================================= */}

            <div className="product-stats">


                <div className="stat-card">

                    <h2>
                        {totalProducts}
                    </h2>

                    <p>
                        Total Products
                    </p>

                </div>


                <div className="stat-card pending-card">

                    <h2>
                        {pendingProducts}
                    </h2>

                    <p>
                        Pending
                    </p>

                </div>


                <div className="stat-card approved-card">

                    <h2>
                        {approvedProducts}
                    </h2>

                    <p>
                        Approved
                    </p>

                </div>


                <div className="stat-card rejected-card">

                    <h2>
                        {rejectedProducts}
                    </h2>

                    <p>
                        Rejected
                    </p>

                </div>


            </div>


            {/* =================================================
               FILTERS
            ================================================= */}

            <div className="filter-bar">

                {[
                    "All",
                    "Pending",
                    "Approved",
                    "Rejected",
                ].map(
                    (filter) => (

                        <button
                            key={filter}
                            className={
                                status ===
                                filter
                                    ? "active-filter"
                                    : ""
                            }
                            onClick={() =>
                                setStatus(
                                    filter
                                )
                            }
                        >

                            {filter}

                        </button>

                    )
                )}

            </div>


            {/* =================================================
               PRODUCTS
            ================================================= */}

            <div className="products-grid">


                {filteredProducts.length ===
                0 ? (

                    <div className="no-products">

                        <h2>
                            No Products Found
                        </h2>

                        <p>
                            No products match your current search or filter.
                        </p>

                    </div>

                ) : (

                    filteredProducts.map(
                        (product) => {

                            const productId =
                                product.id;

                            const imageUrl =
                                getProductImage(
                                    product
                                );

                            const productStatus =
                                String(
                                    product.status ||
                                    "Unknown"
                                ).toLowerCase();

                            const seller =
                                product.User ||
                                product.user ||
                                product.seller ||
                                {};


                            return (

                                <div
                                    className="product-card"
                                    key={
                                        productId
                                    }
                                >


                                    {/* =================================
                                       IMAGE
                                    ================================= */}

                                    <div className="product-image">

                                        <img
                                            src={
                                                imageUrl
                                            }
                                            alt={
                                                product.title ||
                                                "Product"
                                            }
                                            loading="lazy"
                                            onError={
                                                handleImageError
                                            }
                                        />


                                        <span
                                            className={`status-badge ${productStatus}`}
                                        >

                                            {
                                                product.status ||
                                                "Unknown"
                                            }

                                        </span>

                                    </div>


                                    {/* =================================
                                       CONTENT
                                    ================================= */}

                                    <div className="product-content">


                                        <h2>

                                            {
                                                product.title ||
                                                product.name ||
                                                "Untitled Product"
                                            }

                                        </h2>


                                        <h3>

                                            GH₵{" "}

                                            {Number(
                                                product.price ||
                                                0
                                            ).toLocaleString(
                                                "en-GH",
                                                {
                                                    minimumFractionDigits:
                                                        2,
                                                    maximumFractionDigits:
                                                        2,
                                                }
                                            )}

                                        </h3>


                                        <div className="product-details">


                                            <p>

                                                <strong>
                                                    Category:
                                                </strong>{" "}

                                                {
                                                    product.category ||
                                                    "-"
                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Condition:
                                                </strong>{" "}

                                                {
                                                    product.condition ||
                                                    "-"
                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Location:
                                                </strong>{" "}

                                                {
                                                    product.location ||
                                                    "-"
                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Seller:
                                                </strong>{" "}

                                                {
                                                    seller.name ||
                                                    "Unknown"
                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Phone:
                                                </strong>{" "}

                                                {
                                                    seller.phone ||
                                                    "-"
                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Date Posted:
                                                </strong>{" "}

                                                {
                                                    product.createdAt
                                                        ? new Date(
                                                              product.createdAt
                                                          ).toLocaleDateString(
                                                              "en-GH"
                                                          )
                                                        : "-"
                                                }

                                            </p>


                                        </div>


                                        {/* =================================
                                           ACTIONS
                                        ================================= */}

                                        <div className="product-actions">


                                            <Link
                                                to={`/admin/product/${productId}`}
                                            >

                                                <button
                                                    className="view-btn"
                                                    type="button"
                                                >

                                                    👁 View

                                                </button>

                                            </Link>


                                            {
                                                productStatus !==
                                                    "approved" && (

                                                    <button
                                                        className="approve-btn"
                                                        type="button"
                                                        disabled={
                                                            actionLoading[
                                                                productId
                                                            ]?.approve
                                                        }
                                                        onClick={() =>
                                                            approveProduct(
                                                                productId
                                                            )
                                                        }
                                                    >

                                                        {
                                                            actionLoading[
                                                                productId
                                                            ]?.approve
                                                                ? "Approving..."
                                                                : "✔ Approve"
                                                        }

                                                    </button>

                                                )
                                            }


                                            {
                                                productStatus !==
                                                    "rejected" && (

                                                    <button
                                                        className="reject-btn"
                                                        type="button"
                                                        disabled={
                                                            actionLoading[
                                                                productId
                                                            ]?.reject
                                                        }
                                                        onClick={() =>
                                                            rejectProduct(
                                                                productId
                                                            )
                                                        }
                                                    >

                                                        {
                                                            actionLoading[
                                                                productId
                                                            ]?.reject
                                                                ? "Rejecting..."
                                                                : "✖ Reject"
                                                        }

                                                    </button>

                                                )
                                            }


                                            <button
                                                className="feature-btn"
                                                type="button"
                                                disabled={
                                                    actionLoading[
                                                        productId
                                                    ]?.feature
                                                }
                                                onClick={() =>
                                                    featureProduct(
                                                        productId
                                                    )
                                                }
                                            >

                                                {
                                                    actionLoading[
                                                        productId
                                                    ]?.feature
                                                        ? "Featuring..."
                                                        : "⭐ Feature"
                                                }

                                            </button>


                                            <button
                                                className="express-btn"
                                                type="button"
                                                disabled={
                                                    actionLoading[
                                                        productId
                                                    ]?.express
                                                }
                                                onClick={() =>
                                                    expressPromotion(
                                                        productId
                                                    )
                                                }
                                            >

                                                {
                                                    actionLoading[
                                                        productId
                                                    ]?.express
                                                        ? "Processing..."
                                                        : "🚀 Express"
                                                }

                                            </button>


                                            <button
                                                className="delete-btn"
                                                type="button"
                                                disabled={
                                                    actionLoading[
                                                        productId
                                                    ]?.delete
                                                }
                                                onClick={() =>
                                                    deleteProduct(
                                                        productId
                                                    )
                                                }
                                            >

                                                {
                                                    actionLoading[
                                                        productId
                                                    ]?.delete
                                                        ? "Deleting..."
                                                        : "🗑 Delete"
                                                }

                                            </button>


                                        </div>


                                    </div>


                                </div>

                            );

                        }
                    )

                )}


            </div>


        </div>

    );

}


export default ProductsPage;
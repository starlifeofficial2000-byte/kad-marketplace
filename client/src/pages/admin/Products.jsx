import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../config/axios";

import "./Products.css";

/*
|--------------------------------------------------------------------------
| IMAGE CONFIGURATION
|--------------------------------------------------------------------------
|
| Production:
| https://cdn.kadmarket.com
|
| Make sure your R2 public domain points to your Cloudflare R2 bucket.
|
*/

const CDN_URL = (
    import.meta.env.VITE_R2_PUBLIC_URL ||
    "https://cdn.kadmarket.com"
).replace(/\/+$/, "");

const FALLBACK_IMAGE = "/default-product.png";


function Products() {

    const navigate = useNavigate();


    /* =========================================================
       STATE
    ========================================================= */

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [actionLoading, setActionLoading] = useState(null);


    /* =========================================================
       LOAD PRODUCTS
    ========================================================= */

    useEffect(() => {

        loadProducts();

    }, []);


    const loadProducts = async () => {

        try {

            setLoading(true);


            const response = await api.get(
                "/admin/products"
            );


            console.log(
                "PRODUCTS RESPONSE:",
                response.data
            );


            /*
             * Support:
             *
             * {
             *   products: []
             * }
             *
             * {
             *   data: []
             * }
             *
             * []
             */

            let productsData =
                response.data?.products ??
                response.data?.data ??
                response.data?.results ??
                response.data ??
                [];


            if (!Array.isArray(productsData)) {

                productsData = [];

            }


            console.log(
                "NORMALIZED PRODUCTS:",
                productsData
            );


            setProducts(productsData);

        }

        catch (error) {

            console.error(
                "LOAD PRODUCTS ERROR:",
                error
            );


            setProducts([]);


            alert(
                error.response?.data?.message ||
                "Unable to load products."
            );

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================================
       APPROVE PRODUCT
    ========================================================= */

    const approveProduct = async (id) => {

        const confirmed = window.confirm(
            "Approve this product?"
        );


        if (!confirmed) return;


        try {

            setActionLoading(id);


            await api.put(
                `/admin/products/${id}/approve`,
                {}
            );


            alert(
                "Product approved successfully."
            );


            await loadProducts();

        }

        catch (error) {

            console.error(
                "APPROVE PRODUCT ERROR:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Unable to approve product."
            );

        }

        finally {

            setActionLoading(null);

        }

    };

/* =========================================================
   REJECT PRODUCT
========================================================= */

const rejectProduct = async (id) => {

    const rejectionReason =
        window.prompt(
            "Enter the reason for rejecting this product:"
        );


    // User cancelled the prompt
    if (rejectionReason === null) {
        return;
    }


    const trimmedReason =
        rejectionReason.trim();


    if (!trimmedReason) {

        alert(
            "A rejection reason is required."
        );

        return;
    }


    try {

        setActionLoading(id);


        await api.put(
            `/admin/products/${id}/reject`,
            {
                rejectionReason:
                    trimmedReason
            }
        );


        alert(
            "Product rejected successfully."
        );


        await loadProducts();

    }

    catch (error) {

        console.error(
            "REJECT PRODUCT ERROR:",
            error
        );


        alert(
            error.response?.data?.message ||
            "Unable to reject product."
        );

    }

    finally {

        setActionLoading(null);

    }

};
    /* =========================================================
       DELETE PRODUCT
    ========================================================= */

    const deleteProduct = async (id) => {

        const confirmed = window.confirm(
            "Delete this product permanently?"
        );


        if (!confirmed) return;


        try {

            setActionLoading(id);


            await api.delete(
                `/admin/products/${id}`
            );


            alert(
                "Product deleted successfully."
            );


            await loadProducts();

        }

        catch (error) {

            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Unable to delete product."
            );

        }

        finally {

            setActionLoading(null);

        }

    };


    /* =========================================================
       SEARCH PRODUCTS
    ========================================================= */

    const filteredProducts = (
        Array.isArray(products)
            ? products
            : []
    ).filter((product) => {

        const searchText =
            search.trim().toLowerCase();


        if (!searchText) {

            return true;

        }


        const title =
            String(
                product?.title ||
                ""
            ).toLowerCase();


        const name =
            String(
                product?.name ||
                ""
            ).toLowerCase();


        const category =
            typeof product?.category === "object"
                ? String(
                    product?.category?.name ||
                    ""
                ).toLowerCase()
                : String(
                    product?.category ||
                    ""
                ).toLowerCase();


        const seller =
            String(
                product?.seller?.name ||
                product?.user?.name ||
                product?.User?.name ||
                ""
            ).toLowerCase();


        return (
            title.includes(searchText) ||
            name.includes(searchText) ||
            category.includes(searchText) ||
            seller.includes(searchText)
        );

    });


    /* =========================================================
       PARSE PRODUCT IMAGES
    ========================================================= */

    const parseProductImages = (product) => {

        if (!product) {

            return [];

        }


        /*
         * Different possible backend fields.
         */

        let images =
            product.images ??
            product.imageUrls ??
            product.imageUrl ??
            product.image ??
            [];


        /*
         * Already an array
         */

        if (Array.isArray(images)) {

            return images.filter(Boolean);

        }


        /*
         * JSON string
         *
         * Example:
         *
         * "[\"iphone.jpg\",\"iphone2.jpg\"]"
         */

        if (typeof images === "string") {

            const value =
                images.trim();


            if (!value) {

                return [];

            }


            try {

                const parsed =
                    JSON.parse(value);


                if (Array.isArray(parsed)) {

                    return parsed.filter(Boolean);

                }


                if (parsed) {

                    return [parsed];

                }

            }

            catch (error) {

                /*
                 * Not JSON.
                 *
                 * Continue below.
                 */

            }


            /*
             * Comma-separated values
             */

            if (value.includes(",")) {

                return value
                    .split(",")
                    .map(
                        (item) =>
                            item.trim()
                    )
                    .filter(Boolean);

            }


            /*
             * Single filename
             */

            return [value];

        }


        /*
         * Object
         */

        if (
            typeof images === "object" &&
            images !== null
        ) {

            return [images];

        }


        return [];

    };


    /* =========================================================
       RESOLVE IMAGE OBJECT
    ========================================================= */

    const resolveImageObject = (image) => {

        if (!image) {

            return null;

        }


        /*
         * Image stored as object.
         *
         * Possible structures:
         *
         * {
         *   url: "..."
         * }
         *
         * {
         *   filename: "..."
         * }
         *
         * {
         *   key: "uploads/..."
         * }
         */

        if (
            typeof image === "object" &&
            image !== null
        ) {

            return (
                image.url ||
                image.imageUrl ||
                image.src ||
                image.path ||
                image.location ||
                image.filename ||
                image.key ||
                image.fileName ||
                null
            );

        }


        return image;

    };


    /* =========================================================
       RESOLVE PRODUCT IMAGE URL
    ========================================================= */

    const resolveProductImage = (image) => {

        image =
            resolveImageObject(image);


        if (!image) {

            return null;

        }


        if (
            typeof image !== "string"
        ) {

            return null;

        }


        let value =
            image.trim();


        if (!value) {

            return null;

        }


        /*
         * Already a complete URL.
         *
         * Example:
         *
         * https://cdn.kadmarket.com/uploads/a.jpg
         */

        if (
            /^https?:\/\//i.test(value)
        ) {

            return value;

        }


        /*
         * Remove leading slash.
         */

        value =
            value.replace(
                /^\/+/,
                ""
            );


        /*
         * Remove duplicate uploads prefix.
         *
         * uploads/uploads/a.jpg
         *
         * becomes:
         *
         * uploads/a.jpg
         */

        while (
            value.startsWith(
                "uploads/uploads/"
            )
        ) {

            value =
                value.replace(
                    /^uploads\//,
                    ""
                );

        }


        /*
         * If the database contains:
         *
         * uploads/product.jpg
         */

        if (
            value.startsWith(
                "uploads/"
            )
        ) {

            return `${CDN_URL}/${value}`;

        }


        /*
         * Normal filename:
         *
         * product.jpg
         *
         * becomes:
         *
         * https://cdn.kadmarket.com/uploads/product.jpg
         */

        return `${CDN_URL}/uploads/${value}`;

    };


    /* =========================================================
       GET PRODUCT IMAGE
    ========================================================= */

    const getProductImage = (product) => {

        const images =
            parseProductImages(product);


        /*
         * Debugging information.
         *
         * Check browser console if an image
         * still fails.
         */

        console.log(
            "PRODUCT IMAGE:",
            {
                productId: product?.id,
                rawImages: product?.images,
                parsedImages: images,
                firstImage: images[0],
                resolvedImage:
                    resolveProductImage(
                        images[0]
                    )
            }
        );


        /*
         * Try every image until we find
         * a valid image URL.
         */

        for (
            const image of images
        ) {

            const resolved =
                resolveProductImage(
                    image
                );


            if (resolved) {

                return resolved;

            }

        }


        /*
         * No image.
         */

        return FALLBACK_IMAGE;

    };


    /* =========================================================
       IMAGE ERROR HANDLER
    ========================================================= */

    const handleImageError = (event, product) => {

        const currentSrc =
            event.currentTarget.src;


        console.error(
            "PRODUCT IMAGE FAILED:",
            {
                productId: product?.id,
                productName:
                    product?.title ||
                    product?.name,
                attemptedURL:
                    currentSrc,
                rawImages:
                    product?.images
            }
        );


        /*
         * Prevent infinite error loop.
         */

        if (
            !event.currentTarget.dataset.fallback
        ) {

            event.currentTarget.dataset.fallback =
                "true";


            event.currentTarget.src =
                FALLBACK_IMAGE;

        }

    };


    /* =========================================================
       PRODUCT STATUS
    ========================================================= */

    const renderStatus = (status) => {

        const normalizedStatus =
            String(
                status ||
                "pending"
            ).toLowerCase();


        if (
            normalizedStatus ===
            "approved"
        ) {

            return (

                <span className="status approved">

                    Approved

                </span>

            );

        }


        if (
            normalizedStatus ===
            "rejected"
        ) {

            return (

                <span className="status rejected">

                    Rejected

                </span>

            );

        }


        return (

            <span className="status pending">

                Pending

            </span>

        );

    };


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (

            <div className="products-page">

                <h2>

                    Loading Products...

                </h2>

            </div>

        );

    }


    /* =========================================================
       PAGE
    ========================================================= */

    return (

        <div className="products-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="products-header">

                <div>

                    <h1>

                        Product Management

                    </h1>

                    <p>

                        Manage marketplace products
                        and approvals.

                    </p>

                </div>


                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="products-summary">

                <p>

                    Total Products:

                    <strong>

                        {" "}
                        {products.length}

                    </strong>

                </p>


                <p>

                    Showing:

                    <strong>

                        {" "}
                        {filteredProducts.length}

                    </strong>

                </p>

            </div>


            {/* =================================================
                PRODUCTS TABLE
            ================================================= */}

            <div className="table-wrapper">

                <table className="products-table">

                    <thead>

                        <tr>

                            <th>
                                Image
                            </th>

                            <th>
                                Title
                            </th>

                            <th>
                                Seller
                            </th>

                            <th>
                                Category
                            </th>

                            <th>
                                Price
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {

                            filteredProducts.length === 0

                                ?

                                (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            style={{
                                                textAlign:
                                                    "center",
                                                padding:
                                                    "30px"
                                            }}
                                        >

                                            No products found.

                                        </td>

                                    </tr>

                                )

                                :

                                (

                                    filteredProducts.map(
                                        (product) => {

                                            const status =
                                                String(
                                                    product?.status ||
                                                    "pending"
                                                ).toLowerCase();


                                            const isProcessing =
                                                actionLoading ===
                                                product.id;


                                            return (

                                                <tr
                                                    key={
                                                        product.id
                                                    }
                                                >


                                                    {/* =========================
                                                        IMAGE
                                                    ========================= */}

                                                    <td>

                                                        <div
                                                            className="product-image-wrapper"
                                                        >

                                                            <img
                                                                src={
                                                                    getProductImage(
                                                                        product
                                                                    )
                                                                }
                                                                className="product-thumb"
                                                                alt={
                                                                    product.title ||
                                                                    product.name ||
                                                                    "Product"
                                                                }
                                                                loading="lazy"
                                                                onError={(
                                                                    event
                                                                ) =>
                                                                    handleImageError(
                                                                        event,
                                                                        product
                                                                    )
                                                                }
                                                            />

                                                        </div>

                                                    </td>


                                                    {/* =========================
                                                        TITLE
                                                    ========================= */}

                                                    <td>

                                                        {
                                                            product.title ||
                                                            product.name ||
                                                            "Untitled Product"
                                                        }

                                                    </td>


                                                    {/* =========================
                                                        SELLER
                                                    ========================= */}

                                                    <td>

                                                        {
                                                            product.seller?.name ||
                                                            product.user?.name ||
                                                            product.User?.name ||
                                                            "Unknown Seller"
                                                        }

                                                    </td>


                                                    {/* =========================
                                                        CATEGORY
                                                    ========================= */}

                                                    <td>

                                                        {
                                                            typeof product.category ===
                                                            "object"

                                                                ?

                                                                product.category?.name

                                                                :

                                                                product.category ||
                                                                "-"
                                                        }

                                                    </td>


                                                    {/* =========================
                                                        PRICE
                                                    ========================= */}

                                                    <td>

                                                        GH₵{" "}

                                                        {
                                                            Number(
                                                                product.price ||
                                                                0
                                                            ).toLocaleString(
                                                                "en-GH"
                                                            )
                                                        }

                                                    </td>


                                                    {/* =========================
                                                        STATUS
                                                    ========================= */}

                                                    <td>

                                                        {
                                                            renderStatus(
                                                                product.status
                                                            )
                                                        }

                                                    </td>


                                                    {/* =========================
                                                        ACTIONS
                                                    ========================= */}

                                                    <td
                                                        className="actions"
                                                    >

                                                        {/* VIEW */}

                                                        <button
                                                            className="view-btn"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/product/${product.id}`
                                                                )
                                                            }
                                                        >

                                                            View

                                                        </button>


                                                        {/* =====================
                                                            PENDING
                                                        ===================== */}

                                                        {
                                                            status ===
                                                            "pending" &&

                                                            <>

                                                                <button
                                                                    className="approve-btn"
                                                                    disabled={
                                                                        isProcessing
                                                                    }
                                                                    onClick={() =>
                                                                        approveProduct(
                                                                            product.id
                                                                        )
                                                                    }
                                                                >

                                                                    {
                                                                        isProcessing

                                                                            ?

                                                                            "Processing..."

                                                                            :

                                                                            "Approve"
                                                                    }

                                                                </button>


                                                                <button
                                                                    className="reject-btn"
                                                                    disabled={
                                                                        isProcessing
                                                                    }
                                                                    onClick={() =>
                                                                        rejectProduct(
                                                                            product.id
                                                                        )
                                                                    }
                                                                >

                                                                    Reject

                                                                </button>

                                                            </>

                                                        }


                                                        {/* =====================
                                                            APPROVED
                                                        ===================== */}

                                                        {
                                                            status ===
                                                            "approved" &&

                                                            <button
                                                                className="reject-btn"
                                                                disabled={
                                                                    isProcessing
                                                                }
                                                                onClick={() =>
                                                                    rejectProduct(
                                                                        product.id
                                                                    )
                                                                }
                                                            >

                                                                Reject

                                                            </button>

                                                        }


                                                        {/* =====================
                                                            REJECTED
                                                        ===================== */}

                                                        {
                                                            status ===
                                                            "rejected" &&

                                                            <button
                                                                className="approve-btn"
                                                                disabled={
                                                                    isProcessing
                                                                }
                                                                onClick={() =>
                                                                    approveProduct(
                                                                        product.id
                                                                    )
                                                                }
                                                            >

                                                                Approve

                                                            </button>

                                                        }


                                                        {/* =====================
                                                            DELETE
                                                        ===================== */}

                                                        <button
                                                            className="delete-btn"
                                                            disabled={
                                                                isProcessing
                                                            }
                                                            onClick={() =>
                                                                deleteProduct(
                                                                    product.id
                                                                )
                                                            }
                                                        >

                                                            Delete

                                                        </button>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )

                                )

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}


export default Products;
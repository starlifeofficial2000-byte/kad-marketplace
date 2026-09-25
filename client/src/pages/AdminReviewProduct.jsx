import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../config/axios";
import "./AdminReviewProduct.css";

/*
|--------------------------------------------------------------------------
| R2 / CDN CONFIGURATION
|--------------------------------------------------------------------------
| Product images stored in the database are usually filenames such as:
|
| 1789905008592-194091026.jpg
|
| They should be served from:
|
| https://cdn.kadmarket.com/uploads/1789905008592-194091026.jpg
|
| instead of:
|
| /uploads/1789905008592-194091026.jpg
|
*/

const CDN_URL = (
    import.meta.env.VITE_R2_PUBLIC_URL ||
    "https://cdn.kadmarket.com"
).replace(/\/+$/, "");

const FALLBACK_IMAGE = "/images/product-placeholder.png";


function AdminReviewProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);


    /* ========================================================================
       LOAD PRODUCT
    ======================================================================== */

    useEffect(() => {
        if (id) {
            loadProduct();
        }
    }, [id]);


    const loadProduct = async () => {
        try {
            setLoading(true);

            console.log("=================================");
            console.log("LOADING ADMIN PRODUCT");
            console.log("PRODUCT ID:", id);
            console.log("=================================");

            const response = await api.get(
                `/admin/products/${id}`
            );

            console.log(
                "PRODUCT RESPONSE:",
                response.data
            );

            const productData =
                response.data?.product ||
                response.data?.data ||
                response.data;

            if (!productData || !productData.id) {
                console.warn(
                    "Product data was not found."
                );

                setProduct(null);
                setImages([]);
                setSelectedImage(null);

                return;
            }

            setProduct(productData);


            /* --------------------------------------------------------------
               NORMALIZE PRODUCT IMAGES
            -------------------------------------------------------------- */

            const normalizedImages =
                normalizeImages(
                    productData.images,
                    productData.imageUrl,
                    productData.image
                );

            console.log(
                "NORMALIZED PRODUCT IMAGES:",
                normalizedImages
            );

            setImages(normalizedImages);

            if (normalizedImages.length > 0) {
                setSelectedImage(
                    normalizedImages[0]
                );
            } else {
                setSelectedImage(null);
            }

        } catch (error) {
            console.error(
                "LOAD PRODUCT ERROR:",
                error
            );

            console.error(
                "STATUS:",
                error.response?.status
            );

            console.error(
                "RESPONSE:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                "Unable to load product."
            );

            setProduct(null);
            setImages([]);
            setSelectedImage(null);

        } finally {
            setLoading(false);
        }
    };


    /* ========================================================================
       NORMALIZE PRODUCT IMAGES
    ======================================================================== */

    const normalizeImages = (
        productImages,
        imageUrl,
        singleImage
    ) => {

        /*
         * Collect possible image sources.
         *
         * Different versions of the backend may return:
         *
         * images: [...]
         * images: '["image1.jpg","image2.jpg"]'
         * imageUrl: 'image.jpg'
         * image: 'image.jpg'
         */

        let source = productImages;

        if (
            !source &&
            imageUrl
        ) {
            source = imageUrl;
        }

        if (
            !source &&
            singleImage
        ) {
            source = singleImage;
        }


        if (!source) {
            return [];
        }


        /* --------------------------------------------------------------
           ARRAY
        -------------------------------------------------------------- */

        if (Array.isArray(source)) {

            return source
                .flatMap((item) => {

                    if (!item) {
                        return [];
                    }

                    /*
                     * Sometimes array items can themselves contain
                     * JSON strings.
                     */

                    if (
                        typeof item === "string"
                    ) {
                        const value =
                            item.trim();

                        if (!value) {
                            return [];
                        }

                        try {
                            const parsed =
                                JSON.parse(value);

                            if (
                                Array.isArray(parsed)
                            ) {
                                return parsed;
                            }

                        } catch {
                            // Normal filename
                        }

                        return [value];
                    }

                    /*
                     * Handle object-style image records.
                     */

                    if (
                        typeof item === "object"
                    ) {

                        const objectImage =
                            item.url ||
                            item.imageUrl ||
                            item.path ||
                            item.filename ||
                            item.fileName;

                        return objectImage
                            ? [objectImage]
                            : [];
                    }

                    return [];
                })
                .filter(Boolean);
        }


        /* --------------------------------------------------------------
           STRING
        -------------------------------------------------------------- */

        if (
            typeof source === "string"
        ) {

            const value =
                source.trim();

            if (!value) {
                return [];
            }


            /*
             * JSON array:
             *
             * ["image1.jpg","image2.jpg"]
             */

            try {

                const parsed =
                    JSON.parse(value);

                if (
                    Array.isArray(parsed)
                ) {

                    return parsed
                        .flatMap((item) => {

                            if (!item) {
                                return [];
                            }

                            if (
                                typeof item ===
                                "object"
                            ) {

                                return [
                                    item.url ||
                                    item.imageUrl ||
                                    item.path ||
                                    item.filename ||
                                    item.fileName
                                ].filter(Boolean);
                            }

                            return [String(item)];
                        })
                        .filter(Boolean);
                }


                /*
                 * JSON object
                 */

                if (
                    parsed &&
                    typeof parsed ===
                    "object"
                ) {

                    const objectImage =
                        parsed.url ||
                        parsed.imageUrl ||
                        parsed.path ||
                        parsed.filename ||
                        parsed.fileName;

                    if (objectImage) {
                        return [objectImage];
                    }
                }

            } catch {
                // Not JSON. Continue.
            }


            /*
             * Comma-separated images
             */

            if (value.includes(",")) {

                const splitImages =
                    value
                        .split(",")
                        .map((item) =>
                            item.trim()
                        )
                        .filter(Boolean);

                if (
                    splitImages.length > 0
                ) {
                    return splitImages;
                }
            }


            /*
             * Single image
             */

            return [value];
        }


        return [];
    };


    /* ========================================================================
       GET PRODUCT IMAGE URL
    ======================================================================== */

    const getImageUrl = (image) => {

        if (!image) {
            return null;
        }


        let value = String(image).trim();

        if (!value) {
            return null;
        }


        /*
         * Remove quotes that may exist when an image value
         * comes from a JSON/string conversion.
         */

        value = value
            .replace(/^["']+|["']+$/g, "")
            .trim();

        if (!value) {
            return null;
        }


        /*
         * Already an external URL.
         *
         * Examples:
         *
         * https://cdn.kadmarket.com/uploads/image.jpg
         * https://example.com/image.jpg
         */

        if (
            /^https?:\/\//i.test(value)
        ) {
            return value;
        }


        /*
         * Data URLs.
         */

        if (
            /^data:image\//i.test(value)
        ) {
            return value;
        }


        /*
         * Remove leading slashes.
         */

        value = value.replace(
            /^\/+/,
            ""
        );


        /*
         * Remove old localhost/backend URL
         * if one somehow exists in the database.
         */

        value = value.replace(
            /^https?:\/\/[^/]+\/?/i,
            ""
        );


        /*
         * If the database already contains:
         *
         * uploads/image.jpg
         *
         * don't add uploads twice.
         */

        if (
            value.startsWith("uploads/")
        ) {
            return `${CDN_URL}/${value}`;
        }


        /*
         * If the database contains:
         *
         * /uploads/image.jpg
         *
         * this was already normalized above,
         * but this protects against unusual paths.
         */

        if (
            value.startsWith("uploads\\")
        ) {
            value =
                value.replace(
                    /^uploads[\\/]+/i,
                    ""
                );
        }


        /*
         * Normal database value:
         *
         * image.jpg
         *
         * becomes:
         *
         * https://cdn.kadmarket.com/uploads/image.jpg
         */

        return `${CDN_URL}/uploads/${value}`;
    };


    /* ========================================================================
       IMAGE ERROR HANDLER
    ======================================================================== */

    const handleImageError = (
        event,
        image
    ) => {

        const imageUrl =
            getImageUrl(image);

        console.error(
            "PRODUCT IMAGE FAILED:",
            {
                image,
                imageUrl
            }
        );


        /*
         * Prevent an infinite onError loop.
         */

        if (
            event.currentTarget.dataset.fallbackApplied ===
            "true"
        ) {
            return;
        }


        event.currentTarget.dataset.fallbackApplied =
            "true";

        event.currentTarget.src =
            FALLBACK_IMAGE;
    };


    /* ========================================================================
       APPROVE PRODUCT
    ======================================================================== */

    const approveProduct = async () => {

        const confirmed =
            window.confirm(
                "Are you sure you want to approve this product?"
            );

        if (!confirmed) {
            return;
        }


        try {

            setProcessing(true);

            await api.put(
                `/admin/products/${id}/approve`
            );

            alert(
                "Product approved successfully."
            );

            await loadProduct();

        } catch (error) {

            console.error(
                "APPROVE PRODUCT ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to approve product."
            );

        } finally {

            setProcessing(false);

        }
    };


    /* ========================================================================
       REJECT PRODUCT
    ======================================================================== */

    const rejectProduct = async () => {

        const reason =
            window.prompt(
                "Enter the reason for rejecting this product:"
            );

        if (
            !reason ||
            !reason.trim()
        ) {

            alert(
                "A rejection reason is required."
            );

            return;
        }


        try {

            setProcessing(true);

            await api.put(
                `/admin/products/${id}/reject`,
                {
                    reason: reason.trim()
                }
            );

            alert(
                "Product rejected successfully."
            );

            await loadProduct();

        } catch (error) {

            console.error(
                "REJECT PRODUCT ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to reject product."
            );

        } finally {

            setProcessing(false);

        }
    };


    /* ========================================================================
       DELETE PRODUCT
    ======================================================================== */

    const deleteProduct = async () => {

        const confirmed =
            window.confirm(
                "Delete this product permanently? This action cannot be undone."
            );

        if (!confirmed) {
            return;
        }


        try {

            setProcessing(true);

            await api.delete(
                `/admin/products/${id}`
            );

            alert(
                "Product deleted successfully."
            );

            navigate(
                "/admin/products"
            );

        } catch (error) {

            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete product."
            );

        } finally {

            setProcessing(false);

        }
    };


    /* ========================================================================
       SELLER
    ======================================================================== */

    const seller =
        product?.seller ||
        product?.Seller ||
        product?.User ||
        product?.user ||
        null;


    /* ========================================================================
       FORMAT PRICE
    ======================================================================== */

    const formatPrice = (price) => {

        const numericPrice =
            Number(price);

        if (
            Number.isNaN(
                numericPrice
            )
        ) {
            return "0";
        }

        return numericPrice.toLocaleString(
            "en-GH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    };


    /* ========================================================================
       FORMAT DATE
    ======================================================================== */

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "-";
        }

        return parsedDate.toLocaleDateString(
            "en-GH",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
    };


    /* ========================================================================
       STATUS
    ======================================================================== */

    const normalizedStatus =
        String(
            product?.status || ""
        ).toLowerCase();


    /* ========================================================================
       LOADING
    ======================================================================== */

    if (loading) {

        return (
            <div className="review-loading">

                <div className="review-loading-content">

                    <div className="review-spinner" />

                    <h2>
                        Loading Product...
                    </h2>

                    <p>
                        Please wait while the
                        product information is loaded.
                    </p>

                </div>

            </div>
        );
    }


    /* ========================================================================
       PRODUCT NOT FOUND
    ======================================================================== */

    if (!product) {

        return (
            <div className="review-not-found">

                <h2>
                    Product Not Found
                </h2>

                <p>
                    The product may have been
                    deleted or does not exist.
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/admin/products"
                        )
                    }
                >
                    ← Back to Products
                </button>

            </div>
        );
    }


    /* ========================================================================
       MAIN PAGE
    ======================================================================== */

    return (

        <div className="review-container">

            {/* ================================================================
                PAGE HEADER
            ================================================================ */}

            <div className="review-header">

                <div>

                    <button
                        type="button"
                        className="back-top-btn"
                        onClick={() =>
                            navigate(
                                "/admin/products"
                            )
                        }
                    >
                        ← Back to Products
                    </button>


                    <h1>
                        Review Product
                    </h1>


                    <p>
                        Review product information
                        and manage its marketplace status.
                    </p>

                </div>


                <span
                    className={`status-badge ${normalizedStatus}`}
                >
                    {product.status ||
                        "Unknown"}
                </span>

            </div>


            {/* ================================================================
                CONTENT
            ================================================================ */}

            <div className="review-content">


                {/* ============================================================
                    PRODUCT GALLERY
                ============================================================ */}

                <div className="gallery">

                    <div className="main-image-container">

                        {selectedImage ? (

                            <img
                                className="main-image"
                                src={getImageUrl(
                                    selectedImage
                                )}
                                alt={
                                    product.title ||
                                    "Product"
                                }
                                loading="eager"
                                onError={(event) =>
                                    handleImageError(
                                        event,
                                        selectedImage
                                    )
                                }
                            />

                        ) : (

                            <div className="no-image-box">

                                <div className="no-image-icon">
                                    📦
                                </div>

                                <p>
                                    No Product Image Available
                                </p>

                            </div>

                        )}

                    </div>


                    {/* ========================================================
                        THUMBNAILS
                    ======================================================== */}

                    {images.length > 1 && (

                        <div className="thumbs">

                            {images.map(
                                (image, index) => {

                                    const imageUrl =
                                        getImageUrl(
                                            image
                                        );

                                    return (

                                        <button
                                            type="button"
                                            key={`${image}-${index}`}
                                            className={
                                                selectedImage ===
                                                image
                                                    ? "thumbnail active-thumbnail"
                                                    : "thumbnail"
                                            }
                                            onClick={() =>
                                                setSelectedImage(
                                                    image
                                                )
                                            }
                                            title={`View image ${
                                                index + 1
                                            }`}
                                        >

                                            <img
                                                src={
                                                    imageUrl
                                                }
                                                alt={`Product ${
                                                    index + 1
                                                }`}
                                                loading="lazy"
                                                onError={(
                                                    event
                                                ) =>
                                                    handleImageError(
                                                        event,
                                                        image
                                                    )
                                                }
                                            />

                                        </button>

                                    );
                                }
                            )}

                        </div>

                    )}


                    {/* ========================================================
                        IMAGE COUNT
                    ======================================================== */}

                    {images.length > 0 && (

                        <div className="image-count">

                            {images.length}{" "}
                            {images.length === 1
                                ? "image"
                                : "images"}{" "}
                            available

                        </div>

                    )}

                </div>


                {/* ============================================================
                    PRODUCT INFORMATION
                ============================================================ */}

                <div className="review-info">


                    {/* ========================================================
                        TITLE + PRICE
                    ======================================================== */}

                    <div className="product-title-section">

                        <h1>
                            {product.title ||
                                "Untitled Product"}
                        </h1>


                        <h2>
                            GH₵{" "}
                            {formatPrice(
                                product.price
                            )}
                        </h2>

                    </div>


                    {/* ========================================================
                        PRODUCT INFORMATION
                    ======================================================== */}

                    <div className="details-card">

                        <h3>
                            Product Information
                        </h3>


                        <div className="details-grid">

                            <div className="detail-item">

                                <span>
                                    Category
                                </span>

                                <strong>
                                    {product.category ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Condition
                                </span>

                                <strong>
                                    {product.condition ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Location
                                </span>

                                <strong>
                                    {product.location ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Status
                                </span>

                                <strong>
                                    {product.status ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Date Posted
                                </span>

                                <strong>
                                    {formatDate(
                                        product.createdAt
                                    )}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Product ID
                                </span>

                                <strong>
                                    #{product.id}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* ========================================================
                        SELLER INFORMATION
                    ======================================================== */}

                    <div className="details-card">

                        <h3>
                            Seller Information
                        </h3>


                        <div className="details-grid">

                            <div className="detail-item">

                                <span>
                                    Seller Name
                                </span>

                                <strong>
                                    {seller?.name ||
                                        seller?.fullName ||
                                        seller?.username ||
                                        "Unknown"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Email
                                </span>

                                <strong>
                                    {seller?.email ||
                                        "-"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Phone
                                </span>

                                <strong>
                                    {seller?.phone ||
                                        seller?.phoneNumber ||
                                        "-"}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* ========================================================
                        DESCRIPTION
                    ======================================================== */}

                    <div className="description-card">

                        <h3>
                            Description
                        </h3>


                        <p>
                            {product.description ||
                                "No description provided."}
                        </p>

                    </div>


                    {/* ========================================================
                        REJECTION REASON
                    ======================================================== */}

                    {normalizedStatus ===
                        "rejected" &&
                        product.rejectionReason && (

                            <div className="rejection-card">

                                <h3>
                                    Rejection Reason
                                </h3>

                                <p>
                                    {
                                        product.rejectionReason
                                    }
                                </p>

                            </div>

                        )}


                    {/* ========================================================
                        ACTION BUTTONS
                    ======================================================== */}

                    <div className="review-buttons">


                        {/* APPROVE */}

                        {normalizedStatus !==
                            "approved" && (

                                <button
                                    type="button"
                                    className="approve"
                                    onClick={
                                        approveProduct
                                    }
                                    disabled={
                                        processing
                                    }
                                >

                                    {processing
                                        ? "Processing..."
                                        : "✓ Approve Product"}

                                </button>

                            )}


                        {/* REJECT */}

                        {normalizedStatus !==
                            "rejected" && (

                                <button
                                    type="button"
                                    className="reject"
                                    onClick={
                                        rejectProduct
                                    }
                                    disabled={
                                        processing
                                    }
                                >

                                    {processing
                                        ? "Processing..."
                                        : "✕ Reject Product"}

                                </button>

                            )}


                        {/* DELETE */}

                        <button
                            type="button"
                            className="delete"
                            onClick={
                                deleteProduct
                            }
                            disabled={
                                processing
                            }
                        >
                            🗑 Delete Product
                        </button>


                        {/* BACK */}

                        <button
                            type="button"
                            className="back"
                            onClick={() =>
                                navigate(
                                    "/admin/products"
                                )
                            }
                            disabled={
                                processing
                            }
                        >
                            ← Back
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default AdminReviewProduct;
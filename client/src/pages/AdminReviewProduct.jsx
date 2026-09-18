import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../config/axios";
import "./AdminReviewProduct.css";

function AdminReviewProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    /* ==========================================
       LOAD PRODUCT
    ========================================== */

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);

            console.log("Loading product ID:", id);

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
                setProduct(null);
                return;
            }

            setProduct(productData);

            // Normalize images
            const normalizedImages =
                normalizeImages(productData.images);

            setImages(normalizedImages);

            if (normalizedImages.length > 0) {
                setSelectedImage(normalizedImages[0]);
            }

        } catch (error) {
            console.error(
                "LOAD PRODUCT ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to load product."
            );

            setProduct(null);

        } finally {
            setLoading(false);
        }
    };


    /* ==========================================
       NORMALIZE PRODUCT IMAGES
    ========================================== */

    const normalizeImages = (productImages) => {
        if (!productImages) {
            return [];
        }

        // Already an array
        if (Array.isArray(productImages)) {
            return productImages.filter(Boolean);
        }

        // JSON string or single filename
        if (typeof productImages === "string") {
            try {
                const parsed = JSON.parse(productImages);

                if (Array.isArray(parsed)) {
                    return parsed.filter(Boolean);
                }

                return [productImages];

            } catch {
                return [productImages];
            }
        }

        return [];
    };


    /* ==========================================
       GET IMAGE URL
    ========================================== */

    const getImageUrl = (image) => {
        if (!image) {
            return null;
        }

        // Already a complete URL
        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        // Remove /uploads/ if already included
        if (image.startsWith("/uploads/")) {
            return `${image}`;
        }

        return `/uploads/${image}`;
    };


    /* ==========================================
       APPROVE PRODUCT
    ========================================== */

    const approveProduct = async () => {
        const confirmed = window.confirm(
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


    /* ==========================================
       REJECT PRODUCT
    ========================================== */

    const rejectProduct = async () => {
        const reason = window.prompt(
            "Enter the reason for rejecting this product:"
        );

        if (!reason || !reason.trim()) {
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


    /* ==========================================
       DELETE PRODUCT
    ========================================== */

    const deleteProduct = async () => {
        const confirmed = window.confirm(
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

            navigate("/admin/products");

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


    /* ==========================================
       GET SELLER
    ========================================== */

    const seller =
        product?.seller ||
        product?.User ||
        product?.user ||
        null;


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {
        return (
            <div className="review-loading">
                <h2>Loading Product...</h2>
            </div>
        );
    }


    /* ==========================================
       PRODUCT NOT FOUND
    ========================================== */

    if (!product) {
        return (
            <div className="review-not-found">

                <h2>Product Not Found</h2>

                <p>
                    The product may have been deleted
                    or does not exist.
                </p>

                <button
                    onClick={() =>
                        navigate("/admin/products")
                    }
                >
                    ← Back to Products
                </button>

            </div>
        );
    }


    /* ==========================================
       MAIN PAGE
    ========================================== */

    return (
        <div className="review-container">

            {/* =====================================
                PAGE HEADER
            ===================================== */}

            <div className="review-header">

                <div>

                    <button
                        className="back-top-btn"
                        onClick={() =>
                            navigate("/admin/products")
                        }
                    >
                        ← Back to Products
                    </button>

                    <h1>
                        Review Product
                    </h1>

                    <p>
                        Review product information and
                        manage its marketplace status.
                    </p>

                </div>

                <span
                    className={`status-badge ${String(
                        product.status || ""
                    ).toLowerCase()}`}
                >
                    {product.status || "Unknown"}
                </span>

            </div>


            <div className="review-content">


                {/* =====================================
                    PRODUCT GALLERY
                ===================================== */}

                <div className="gallery">

                    <div className="main-image-container">

                        {selectedImage ? (

                            <img
                                className="main-image"
                                src={getImageUrl(selectedImage)}
                                alt={product.title || "Product"}
                                onError={(e) => {
                                    console.error(
                                        "IMAGE FAILED:",
                                        selectedImage
                                    );

                                    e.currentTarget.style.display =
                                        "none";
                                }}
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


                    {/* THUMBNAILS */}

                    {images.length > 1 && (

                        <div className="thumbs">

                            {images.map(
                                (image, index) => (

                                    <button
                                        type="button"
                                        key={`${image}-${index}`}
                                        className={
                                            selectedImage === image
                                                ? "thumbnail active-thumbnail"
                                                : "thumbnail"
                                        }
                                        onClick={() =>
                                            setSelectedImage(image)
                                        }
                                    >

                                        <img
                                            src={getImageUrl(image)}
                                            alt={`Product ${index + 1}`}
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />

                                    </button>

                                )
                            )}

                        </div>

                    )}

                </div>


                {/* =====================================
                    PRODUCT INFORMATION
                ===================================== */}

                <div className="review-info">

                    <div className="product-title-section">

                        <h1>
                            {product.title || "Untitled Product"}
                        </h1>

                        <h2>
                            GH₵{" "}
                            {Number(
                                product.price || 0
                            ).toLocaleString()}
                        </h2>

                    </div>


                    {/* PRODUCT DETAILS */}

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
                                    {product.category || "-"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Condition
                                </span>

                                <strong>
                                    {product.condition || "-"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Location
                                </span>

                                <strong>
                                    {product.location || "-"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Status
                                </span>

                                <strong>
                                    {product.status || "-"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Date Posted
                                </span>

                                <strong>

                                    {product.createdAt
                                        ? new Date(
                                            product.createdAt
                                        ).toLocaleDateString()
                                        : "-"
                                    }

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


                    {/* SELLER INFORMATION */}

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
                                    {seller?.name || "Unknown"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Email
                                </span>

                                <strong>
                                    {seller?.email || "-"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Phone
                                </span>

                                <strong>
                                    {seller?.phone || "-"}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* DESCRIPTION */}

                    <div className="description-card">

                        <h3>
                            Description
                        </h3>

                        <p>
                            {product.description ||
                                "No description provided."
                            }
                        </p>

                    </div>


                    {/* REJECTION REASON */}

                    {product.status === "Rejected" &&
                        product.rejectionReason && (

                        <div className="rejection-card">

                            <h3>
                                Rejection Reason
                            </h3>

                            <p>
                                {product.rejectionReason}
                            </p>

                        </div>

                    )}


                    {/* =====================================
                        ACTION BUTTONS
                    ===================================== */}

                    <div className="review-buttons">

                        {String(
                            product.status || ""
                        ).toLowerCase() !== "approved" && (

                            <button
                                className="approve"
                                onClick={approveProduct}
                                disabled={processing}
                            >
                                {processing
                                    ? "Processing..."
                                    : "✓ Approve Product"
                                }
                            </button>

                        )}


                        {String(
                            product.status || ""
                        ).toLowerCase() !== "rejected" && (

                            <button
                                className="reject"
                                onClick={rejectProduct}
                                disabled={processing}
                            >
                                {processing
                                    ? "Processing..."
                                    : "✕ Reject Product"
                                }
                            </button>

                        )}


                        <button
                            className="delete"
                            onClick={deleteProduct}
                            disabled={processing}
                        >
                            🗑 Delete Product
                        </button>


                        <button
                            className="back"
                            onClick={() =>
                                navigate("/admin/products")
                            }
                            disabled={processing}
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
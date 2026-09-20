import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./HeroBanners.css";

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "https://kad-marketplace-production.up.railway.app";

const INITIAL_FORM_DATA = {
    title: "",
    subtitle: "",
    description: "",
    buttonText: "Shop Now",
    link: "",
    priority: 1,
    startDate: "",
    endDate: "",
};

function HeroBanners() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [banners, setBanners] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    /* =====================================================
       IMAGE URL
    ===================================================== */

    const getImageUrl = (imagePath) => {
        if (!imagePath || typeof imagePath !== "string") {
            return "";
        }

        const cleanPath = imagePath.trim();

        if (!cleanPath) {
            return "";
        }

        // Already a complete URL
        if (
            cleanPath.startsWith("http://") ||
            cleanPath.startsWith("https://")
        ) {
            return cleanPath;
        }

        // /uploads/image.jpg
        if (cleanPath.startsWith("/uploads/")) {
            return `${SERVER_URL}${cleanPath}`;
        }

        // uploads/image.jpg
        if (cleanPath.startsWith("uploads/")) {
            return `${SERVER_URL}/${cleanPath}`;
        }

        // Any other absolute path
        if (cleanPath.startsWith("/")) {
            return `${SERVER_URL}${cleanPath}`;
        }

        // Plain filename
        return `${SERVER_URL}/uploads/${cleanPath}`;
    };

    /* =====================================================
       LOAD BANNERS
    ===================================================== */

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                "/admin/home-builder/banners"
            );

            console.log(
                "HERO BANNERS RESPONSE:",
                response.data
            );

            const bannerData =
                response.data?.banners ??
                response.data?.data ??
                response.data ??
                [];

            const bannersArray = Array.isArray(bannerData)
                ? bannerData
                : [];

            console.log(
                "HERO BANNERS ARRAY:",
                bannersArray
            );

            bannersArray.forEach((banner) => {
                console.log(
                    "HERO BANNER:",
                    banner.title,
                    "IMAGE:",
                    banner.image,
                    "IMAGE URL:",
                    getImageUrl(banner.image)
                );
            });

            setBanners(bannersArray);
        } catch (error) {
            console.error(
                "LOAD BANNERS ERROR:",
                error
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );

            setBanners([]);

            alert(
                error.response?.data?.message ||
                    "Unable to load hero banners."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       RESET
    ===================================================== */

    const resetForm = () => {
        if (preview && preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }

        setEditingBanner(null);
        setImage(null);
        setPreview("");
        setFormData({
            ...INITIAL_FORM_DATA,
        });
    };

    /* =====================================================
       CREATE MODAL
    ===================================================== */

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    /* =====================================================
       EDIT MODAL
    ===================================================== */

    const openEditModal = (banner) => {
        setEditingBanner(banner);

        setImage(null);

        if (banner.image) {
            setPreview(getImageUrl(banner.image));
        } else {
            setPreview("");
        }

        setFormData({
            title: banner.title || "",
            subtitle: banner.subtitle || "",
            description: banner.description || "",
            buttonText: banner.buttonText || "Shop Now",
            link: banner.link || "",
            priority: banner.priority || 1,
            startDate: banner.startDate
                ? String(banner.startDate).substring(0, 10)
                : "",
            endDate: banner.endDate
                ? String(banner.endDate).substring(0, 10)
                : "",
        });

        setShowModal(true);
    };

    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    const closeModal = () => {
        if (preview && preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }

        setShowModal(false);
        resetForm();
    };

    /* =====================================================
       TEXT INPUT
    ===================================================== */

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /* =====================================================
       IMAGE SELECTION
    ===================================================== */

    const handleImage = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        console.log("SELECTED BANNER IMAGE:", {
            name: file.name,
            type: file.type,
            size: file.size,
            file,
        });

        // Allowed types
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert(
                "Please select a JPG, JPEG, PNG or WEBP image."
            );

            event.target.value = "";
            return;
        }

        // 5MB maximum
        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            alert(
                "Banner image must be 5MB or smaller."
            );

            event.target.value = "";
            return;
        }

        // Remove previous object URL
        if (preview && preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }

        // Store the REAL File object
        setImage(file);

        // Create local preview
        const objectUrl = URL.createObjectURL(file);

        setPreview(objectUrl);

        console.log(
            "BANNER FILE STORED:",
            file.name
        );
    };

    /* =====================================================
       CREATE / UPDATE BANNER
    ===================================================== */

    const handleSubmit = async (event) => {
        event.preventDefault();

        // New banner MUST have an image
        if (!editingBanner && !image) {
            alert(
                "Please select a banner image before creating the banner."
            );
            return;
        }

        try {
            setSaving(true);

            const data = new FormData();

            data.append(
                "title",
                formData.title.trim()
            );

            data.append(
                "subtitle",
                formData.subtitle.trim()
            );

            data.append(
                "description",
                formData.description.trim()
            );

            data.append(
                "buttonText",
                formData.buttonText.trim()
            );

            data.append(
                "link",
                formData.link.trim()
            );

            data.append(
                "priority",
                String(formData.priority)
            );

            if (formData.startDate) {
                data.append(
                    "startDate",
                    formData.startDate
                );
            }

            if (formData.endDate) {
                data.append(
                    "endDate",
                    formData.endDate
                );
            }

            // IMPORTANT:
            // Append the actual File object.
            if (image instanceof File) {
                data.append(
                    "image",
                    image,
                    image.name
                );
            }

            /* =================================================
               DEBUG FOR UPLOAD
            ================================================= */

            console.log(
                "========== BANNER UPLOAD DEBUG =========="
            );

            console.log(
                "EDITING:",
                Boolean(editingBanner)
            );

            console.log(
                "IMAGE STATE:",
                image
            );

            console.log(
                "IMAGE NAME:",
                image?.name
            );

            console.log(
                "IMAGE TYPE:",
                image?.type
            );

            console.log(
                "IMAGE SIZE:",
                image?.size
            );

            console.log(
                "FORMDATA IMAGE:",
                data.get("image")
            );

            console.log(
                "FORMDATA IMAGE NAME:",
                data.get("image")?.name
            );

            console.log(
                "FORMDATA IMAGE TYPE:",
                data.get("image")?.type
            );

            console.log(
                "FORMDATA IMAGE SIZE:",
                data.get("image")?.size
            );

            console.log(
                "=========================================="
            );

            let response;

            /* =================================================
               UPDATE
            ================================================= */

            if (editingBanner) {
                response = await api.put(
                    `/admin/home-builder/banners/${editingBanner.id}`,
                    data,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

                console.log(
                    "UPDATE BANNER RESPONSE:",
                    response.data
                );

                alert(
                    "Banner updated successfully."
                );
            }

            /* =================================================
               CREATE
            ================================================= */

            else {
                response = await api.post(
                    "/admin/home-builder/banners",
                    data,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

                console.log(
                    "CREATE BANNER RESPONSE:",
                    response.data
                );

                alert(
                    "Banner created successfully."
                );
            }

            closeModal();

            await loadBanners();
        } catch (error) {
            console.error(
                "SAVE BANNER ERROR:",
                error
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                    "Unable to save banner."
            );
        } finally {
            setSaving(false);
        }
    };

    /* =====================================================
       DELETE
    ===================================================== */

    const deleteBanner = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this banner?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/admin/home-builder/banners/${id}`
            );

            alert(
                "Banner deleted successfully."
            );

            await loadBanners();
        } catch (error) {
            console.error(
                "DELETE BANNER ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                    "Unable to delete banner."
            );
        }
    };

    /* =====================================================
       TOGGLE STATUS
    ===================================================== */

    const toggleBanner = async (id) => {
        try {
            const response = await api.patch(
                `/admin/home-builder/banners/${id}/status`,
                {}
            );

            console.log(
                "STATUS RESPONSE:",
                response.data
            );

            await loadBanners();
        } catch (error) {
            console.error(
                "TOGGLE STATUS ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                    "Unable to update banner status."
            );
        }
    };

    /* =====================================================
       REJECT
    ===================================================== */

    const rejectBanner = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to reject this banner?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.patch(
                `/admin/home-builder/banners/${id}/reject`,
                {}
            );

            alert(
                "Banner rejected successfully."
            );

            await loadBanners();
        } catch (error) {
            console.error(
                "REJECT BANNER ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                    "Unable to reject banner."
            );
        }
    };

    /* =====================================================
       STATUS CLASS
    ===================================================== */

    const getStatusClass = (status) => {
        return String(
            status || "Unknown"
        )
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="hero-banners">
                <h3>
                    Loading banners...
                </h3>
            </div>
        );
    }

    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="hero-banners">

            {/* HEADER */}

            <div className="hero-header">

                <div>
                    <h2>
                        Hero Banner Manager
                    </h2>

                    <p>
                        Manage the banners displayed on your homepage.
                    </p>
                </div>

                <button
                    className="add-banner-btn"
                    onClick={openCreateModal}
                    type="button"
                >
                    + Add Banner
                </button>

            </div>

            {/* MODAL */}

            {showModal && (
                <div className="modal-overlay">

                    <div className="banner-modal">

                        <h2>
                            {editingBanner
                                ? "Edit Hero Banner"
                                : "Create Hero Banner"}
                        </h2>

                        <form
                            className="hero-form"
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                        >

                            {/* TITLE */}

                            <input
                                type="text"
                                name="title"
                                placeholder="Banner Title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />

                            {/* SUBTITLE */}

                            <input
                                type="text"
                                name="subtitle"
                                placeholder="Subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                            />

                            {/* DESCRIPTION */}

                            <textarea
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleChange}
                            />

                            {/* BUTTON TEXT */}

                            <input
                                type="text"
                                name="buttonText"
                                placeholder="Button Text"
                                value={formData.buttonText}
                                onChange={handleChange}
                            />

                            {/* LINK */}

                            <input
                                type="text"
                                name="link"
                                placeholder="Button Link"
                                value={formData.link}
                                onChange={handleChange}
                            />

                            {/* PRIORITY */}

                            <input
                                type="number"
                                name="priority"
                                placeholder="Priority"
                                min="1"
                                value={formData.priority}
                                onChange={handleChange}
                            />

                            {/* START DATE */}

                            <label>
                                Start Date
                            </label>

                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                            />

                            {/* END DATE */}

                            <label>
                                End Date
                            </label>

                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                            />

                            {/* IMAGE */}

                            <label className="image-upload-label">
                                Banner Image
                            </label>

                            <input
                                type="file"
                                name="image"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImage}
                            />

                            {/* SELECTED FILE */}

                            {image && (
                                <div className="selected-image-info">
                                    <strong>
                                        Selected:
                                    </strong>{" "}
                                    {image.name}

                                    <br />

                                    <small>
                                        {image.type} •{" "}
                                        {(
                                            image.size /
                                            1024 /
                                            1024
                                        ).toFixed(2)}{" "}
                                        MB
                                    </small>
                                </div>
                            )}

                            {/* PREVIEW */}

                            {preview && (
                                <div className="banner-preview-wrapper">

                                    <img
                                        src={preview}
                                        alt="Banner preview"
                                        className="banner-preview"
                                        onLoad={() => {
                                            console.log(
                                                "BANNER PREVIEW LOADED:",
                                                preview
                                            );
                                        }}
                                        onError={(event) => {
                                            console.error(
                                                "BANNER PREVIEW FAILED:",
                                                event.currentTarget.src
                                            );
                                        }}
                                    />

                                </div>
                            )}

                            {/* BUTTONS */}

                            <div className="modal-buttons">

                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Uploading..."
                                        : editingBanner
                                            ? "Update Banner"
                                            : "Create Banner"}
                                </button>

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* BANNER LIST */}

            <div className="banner-grid">

                {banners.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No Hero Banners
                        </h3>

                        <p>
                            Click "+ Add Banner" to create your first homepage banner.
                        </p>

                    </div>

                ) : (

                    banners.map((banner) => {

                        const imageUrl =
                            getImageUrl(
                                banner.image
                            );

                        return (
                            <div
                                className="banner-card"
                                key={banner.id}
                            >

                                {/* IMAGE */}

                                <div className="banner-image-container">

                                    {imageUrl ? (

                                        <img
                                            src={imageUrl}
                                            alt={
                                                banner.title ||
                                                "Hero Banner"
                                            }
                                            className="hero-banner-image"
                                            loading="lazy"
                                            onLoad={() => {
                                                console.log(
                                                    "HERO BANNER IMAGE LOADED:",
                                                    imageUrl
                                                );
                                            }}
                                            onError={(event) => {
                                                console.error(
                                                    "HERO BANNER IMAGE FAILED:",
                                                    imageUrl
                                                );

                                                event.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />

                                    ) : (

                                        <div className="no-banner-image">
                                            No Image
                                        </div>

                                    )}

                                </div>

                                {/* INFO */}

                                <div className="banner-info">

                                    <h3>
                                        {banner.title ||
                                            "Untitled Banner"}
                                    </h3>

                                    {banner.subtitle && (
                                        <p>
                                            {banner.subtitle}
                                        </p>
                                    )}

                                    <span
                                        className={`status ${getStatusClass(
                                            banner.status
                                        )}`}
                                    >
                                        {banner.status ||
                                            "Unknown"}
                                    </span>

                                    <div className="banner-actions">

                                        <button
                                            type="button"
                                            className="edit-btn"
                                            onClick={() =>
                                                openEditModal(
                                                    banner
                                                )
                                            }
                                        >
                                            ✏ Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="status-btn"
                                            onClick={() =>
                                                toggleBanner(
                                                    banner.id
                                                )
                                            }
                                        >
                                            {String(
                                                banner.status ||
                                                    ""
                                            ).toLowerCase() ===
                                            "running"
                                                ? "Pause"
                                                : "Run"}
                                        </button>

                                        <button
                                            type="button"
                                            className="reject-btn"
                                            onClick={() =>
                                                rejectBanner(
                                                    banner.id
                                                )
                                            }
                                        >
                                            Reject
                                        </button>

                                        <button
                                            type="button"
                                            className="delete-btn"
                                            onClick={() =>
                                                deleteBanner(
                                                    banner.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>
                        );
                    })

                )}

            </div>

        </div>
    );
}

export default HeroBanners;
import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./HeroBanners.css";

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "https://kad-marketplace-production.up.railway.app";

const initialFormData = {
    title: "",
    subtitle: "",
    description: "",
    buttonText: "Shop Now",
    link: "",
    priority: 1,
    startDate: "",
    endDate: ""
};

function HeroBanners() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [banners, setBanners] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    const [preview, setPreview] = useState("");
    const [image, setImage] = useState(null);

    const [formData, setFormData] = useState(initialFormData);

    /* ==========================================
       IMAGE URL HELPER
    ========================================== */

    const getImageUrl = (imagePath) => {
        if (!imagePath || typeof imagePath !== "string") {
            return "";
        }

        const cleanPath = imagePath.trim();

        if (!cleanPath) {
            return "";
        }

        // Already a full URL
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

        // /image.jpg
        if (cleanPath.startsWith("/")) {
            return `${SERVER_URL}${cleanPath}`;
        }

        // Plain filename
        return `${SERVER_URL}/uploads/${cleanPath}`;
    };

    /* ==========================================
       LOAD BANNERS
    ========================================== */

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
                response.data?.banners ||
                response.data?.data ||
                response.data ||
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

            alert(
                error.response?.data?.message ||
                "Unable to load hero banners."
            );

            setBanners([]);
        } finally {
            setLoading(false);
        }
    };

    /* ==========================================
       RESET FORM
    ========================================== */

    const resetForm = () => {
        setEditingBanner(null);
        setImage(null);
        setPreview("");
        setFormData({
            ...initialFormData
        });
    };

    /* ==========================================
       OPEN CREATE MODAL
    ========================================== */

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    /* ==========================================
       OPEN EDIT MODAL
    ========================================== */

    const openEditModal = (banner) => {
        setEditingBanner(banner);

        setImage(null);

        setPreview(
            getImageUrl(banner.image)
        );

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
                : ""
        });

        setShowModal(true);
    };

    /* ==========================================
       CLOSE MODAL
    ========================================== */

    const closeModal = () => {
        if (preview && preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }

        setShowModal(false);
        resetForm();
    };

    /* ==========================================
       HANDLE INPUT
    ========================================== */

    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    /* ==========================================
       HANDLE IMAGE
    ========================================== */

    const handleImage = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert(
                "Please select a valid image file."
            );

            event.target.value = "";
            return;
        }

        if (preview && preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }

        setImage(file);

        const imagePreview =
            URL.createObjectURL(file);

        setPreview(imagePreview);

        console.log(
            "SELECTED BANNER IMAGE:",
            file.name,
            file.type,
            file.size
        );
    };

    /* ==========================================
       CREATE / UPDATE
    ========================================== */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!editingBanner && !image) {
            alert(
                "Please select a banner image."
            );

            return;
        }

        try {
            setSaving(true);

            const data = new FormData();

            data.append(
                "title",
                formData.title
            );

            data.append(
                "subtitle",
                formData.subtitle
            );

            data.append(
                "description",
                formData.description
            );

            data.append(
                "buttonText",
                formData.buttonText
            );

            data.append(
                "link",
                formData.link
            );

            data.append(
                "priority",
                String(formData.priority)
            );

            data.append(
                "startDate",
                formData.startDate
            );

            data.append(
                "endDate",
                formData.endDate
            );

            if (image) {
                data.append(
                    "image",
                    image
                );
            }

            console.log(
                "SAVING HERO BANNER",
                {
                    editing: Boolean(editingBanner),
                    id: editingBanner?.id,
                    image: image?.name
                }
            );

            let response;

            if (editingBanner) {
                response = await api.put(
                    `/admin/home-builder/banners/${editingBanner.id}`,
                    data
                );

                console.log(
                    "UPDATE BANNER RESPONSE:",
                    response.data
                );

                alert(
                    "Banner updated successfully."
                );
            } else {
                response = await api.post(
                    "/admin/home-builder/banners",
                    data
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

    /* ==========================================
       DELETE
    ========================================== */

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

    /* ==========================================
       TOGGLE STATUS
    ========================================== */

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

    /* ==========================================
       REJECT
    ========================================== */

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

    /* ==========================================
       STATUS CLASS
    ========================================== */

    const getStatusClass = (status) => {
        return String(
            status || "Unknown"
        )
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {
        return (
            <div className="hero-banners">
                <h3>
                    Loading banners...
                </h3>
            </div>
        );
    }

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
                        >

                            <input
                                type="text"
                                name="title"
                                placeholder="Banner Title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="text"
                                name="subtitle"
                                placeholder="Subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                            />

                            <textarea
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="buttonText"
                                placeholder="Button Text"
                                value={formData.buttonText}
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="link"
                                placeholder="Button Link"
                                value={formData.link}
                                onChange={handleChange}
                            />

                            <input
                                type="number"
                                name="priority"
                                placeholder="Priority"
                                min="1"
                                value={formData.priority}
                                onChange={handleChange}
                            />

                            <label>
                                Start Date
                            </label>

                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                            />

                            <label>
                                End Date
                            </label>

                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                            />

                            <input
                                type="file"
                                name="image"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleImage}
                            />

                            {preview && (
                                <img
                                    src={preview}
                                    alt="Banner preview"
                                    className="banner-preview"
                                    onError={(event) => {
                                        console.error(
                                            "BANNER PREVIEW FAILED:",
                                            event.currentTarget.src
                                        );
                                    }}
                                />
                            )}

                            <div className="modal-buttons">

                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
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
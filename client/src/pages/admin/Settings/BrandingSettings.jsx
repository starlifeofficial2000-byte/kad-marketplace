import { useState } from "react";
import api from "../../../config/axios";
import "./BrandingSettings.css";

const DEFAULT_CDN_URL =
    "https://cdn.kadmarket.com";

const FALLBACK_IMAGE =
    "/images/product-placeholder.png";

function BrandingSettings({ settings, loadSettings }) {
    const [uploading, setUploading] = useState({
        logo: false,
        admin_logo: false,
        favicon: false,
    });

    const [deleting, setDeleting] = useState({
        logo: false,
        admin_logo: false,
        favicon: false,
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    /*
    =========================================================
       GET IMAGE URL
    =========================================================
    */

    const getImageUrl = (value) => {
        if (!value) {
            return null;
        }

        const image = String(value).trim();

        if (!image) {
            return null;
        }

        /*
         * Already a complete URL.
         */
        if (
            image.startsWith("http://") ||
            image.startsWith("https://") ||
            image.startsWith("blob:") ||
            image.startsWith("data:")
        ) {
            return image;
        }

        /*
         * Local frontend assets.
         */
        if (
            image.startsWith("/images/") ||
            image.startsWith("/assets/")
        ) {
            return image;
        }

        /*
         * R2 key.
         */
        const normalizedKey = image
            .replace(/^\/+/, "")
            .replace(/\\/g, "/");

        const r2Key = normalizedKey.startsWith("uploads/")
            ? normalizedKey
            : `uploads/${normalizedKey}`;

        return `${DEFAULT_CDN_URL}/${r2Key
            .split("/")
            .map((part) => encodeURIComponent(part))
            .join("/")}`;
    };

    /*
    =========================================================
       SHOW MESSAGE
    =========================================================
    */

    const showMessage = (message, type = "success") => {
        setMessage(message);
        setMessageType(type);
    };

    /*
    =========================================================
       UPLOAD BRANDING
    =========================================================
    */

    const handleUpload = async (type, file) => {
        if (!file) {
            return;
        }

        /*
         * Client-side size validation.
         */
        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            showMessage(
                "Image must be smaller than 5 MB.",
                "error"
            );

            return;
        }

        /*
         * Client-side type validation.
         */
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/x-icon",
            "image/vnd.microsoft.icon",
        ];

        if (!allowedTypes.includes(file.type)) {
            showMessage(
                "Only JPG, JPEG, PNG, WEBP, and ICO files are allowed.",
                "error"
            );

            return;
        }

        const formData = new FormData();

        formData.append(
            "image",
            file
        );

        formData.append(
            "type",
            type
        );

        try {
            setUploading((previous) => ({
                ...previous,
                [type]: true,
            }));

            setMessage("");

            const response = await api.post(
                "/admin/settings/branding/upload",
                formData
            );

            if (response.data?.success) {
                showMessage(
                    response.data.message ||
                        `${type.replace(
                            "_",
                            " "
                        )} uploaded successfully.`,
                    "success"
                );

                if (loadSettings) {
                    await loadSettings();
                }
            } else {
                showMessage(
                    response.data?.message ||
                        "Branding upload failed.",
                    "error"
                );
            }
        } catch (error) {
            console.error(
                "UPLOAD BRANDING ERROR:",
                error
            );

            showMessage(
                error.response?.data?.message ||
                    "Failed to upload branding image.",
                "error"
            );
        } finally {
            setUploading((previous) => ({
                ...previous,
                [type]: false,
            }));
        }
    };

    /*
    =========================================================
       DELETE BRANDING
    =========================================================
    */

    const handleDelete = async (type) => {
        const displayName = type.replace(
            "_",
            " "
        );

        const confirmed = window.confirm(
            `Are you sure you want to remove the ${displayName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting((previous) => ({
                ...previous,
                [type]: true,
            }));

            setMessage("");

            const response = await api.delete(
                `/admin/settings/branding/${type}`
            );

            if (response.data?.success) {
                showMessage(
                    response.data.message ||
                        `${displayName} deleted successfully.`,
                    "success"
                );

                if (loadSettings) {
                    await loadSettings();
                }
            } else {
                showMessage(
                    response.data?.message ||
                        "Failed to delete branding.",
                    "error"
                );
            }
        } catch (error) {
            console.error(
                "DELETE BRANDING ERROR:",
                error
            );

            showMessage(
                error.response?.data?.message ||
                    "Failed to delete branding image.",
                "error"
            );
        } finally {
            setDeleting((previous) => ({
                ...previous,
                [type]: false,
            }));
        }
    };

    /*
    =========================================================
       BRANDING CARD
    =========================================================
    */

    const BrandingItem = ({
        type,
        title,
        description,
        accept,
    }) => {
        const filename =
            settings?.[type];

        const imageUrl =
            getImageUrl(filename);

        const isUploading =
            uploading[type];

        const isDeleting =
            deleting[type];

        return (
            <div className="branding-item">

                <div className="branding-info">
                    <h3>
                        {title}
                    </h3>

                    <p>
                        {description}
                    </p>
                </div>

                <div className="branding-preview">

                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                    FALLBACK_IMAGE;
                            }}
                        />
                    ) : (
                        <div className="no-image">
                            No Image
                        </div>
                    )}

                </div>

                <div className="branding-actions">

                    <label
                        className={`upload-button ${
                            isUploading
                                ? "disabled"
                                : ""
                        }`}
                    >
                        {isUploading
                            ? "Uploading..."
                            : "Upload"}

                        <input
                            type="file"
                            accept={accept}
                            hidden
                            disabled={
                                isUploading ||
                                isDeleting
                            }
                            onChange={(e) => {
                                const file =
                                    e.target.files?.[0];

                                if (file) {
                                    handleUpload(
                                        type,
                                        file
                                    );
                                }

                                e.target.value = "";
                            }}
                        />
                    </label>

                    {filename && (
                        <button
                            type="button"
                            className="delete-button"
                            disabled={
                                isUploading ||
                                isDeleting
                            }
                            onClick={() =>
                                handleDelete(type)
                            }
                        >
                            {isDeleting
                                ? "Removing..."
                                : "Remove"}
                        </button>
                    )}

                </div>

            </div>
        );
    };

    /*
    =========================================================
       RENDER
    =========================================================
    */

    return (
        <div className="settings-section">

            <div className="section-header">

                <div>
                    <h2>
                        Branding Settings
                    </h2>

                    <p>
                        Customize your marketplace identity and
                        appearance.
                    </p>
                </div>

            </div>

            {message && (
                <div
                    className={`branding-message ${
                        messageType === "error"
                            ? "error-message"
                            : "success-message"
                    }`}
                >
                    {message}
                </div>
            )}

            <div className="branding-card">

                <BrandingItem
                    type="logo"
                    title="Marketplace Logo"
                    description="Upload the main logo displayed throughout the marketplace website."
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                />

                <BrandingItem
                    type="admin_logo"
                    title="Admin Dashboard Logo"
                    description="Upload the logo displayed inside the administrator dashboard."
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                />

                <BrandingItem
                    type="favicon"
                    title="Website Favicon"
                    description="Upload the favicon displayed in browser tabs and bookmarks."
                    accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/jpeg,image/webp"
                />

            </div>

            <div className="branding-guidelines">

                <h3>
                    Upload Guidelines
                </h3>

                <ul>
                    <li>
                        Maximum file size: 5 MB
                    </li>

                    <li>
                        Supported formats: PNG, JPG, JPEG, WEBP, ICO
                    </li>

                    <li>
                        Recommended logo format: PNG with transparent
                        background
                    </li>

                    <li>
                        Recommended favicon size: 32 × 32 or
                        64 × 64 pixels
                    </li>

                    <li>
                        Keep image files optimized for faster loading
                    </li>

                    <li>
                        Branding files are stored on Cloudflare R2
                        and served through the KAD Marketplace CDN
                    </li>
                </ul>

            </div>

        </div>
    );
}

export default BrandingSettings;
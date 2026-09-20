import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./MyStore.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const getToken = () => {
    return localStorage.getItem("token");
};

const getApiOrigin = () => {
    if (API_ORIGIN && API_ORIGIN !== "/api") {
        return API_ORIGIN.replace(/\/$/, "");
    }

    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    return "";
};

function MyStore() {

    /* ==========================================
       STATES
    ========================================== */

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");


    /* ==========================================
       STORE DATA
    ========================================== */

    const [store, setStore] = useState({
        storeName: "",
        description: "",

        phone: "",
        email: "",
        website: "",

        businessCategory: "",

        region: "",
        city: "",
        address: "",

        businessHours: "",

        facebook: "",
        instagram: "",
        tiktok: "",
        x: "",
        whatsapp: "",

        accentColor: "#0A66C2",
        coverColor: "#2563eb",

        logo: "",
        banner: "",

        totalProducts: 0,
        totalViews: 0,
        followers: 0,
        rating: 5
    });


    /* ==========================================
       IMAGE URL
    ========================================== */

    const getImageUrl = (imagePath) => {

        if (!imagePath || typeof imagePath !== "string") {
            return null;
        }

        const value = imagePath.trim();

        if (!value) {
            return null;
        }

        // Already a complete URL
        if (
            value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("data:")
        ) {
            return value;
        }

        const origin = getApiOrigin();

        // Already starts with /
        if (value.startsWith("/")) {
            return `${origin}${value}`;
        }

        // uploads/...
        if (value.startsWith("uploads/")) {
            return `${origin}/${value}`;
        }

        // Store images saved only as filename
        return `${origin}/uploads/stores/${value}`;
    };


    /* ==========================================
       LOAD STORE
    ========================================== */

    const loadStore = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/store/my-store"
            );

            console.log(
                "STORE DATA:",
                response.data
            );

            const storeData =
                response.data?.store ||
                response.data?.data ||
                response.data;

            if (storeData) {

                setStore((prev) => ({
                    ...prev,
                    ...storeData
                }));

            }

        } catch (err) {

            console.error(
                "LOAD STORE ERROR:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load your store."
            );

        } finally {

            setLoading(false);

        }

    };


    /* ==========================================
       LOAD ON START
    ========================================== */

    useEffect(() => {

        loadStore();

    }, []);


    /* ==========================================
       HANDLE INPUT CHANGE
    ========================================== */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setStore((prev) => ({
            ...prev,
            [name]: value
        }));

    };


    /* ==========================================
       SAVE STORE
    ========================================== */

    const saveStore = async () => {

        try {

            setSaving(true);

            setSuccess("");
            setError("");

            /*
             * Only send fields that the seller is
             * actually allowed to edit.
             *
             * Do not send calculated fields such as:
             * totalProducts
             * totalViews
             * followers
             * rating
             */

            const payload = {

                storeName: store.storeName || "",

                description: store.description || "",

                phone: store.phone || "",

                email: store.email || "",

                website: store.website || "",

                businessCategory:
                    store.businessCategory || "",

                region: store.region || "",

                city: store.city || "",

                address: store.address || "",

                businessHours:
                    store.businessHours || "",

                facebook: store.facebook || "",

                instagram: store.instagram || "",

                tiktok: store.tiktok || "",

                x: store.x || "",

                whatsapp: store.whatsapp || "",

                accentColor:
                    store.accentColor || "#0A66C2",

                coverColor:
                    store.coverColor || "#2563eb",

                logo: store.logo || "",

                banner: store.banner || ""
            };

            console.log(
                "SAVING STORE:",
                payload
            );

            const response = await api.put(
                "/store/my-store",
                payload
            );

            console.log(
                "SAVE STORE RESPONSE:",
                response.data
            );

            const updatedStore =
                response.data?.store ||
                response.data?.data;

            if (
                updatedStore &&
                typeof updatedStore === "object"
            ) {

                setStore((prev) => ({
                    ...prev,
                    ...updatedStore
                }));

            }

            setSuccess(
                "Store information updated successfully."
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (err) {

            console.error(
                "SAVE STORE ERROR:",
                err.response?.data ||
                err.message
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to save your store."
            );

        } finally {

            setSaving(false);

        }

    };


    /* ==========================================
       UPLOAD LOGO
    ========================================== */

    const uploadLogo = async (e) => {

        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        // Reset input so selecting the same image
        // again will trigger onChange.
        e.target.value = "";

        if (!file.type.startsWith("image/")) {

            setError(
                "Please select a valid image for the store logo."
            );

            return;
        }

        if (file.size > 10 * 1024 * 1024) {

            setError(
                "Store logo must be smaller than 10MB."
            );

            return;
        }

        const token = getToken();

        if (!token) {

            setError(
                "Your session has expired. Please log in again."
            );

            return;
        }

        try {

            setUploadingLogo(true);

            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append(
                "logo",
                file,
                file.name
            );

            console.log(
                "Uploading store logo:",
                {
                    name: file.name,
                    type: file.type,
                    size: file.size
                }
            );

            /*
             * IMPORTANT:
             *
             * Do NOT manually set:
             *
             * Content-Type: multipart/form-data
             *
             * The browser creates the correct
             * multipart boundary automatically.
             */

            const response = await fetch(
                `${API_URL}/store/upload-logo`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },

                    body: formData
                }
            );

            const data =
                await response
                    .json()
                    .catch(() => ({}));

            console.log(
                "LOGO UPLOAD RESPONSE:",
                data
            );

            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    `Logo upload failed (${response.status}).`
                );

            }

            const newLogo =
                data?.logo ||
                data?.store?.logo ||
                data?.data?.logo;

            if (!newLogo) {

                throw new Error(
                    "Logo upload succeeded, but the server did not return the logo path."
                );

            }

            setStore((prev) => ({
                ...prev,
                logo: newLogo
            }));

            setSuccess(
                "Store logo uploaded successfully."
            );

        } catch (err) {

            console.error(
                "LOGO UPLOAD ERROR:",
                err
            );

            setError(
                err.message ||
                "Unable to upload store logo."
            );

        } finally {

            setUploadingLogo(false);

        }

    };


    /* ==========================================
       UPLOAD BANNER
    ========================================== */

    const uploadBanner = async (e) => {

        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        e.target.value = "";

        if (!file.type.startsWith("image/")) {

            setError(
                "Please select a valid image for the store banner."
            );

            return;
        }

        if (file.size > 10 * 1024 * 1024) {

            setError(
                "Store banner must be smaller than 10MB."
            );

            return;
        }

        const token = getToken();

        if (!token) {

            setError(
                "Your session has expired. Please log in again."
            );

            return;
        }

        try {

            setUploadingBanner(true);

            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append(
                "banner",
                file,
                file.name
            );

            console.log(
                "Uploading store banner:",
                {
                    name: file.name,
                    type: file.type,
                    size: file.size
                }
            );

            /*
             * Same rule as logo:
             * Do NOT manually set Content-Type.
             */

            const response = await fetch(
                `${API_URL}/store/upload-banner`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },

                    body: formData
                }
            );

            const data =
                await response
                    .json()
                    .catch(() => ({}));

            console.log(
                "BANNER UPLOAD RESPONSE:",
                data
            );

            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    `Banner upload failed (${response.status}).`
                );

            }

            const newBanner =
                data?.banner ||
                data?.store?.banner ||
                data?.data?.banner;

            if (!newBanner) {

                throw new Error(
                    "Banner upload succeeded, but the server did not return the banner path."
                );

            }

            setStore((prev) => ({
                ...prev,
                banner: newBanner
            }));

            setSuccess(
                "Store banner uploaded successfully."
            );

        } catch (err) {

            console.error(
                "BANNER UPLOAD ERROR:",
                err
            );

            setError(
                err.message ||
                "Unable to upload store banner."
            );

        } finally {

            setUploadingBanner(false);

        }

    };


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="loading-spinner">

                Loading Store...

            </div>

        );

    }


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="store-page">

            {success && (

                <div className="success-box">

                    {success}

                </div>

            )}


            {error && (

                <div className="error-box">

                    {error}

                </div>

            )}


            {/* ==========================================
                STORE HEADER / BANNER
            ========================================== */}

            <div
                className="store-banner"

                style={{
                    backgroundImage:
                        store.banner
                            ? `url("${getImageUrl(
                                store.banner
                            )}")`
                            : `linear-gradient(
                                135deg,
                                ${store.coverColor || "#0A66C2"},
                                ${store.accentColor || "#1E3A8A"}
                            )`
                }}
            >

                <input
                    type="file"
                    hidden
                    id="bannerUpload"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={uploadBanner}
                    disabled={uploadingBanner}
                />

                <label
                    htmlFor="bannerUpload"
                    className="change-banner"
                >

                    {uploadingBanner
                        ? "Uploading..."
                        : "📷 Change Banner"
                    }

                </label>


                <div className="store-header">


                    {/* ==========================================
                        STORE LOGO
                    ========================================== */}

                    <div className="store-logo">

                        <img
                            src={
                                store.logo
                                    ? getImageUrl(
                                        store.logo
                                    )
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        store.storeName ||
                                        "Store"
                                    )}&background=0A66C2&color=fff`
                            }

                            alt="Store Logo"

                            className="logo-image"

                            onError={(event) => {

                                event.currentTarget.onerror =
                                    null;

                                event.currentTarget.src =
                                    "/images/product-placeholder.png";

                            }}
                        />


                        <input
                            type="file"
                            hidden
                            id="logoUpload"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={uploadLogo}
                            disabled={uploadingLogo}
                        />


                        <label
                            htmlFor="logoUpload"
                            className="change-logo"
                        >

                            {uploadingLogo
                                ? "..."
                                : "📷"
                            }

                        </label>

                    </div>


                    {/* ==========================================
                        STORE HEADER INFO
                    ========================================== */}

                    <div className="store-header-info">

                        <h1>

                            {store.storeName ||
                                "My Store"}

                        </h1>


                        <div className="seller-badge">

                            🏪 Store Owner

                        </div>


                        <p>

                            📍{" "}

                            {store.city ||
                                "City"}

                            {", "}

                            {store.region ||
                                "Region"}

                        </p>


                        <div className="store-stats">


                            <div>

                                <strong>

                                    {store.totalProducts ||
                                        0}

                                </strong>

                                <span>

                                    Products

                                </span>

                            </div>


                            <div>

                                <strong>

                                    {store.totalViews ||
                                        0}

                                </strong>

                                <span>

                                    Views

                                </span>

                            </div>


                            <div>

                                <strong>

                                    {store.followers ||
                                        0}

                                </strong>

                                <span>

                                    Followers

                                </span>

                            </div>


                            <div>

                                <strong>

                                    {store.rating ||
                                        5}

                                </strong>

                                <span>

                                    Rating

                                </span>

                            </div>


                        </div>

                    </div>

                </div>

            </div>


            {/* ==========================================
                BASIC INFORMATION
            ========================================== */}

            <div className="store-card">

                <h2>
                    🏪 Basic Store Information
                </h2>


                <div className="store-grid">


                    <div className="input-group">

                        <label>
                            Store Name
                        </label>

                        <input
                            type="text"
                            name="storeName"
                            value={
                                store.storeName ||
                                ""
                            }
                            onChange={handleChange}
                            placeholder="Enter store name"
                        />

                    </div>


                    <div className="input-group">

                        <label>
                            Business Category
                        </label>

                        <input
                            type="text"
                            name="businessCategory"
                            value={
                                store.businessCategory ||
                                ""
                            }
                            onChange={handleChange}
                            placeholder="Example: Electronics"
                        />

                    </div>


                    <div className="input-group">

                        <label>
                            Phone Number
                        </label>

                        <input
                            type="text"
                            name="phone"
                            value={
                                store.phone ||
                                ""
                            }
                            onChange={handleChange}
                            placeholder="024XXXXXXX"
                        />

                    </div>


                    <div className="input-group">

                        <label>
                            Email Address
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={
                                store.email ||
                                ""
                            }
                            onChange={handleChange}
                            placeholder="store@email.com"
                        />

                    </div>


                    <div className="input-group full-width">

                        <label>
                            Website
                        </label>

                        <input
                            type="text"
                            name="website"
                            value={
                                store.website ||
                                ""
                            }
                            onChange={handleChange}
                            placeholder="https://example.com"
                        />

                    </div>

                </div>


                <div className="input-group full-width">

                    <label>
                        Store Description
                    </label>

                    <textarea
                        name="description"
                        value={
                            store.description ||
                            ""
                        }
                        onChange={handleChange}
                        rows="6"
                        placeholder="Tell customers about your business..."
                    />

                </div>

            </div>


            {/* ==========================================
                LOCATION
            ========================================== */}

            <div className="store-card">

                <h2>
                    📍 Business Location
                </h2>


                <div className="store-grid">


                    <div className="input-group">

                        <label>
                            Region
                        </label>

                        <input
                            type="text"
                            name="region"
                            value={
                                store.region ||
                                ""
                            }
                            onChange={handleChange}
                            placeholder="Greater Accra"
                        />

                    </div>


                    <div className="input-group">

                        <label>
                            City
                        </label>

                        <input
                            type="text"
                            name="city"
                            value={
                                store.city ||
                                ""
                            }
                            onChange={handleChange}
                            placeholder="Accra"
                        />

                    </div>

                </div>


                <div className="input-group full-width">

                    <label>
                        Business Address
                    </label>

                    <textarea
                        name="address"
                        value={
                            store.address ||
                            ""
                        }
                        onChange={handleChange}
                        rows="3"
                        placeholder="Enter your business address"
                    />

                </div>

            </div>


            {/* ==========================================
                BUSINESS HOURS
            ========================================== */}

            <div className="store-card">

                <h2>
                    🕒 Business Hours
                </h2>


                <div className="input-group full-width">

                    <label>
                        Opening Hours
                    </label>

                    <textarea
                        name="businessHours"
                        value={
                            store.businessHours ||
                            ""
                        }
                        onChange={handleChange}
                        rows="4"
                        placeholder={`Monday - Friday: 8:00 AM - 6:00 PM
Saturday: 9:00 AM - 4:00 PM
Sunday: Closed`}
                    />

                </div>

            </div>


            {/* ==========================================
                SOCIAL MEDIA
            ========================================== */}

            <div className="store-card">

                <h2>
                    🌐 Social Media & Contact Links
                </h2>


                <div className="store-grid">


                    <div className="input-group">

                        <label>
                            Facebook
                        </label>

                        <input
                            type="text"
                            name="facebook"
                            value={
                                store.facebook ||
                                ""
                            }
                            onChange={handleChange}
                            placeholder="Facebook URL"
                        />

                    </div>


                    <div className="input-group">

                        <label>
                            Instagram
                        </label>

                        <input
                            type="text"
                            name="instagram"
                            value={
                                store.instagram ||
                                ""
                            }
                            onChange={handleChange}
                            placeholder="Instagram URL"
                        />

                    </div>


                    <div className="input-group">

                        <label>
                            TikTok
                        </label>

                        <input
                            type="text"
                            name="tiktok"
                            value={
                                store.tiktok ||
                                ""
                            }
                            onChange={handleChange}
                            placeholder="TikTok URL"
                        />

                    </div>


                    <div className="input-group">

                        <label>
                            X / Twitter
                        </label>

                        <input
                            type="text"
                            name="x"
                            value={
                                store.x ||
                                ""
                            }
                            onChange={handleChange}
                            placeholder="X profile URL"
                        />

                    </div>


                    <div className="input-group full-width">

                        <label>
                            WhatsApp Number
                        </label>

                        <input
                            type="text"
                            name="whatsapp"
                            value={
                                store.whatsapp ||
                                ""
                            }
                            onChange={handleChange}
                            placeholder="233XXXXXXXXX"
                        />

                    </div>

                </div>

            </div>


            {/* ==========================================
                STORE APPEARANCE
            ========================================== */}

            <div className="store-card">

                <h2>
                    🎨 Store Appearance
                </h2>


                <div className="store-grid">


                    <div className="input-group">

                        <label>
                            Accent Color
                        </label>

                        <input
                            type="color"
                            name="accentColor"
                            value={
                                store.accentColor ||
                                "#0A66C2"
                            }
                            onChange={handleChange}
                        />

                    </div>


                    <div className="input-group">

                        <label>
                            Cover Color
                        </label>

                        <input
                            type="color"
                            name="coverColor"
                            value={
                                store.coverColor ||
                                "#2563eb"
                            }
                            onChange={handleChange}
                        />

                    </div>

                </div>

            </div>


            {/* ==========================================
                SAVE BUTTON
            ========================================== */}

            <div className="store-save-section">

                <button
                    type="button"
                    className="save-store-btn"
                    onClick={saveStore}
                    disabled={saving}
                >

                    {saving
                        ? "Saving Changes..."
                        : "💾 Save All Changes"
                    }

                </button>

            </div>

        </div>

    );
}

export default MyStore;
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./MyStore.css";

/* ============================================================
   KAD MARKETPLACE — MY STORE
   ============================================================ */

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://kad-marketplace-production.up.railway.app";

const API_URL = API_BASE_URL.replace(/\/+$/, "");

/* ============================================================
   AXIOS INSTANCE
   ============================================================ */

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        Accept: "application/json",
    },
});

/* ============================================================
   AUTH TOKEN HELPER
   ============================================================ */

const getToken = () => {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        ""
    );
};

/* ============================================================
   AUTH HEADERS
   ============================================================ */

const getAuthConfig = () => {
    const token = getToken();

    if (!token) {
        return {
            withCredentials: true,
        };
    }

    return {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

/* ============================================================
   API RESPONSE HELPER
   ============================================================ */

const getErrorMessage = (error, fallback) => {
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }

    if (error?.response?.data?.error) {
        return error.response.data.error;
    }

    if (error?.message) {
        return error.message;
    }

    return fallback;
};

/* ============================================================
   IMAGE URL HELPER
   ============================================================ */

const getImageUrl = (url) => {
    if (!url) {
        return "";
    }

    if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("blob:")
    ) {
        return url;
    }

    if (url.startsWith("/")) {
        return `${API_URL}${url}`;
    }

    return `${API_URL}/${url}`;
};

/* ============================================================
   DEFAULT STORE
   ============================================================ */

const DEFAULT_STORE = {
    id: null,
    storeName: "",
    storeSlug: "",
    description: "",
    phone: "",
    email: "",
    location: "",
    address: "",
    logo: "",
    logoUrl: "",
    banner: "",
    bannerUrl: "",
    facebook: "",
    instagram: "",
    twitter: "",
    whatsapp: "",
    website: "",
    isActive: true,
};

/* ============================================================
   NORMALIZE STORE
   ============================================================ */

const normalizeStore = (data = {}) => {
    const store =
        data.store ||
        data.data ||
        data.result ||
        data;

    return {
        ...DEFAULT_STORE,
        ...store,

        storeName:
            store.storeName ||
            store.name ||
            "",

        storeSlug:
            store.storeSlug ||
            store.slug ||
            "",

        description:
            store.description ||
            "",

        phone:
            store.phone ||
            store.phoneNumber ||
            "",

        email:
            store.email ||
            "",

        location:
            store.location ||
            "",

        address:
            store.address ||
            "",

        logo:
            store.logo ||
            "",

        logoUrl:
            store.logoUrl ||
            store.logoURL ||
            store.logo ||
            "",

        banner:
            store.banner ||
            "",

        bannerUrl:
            store.bannerUrl ||
            store.bannerURL ||
            store.banner ||
            "",

        facebook:
            store.facebook ||
            "",

        instagram:
            store.instagram ||
            "",

        twitter:
            store.twitter ||
            "",

        whatsapp:
            store.whatsapp ||
            "",

        website:
            store.website ||
            "",

        isActive:
            store.isActive !== undefined
                ? store.isActive
                : true,
    };
};

/* ============================================================
   COMPONENT
   ============================================================ */

function MyStore() {
    /* ========================================================
       STATE
    ======================================================== */

    const [store, setStore] = useState(DEFAULT_STORE);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [uploadingLogo, setUploadingLogo] = useState(false);

    const [uploadingBanner, setUploadingBanner] =
        useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [logoPreview, setLogoPreview] =
        useState("");

    const [bannerPreview, setBannerPreview] =
        useState("");

    const [logoFile, setLogoFile] =
        useState(null);

    const [bannerFile, setBannerFile] =
        useState(null);

    const logoInputRef =
        useRef(null);

    const bannerInputRef =
        useRef(null);

    /* ========================================================
       LOAD STORE
    ======================================================== */

    useEffect(() => {
        loadMyStore();

        return () => {
            if (logoPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(logoPreview);
            }

            if (bannerPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(bannerPreview);
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ========================================================
       LOAD MY STORE
    ======================================================== */

    const loadMyStore = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/api/store/my-store",
                getAuthConfig()
            );

            console.log(
                "MY STORE RESPONSE:",
                response.data
            );

            if (response.data?.success === false) {
                throw new Error(
                    response.data.message ||
                        "Unable to load your store."
                );
            }

            const normalized =
                normalizeStore(response.data);

            setStore(normalized);

            setLogoPreview(
                getImageUrl(
                    normalized.logoUrl ||
                        normalized.logo
                )
            );

            setBannerPreview(
                getImageUrl(
                    normalized.bannerUrl ||
                        normalized.banner
                )
            );
        } catch (err) {
            console.error(
                "LOAD MY STORE ERROR:",
                err
            );

            if (err?.response?.status === 401) {
                setError(
                    "Your session has expired. Please log in again."
                );
            } else if (
                err?.response?.status === 404
            ) {
                setError(
                    "Your store could not be found."
                );
            } else {
                setError(
                    getErrorMessage(
                        err,
                        "Unable to load your store."
                    )
                );
            }
        } finally {
            setLoading(false);
        }
    };

    /* ========================================================
       INPUT CHANGE
    ======================================================== */

    const handleChange = (event) => {
        const { name, value } = event.target;

        setStore((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    /* ========================================================
       LOGO FILE CHANGE
    ======================================================== */

    const handleLogoChange = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");
        setSuccess("");

        if (!file.type.startsWith("image/")) {
            setError(
                "Please select a valid image for your store logo."
            );

            event.target.value = "";
            return;
        }

        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            setError(
                "Logo image must be smaller than 5MB."
            );

            event.target.value = "";
            return;
        }

        if (logoPreview?.startsWith("blob:")) {
            URL.revokeObjectURL(
                logoPreview
            );
        }

        const preview =
            URL.createObjectURL(file);

        setLogoFile(file);
        setLogoPreview(preview);
    };

    /* ========================================================
       BANNER FILE CHANGE
    ======================================================== */

    const handleBannerChange = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");
        setSuccess("");

        if (!file.type.startsWith("image/")) {
            setError(
                "Please select a valid image for your store banner."
            );

            event.target.value = "";
            return;
        }

        const maxSize =
            10 * 1024 * 1024;

        if (file.size > maxSize) {
            setError(
                "Banner image must be smaller than 10MB."
            );

            event.target.value = "";
            return;
        }

        if (bannerPreview?.startsWith("blob:")) {
            URL.revokeObjectURL(
                bannerPreview
            );
        }

        const preview =
            URL.createObjectURL(file);

        setBannerFile(file);
        setBannerPreview(preview);
    };

    /* ========================================================
       UPLOAD LOGO
    ======================================================== */

    const uploadLogo = async () => {
        if (!logoFile) {
            setError(
                "Please select a logo first."
            );
            return;
        }

        try {
            setUploadingLogo(true);
            setError("");
            setSuccess("");

            const formData =
                new FormData();

            /*
             * IMPORTANT:
             * Backend uses:
             *
             * upload.single("logo")
             *
             * Therefore the field MUST be "logo".
             */

            formData.append(
                "logo",
                logoFile
            );

            console.log(
                "Uploading store logo:",
                {
                    name: logoFile.name,
                    type: logoFile.type,
                    size: logoFile.size,
                    endpoint:
                        "/api/store/upload-logo",
                }
            );

            const response =
                await api.post(
                    "/api/store/upload-logo",
                    formData,
                    {
                        ...getAuthConfig(),

                        headers: {
    ...(getAuthConfig().headers || {}),
},

                        timeout: 120000,
                    }
                );

            console.log(
                "LOGO UPLOAD RESPONSE:",
                response.data
            );

            if (
                response.data?.success === false
            ) {
                throw new Error(
                    response.data.message ||
                        "Logo upload failed."
                );
            }

            const returnedStore =
                normalizeStore(
                    response.data
                );

            const returnedLogo =
                response.data?.logo ||
                response.data?.logoUrl ||
                returnedStore.logoUrl ||
                returnedStore.logo;

            setStore((previous) => ({
                ...previous,
                ...returnedStore,

                logo:
                    returnedLogo ||
                    previous.logo,

                logoUrl:
                    returnedLogo ||
                    previous.logoUrl,
            }));

            if (returnedLogo) {
                setLogoPreview(
                    getImageUrl(
                        returnedLogo
                    )
                );
            }

            setLogoFile(null);

            if (logoInputRef.current) {
                logoInputRef.current.value =
                    "";
            }

            setSuccess(
                "Store logo uploaded successfully."
            );
        } catch (err) {
            console.error(
                "LOGO UPLOAD ERROR:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to upload your store logo."
                )
            );
        } finally {
            setUploadingLogo(false);
        }
    };

    /* ========================================================
       UPLOAD BANNER
    ======================================================== */

    const uploadBanner = async () => {
        if (!bannerFile) {
            setError(
                "Please select a banner first."
            );
            return;
        }

        try {
            setUploadingBanner(true);
            setError("");
            setSuccess("");

            const formData =
                new FormData();

            /*
             * IMPORTANT:
             * Backend uses:
             *
             * upload.single("banner")
             *
             * Therefore the field MUST be "banner".
             */

            formData.append(
                "banner",
                bannerFile
            );

            console.log(
                "Uploading store banner:",
                {
                    name: bannerFile.name,
                    type: bannerFile.type,
                    size: bannerFile.size,
                    endpoint:
                        "/api/store/upload-banner",
                }
            );

            const response =
                await api.post(
                    "/api/store/upload-banner",
                    formData,
                    {
                        ...getAuthConfig(),

                      headers: {
    ...(getAuthConfig().headers || {}),
},

                        timeout: 120000,
                    }
                );

            console.log(
                "BANNER UPLOAD RESPONSE:",
                response.data
            );

            if (
                response.data?.success === false
            ) {
                throw new Error(
                    response.data.message ||
                        "Banner upload failed."
                );
            }

            const returnedStore =
                normalizeStore(
                    response.data
                );

            const returnedBanner =
                response.data?.banner ||
                response.data?.bannerUrl ||
                returnedStore.bannerUrl ||
                returnedStore.banner;

            setStore((previous) => ({
                ...previous,
                ...returnedStore,

                banner:
                    returnedBanner ||
                    previous.banner,

                bannerUrl:
                    returnedBanner ||
                    previous.bannerUrl,
            }));

            if (returnedBanner) {
                setBannerPreview(
                    getImageUrl(
                        returnedBanner
                    )
                );
            }

            setBannerFile(null);

            if (
                bannerInputRef.current
            ) {
                bannerInputRef.current.value =
                    "";
            }

            setSuccess(
                "Store banner uploaded successfully."
            );
        } catch (err) {
            console.error(
                "BANNER UPLOAD ERROR:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to upload your store banner."
                )
            );
        } finally {
            setUploadingBanner(false);
        }
    };

    /* ========================================================
       SAVE STORE DETAILS
    ======================================================== */

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                storeName:
                    store.storeName.trim(),

                description:
                    store.description.trim(),

                phone:
                    store.phone.trim(),

                email:
                    store.email.trim(),

                location:
                    store.location.trim(),

                address:
                    store.address.trim(),

                facebook:
                    store.facebook.trim(),

                instagram:
                    store.instagram.trim(),

                twitter:
                    store.twitter.trim(),

                whatsapp:
                    store.whatsapp.trim(),

                website:
                    store.website.trim(),
            };

            if (!payload.storeName) {
                setError(
                    "Store name is required."
                );

                return;
            }

            console.log(
                "UPDATING STORE:",
                payload
            );

            const response =
                await api.put(
                    "/api/store/my-store",
                    payload,
                    getAuthConfig()
                );

            console.log(
                "UPDATE STORE RESPONSE:",
                response.data
            );

            if (
                response.data?.success === false
            ) {
                throw new Error(
                    response.data.message ||
                        "Store update failed."
                );
            }

            const updatedStore =
                normalizeStore(
                    response.data
                );

            setStore((previous) => ({
                ...previous,
                ...updatedStore,
            }));

            setSuccess(
                "Your store has been updated successfully."
            );
        } catch (err) {
            console.error(
                "UPDATE STORE ERROR:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to update your store."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    /* ========================================================
       OPEN LOGO SELECTOR
    ======================================================== */

    const selectLogo = () => {
        if (
            logoInputRef.current &&
            !uploadingLogo
        ) {
            logoInputRef.current.click();
        }
    };

    /* ========================================================
       OPEN BANNER SELECTOR
    ======================================================== */

    const selectBanner = () => {
        if (
            bannerInputRef.current &&
            !uploadingBanner
        ) {
            bannerInputRef.current.click();
        }
    };

    /* ========================================================
       RETRY
    ======================================================== */

    const handleRetry = () => {
        loadMyStore();
    };

    /* ========================================================
       LOADING SCREEN
    ======================================================== */

    if (loading) {
        return (
            <div className="my-store-page">
                <div className="my-store-loading">
                    <div className="store-spinner" />

                    <h2>
                        Loading your store...
                    </h2>

                    <p>
                        Please wait while we
                        retrieve your store
                        information.
                    </p>
                </div>
            </div>
        );
    }

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <div className="my-store-page">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="my-store-header">

                <div>
                    <span className="store-eyebrow">
                        SELLER CENTER
                    </span>

                    <h1>
                        My Store
                    </h1>

                    <p>
                        Manage your store,
                        branding, contact
                        information and
                        public profile.
                    </p>
                </div>

                <div className="store-status">

                    <span
                        className={
                            store.isActive
                                ? "status-dot active"
                                : "status-dot"
                        }
                    />

                    {store.isActive
                        ? "Store Active"
                        : "Store Inactive"}
                </div>

            </div>

            {/* ==================================================
                ALERTS
            ================================================== */}

            {error && (
                <div
                    className="store-alert error"
                    role="alert"
                >
                    <span>
                        ⚠️
                    </span>

                    <div>
                        <strong>
                            Error
                        </strong>

                        <p>
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        ×
                    </button>
                </div>
            )}

            {success && (
                <div
                    className="store-alert success"
                    role="status"
                >
                    <span>
                        ✓
                    </span>

                    <div>
                        <strong>
                            Success
                        </strong>

                        <p>
                            {success}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        ×
                    </button>
                </div>
            )}

            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <div className="my-store-content">

                {/* ==================================================
                    BRANDING CARD
                ================================================== */}

                <section className="store-card branding-card">

                    <div className="store-card-header">

                        <div>
                            <h2>
                                Store Branding
                            </h2>

                            <p>
                                Upload the logo and
                                banner customers
                                will see on your
                                store.
                            </p>
                        </div>

                    </div>

                    {/* ==================================================
                        BANNER
                    ================================================== */}

                    <div className="store-banner-section">

                        <div
                            className="store-banner-preview"
                            onClick={
                                selectBanner
                            }
                        >

                            {bannerPreview ? (
                                <img
                                    src={
                                        bannerPreview
                                    }
                                    alt="Store banner"
                                />
                            ) : (
                                <div className="empty-banner">
                                    <span>
                                        🖼️
                                    </span>

                                    <p>
                                        No store
                                        banner
                                    </p>
                                </div>
                            )}

                            <div className="banner-overlay">
                                <span>
                                    Change Banner
                                </span>
                            </div>

                        </div>

                        <input
                            ref={
                                bannerInputRef
                            }
                            type="file"
                            accept="image/*"
                            onChange={
                                handleBannerChange
                            }
                            hidden
                        />

                        <div className="upload-controls">

                            <div>
                                <strong>
                                    Store Banner
                                </strong>

                                <p>
                                    Recommended:
                                    1600 × 500px
                                </p>
                            </div>

                            <div className="upload-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        selectBanner
                                    }
                                    disabled={
                                        uploadingBanner
                                    }
                                >
                                    Choose Image
                                </button>

                                {bannerFile && (
                                    <button
                                        type="button"
                                        className="primary-button"
                                        onClick={
                                            uploadBanner
                                        }
                                        disabled={
                                            uploadingBanner
                                        }
                                    >
                                        {uploadingBanner
                                            ? "Uploading..."
                                            : "Upload Banner"}
                                    </button>
                                )}

                            </div>

                        </div>

                    </div>

                    {/* ==================================================
                        LOGO
                    ================================================== */}

                    <div className="store-logo-section">

                        <div
                            className="store-logo-preview"
                            onClick={
                                selectLogo
                            }
                        >

                            {logoPreview ? (
                                <img
                                    src={
                                        logoPreview
                                    }
                                    alt="Store logo"
                                />
                            ) : (
                                <div className="empty-logo">
                                    <span>
                                        🏪
                                    </span>
                                </div>
                            )}

                            <div className="logo-overlay">
                                <span>
                                    Change
                                </span>
                            </div>

                        </div>

                        <input
                            ref={
                                logoInputRef
                            }
                            type="file"
                            accept="image/*"
                            onChange={
                                handleLogoChange
                            }
                            hidden
                        />

                        <div className="logo-details">

                            <h3>
                                Store Logo
                            </h3>

                            <p>
                                Use a clear square
                                image representing
                                your business.
                            </p>

                            <p className="upload-hint">
                                PNG, JPG, JPEG or
                                WEBP • Maximum 5MB
                            </p>

                            <div className="upload-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        selectLogo
                                    }
                                    disabled={
                                        uploadingLogo
                                    }
                                >
                                    Choose Logo
                                </button>

                                {logoFile && (
                                    <button
                                        type="button"
                                        className="primary-button"
                                        onClick={
                                            uploadLogo
                                        }
                                        disabled={
                                            uploadingLogo
                                        }
                                    >
                                        {uploadingLogo
                                            ? "Uploading..."
                                            : "Upload Logo"}
                                    </button>
                                )}

                            </div>

                        </div>

                    </div>

                </section>

                {/* ==================================================
                    STORE INFORMATION
                ================================================== */}

                <form
                    className="store-card"
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="store-card-header">

                        <div>
                            <h2>
                                Store Information
                            </h2>

                            <p>
                                Keep your store
                                information
                                accurate and
                                up to date.
                            </p>
                        </div>

                    </div>

                    <div className="store-form-grid">

                        {/* STORE NAME */}

                        <div className="form-group full">

                            <label htmlFor="storeName">
                                Store Name
                            </label>

                            <input
                                id="storeName"
                                name="storeName"
                                type="text"
                                value={
                                    store.storeName
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter your store name"
                                required
                            />

                        </div>

                        {/* DESCRIPTION */}

                        <div className="form-group full">

                            <label htmlFor="description">
                                Store Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                rows="5"
                                value={
                                    store.description
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Tell customers about your store..."
                            />

                        </div>

                        {/* PHONE */}

                        <div className="form-group">

                            <label htmlFor="phone">
                                Phone Number
                            </label>

                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={
                                    store.phone
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="024 XXX XXXX"
                            />

                        </div>

                        {/* EMAIL */}

                        <div className="form-group">

                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={
                                    store.email
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="store@example.com"
                            />

                        </div>

                        {/* LOCATION */}

                        <div className="form-group">

                            <label htmlFor="location">
                                Location
                            </label>

                            <input
                                id="location"
                                name="location"
                                type="text"
                                value={
                                    store.location
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Kumasi, Ghana"
                            />

                        </div>

                        {/* ADDRESS */}

                        <div className="form-group">

                            <label htmlFor="address">
                                Address
                            </label>

                            <input
                                id="address"
                                name="address"
                                type="text"
                                value={
                                    store.address
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Store address"
                            />

                        </div>

                    </div>

                    {/* ==================================================
                        SOCIAL MEDIA
                    ================================================== */}

                    <div className="social-section">

                        <div className="store-card-header">

                            <div>
                                <h2>
                                    Social Media
                                </h2>

                                <p>
                                    Add your
                                    business social
                                    media accounts.
                                </p>
                            </div>

                        </div>

                        <div className="store-form-grid">

                            <div className="form-group">

                                <label htmlFor="facebook">
                                    Facebook
                                </label>

                                <input
                                    id="facebook"
                                    name="facebook"
                                    type="url"
                                    value={
                                        store.facebook
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="https://facebook.com/..."
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="instagram">
                                    Instagram
                                </label>

                                <input
                                    id="instagram"
                                    name="instagram"
                                    type="url"
                                    value={
                                        store.instagram
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="https://instagram.com/..."
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="twitter">
                                    X / Twitter
                                </label>

                                <input
                                    id="twitter"
                                    name="twitter"
                                    type="url"
                                    value={
                                        store.twitter
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="https://x.com/..."
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="whatsapp">
                                    WhatsApp
                                </label>

                                <input
                                    id="whatsapp"
                                    name="whatsapp"
                                    type="text"
                                    value={
                                        store.whatsapp
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="024 XXX XXXX"
                                />

                            </div>

                            <div className="form-group full">

                                <label htmlFor="website">
                                    Website
                                </label>

                                <input
                                    id="website"
                                    name="website"
                                    type="url"
                                    value={
                                        store.website
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="https://yourwebsite.com"
                                />

                            </div>

                        </div>

                    </div>

                    {/* ==================================================
                        SAVE BUTTON
                    ================================================== */}

                    <div className="store-form-footer">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                loadMyStore
                            }
                            disabled={
                                saving
                            }
                        >
                            Reset
                        </button>

                        <button
                            type="submit"
                            className="primary-button save-button"
                            disabled={
                                saving
                            }
                        >
                            {saving
                                ? "Saving..."
                                : "Save Store Changes"}
                        </button>

                    </div>

                </form>

                {/* ==================================================
                    STORE PREVIEW
                ================================================== */}

                <section className="store-card store-preview-card">

                    <div className="store-card-header">

                        <div>
                            <h2>
                                Store Preview
                            </h2>

                            <p>
                                Preview how your
                                store branding
                                appears to
                                customers.
                            </p>
                        </div>

                    </div>

                    <div className="store-public-preview">

                        <div className="preview-banner">

                            {bannerPreview ? (
                                <img
                                    src={
                                        bannerPreview
                                    }
                                    alt=""
                                />
                            ) : (
                                <div />
                            )}

                        </div>

                        <div className="preview-body">

                            <div className="preview-logo">

                                {logoPreview ? (
                                    <img
                                        src={
                                            logoPreview
                                        }
                                        alt={
                                            store.storeName ||
                                            "Store logo"
                                        }
                                    />
                                ) : (
                                    <span>
                                        🏪
                                    </span>
                                )}

                            </div>

                            <div className="preview-info">

                                <h3>
                                    {store.storeName ||
                                        "Your Store Name"}
                                </h3>

                                <p>
                                    {store.description ||
                                        "Your store description will appear here."}
                                </p>

                                {store.location && (
                                    <span>
                                        📍{" "}
                                        {
                                            store.location
                                        }
                                    </span>
                                )}

                            </div>

                        </div>

                    </div>

                </section>

                {/* ==================================================
                    RETRY
                ================================================== */}

                {error && (
                    <div className="store-retry">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                handleRetry
                            }
                        >
                            Try Again
                        </button>

                    </div>
                )}

            </div>
        </div>
    );
}

export default MyStore;
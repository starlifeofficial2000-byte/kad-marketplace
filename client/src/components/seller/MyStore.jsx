import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./MyStore.css";

const SERVER_URL = "";

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

        if (!imagePath) return null;

        if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://")
        ) {

            return imagePath;

        }

        if (imagePath.startsWith("/")) {

            return `${SERVER_URL}${imagePath}`;

        }

        return `${SERVER_URL}/uploads/stores/${imagePath}`;

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
                response.data.store ||
                response.data.data ||
                response.data;

            if (storeData) {

                setStore((prev) => ({

                    ...prev,

                    ...storeData

                }));

            }

        }

        catch (err) {

            console.error(
                "LOAD STORE ERROR:",
                err.response?.data || err.message
            );

            setError(

                err.response?.data?.message ||

                "Unable to load your store."

            );

        }

        finally {

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

            const response = await api.put(

                "/store/my-store",

                store

            );


            if (response.data.store) {

                setStore((prev) => ({

                    ...prev,

                    ...response.data.store

                }));

            }


            setSuccess(
                "Store information updated successfully."
            );


            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }

        catch (err) {

            console.error(
                "SAVE STORE ERROR:",
                err.response?.data || err.message
            );

            setError(

                err.response?.data?.message ||

                "Failed to save your store."

            );

        }

        finally {

            setSaving(false);

        }

    };


    /* ==========================================
       UPLOAD LOGO
    ========================================== */

    const uploadLogo = async (e) => {

        const file = e.target.files?.[0];

        if (!file) return;


        try {

            setUploadingLogo(true);

            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append("logo", file);


            const response = await api.post(

                "/store/upload-logo",

                formData

            );


            const newLogo =

                response.data.logo ||

                response.data.store?.logo;


            if (!newLogo) {

                throw new Error(
                    "Logo uploaded but image path was not returned."
                );

            }


            setStore((prev) => ({

                ...prev,

                logo: newLogo

            }));


            setSuccess(
                "Store logo uploaded successfully."
            );


            e.target.value = "";

        }

        catch (err) {

            console.error(
                "LOGO UPLOAD ERROR:",
                err.response?.data || err.message
            );

            setError(

                err.response?.data?.message ||

                "Unable to upload logo."

            );

        }

        finally {

            setUploadingLogo(false);

        }

    };


    /* ==========================================
       UPLOAD BANNER
    ========================================== */

    const uploadBanner = async (e) => {

        const file = e.target.files?.[0];

        if (!file) return;


        try {

            setUploadingBanner(true);

            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append("banner", file);


            const response = await api.post(

                "/store/upload-banner",

                formData

            );


            const newBanner =

                response.data.banner ||

                response.data.store?.banner;


            if (!newBanner) {

                throw new Error(
                    "Banner uploaded but image path was not returned."
                );

            }


            setStore((prev) => ({

                ...prev,

                banner: newBanner

            }));


            setSuccess(
                "Store banner uploaded successfully."
            );


            e.target.value = "";

        }

        catch (err) {

            console.error(
                "BANNER UPLOAD ERROR:",
                err.response?.data || err.message
            );

            setError(

                err.response?.data?.message ||

                "Unable to upload banner."

            );

        }

        finally {

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


            {/* STORE HEADER */}

            <div

                className="store-banner"

                style={{

                    backgroundImage:

                        store.banner

                            ? `url("${getImageUrl(store.banner)}")`

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

                    accept="image/jpeg,image/png,image/webp"

                    onChange={uploadBanner}

                    disabled={uploadingBanner}

                />


                <label

                    htmlFor="bannerUpload"

                    className="change-banner"

                >

                    {

                        uploadingBanner

                            ? "Uploading..."

                            : "📷 Change Banner"

                    }

                </label>


                <div className="store-header">


                    <div className="store-logo">

                        <img

                            src={

                                store.logo

                                    ? getImageUrl(store.logo)

                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        store.storeName || "Store"
                                    )}&background=0A66C2&color=fff`

                            }

                            alt="Store Logo"

                            className="logo-image"

                        />


                        <input

                            type="file"

                            hidden

                            id="logoUpload"

                            accept="image/jpeg,image/png,image/webp"

                            onChange={uploadLogo}

                            disabled={uploadingLogo}

                        />


                        <label

                            htmlFor="logoUpload"

                            className="change-logo"

                        >

                            {

                                uploadingLogo

                                    ? "..."

                                    : "📷"

                            }

                        </label>

                    </div>


                    <div className="store-header-info">

                        <h1>

                            {store.storeName || "My Store"}

                        </h1>


                        <div className="seller-badge">

                            🏪 Store Owner

                        </div>


                        <p>

                            📍 {store.city || "City"},
                            {" "}
                            {store.region || "Region"}

                        </p>


                        <div className="store-stats">


                            <div>

                                <strong>

                                    {store.totalProducts || 0}

                                </strong>

                                <span>

                                    Products

                                </span>

                            </div>


                            <div>

                                <strong>

                                    {store.totalViews || 0}

                                </strong>

                                <span>

                                    Views

                                </span>

                            </div>


                            <div>

                                <strong>

                                    {store.followers || 0}

                                </strong>

                                <span>

                                    Followers

                                </span>

                            </div>


                            <div>

                                <strong>

                                    {store.rating || 5}

                                </strong>

                                <span>

                                    Rating

                                </span>

                            </div>


                        </div>

                    </div>

                </div>

            </div>


            {/* BASIC INFORMATION */}

            <div className="store-card">

                <h2>🏪 Basic Store Information</h2>


                <div className="store-grid">


                    <div className="input-group">

                        <label>Store Name</label>

                        <input

                            type="text"

                            name="storeName"

                            value={store.storeName || ""}

                            onChange={handleChange}

                            placeholder="Enter store name"

                        />

                    </div>


                    <div className="input-group">

                        <label>Business Category</label>

                        <input

                            type="text"

                            name="businessCategory"

                            value={store.businessCategory || ""}

                            onChange={handleChange}

                            placeholder="Example: Electronics"

                        />

                    </div>


                    <div className="input-group">

                        <label>Phone Number</label>

                        <input

                            type="text"

                            name="phone"

                            value={store.phone || ""}

                            onChange={handleChange}

                            placeholder="024XXXXXXX"

                        />

                    </div>


                    <div className="input-group">

                        <label>Email Address</label>

                        <input

                            type="email"

                            name="email"

                            value={store.email || ""}

                            onChange={handleChange}

                            placeholder="store@email.com"

                        />

                    </div>


                    <div className="input-group full-width">

                        <label>Website</label>

                        <input

                            type="text"

                            name="website"

                            value={store.website || ""}

                            onChange={handleChange}

                            placeholder="https://example.com"

                        />

                    </div>


                </div>


                <div className="input-group full-width">

                    <label>Store Description</label>

                    <textarea

                        name="description"

                        value={store.description || ""}

                        onChange={handleChange}

                        rows="6"

                        placeholder="Tell customers about your business..."

                    />

                </div>

            </div>


            {/* LOCATION */}

            <div className="store-card">

                <h2>📍 Business Location</h2>


                <div className="store-grid">


                    <div className="input-group">

                        <label>Region</label>

                        <input

                            type="text"

                            name="region"

                            value={store.region || ""}

                            onChange={handleChange}

                            placeholder="Greater Accra"

                        />

                    </div>


                    <div className="input-group">

                        <label>City</label>

                        <input

                            type="text"

                            name="city"

                            value={store.city || ""}

                            onChange={handleChange}

                            placeholder="Accra"

                        />

                    </div>


                </div>


                <div className="input-group full-width">

                    <label>Business Address</label>

                    <textarea

                        name="address"

                        value={store.address || ""}

                        onChange={handleChange}

                        rows="3"

                        placeholder="Enter your business address"

                    />

                </div>

            </div>


            {/* BUSINESS HOURS */}

            <div className="store-card">

                <h2>🕒 Business Hours</h2>


                <div className="input-group full-width">

                    <label>Opening Hours</label>

                    <textarea

                        name="businessHours"

                        value={store.businessHours || ""}

                        onChange={handleChange}

                        rows="4"

                        placeholder={`Monday - Friday: 8:00 AM - 6:00 PM
Saturday: 9:00 AM - 4:00 PM
Sunday: Closed`}

                    />

                </div>

            </div>


            {/* SOCIAL MEDIA */}

            <div className="store-card">

                <h2>🌐 Social Media & Contact Links</h2>


                <div className="store-grid">


                    <div className="input-group">

                        <label>Facebook</label>

                        <input

                            type="text"

                            name="facebook"

                            value={store.facebook || ""}

                            onChange={handleChange}

                            placeholder="Facebook URL"

                        />

                    </div>


                    <div className="input-group">

                        <label>Instagram</label>

                        <input

                            type="text"

                            name="instagram"

                            value={store.instagram || ""}

                            onChange={handleChange}

                            placeholder="Instagram URL"

                        />

                    </div>


                    <div className="input-group">

                        <label>TikTok</label>

                        <input

                            type="text"

                            name="tiktok"

                            value={store.tiktok || ""}

                            onChange={handleChange}

                            placeholder="TikTok URL"

                        />

                    </div>


                    <div className="input-group">

                        <label>X / Twitter</label>

                        <input

                            type="text"

                            name="x"

                            value={store.x || ""}

                            onChange={handleChange}

                            placeholder="X profile URL"

                        />

                    </div>


                    <div className="input-group full-width">

                        <label>WhatsApp Number</label>

                        <input

                            type="text"

                            name="whatsapp"

                            value={store.whatsapp || ""}

                            onChange={handleChange}

                            placeholder="233XXXXXXXXX"

                        />

                    </div>


                </div>

            </div>


            {/* STORE APPEARANCE */}

            <div className="store-card">

                <h2>🎨 Store Appearance</h2>


                <div className="store-grid">


                    <div className="input-group">

                        <label>Accent Color</label>

                        <input

                            type="color"

                            name="accentColor"

                            value={store.accentColor || "#0A66C2"}

                            onChange={handleChange}

                        />

                    </div>


                    <div className="input-group">

                        <label>Cover Color</label>

                        <input

                            type="color"

                            name="coverColor"

                            value={store.coverColor || "#2563eb"}

                            onChange={handleChange}

                        />

                    </div>


                </div>

            </div>


            {/* SAVE BUTTON */}

            <div className="store-save-section">

                <button

                    type="button"

                    className="save-store-btn"

                    onClick={saveStore}

                    disabled={saving}

                >

                    {

                        saving

                            ? "Saving Changes..."

                            : "💾 Save All Changes"

                    }

                </button>

            </div>


        </div>

    );

}

export default MyStore;
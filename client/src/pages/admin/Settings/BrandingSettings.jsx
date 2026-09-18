import { useState } from "react";
import api from "../../../config/axios";
import "./BrandingSettings.css";

function BrandingSettings({ settings, loadSettings }) {

    const token = localStorage.getItem("token");

    const [uploading, setUploading] = useState({
        logo: false,
        admin_logo: false,
        favicon: false
    });

    const [message, setMessage] = useState("");

    const API_URL = "";


    /* =====================================================
       GET IMAGE URL
    ===================================================== */

    const getImageUrl = (filename) => {

        if (!filename) return null;

        return `${API_URL}/uploads/branding/${filename}`;

    };


    /* =====================================================
       UPLOAD BRANDING FILE
    ===================================================== */

    const handleUpload = async (type, file) => {

        if (!file) return;


        const formData = new FormData();

        formData.append("image", file);

        formData.append("type", type);


        try {

            setUploading((prev) => ({
                ...prev,
                [type]: true
            }));


            setMessage("");


            const response = await axios.post(

                `${API_URL}/api/settings/upload-logo`,

                formData,

                {
                    headers: {

                        Authorization: `Bearer ${token}`,

                        "Content-Type":
                            "multipart/form-data"

                    }
                }

            );


            if (response.data.success) {

                setMessage(
                    `${type.replace("_", " ")} uploaded successfully.`
                );


                if (loadSettings) {

                    await loadSettings();

                }

            }

        }
        catch (error) {

            console.error(
                "UPLOAD BRANDING ERROR:",
                error
            );


            setMessage(

                error.response?.data?.message ||

                "Failed to upload branding image."

            );

        }
        finally {

            setUploading((prev) => ({
                ...prev,
                [type]: false
            }));

        }

    };


    /* =====================================================
       DELETE BRANDING
    ===================================================== */

    const handleDelete = async (type) => {

        const confirmed = window.confirm(

            `Are you sure you want to remove the ${type.replace("_", " ")}?`

        );


        if (!confirmed) return;


        try {

            setMessage("");


            const response = await axios.delete(

                `${API_URL}/api/settings/branding/${type}`,

                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }
                }

            );


            if (response.data.success) {

                setMessage(

                    `${type.replace("_", " ")} deleted successfully.`

                );


                if (loadSettings) {

                    await loadSettings();

                }

            }

        }
        catch (error) {

            console.error(
                "DELETE BRANDING ERROR:",
                error
            );


            setMessage(

                error.response?.data?.message ||

                "Failed to delete branding image."

            );

        }

    };


    /* =====================================================
       BRANDING CARD
    ===================================================== */

    const BrandingItem = ({
        type,
        title,
        description,
        accept
    }) => {

        const filename = settings[type];

        const imageUrl =
            getImageUrl(filename);


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

                    {

                        imageUrl

                            ?

                            <img
                                src={imageUrl}
                                alt={title}
                            />

                            :

                            <div className="no-image">

                                No Image

                            </div>

                    }

                </div>


                <div className="branding-actions">

                    <label
                        className="upload-button"
                    >

                        {

                            uploading[type]

                                ?

                                "Uploading..."

                                :

                                "Upload"

                        }

                        <input

                            type="file"

                            accept={accept}

                            hidden

                            disabled={
                                uploading[type]
                            }

                            onChange={(e) =>

                                handleUpload(

                                    type,

                                    e.target.files[0]

                                )

                            }

                        />

                    </label>


                    {

                        filename &&

                        <button

                            className="delete-button"

                            onClick={() =>
                                handleDelete(type)
                            }

                        >

                            Remove

                        </button>

                    }

                </div>

            </div>

        );

    };


    return (

        <div className="settings-section">


            <div className="section-header">

                <div>

                    <h2>
                        Branding Settings
                    </h2>

                    <p>
                        Customize your marketplace identity and appearance.
                    </p>

                </div>

            </div>


            {

                message &&

                <div className="branding-message">

                    {message}

                </div>

            }


            <div className="branding-card">


                <BrandingItem

                    type="logo"

                    title="Marketplace Logo"

                    description="
                        Upload the main logo displayed on the marketplace website.
                    "

                    accept="image/png,image/jpeg,image/jpg,image/webp"

                />


                <BrandingItem

                    type="admin_logo"

                    title="Admin Dashboard Logo"

                    description="
                        Upload the logo displayed inside the administrator dashboard.
                    "

                    accept="image/png,image/jpeg,image/jpg,image/webp"

                />


                <BrandingItem

                    type="favicon"

                    title="Website Favicon"

                    description="
                        Upload a favicon for browser tabs and bookmarks.
                    "

                    accept="image/png,image/x-icon,image/jpeg,image/webp"

                />


            </div>


            <div className="branding-guidelines">

                <h3>
                    Upload Guidelines
                </h3>

                <ul>

                    <li>
                        Supported formats: PNG, JPG, JPEG, WEBP
                    </li>

                    <li>
                        Recommended logo format: PNG with transparent background
                    </li>

                    <li>
                        Recommended favicon size: 32 × 32 or 64 × 64 pixels
                    </li>

                    <li>
                        Keep image files optimized for faster loading
                    </li>

                </ul>

            </div>


        </div>

    );

}

export default BrandingSettings;
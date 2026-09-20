import { useEffect, useRef, useState } from "react";
import api from "../config/axios";
import "./Profile.css";

function Profile() {
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);

    const [preview, setPreview] = useState("");
    const [profileImage, setProfileImage] = useState(null);

    const objectUrlRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        ghanaCard: "",
        region: "",
        city: "",
        address: "",
    });

    /*
     * ==========================================================
     * API ORIGIN
     * ==========================================================
     */

    const API_URL =
        import.meta.env.VITE_API_URL || "/api";

    const API_ORIGIN = API_URL.startsWith("http")
        ? API_URL.replace(/\/api\/?$/, "")
        : "";

    /*
     * ==========================================================
     * BUILD PROFILE IMAGE URL
     * ==========================================================
     */

    const getImageUrl = (image) => {
        if (!image || typeof image !== "string") {
            return "";
        }

        const trimmedImage = image.trim();

        if (!trimmedImage) {
            return "";
        }

        // Already an absolute URL
        if (
            trimmedImage.startsWith("http://") ||
            trimmedImage.startsWith("https://")
        ) {
            return trimmedImage;
        }

        // Local absolute path
        if (trimmedImage.startsWith("/")) {
            return `${API_ORIGIN}${trimmedImage}`;
        }

        // Stored as "uploads/..."
        if (
            trimmedImage.startsWith("uploads/")
        ) {
            return `${API_ORIGIN}/${trimmedImage}`;
        }

        // Stored as just a filename
        return `${API_ORIGIN}/uploads/${trimmedImage}`;
    };

    /*
     * ==========================================================
     * FALLBACK AVATAR
     * ==========================================================
     */

    const getInitials = () => {
        const name = formData.name?.trim();

        if (!name) {
            return "U";
        }

        const parts = name.split(/\s+/);

        if (parts.length === 1) {
            return parts[0]
                .charAt(0)
                .toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    };

    /*
     * ==========================================================
     * FETCH PROFILE
     * ==========================================================
     */

    useEffect(() => {
        fetchProfile();

        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(
                    objectUrlRef.current
                );
            }
        };
    }, []);

    const fetchProfile = async () => {
        try {
            setProfileLoading(true);

            const response = await api.get(
                "/users/profile"
            );

            const user = response.data?.user ||
                response.data;

            setFormData({
                name: user?.name || "",
                email: user?.email || "",
                phone: user?.phone || "",
                ghanaCard: user?.ghanaCard || "",
                region: user?.region || "",
                city: user?.city || "",
                address: user?.address || "",
            });

            if (user?.profileImage) {
                setPreview(
                    getImageUrl(
                        user.profileImage
                    )
                );
            } else {
                setPreview("");
            }
        } catch (error) {
            console.error(
                "FETCH PROFILE ERROR:",
                error.response?.data ||
                    error.message
            );
        } finally {
            setProfileLoading(false);
        }
    };

    /*
     * ==========================================================
     * HANDLE INPUT
     * ==========================================================
     */

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /*
     * ==========================================================
     * HANDLE PROFILE IMAGE
     * ==========================================================
     */

    const handleImage = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        // Allowed image types
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert(
                "Please select a JPG, JPEG, PNG, WEBP, or GIF image."
            );

            event.target.value = "";
            return;
        }

        // 5MB limit
        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            alert(
                "Profile image must be 5MB or smaller."
            );

            event.target.value = "";
            return;
        }

        // Remove previous object URL
        if (objectUrlRef.current) {
            URL.revokeObjectURL(
                objectUrlRef.current
            );
        }

        const objectUrl =
            URL.createObjectURL(file);

        objectUrlRef.current = objectUrl;

        setProfileImage(file);
        setPreview(objectUrl);
    };

    /*
     * ==========================================================
     * PROFILE IMAGE ERROR
     * ==========================================================
     */

    const handleImageError = (event) => {
        event.currentTarget.style.display =
            "none";

        const fallback =
            event.currentTarget.parentElement?.querySelector(
                ".profile-avatar-fallback"
            );

        if (fallback) {
            fallback.style.display = "flex";
        }
    };

    /*
     * ==========================================================
     * UPDATE PROFILE
     * ==========================================================
     */

    const updateProfile = async (event) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();

            data.append(
                "name",
                formData.name.trim()
            );

            data.append(
                "email",
                formData.email.trim()
            );

            data.append(
                "phone",
                formData.phone.trim()
            );

            data.append(
                "ghanaCard",
                formData.ghanaCard.trim()
            );

            data.append(
                "region",
                formData.region.trim()
            );

            data.append(
                "city",
                formData.city.trim()
            );

            data.append(
                "address",
                formData.address.trim()
            );

            if (profileImage) {
                data.append(
                    "profileImage",
                    profileImage
                );
            }

            /*
             * IMPORTANT:
             *
             * Do NOT manually set
             * Content-Type to multipart/form-data.
             *
             * Axios will generate the correct
             * multipart boundary automatically.
             */

            const response = await api.put(
                "/users/profile",
                data
            );

            console.log(
                "PROFILE UPDATE RESPONSE:",
                response.data
            );

            const updatedUser =
                response.data?.user;

            if (updatedUser) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );

                setFormData({
                    name:
                        updatedUser.name ||
                        "",
                    email:
                        updatedUser.email ||
                        "",
                    phone:
                        updatedUser.phone ||
                        "",
                    ghanaCard:
                        updatedUser.ghanaCard ||
                        "",
                    region:
                        updatedUser.region ||
                        "",
                    city:
                        updatedUser.city ||
                        "",
                    address:
                        updatedUser.address ||
                        "",
                });

                if (
                    updatedUser.profileImage &&
                    !objectUrlRef.current
                ) {
                    setPreview(
                        getImageUrl(
                            updatedUser.profileImage
                        )
                    );
                }
            }

            // Clear selected file after successful upload
            setProfileImage(null);

            if (objectUrlRef.current) {
                URL.revokeObjectURL(
                    objectUrlRef.current
                );

                objectUrlRef.current = null;
            }

            // Reload profile image from server
            await fetchProfile();

            alert(
                response.data?.message ||
                    "Profile updated successfully."
            );
        } catch (error) {
            console.error(
                "UPDATE PROFILE ERROR:",
                error.response?.data ||
                    error.message
            );

            alert(
                error.response?.data?.message ||
                    "Unable to update profile."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     * ==========================================================
     * LOADING SCREEN
     * ==========================================================
     */

    if (profileLoading) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <div
                        style={{
                            textAlign: "center",
                            padding: "40px 20px",
                            color: "#64748b",
                        }}
                    >
                        Loading profile...
                    </div>
                </div>
            </div>
        );
    }

    /*
     * ==========================================================
     * PAGE
     * ==========================================================
     */

    return (
        <div className="profile-page">
            <form
                className="profile-card"
                onSubmit={updateProfile}
            >
                <h1>My Profile</h1>

                {/* ==================================================
                    PROFILE PICTURE
                ================================================== */}

                <div className="profile-picture">
                    {preview && (
                        <img
                            src={preview}
                            alt="Profile"
                            onError={
                                handleImageError
                            }
                        />
                    )}

                    <div
                        className="profile-avatar-fallback"
                        style={{
                            display: preview
                                ? "none"
                                : "flex",
                        }}
                    >
                        {getInitials()}
                    </div>

                    <label
                        htmlFor="profileImage"
                        className="profile-image-button"
                    >
                        Change Photo
                    </label>

                    <input
                        id="profileImage"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleImage}
                        style={{
                            display: "none",
                        }}
                    />
                </div>

                {/* ==================================================
                    PROFILE INFORMATION
                ================================================== */}

                <div className="profile-grid">
                    <div>
                        <label htmlFor="name">
                            Full Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={
                                formData.name
                            }
                            onChange={
                                handleChange
                            }
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={
                                formData.email
                            }
                            onChange={
                                handleChange
                            }
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="phone">
                            Phone Number
                        </label>

                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={
                                formData.phone
                            }
                            onChange={
                                handleChange
                            }
                            autoComplete="tel"
                        />
                    </div>

                    <div>
                        <label htmlFor="ghanaCard">
                            Ghana Card
                        </label>

                        <input
                            id="ghanaCard"
                            type="text"
                            name="ghanaCard"
                            value={
                                formData.ghanaCard
                            }
                            onChange={
                                handleChange
                            }
                            autoComplete="off"
                        />
                    </div>

                    <div>
                        <label htmlFor="region">
                            Region
                        </label>

                        <input
                            id="region"
                            type="text"
                            name="region"
                            value={
                                formData.region
                            }
                            onChange={
                                handleChange
                            }
                            autoComplete="address-level1"
                        />
                    </div>

                    <div>
                        <label htmlFor="city">
                            City
                        </label>

                        <input
                            id="city"
                            type="text"
                            name="city"
                            value={
                                formData.city
                            }
                            onChange={
                                handleChange
                            }
                            autoComplete="address-level2"
                        />
                    </div>
                </div>

                {/* ==================================================
                    ADDRESS
                ================================================== */}

                <div className="profile-address">
                    <label htmlFor="address">
                        Address
                    </label>

                    <textarea
                        id="address"
                        rows="4"
                        name="address"
                        value={
                            formData.address
                        }
                        onChange={
                            handleChange
                        }
                        autoComplete="street-address"
                    />
                </div>

                {/* ==================================================
                    SAVE BUTTON
                ================================================== */}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Saving..."
                        : "Save Changes"}
                </button>
            </form>
        </div>
    );
}

export default Profile;
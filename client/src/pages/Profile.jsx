import { useEffect, useRef, useState } from "react";
import api from "../config/axios";
import "./Profile.css";

function Profile() {
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);

    const [preview, setPreview] = useState("");
    const [profileImage, setProfileImage] = useState(null);

    const objectUrlRef = useRef(null);
    const fileInputRef = useRef(null);

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
    ==========================================================
    API / SERVER CONFIGURATION
    ==========================================================
    */

    const getApiOrigin = () => {
        try {
            /*
             * IMPORTANT:
             *
             * Use the actual Axios baseURL.
             *
             * This works with:
             *
             * https://kad-marketplace-production.up.railway.app/api
             *
             * /api
             *
             * http://localhost:5000/api
             */
            const baseURL =
                api?.defaults?.baseURL ||
                import.meta.env.VITE_API_URL ||
                "/api";

            const url = new URL(
                baseURL,
                window.location.origin
            );

            /*
             * If baseURL is:
             *
             * https://server.com/api
             *
             * return:
             *
             * https://server.com
             */
            return url.origin;
        } catch (error) {
            console.error(
                "API ORIGIN ERROR:",
                error
            );

            return window.location.origin;
        }
    };

    /*
    ==========================================================
    PROFILE IMAGE URL
    ==========================================================
    */

    const getImageUrl = (image, cacheBust = false) => {
        if (!image) {
            return "";
        }

        if (typeof image !== "string") {
            return "";
        }

        let value = image.trim();

        if (!value) {
            return "";
        }

        /*
         * Already a complete URL
         */
        if (
            value.startsWith("http://") ||
            value.startsWith("https://")
        ) {
            if (cacheBust) {
                const separator = value.includes("?")
                    ? "&"
                    : "?";

                return `${value}${separator}v=${Date.now()}`;
            }

            return value;
        }

        const API_ORIGIN = getApiOrigin();

        /*
         * If backend stored:
         *
         * /uploads/profile.jpg
         */
        if (value.startsWith("/")) {
            value = value.replace(/^\/+/, "");

            const url =
                `${API_ORIGIN}/${value}`;

            return cacheBust
                ? `${url}?v=${Date.now()}`
                : url;
        }

        /*
         * If backend stored:
         *
         * uploads/profile.jpg
         */
        if (
            value.startsWith("uploads/")
        ) {
            const url =
                `${API_ORIGIN}/${value}`;

            return cacheBust
                ? `${url}?v=${Date.now()}`
                : url;
        }

        /*
         * Normal case:
         *
         * Database contains only:
         *
         * 1758394820192-profile.jpg
         *
         * Backend serves:
         *
         * /uploads/1758394820192-profile.jpg
         */
        const url =
            `${API_ORIGIN}/uploads/${encodeURIComponent(value)}`;

        return cacheBust
            ? `${url}?v=${Date.now()}`
            : url;
    };

    /*
    ==========================================================
    GET INITIALS
    ==========================================================
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
    ==========================================================
    FETCH PROFILE
    ==========================================================
    */

    useEffect(() => {
        fetchProfile();

        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(
                    objectUrlRef.current
                );

                objectUrlRef.current = null;
            }
        };
    }, []);

    const fetchProfile = async () => {
        try {
            setProfileLoading(true);

            const response = await api.get(
                "/users/profile"
            );

            console.log(
                "PROFILE RESPONSE:",
                response.data
            );

            const user =
                response.data?.user ||
                response.data;

            /*
             * Update profile information
             */
            setFormData({
                name: user?.name || "",
                email: user?.email || "",
                phone: user?.phone || "",
                ghanaCard:
                    user?.ghanaCard || "",
                region:
                    user?.region || "",
                city:
                    user?.city || "",
                address:
                    user?.address || "",
            });

            /*
             * Update profile image
             */
            if (user?.profileImage) {
                const imageUrl =
                    getImageUrl(
                        user.profileImage
                    );

                console.log(
                    "PROFILE IMAGE FROM SERVER:",
                    user.profileImage
                );

                console.log(
                    "PROFILE IMAGE URL:",
                    imageUrl
                );

                setPreview(imageUrl);
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
    ==========================================================
    HANDLE INPUT
    ==========================================================
    */

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /*
    ==========================================================
    SELECT PROFILE IMAGE
    ==========================================================
    */

    const handleImage = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        /*
         * Allowed formats
         */
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {
            alert(
                "Please select a JPG, JPEG, PNG, WEBP, or GIF image."
            );

            event.target.value = "";

            return;
        }

        /*
         * Maximum 5MB
         */
        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            alert(
                "Profile image must be 5MB or smaller."
            );

            event.target.value = "";

            return;
        }

        /*
         * Remove old preview URL
         */
        if (objectUrlRef.current) {
            URL.revokeObjectURL(
                objectUrlRef.current
            );
        }

        /*
         * Create temporary preview
         */
        const objectUrl =
            URL.createObjectURL(file);

        objectUrlRef.current =
            objectUrl;

        setProfileImage(file);
        setPreview(objectUrl);
    };

    /*
    ==========================================================
    PROFILE IMAGE ERROR
    ==========================================================
    */

    const handleImageError = (event) => {
        console.error(
            "PROFILE IMAGE FAILED:",
            event.currentTarget.src
        );

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
    ==========================================================
    UPDATE PROFILE
    ==========================================================
    */

    const updateProfile = async (event) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();

            /*
             * Profile information
             */
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

            /*
             * Profile image
             *
             * Backend expects:
             *
             * req.file
             *
             * and the field name:
             *
             * profileImage
             */
            if (profileImage) {
                data.append(
                    "profileImage",
                    profileImage,
                    profileImage.name
                );
            }

            /*
             * DO NOT manually set:
             *
             * Content-Type: multipart/form-data
             *
             * Axios automatically creates
             * the correct multipart boundary.
             */
            const response =
                await api.put(
                    "/users/profile",
                    data
                );

            console.log(
                "PROFILE UPDATE RESPONSE:",
                response.data
            );

            if (
                !response.data?.success &&
                !response.data?.user
            ) {
                throw new Error(
                    response.data?.message ||
                        "Profile update failed."
                );
            }

            const updatedUser =
                response.data?.user;

            /*
             * Save updated user locally
             */
            if (updatedUser) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        updatedUser
                    )
                );

                /*
                 * Update form fields
                 */
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

                /*
                 * IMPORTANT:
                 *
                 * If a new image was uploaded,
                 * immediately use the server image.
                 */
                if (
                    updatedUser.profileImage
                ) {
                    const serverImage =
                        getImageUrl(
                            updatedUser.profileImage,
                            true
                        );

                    console.log(
                        "NEW SERVER PROFILE IMAGE:",
                        serverImage
                    );

                    setPreview(
                        serverImage
                    );
                }
            }

            /*
             * Remove temporary object URL
             */
            if (objectUrlRef.current) {
                URL.revokeObjectURL(
                    objectUrlRef.current
                );

                objectUrlRef.current = null;
            }

            /*
             * Clear selected file
             */
            setProfileImage(null);

            /*
             * Clear file input
             */
            if (
                fileInputRef.current
            ) {
                fileInputRef.current.value =
                    "";
            }

            /*
             * Fetch the profile again from
             * the backend to make sure we have
             * the actual saved image.
             */
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
                error.response?.data
                    ?.message ||
                    error.message ||
                    "Unable to update profile."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    ==========================================================
    LOADING SCREEN
    ==========================================================
    */

    if (profileLoading) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <div
                        style={{
                            textAlign:
                                "center",
                            padding:
                                "40px 20px",
                            color:
                                "#64748b",
                        }}
                    >
                        Loading profile...
                    </div>
                </div>
            </div>
        );
    }

    /*
    ==========================================================
    PAGE
    ==========================================================
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
                            key={preview}
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
                            display:
                                preview
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
                        ref={
                            fileInputRef
                        }
                        id="profileImage"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={
                            handleImage
                        }
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
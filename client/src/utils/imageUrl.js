const API_ORIGIN =
    import.meta.env.VITE_API_ORIGIN ||
    "https://kad-marketplace-production.up.railway.app";

const FALLBACK_IMAGE =
    "/images/product-placeholder.png";

export const getImageUrl = (image) => {
    // ==========================================
    // NO IMAGE
    // ==========================================

    if (!image) {
        return FALLBACK_IMAGE;
    }

    const value = String(image).trim();

    if (!value) {
        return FALLBACK_IMAGE;
    }

    // ==========================================
    // ALREADY A COMPLETE URL
    // ==========================================

    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    // ==========================================
    // BACKEND UPLOAD PATH
    // Example:
    // /uploads/abc.jpg
    // ==========================================

    if (value.startsWith("/uploads/")) {
        return `${API_ORIGIN}${value}`;
    }

    // ==========================================
    // BACKEND UPLOAD PATH WITHOUT /
    // Example:
    // uploads/abc.jpg
    // ==========================================

    if (value.startsWith("uploads/")) {
        return `${API_ORIGIN}/${value}`;
    }

    // ==========================================
    // OTHER ABSOLUTE PATH
    // Example:
    // /images/example.jpg
    // ==========================================

    if (value.startsWith("/")) {
        return `${API_ORIGIN}${value}`;
    }

    // ==========================================
    // NORMAL DATABASE FILENAME
    // Example:
    // 1789905008592-194091026.jpg
    // ==========================================

    return `${API_ORIGIN}/uploads/${value}`;
};

export default getImageUrl;
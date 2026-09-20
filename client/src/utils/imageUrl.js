const API_ORIGIN =
    import.meta.env.VITE_API_ORIGIN ||
    "https://kad-marketplace-production.up.railway.app";

export const getImageUrl = (image) => {
    // No image
    if (!image) {
        return "/images/product-placeholder.png";
    }

    const value = String(image).trim();

    // Empty value
    if (!value) {
        return "/images/product-placeholder.png";
    }

    // Already a complete URL
    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    // Backend-relative path
    if (value.startsWith("/")) {
        return `${API_ORIGIN}${value}`;
    }

    // Filename only
    return `${API_ORIGIN}/uploads/${value}`;
};

export default getImageUrl;
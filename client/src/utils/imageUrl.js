const FALLBACK_IMAGE =
    "/images/product-placeholder.png";

/*
 * =========================================================
 * KAD MARKETPLACE CDN
 * =========================================================
 *
 * This is a PUBLIC URL.
 * It is safe to use as a frontend fallback.
 *
 * VITE_R2_PUBLIC_URL can still override it when configured.
 */
const DEFAULT_CDN_URL =
    "https://cdn.kadmarket.com";

const R2_PUBLIC_URL =
    (
        import.meta.env.VITE_R2_PUBLIC_URL ||
        DEFAULT_CDN_URL
    )
        .trim()
        .replace(/\/+$/, "");


/*
 * =========================================================
 * NORMALIZE IMAGE KEY
 * =========================================================
 */
const normalizeKey = (value) => {
    return String(value || "")
        .trim()
        .replace(/^\/+/, "")
        .replace(/\\/g, "/");
};


/*
 * =========================================================
 * IMAGE URL RESOLVER
 * =========================================================
 */
export const getImageUrl = (image) => {

    /*
     * =====================================================
     * NO IMAGE
     * =====================================================
     */
    if (!image) {
        return FALLBACK_IMAGE;
    }


    /*
     * =====================================================
     * ARRAY
     * =====================================================
     */
    if (Array.isArray(image)) {
        return image.length > 0
            ? getImageUrl(image[0])
            : FALLBACK_IMAGE;
    }


    /*
     * =====================================================
     * OBJECT
     * =====================================================
     */
    if (
        typeof image === "object" &&
        image !== null
    ) {

        const value =
            image.url ||
            image.location ||
            image.imageUrl ||
            image.r2Url ||
            image.r2Key ||
            image.key ||
            image.filename;

        return value
            ? getImageUrl(value)
            : FALLBACK_IMAGE;
    }


    /*
     * =====================================================
     * STRING
     * =====================================================
     */
    const value =
        String(image).trim();

    if (!value) {
        return FALLBACK_IMAGE;
    }


    /*
     * =====================================================
     * FULL URL
     * =====================================================
     *
     * Keep R2/CDN/external URLs untouched.
     */
    if (
        /^https?:\/\//i.test(value) ||
        value.startsWith("blob:") ||
        value.startsWith("data:")
    ) {
        return value;
    }


    /*
     * =====================================================
     * LOCAL FRONTEND STATIC ASSETS
     * =====================================================
     */
    if (
        value.startsWith("/images/") ||
        value.startsWith("/assets/")
    ) {
        return value;
    }


    /*
     * =====================================================
     * NORMALIZE R2 KEY
     * =====================================================
     */
    const key =
        normalizeKey(value);

    if (!key) {
        return FALLBACK_IMAGE;
    }


    /*
     * =====================================================
     * ALREADY A CDN PATH
     * =====================================================
     *
     * Prevent:
     *
     * cdn.kadmarket.com/uploads/uploads/file.jpg
     */
    const r2Key =
        key.startsWith("uploads/")
            ? key
            : `uploads/${key}`;


    /*
     * =====================================================
     * CLOUDFLARE R2 / CDN URL
     * =====================================================
     */
    return `${R2_PUBLIC_URL}/${r2Key
        .split("/")
        .map(
            (part) =>
                encodeURIComponent(part)
        )
        .join("/")}`;
};


/*
 * =========================================================
 * DEFAULT EXPORT
 * =========================================================
 */
export default getImageUrl;
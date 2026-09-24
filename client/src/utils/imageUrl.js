const FALLBACK_IMAGE =
    "/images/product-placeholder.png";


/* =========================================================
   GET R2/CDN PUBLIC URL
========================================================= */

const R2_PUBLIC_URL =
    import.meta.env.VITE_R2_PUBLIC_URL
        ?.trim()
        .replace(/\/+$/, "") || "";


/* =========================================================
   NORMALIZE IMAGE KEY
========================================================= */

const normalizeKey = (value) => {
    return String(value || "")
        .trim()
        .replace(/^\/+/, "")
        .replace(/\\/g, "/");
};


/* =========================================================
   IMAGE URL RESOLVER
========================================================= */

export const getImageUrl = (image) => {
    if (!image) {
        return FALLBACK_IMAGE;
    }


    /* =====================================================
       ARRAY
    ===================================================== */

    if (Array.isArray(image)) {
        return image.length > 0
            ? getImageUrl(image[0])
            : FALLBACK_IMAGE;
    }


    /* =====================================================
       OBJECT
       Supports different backend formats.
    ===================================================== */

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


    /* =====================================================
       STRING
    ===================================================== */

    const value = String(image).trim();

    if (!value) {
        return FALLBACK_IMAGE;
    }


    /* =====================================================
       FULL URL
       R2/CDN URL
       External image URL
    ===================================================== */

    if (/^https?:\/\//i.test(value)) {
        return value;
    }


    /* =====================================================
       LOCAL FRONTEND STATIC ASSETS
       
       These are NOT uploaded marketplace files.
    ===================================================== */

    if (
        value.startsWith("/images/") ||
        value.startsWith("/assets/")
    ) {
        return value;
    }


    /* =====================================================
       R2 OBJECT KEY
       
       Examples:

       uploads/products/image.jpg
       uploads/123-image.webp
    ===================================================== */

    const key = normalizeKey(value);

    if (!key) {
        return FALLBACK_IMAGE;
    }


    /*
     * If the backend has not supplied a full URL but the
     * frontend has the R2 public URL configured, construct
     * the R2 URL.
     */

    if (R2_PUBLIC_URL) {
        const r2Key = key.startsWith("uploads/")
            ? key
            : `uploads/${key}`;

        return `${R2_PUBLIC_URL}/${r2Key
            .split("/")
            .map(encodeURIComponent)
            .join("/")}`;
    }


    /*
     * IMPORTANT:
     *
     * Do NOT fall back to:
     *
     * /uploads/image.jpg
     *
     * or:
     *
     * https://kad-marketplace-production.up.railway.app/uploads/...
     *
     * because those point to local/Railway storage.
     */

    return FALLBACK_IMAGE;
};


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default getImageUrl;
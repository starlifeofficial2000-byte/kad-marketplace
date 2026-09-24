const {
    Store,
    User,
    Product,
    StoreFollow,
    Review
} = require("../models");

const {
    getR2PublicUrl,
    deleteFromR2
} = require("../config/r2");


/* =====================================================
   CREATE STORE SLUG
===================================================== */

const createSlug = (name) => {
    return String(name || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};


/* =====================================================
   IMAGE HELPERS
===================================================== */

/*
 * Returns the R2 key when possible.
 *
 * New records:
 *   uploads/stores/xxxxx.jpg
 *
 * Older records may contain:
 *   /uploads/stores/xxxxx.jpg
 *
 * We keep the old value recognizable so existing
 * images are not immediately broken.
 */

const getStoredImageKey = (image) => {
    if (!image) return null;

    if (typeof image === "object") {
        image =
            image.r2Key ||
            image.key ||
            image.url ||
            image.location ||
            image.path ||
            image.filename;
    }

    if (!image) return null;

    let value = String(image).trim();

    if (!value) return null;

    /*
     * Full R2 URL
     */
    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        try {
            const parsed = new URL(value);

            const pathname =
                parsed.pathname
                    .replace(/^\/+/, "");

            /*
             * Only treat it as an R2 key when it
             * belongs to our configured R2 public URL.
             */
            const r2PublicUrl =
                process.env.R2_PUBLIC_URL
                    ?.trim()
                    .replace(/\/+$/, "");

            if (
                r2PublicUrl &&
                value.startsWith(r2PublicUrl)
            ) {
                return decodeURIComponent(pathname);
            }

            return null;
        } catch {
            return null;
        }
    }

    value = value
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

    return value;
};


/*
 * Convert a stored image value to a public URL.
 *
 * New R2 objects:
 *   uploads/stores/abc.jpg
 *
 * become:
 *   https://your-r2-domain/.../uploads/stores/abc.jpg
 *
 * Old Railway records are returned unchanged as a
 * relative /uploads/... path so we don't break old
 * data while migration is taking place.
 */

const resolveStoreImageUrl = (image) => {
    if (!image) return null;

    if (typeof image === "object") {
        image =
            image.url ||
            image.location ||
            image.r2Key ||
            image.key ||
            image.path ||
            image.filename;
    }

    if (!image) return null;

    const value = String(image).trim();

    if (!value) return null;

    /*
     * Already a complete URL.
     */
    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    /*
     * R2 object key.
     */
    const normalized = value
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

    if (
        normalized.startsWith("uploads/stores/")
    ) {
        const r2Url =
            getR2PublicUrl(normalized);

        if (r2Url) {
            return r2Url;
        }
    }

    /*
     * Legacy Railway/local image.
     *
     * This is intentionally retained for OLD
     * database records only.
     */
    if (
        normalized.startsWith("uploads/")
    ) {
        return `/${normalized}`;
    }

    return `/${normalized}`;
};


/*
 * Format a Store without changing the database
 * representation.
 */

const formatStore = (store) => {
    if (!store) return null;

    const plain =
        typeof store.toJSON === "function"
            ? store.toJSON()
            : { ...store };

    return {
        ...plain,

        logo: resolveStoreImageUrl(
            plain.logo
        ),

        banner: resolveStoreImageUrl(
            plain.banner
        )
    };
};


/*
 * Format products so Store pages use the same
 * image architecture.
 */

const parseImages = (images) => {
    if (!images) return [];

    if (Array.isArray(images)) {
        return images;
    }

    if (typeof images === "string") {
        try {
            const parsed =
                JSON.parse(images);

            return Array.isArray(parsed)
                ? parsed
                : [images];
        } catch {
            return [images];
        }
    }

    return [images];
};


const formatProduct = (product) => {
    if (!product) return null;

    const plain =
        typeof product.toJSON === "function"
            ? product.toJSON()
            : { ...product };

    const images =
        parseImages(plain.images);

    return {
        ...plain,

        images: images
            .map(resolveStoreImageUrl)
            .filter(Boolean)
    };
};


const formatProducts = (products) => {
    return (products || [])
        .map(formatProduct);
};


/*
 * Determine whether an image belongs to R2.
 */

const getR2KeyFromStoredImage = (image) => {
    if (!image) return null;

    if (typeof image === "object") {
        image =
            image.r2Key ||
            image.key ||
            image.url ||
            image.location;
    }

    if (!image) return null;

    let value =
        String(image).trim();

    if (!value) return null;

    /*
     * R2 public URL.
     */
    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        const publicUrl =
            process.env.R2_PUBLIC_URL
                ?.trim()
                .replace(/\/+$/, "");

        if (
            publicUrl &&
            value.startsWith(publicUrl)
        ) {
            try {
                const parsed =
                    new URL(value);

                return decodeURIComponent(
                    parsed.pathname
                        .replace(/^\/+/, "")
                );
            } catch {
                return null;
            }
        }

        return null;
    }

    value = value
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

    /*
     * Only delete objects that are clearly
     * inside the Store R2 directory.
     */
    if (
        value.startsWith(
            "uploads/stores/"
        )
    ) {
        return value;
    }

    return null;
};


/*
 * Safely delete a previous R2 Store image.
 */

const deleteOldStoreImage = async (image) => {
    const key =
        getR2KeyFromStoredImage(image);

    if (!key) return;

    try {
        await deleteFromR2(key);

        console.log(
            "OLD STORE R2 IMAGE DELETED:",
            key
        );
    } catch (error) {
        /*
         * Don't make a successful database update
         * fail simply because cleanup failed.
         */
        console.error(
            "FAILED TO DELETE OLD STORE R2 IMAGE:",
            key,
            error.message
        );
    }
};


/* =====================================================
   GET MY STORE
===================================================== */

exports.getMyStore = async (req, res) => {
    try {
        let store =
            await Store.findOne({
                where: {
                    userId: req.user.id
                }
            });

        if (!store) {
            const storeName =
                `${req.user.name}'s Store`;

            let storeSlug =
                createSlug(storeName);

            storeSlug =
                `${storeSlug}-${req.user.id}`;

            store =
                await Store.create({
                    userId:
                        req.user.id,

                    storeName,

                    storeSlug,

                    email:
                        req.user.email,

                    phone:
                        req.user.phone ||
                        null,

                    status:
                        "Active"
                });
        }

        return res.status(200).json({
            success: true,
            store:
                formatStore(store)
        });

    } catch (error) {
        console.error(
            "GET MY STORE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load store.",
            error:
                error.message
        });
    }
};


/* =====================================================
   UPDATE STORE
===================================================== */

exports.updateStore = async (req, res) => {
    try {
        const store =
            await Store.findOne({
                where: {
                    userId:
                        req.user.id
                }
            });

        if (!store) {
            return res.status(404).json({
                success: false,
                message:
                    "Store not found."
            });
        }

        const allowedFields = [
            "storeName",
            "description",
            "phone",
            "email",
            "website",
            "businessCategory",
            "businessHours",
            "facebook",
            "instagram",
            "tiktok",
            "x",
            "whatsapp",
            "accentColor",
            "coverColor",
            "region",
            "city",
            "address",
            "metaTitle",
            "metaDescription"
        ];

        allowedFields.forEach(
            (field) => {
                if (
                    req.body[field] !==
                    undefined
                ) {
                    store[field] =
                        req.body[field];
                }
            }
        );

        if (req.body.storeName) {
            let newSlug =
                createSlug(
                    req.body.storeName
                );

            newSlug =
                `${newSlug}-${req.user.id}`;

            store.storeSlug =
                newSlug;
        }

        await store.save();

        return res.status(200).json({
            success: true,
            message:
                "Store updated successfully.",
            store:
                formatStore(store)
        });

    } catch (error) {
        console.error(
            "UPDATE STORE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update store.",
            error:
                error.message
        });
    }
};


/* =====================================================
   UPLOAD STORE LOGO
===================================================== */

exports.uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "No logo file uploaded."
            });
        }

        const store =
            await Store.findOne({
                where: {
                    userId:
                        req.user.id
                }
            });

        if (!store) {
            /*
             * Since the middleware already uploaded
             * the object to R2, clean it up if there
             * is no Store.
             */
            await deleteOldStoreImage(
                req.file.r2Key
            );

            return res.status(404).json({
                success: false,
                message:
                    "Store not found."
            });
        }

        const newKey =
            req.file.r2Key ||
            req.file.key;

        if (!newKey) {
            return res.status(500).json({
                success: false,
                message:
                    "R2 upload did not return an object key."
            });
        }

        const oldLogo =
            store.logo;

        store.logo =
            newKey;

        try {
            await store.save();
        } catch (databaseError) {
            /*
             * DB failed, remove the new R2
             * object so we don't leave an orphan.
             */
            await deleteOldStoreImage(
                newKey
            );

            throw databaseError;
        }

        /*
         * Only after the database update succeeds
         * remove the previous R2 object.
         */
        await deleteOldStoreImage(
            oldLogo
        );

        const logoUrl =
            resolveStoreImageUrl(
                newKey
            );

        return res.status(200).json({
            success: true,
            message:
                "Logo uploaded successfully.",
            logo:
                logoUrl,
            store:
                formatStore(store)
        });

    } catch (error) {
        console.error(
            "UPLOAD LOGO ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to upload logo.",
            error:
                error.message
        });
    }
};


/* =====================================================
   UPLOAD STORE BANNER
===================================================== */

exports.uploadBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "No banner file uploaded."
            });
        }

        const store =
            await Store.findOne({
                where: {
                    userId:
                        req.user.id
                }
            });

        if (!store) {
            await deleteOldStoreImage(
                req.file.r2Key
            );

            return res.status(404).json({
                success: false,
                message:
                    "Store not found."
            });
        }

        const newKey =
            req.file.r2Key ||
            req.file.key;

        if (!newKey) {
            return res.status(500).json({
                success: false,
                message:
                    "R2 upload did not return an object key."
            });
        }

        const oldBanner =
            store.banner;

        store.banner =
            newKey;

        try {
            await store.save();
        } catch (databaseError) {
            await deleteOldStoreImage(
                newKey
            );

            throw databaseError;
        }

        await deleteOldStoreImage(
            oldBanner
        );

        const bannerUrl =
            resolveStoreImageUrl(
                newKey
            );

        return res.status(200).json({
            success: true,
            message:
                "Banner uploaded successfully.",
            banner:
                bannerUrl,
            store:
                formatStore(store)
        });

    } catch (error) {
        console.error(
            "UPLOAD BANNER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to upload banner.",
            error:
                error.message
        });
    }
};


/* =====================================================
   GET FEATURED STORES
===================================================== */

exports.getFeaturedStores = async (
    req,
    res
) => {
    try {
        const stores =
            await Store.findAll({
                where: {
                    featured: true,
                    status: "Active"
                },

                order: [
                    [
                        "listingPriority",
                        "DESC"
                    ],
                    [
                        "createdAt",
                        "DESC"
                    ]
                ],

                limit: 10
            });

        return res.status(200).json({
            success: true,
            stores:
                stores.map(formatStore)
        });

    } catch (error) {
        console.error(
            "GET FEATURED STORES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load featured stores."
        });
    }
};


/* =====================================================
   GET PUBLIC STORE
===================================================== */

exports.getPublicStore = async (
    req,
    res
) => {
    try {
        const {
            storeSlug
        } = req.params;

        if (!storeSlug) {
            return res.status(400).json({
                success: false,
                message:
                    "Store slug is required."
            });
        }

        const store =
            await Store.findOne({
                where: {
                    storeSlug
                }
            });

        if (!store) {
            return res.status(404).json({
                success: false,
                message:
                    "Store not found."
            });
        }

        const products =
            await Product.findAll({
                where: {
                    userId:
                        store.userId,

                    status:
                        "Approved",

                    deleted:
                        false
                },

                order: [
                    [
                        "displayDate",
                        "DESC"
                    ]
                ]
            });

        return res.status(200).json({
            success: true,

            store:
                formatStore(store),

            products:
                formatProducts(products)
        });

    } catch (error) {
        console.error(
            "GET PUBLIC STORE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load store.",
            error:
                error.message
        });
    }
};


/* =====================================================
   FOLLOW STORE
===================================================== */

exports.followStore = async (
    req,
    res
) => {
    try {
        const store =
            await Store.findByPk(
                req.params.id
            );

        if (!store) {
            return res.status(404).json({
                success: false,
                message:
                    "Store not found."
            });
        }

        if (
            Number(store.userId) ===
            Number(req.user.id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot follow your own store."
            });
        }

        const existingFollow =
            await StoreFollow.findOne({
                where: {
                    userId:
                        req.user.id,

                    storeId:
                        store.id
                }
            });

        if (existingFollow) {
            return res.status(400).json({
                success: false,
                message:
                    "You already follow this store."
            });
        }

        await StoreFollow.create({
            userId:
                req.user.id,

            storeId:
                store.id
        });

        store.followers =
            await StoreFollow.count({
                where: {
                    storeId:
                        store.id
                }
            });

        await store.save();

        return res.status(200).json({
            success: true,
            message:
                "Store followed successfully.",
            followers:
                store.followers
        });

    } catch (error) {
        console.error(
            "FOLLOW STORE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to follow store.",
            error:
                error.message
        });
    }
};


/* =====================================================
   UNFOLLOW STORE
===================================================== */

exports.unfollowStore = async (
    req,
    res
) => {
    try {
        const store =
            await Store.findByPk(
                req.params.id
            );

        if (!store) {
            return res.status(404).json({
                success: false,
                message:
                    "Store not found."
            });
        }

        const follow =
            await StoreFollow.findOne({
                where: {
                    userId:
                        req.user.id,

                    storeId:
                        store.id
                }
            });

        if (!follow) {
            return res.status(400).json({
                success: false,
                message:
                    "You are not following this store."
            });
        }

        await follow.destroy();

        store.followers =
            await StoreFollow.count({
                where: {
                    storeId:
                        store.id
                }
            });

        await store.save();

        return res.status(200).json({
            success: true,
            message:
                "Store unfollowed successfully.",
            followers:
                store.followers
        });

    } catch (error) {
        console.error(
            "UNFOLLOW STORE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to unfollow store.",
            error:
                error.message
        });
    }
};


/* =====================================================
   GET STORE REVIEWS
===================================================== */

exports.getStoreReviews = async (
    req,
    res
) => {
    try {
        if (!Review) {
            return res.status(200).json({
                success: true,
                reviews: []
            });
        }

        const reviews =
            await Review.findAll({
                where: {
                    storeId:
                        req.params.id
                },

                order: [
                    [
                        "createdAt",
                        "DESC"
                    ]
                ]
            });

        return res.status(200).json({
            success: true,
            reviews
        });

    } catch (error) {
        console.error(
            "GET STORE REVIEWS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load reviews."
        });
    }
};


/* =====================================================
   GET STORE PRODUCTS
===================================================== */

exports.getStoreProducts = async (
    req,
    res
) => {
    try {
        const store =
            await Store.findByPk(
                req.params.id
            );

        if (!store) {
            return res.status(404).json({
                success: false,
                message:
                    "Store not found."
            });
        }

        const products =
            await Product.findAll({
                where: {
                    userId:
                        store.userId,

                    status:
                        "Approved",

                    deleted:
                        false
                },

                order: [
                    [
                        "createdAt",
                        "DESC"
                    ]
                ]
            });

        return res.status(200).json({
            success: true,
            products:
                formatProducts(products)
        });

    } catch (error) {
        console.error(
            "GET STORE PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load store products."
        });
    }
};
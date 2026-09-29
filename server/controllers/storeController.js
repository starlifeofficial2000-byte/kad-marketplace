// controllers/storeController.js

const { Op } = require("sequelize");

const { Store, Product, StoreFollower, StoreReview } = require("../models");

const {
    getR2PublicUrl,
    deleteFromR2
} = require("../config/r2");


/* ============================================================
   IMAGE HELPERS
============================================================ */

/**
 * Convert any stored image representation into a usable URL.
 *
 * Supported:
 * - Full Cloudflare R2 URL
 * - R2 object key
 * - Old local uploads path
 * - Object containing url / r2Key / key / location / path
 */
const resolveStoreImageUrl = (image) => {
    if (!image) {
        return null;
    }

    /* Object representation */
    if (typeof image === "object") {
        image =
            image.url ||
            image.location ||
            image.r2Key ||
            image.key ||
            image.path ||
            image.filename;
    }

    if (!image) {
        return null;
    }

    let value = String(image).trim();

    if (!value) {
        return null;
    }

    /* Already a complete URL */
    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    /* Normalize Windows / duplicate slashes */
    const normalized = value
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

    /*
     * R2 store object.
     *
     * Example:
     * uploads/stores/1750000000-logo.jpg
     */
    if (normalized.startsWith("uploads/stores/")) {
        try {
            return getR2PublicUrl(normalized);
        } catch (error) {
            console.error(
                "R2 PUBLIC URL ERROR:",
                error.message
            );

            return null;
        }
    }

    /*
     * Legacy local image.
     *
     * This keeps old records working.
     */
    if (normalized.startsWith("uploads/")) {
        return `/${normalized}`;
    }

    return `/${normalized}`;
};


/**
 * Convert a Store Sequelize object to JSON
 * without changing the database values.
 */
const formatStore = (store) => {
    if (!store) {
        return null;
    }

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


/* ============================================================
   PRODUCT IMAGE HELPERS
============================================================ */

const parseImages = (images) => {
    if (!images) {
        return [];
    }

    if (Array.isArray(images)) {
        return images;
    }

    if (typeof images === "string") {
        try {
            const parsed = JSON.parse(images);

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
    if (!product) {
        return null;
    }

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


/* ============================================================
   R2 KEY HELPERS
============================================================ */

/**
 * Get the R2 object key from a stored image.
 *
 * IMPORTANT:
 * We only return keys belonging to:
 *
 * uploads/stores/
 *
 * This prevents deleting unrelated R2 files.
 */
const getR2KeyFromStoredImage = (image) => {
    if (!image) {
        return null;
    }

    if (typeof image === "object") {
        image =
            image.r2Key ||
            image.key ||
            image.url ||
            image.location;
    }

    if (!image) {
        return null;
    }

    let value = String(image).trim();

    if (!value) {
        return null;
    }

    /*
     * Full R2 public URL.
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

                const key =
                    decodeURIComponent(
                        parsed.pathname
                            .replace(/^\/+/, "")
                    );

                if (
                    key.startsWith(
                        "uploads/stores/"
                    )
                ) {
                    return key;
                }

            } catch (error) {
                console.error(
                    "R2 URL PARSE ERROR:",
                    error.message
                );

                return null;
            }
        }

        return null;
    }

    value = value
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

    if (
        value.startsWith(
            "uploads/stores/"
        )
    ) {
        return value;
    }

    return null;
};


/**
 * Delete an old store image from R2.
 *
 * If the image is an old local file,
 * nothing is deleted from R2.
 */
const deleteOldStoreImage = async (image) => {
    const key =
        getR2KeyFromStoredImage(image);

    if (!key) {
        return;
    }

    try {
        await deleteFromR2(key);

        console.log(
            "[R2] Deleted old store image:",
            key
        );

    } catch (error) {
        /*
         * Do not fail the entire store update
         * just because deletion of an old image
         * failed.
         */
        console.error(
            "[R2] FAILED TO DELETE OLD STORE IMAGE:",
            key,
            error.message
        );
    }
};


/* ============================================================
   GET MY STORE
============================================================ */

exports.getMyStore = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const store =
            await Store.findOne({
                where: {
                    userId: req.user.id
                }
            });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found."
            });
        }

        console.log(
            "MY STORE:",
            store.toJSON()
        );

        return res.status(200).json({
            success: true,
            store: formatStore(store)
        });

    } catch (error) {
        console.error(
            "GET MY STORE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load your store.",
            error: error.message
        });
    }
};


/* ============================================================
   UPDATE STORE INFORMATION
============================================================ */

exports.updateStore = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const {
            storeName,
            description,
            phone,
            email,
            location,
            address,
            website,
            facebook,
            instagram,
            twitter,
            whatsapp
        } = req.body;

        console.log(
            "UPDATING STORE:",
            req.body
        );

        const store =
            await Store.findOne({
                where: {
                    userId: req.user.id
                }
            });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found."
            });
        }

        /*
         * Only update supplied fields.
         *
         * This is important because the frontend
         * should NOT accidentally erase logo/banner.
         */
        if (
            storeName !== undefined
        ) {
            const cleanName =
                String(storeName).trim();

            if (!cleanName) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Store name is required."
                });
            }

            store.storeName =
                cleanName;
        }

        if (
            description !== undefined
        ) {
            store.description =
                String(description).trim();
        }

        if (
            phone !== undefined
        ) {
            store.phone =
                String(phone).trim();
        }

        if (
            email !== undefined
        ) {
            store.email =
                String(email).trim();
        }

        if (
            location !== undefined
        ) {
            store.location =
                String(location).trim();
        }

        if (
            address !== undefined
        ) {
            store.address =
                String(address).trim();
        }

        if (
            website !== undefined
        ) {
            store.website =
                String(website).trim();
        }

        if (
            facebook !== undefined
        ) {
            store.facebook =
                String(facebook).trim();
        }

        if (
            instagram !== undefined
        ) {
            store.instagram =
                String(instagram).trim();
        }

        if (
            twitter !== undefined
        ) {
            store.twitter =
                String(twitter).trim();
        }

        if (
            whatsapp !== undefined
        ) {
            store.whatsapp =
                String(whatsapp).trim();
        }

        await store.save();

        console.log(
            "STORE UPDATED:",
            store.toJSON()
        );

        return res.status(200).json({
            success: true,
            message:
                "Store updated successfully.",
            store: formatStore(store)
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
            error: error.message
        });
    }
};


/* ============================================================
   UPLOAD STORE LOGO
============================================================ */

exports.uploadLogo = async (req, res) => {
    let uploadedKey = null;

    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        console.log(
            "===== STORE LOGO UPLOAD ====="
        );

        console.log(
            "FILE:",
            req.file
                ? {
                    originalname:
                        req.file.originalname,
                    mimetype:
                        req.file.mimetype,
                    size:
                        req.file.size,
                    r2Key:
                        req.file.r2Key,
                    url:
                        req.file.url,
                    location:
                        req.file.location
                }
                : null
        );

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "No logo file was uploaded."
            });
        }

        /*
         * storeUpload.js should already have
         * uploaded this file to R2.
         */
        uploadedKey =
            req.file.r2Key ||
            req.file.key;

        if (!uploadedKey) {
            return res.status(500).json({
                success: false,
                message:
                    "Cloudflare R2 upload did not return an object key."
            });
        }

        console.log(
            "[R2] LOGO UPLOAD SUCCESS:",
            uploadedKey
        );

        const store =
            await Store.findOne({
                where: {
                    userId: req.user.id
                }
            });

        if (!store) {
            await deleteOldStoreImage(
                uploadedKey
            );

            return res.status(404).json({
                success: false,
                message: "Store not found."
            });
        }

        /*
         * Save old logo before replacing it.
         */
        const oldLogo =
            store.logo;

        /*
         * IMPORTANT:
         *
         * Store the R2 KEY in the database,
         * NOT a local /uploads path.
         */
        store.logo =
            uploadedKey;

        try {
            await store.save();
        } catch (databaseError) {
            /*
             * Database failed.
             * Remove newly uploaded R2 object
             * because it is no longer being used.
             */
            await deleteOldStoreImage(
                uploadedKey
            );

            throw databaseError;
        }

        console.log(
            "[DATABASE] LOGO SAVED:",
            store.logo
        );

        /*
         * Delete old R2 logo only after
         * the database has successfully saved.
         */
        await deleteOldStoreImage(
            oldLogo
        );

        const logoUrl =
            resolveStoreImageUrl(
                uploadedKey
            );

        console.log(
            "[R2] LOGO PUBLIC URL:",
            logoUrl
        );

        return res.status(200).json({
            success: true,
            message:
                "Logo uploaded successfully.",
            logo: logoUrl,
            store:
                formatStore(store)
        });

    } catch (error) {
        console.error(
            "UPLOAD LOGO ERROR:",
            error
        );

        /*
         * If something failed after R2 upload
         * but before database save, clean it.
         */
        if (uploadedKey) {
            /*
             * This is safe because the helper only
             * deletes uploads/stores/* objects.
             */
            await deleteOldStoreImage(
                uploadedKey
            );
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to upload logo.",
            error: error.message
        });
    }
};


/* ============================================================
   UPLOAD STORE BANNER
============================================================ */

exports.uploadBanner = async (req, res) => {
    let uploadedKey = null;

    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        console.log(
            "===== STORE BANNER UPLOAD ====="
        );

        console.log(
            "FILE:",
            req.file
                ? {
                    originalname:
                        req.file.originalname,
                    mimetype:
                        req.file.mimetype,
                    size:
                        req.file.size,
                    r2Key:
                        req.file.r2Key,
                    url:
                        req.file.url,
                    location:
                        req.file.location
                }
                : null
        );

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "No banner file was uploaded."
            });
        }

        /*
         * storeUpload.js uploads the file
         * to Cloudflare R2 before this controller
         * is called.
         */
        uploadedKey =
            req.file.r2Key ||
            req.file.key;

        if (!uploadedKey) {
            return res.status(500).json({
                success: false,
                message:
                    "Cloudflare R2 upload did not return an object key."
            });
        }

        console.log(
            "[R2] BANNER UPLOAD SUCCESS:",
            uploadedKey
        );

        const store =
            await Store.findOne({
                where: {
                    userId: req.user.id
                }
            });

        if (!store) {
            await deleteOldStoreImage(
                uploadedKey
            );

            return res.status(404).json({
                success: false,
                message: "Store not found."
            });
        }

        /*
         * Keep old banner so we can remove it
         * after the new banner is successfully saved.
         */
        const oldBanner =
            store.banner;

        /*
         * IMPORTANT:
         *
         * Save the Cloudflare R2 object key.
         */
        store.banner =
            uploadedKey;

        try {
            await store.save();
        } catch (databaseError) {
            /*
             * Database failed.
             * Remove newly uploaded object.
             */
            await deleteOldStoreImage(
                uploadedKey
            );

            throw databaseError;
        }

        console.log(
            "[DATABASE] BANNER SAVED:",
            store.banner
        );

        /*
         * Delete previous banner only after
         * successful database save.
         */
        await deleteOldStoreImage(
            oldBanner
        );

        const bannerUrl =
            resolveStoreImageUrl(
                uploadedKey
            );

        console.log(
            "[R2] BANNER PUBLIC URL:",
            bannerUrl
        );

        return res.status(200).json({
            success: true,
            message:
                "Banner uploaded successfully.",
            banner: bannerUrl,
            store:
                formatStore(store)
        });

    } catch (error) {
        console.error(
            "UPLOAD BANNER ERROR:",
            error
        );

        if (uploadedKey) {
            await deleteOldStoreImage(
                uploadedKey
            );
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to upload banner.",
            error: error.message
        });
    }
};


/* ============================================================
   GET FEATURED STORES
============================================================ */

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
                stores.map(
                    formatStore
                )
        });

    } catch (error) {
        console.error(
            "GET FEATURED STORES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load featured stores.",
            error: error.message
        });
    }
};


/* ============================================================
   GET PUBLIC STORE
============================================================ */

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
                formatProducts(
                    products
                )
        });

    } catch (error) {
        console.error(
            "GET PUBLIC STORE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load public store.",
            error: error.message
        });
    }
};


/* ============================================================
   FOLLOW STORE
============================================================ */

exports.followStore = async (
    req,
    res
) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const storeId =
            Number(req.params.id);

        if (!Number.isInteger(storeId)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid store ID."
            });
        }

        const store =
            await Store.findByPk(
                storeId
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

        const existing =
            await StoreFollower.findOne({
                where: {
                    storeId,
                    userId:
                        req.user.id
                }
            });

        if (existing) {
            return res.status(200).json({
                success: true,
                message:
                    "You are already following this store."
            });
        }

        await StoreFollower.create({
            storeId,
            userId:
                req.user.id
        });

        return res.status(201).json({
            success: true,
            message:
                "Store followed successfully."
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
            error: error.message
        });
    }
};


/* ============================================================
   UNFOLLOW STORE
============================================================ */

exports.unfollowStore = async (
    req,
    res
) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const storeId =
            Number(req.params.id);

        if (!Number.isInteger(storeId)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid store ID."
            });
        }

        await StoreFollower.destroy({
            where: {
                storeId,
                userId:
                    req.user.id
            }
        });

        return res.status(200).json({
            success: true,
            message:
                "Store unfollowed successfully."
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
            error: error.message
        });
    }
};


/* ============================================================
   GET STORE REVIEWS
============================================================ */

exports.getStoreReviews = async (
    req,
    res
) => {
    try {
        const storeId =
            Number(req.params.id);

        if (!Number.isInteger(storeId)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid store ID."
            });
        }

        const reviews =
            await StoreReview.findAll({
                where: {
                    storeId
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
                "Failed to load store reviews.",
            error: error.message
        });
    }
};


/* ============================================================
   GET STORE PRODUCTS
============================================================ */

exports.getStoreProducts = async (
    req,
    res
) => {
    try {
        const storeId =
            Number(req.params.id);

        if (!Number.isInteger(storeId)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid store ID."
            });
        }

        const store =
            await Store.findByPk(
                storeId
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
                        "displayDate",
                        "DESC"
                    ]
                ]
            });

        return res.status(200).json({
            success: true,
            products:
                formatProducts(
                    products
                )
        });

    } catch (error) {
        console.error(
            "GET STORE PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load store products.",
            error: error.message
        });
    }
};


/* ============================================================
   DEBUG
============================================================ */

console.log(
    "===== STORE CONTROLLER LOADED ====="
);

console.log({
    getMyStore:
        typeof exports.getMyStore,

    updateStore:
        typeof exports.updateStore,

    uploadLogo:
        typeof exports.uploadLogo,

    uploadBanner:
        typeof exports.uploadBanner,

    getPublicStore:
        typeof exports.getPublicStore,

    getFeaturedStores:
        typeof exports.getFeaturedStores,

    followStore:
        typeof exports.followStore,

    unfollowStore:
        typeof exports.unfollowStore,

    getStoreReviews:
        typeof exports.getStoreReviews,

    getStoreProducts:
        typeof exports.getStoreProducts
});
// controllers/storeController.js

const { Store, Product, StoreFollower, StoreReview } = require("../models");

const {
    getR2PublicUrl,
    deleteFromR2
} = require("../config/r2");


/* ============================================================
   STORE IMAGE HELPERS
============================================================ */

/**
 * Convert a stored Store image into a public URL.
 *
 * Database should normally contain:
 *
 * uploads/stores/xxxxxxxx-logo.png
 *
 * The API returns:
 *
 * https://your-r2-public-domain/uploads/stores/xxxxxxxx-logo.png
 *
 * Also supports old records containing:
 * - full URLs
 * - old /uploads/... paths
 * - objects containing r2Key/key/url/location/path/filename
 */
const resolveStoreImageUrl = (image) => {

    if (!image) {
        return null;
    }

    /* --------------------------------------------------------
       OBJECT REPRESENTATION
    -------------------------------------------------------- */

    if (typeof image === "object") {

        image =
            image.r2Key ||
            image.key ||
            image.url ||
            image.location ||
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


    /* --------------------------------------------------------
       ALREADY A COMPLETE URL
    -------------------------------------------------------- */

    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }


    /* --------------------------------------------------------
       NORMALIZE PATH
    -------------------------------------------------------- */

    const normalized =
        value
            .replace(/\\/g, "/")
            .replace(/^\/+/, "");


    /* --------------------------------------------------------
       CLOUDFLARE R2 STORE OBJECT
    -------------------------------------------------------- */

    if (
        normalized.startsWith(
            "uploads/stores/"
        )
    ) {

        try {

            return getR2PublicUrl(
                normalized
            );

        } catch (error) {

            console.error(
                "[STORE IMAGE] R2 PUBLIC URL ERROR:",
                error.message
            );

            return null;
        }
    }


    /* --------------------------------------------------------
       LEGACY LOCAL UPLOAD
       Keep old marketplace stores working.
    -------------------------------------------------------- */

    if (
        normalized.startsWith(
            "uploads/"
        )
    ) {
        return `/${normalized}`;
    }


    return `/${normalized}`;
};


/* ============================================================
   FORMAT STORE
============================================================ */

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

        /*
         * Database:
         * uploads/stores/logo-xxxxx.png
         *
         * API:
         * https://cdn.yourdomain.com/uploads/stores/logo-xxxxx.png
         */

        logo:
            resolveStoreImageUrl(
                plain.logo
            ),

        banner:
            resolveStoreImageUrl(
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

    if (!product) {
        return null;
    }

    const plain =
        typeof product.toJSON === "function"
            ? product.toJSON()
            : { ...product };

    const images =
        parseImages(
            plain.images
        );

    return {

        ...plain,

        images:
            images
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
 * Extract an R2 object key from a stored value.
 *
 * Only files inside:
 *
 * uploads/stores/
 *
 * are allowed to be deleted by this controller.
 */
const getR2KeyFromStoredImage = (image) => {

    if (!image) {
        return null;
    }


    /* --------------------------------------------------------
       OBJECT
    -------------------------------------------------------- */

    if (typeof image === "object") {

        image =
            image.r2Key ||
            image.key ||
            image.url ||
            image.location ||
            image.path;
    }

    if (!image) {
        return null;
    }

    let value =
        String(image).trim();

    if (!value) {
        return null;
    }


    /* --------------------------------------------------------
       FULL R2 URL
    -------------------------------------------------------- */

    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {

        const publicUrl =
            process.env.R2_PUBLIC_URL
                ?.trim()
                .replace(/\/+$/, "");

        if (
            !publicUrl ||
            !value.startsWith(
                publicUrl
            )
        ) {
            return null;
        }

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
                "[R2] URL PARSE ERROR:",
                error.message
            );

            return null;
        }

        return null;
    }


    /* --------------------------------------------------------
       R2 OBJECT KEY
    -------------------------------------------------------- */

    value =
        value
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


/* ============================================================
   DELETE OLD STORE IMAGE
============================================================ */

/**
 * Deletes an old Store logo/banner from R2.
 *
 * IMPORTANT:
 * This function intentionally does NOT throw.
 *
 * If deletion fails, the Store update should still
 * remain successful because the new image has already
 * been saved.
 */
const deleteOldStoreImage = async (image) => {

    const key =
        getR2KeyFromStoredImage(
            image
        );

    if (!key) {
        return;
    }

    try {

        await deleteFromR2(
            key
        );

        console.log(
            "[R2] Old store image deleted:",
            key
        );

    } catch (error) {

        console.error(
            "[R2] FAILED TO DELETE OLD STORE IMAGE:",
            key,
            error.message
        );
    }
};


/* ============================================================
   DELETE NEWLY UPLOADED IMAGE AFTER FAILED DATABASE SAVE
============================================================ */

const deleteUploadedFileAfterFailure = async (
    uploadedKey
) => {

    if (!uploadedKey) {
        return;
    }

    try {

        await deleteFromR2(
            uploadedKey
        );

        console.log(
            "[R2] New uploaded file cleaned up:",
            uploadedKey
        );

    } catch (error) {

        console.error(
            "[R2] FAILED TO CLEANUP NEW UPLOAD:",
            uploadedKey,
            error.message
        );
    }
};


/* ============================================================
   GET MY STORE
============================================================ */

exports.getMyStore = async (
    req,
    res
) => {

    try {

        if (
            !req.user ||
            !req.user.id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."
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

            return res.status(404).json({

                success: false,

                message:
                    "Store not found."
            });
        }


        console.log(
            "[STORE] My store loaded:",
            store.id
        );


        return res.status(200).json({

            success: true,

            store:
                formatStore(
                    store
                )
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

            error:
                error.message
        });
    }
};


/* ============================================================
   UPDATE STORE INFORMATION
============================================================ */

exports.updateStore = async (
    req,
    res
) => {

    try {

        if (
            !req.user ||
            !req.user.id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."
            });
        }


        const {

            storeName,
            description,
            phone,
            email,
            address,
            website,

            facebook,
            instagram,
            whatsapp,

            /*
             * Your Store model uses "x",
             * not "twitter".
             */
            x,

            region,
            city,

            businessCategory,
            businessHours,

            metaTitle,
            metaDescription,

            coverColor,
            accentColor

        } = req.body;


        console.log(
            "[STORE] Updating store:",
            req.body
        );


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


        /* ----------------------------------------------------
           STORE NAME
        ---------------------------------------------------- */

        if (
            storeName !== undefined
        ) {

            const cleanName =
                String(
                    storeName
                ).trim();


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


        /* ----------------------------------------------------
           BASIC INFORMATION
        ---------------------------------------------------- */

        if (
            description !== undefined
        ) {

            store.description =
                String(
                    description
                ).trim();
        }


        if (
            phone !== undefined
        ) {

            store.phone =
                String(
                    phone
                ).trim();
        }


        if (
            email !== undefined
        ) {

            store.email =
                String(
                    email
                ).trim();
        }


        if (
            address !== undefined
        ) {

            store.address =
                String(
                    address
                ).trim();
        }


        if (
            website !== undefined
        ) {

            store.website =
                String(
                    website
                ).trim();
        }


        /* ----------------------------------------------------
           SOCIAL MEDIA
        ---------------------------------------------------- */

        if (
            facebook !== undefined
        ) {

            store.facebook =
                String(
                    facebook
                ).trim();
        }


        if (
            instagram !== undefined
        ) {

            store.instagram =
                String(
                    instagram
                ).trim();
        }


        if (
            x !== undefined
        ) {

            store.x =
                String(
                    x
                ).trim();
        }


        if (
            whatsapp !== undefined
        ) {

            store.whatsapp =
                String(
                    whatsapp
                ).trim();
        }


        /* ----------------------------------------------------
           LOCATION
        ---------------------------------------------------- */

        if (
            region !== undefined
        ) {

            store.region =
                String(
                    region
                ).trim();
        }


        if (
            city !== undefined
        ) {

            store.city =
                String(
                    city
                ).trim();
        }


        /* ----------------------------------------------------
           BUSINESS INFORMATION
        ---------------------------------------------------- */

        if (
            businessCategory !== undefined
        ) {

            store.businessCategory =
                String(
                    businessCategory
                ).trim();
        }


        if (
            businessHours !== undefined
        ) {

            store.businessHours =
                String(
                    businessHours
                ).trim();
        }


        /* ----------------------------------------------------
           SEO
        ---------------------------------------------------- */

        if (
            metaTitle !== undefined
        ) {

            store.metaTitle =
                String(
                    metaTitle
                ).trim();
        }


        if (
            metaDescription !== undefined
        ) {

            store.metaDescription =
                String(
                    metaDescription
                ).trim();
        }


        /* ----------------------------------------------------
           COLORS
        ---------------------------------------------------- */

        if (
            coverColor !== undefined
        ) {

            store.coverColor =
                String(
                    coverColor
                ).trim();
        }


        if (
            accentColor !== undefined
        ) {

            store.accentColor =
                String(
                    accentColor
                ).trim();
        }


        /*
         * IMPORTANT:
         *
         * We deliberately DO NOT touch:
         *
         * store.logo
         * store.banner
         *
         * Therefore updating store information cannot
         * accidentally remove the Cloudflare R2 images.
         */


        await store.save();


        console.log(
            "[DATABASE] STORE UPDATED:",
            store.id
        );


        return res.status(200).json({

            success: true,

            message:
                "Store updated successfully.",

            store:
                formatStore(
                    store
                )
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


/* ============================================================
   UPLOAD STORE LOGO
============================================================ */

exports.uploadLogo = async (
    req,
    res
) => {

    let uploadedKey = null;

    let databaseSaved = false;


    try {

        /* ----------------------------------------------------
           AUTHENTICATION
        ---------------------------------------------------- */

        if (
            !req.user ||
            !req.user.id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."
            });
        }


        console.log(
            "========================================"
        );

        console.log(
            "[STORE R2] LOGO UPLOAD"
        );

        console.log(
            "========================================"
        );


        /* ----------------------------------------------------
           CHECK FILE
        ---------------------------------------------------- */

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "No logo file was uploaded."
            });
        }


        console.log(
            "[STORE R2] Uploaded file:",
            {
                originalname:
                    req.file.originalname,

                mimetype:
                    req.file.mimetype,

                size:
                    req.file.size,

                r2Key:
                    req.file.r2Key,

                url:
                    req.file.url
            }
        );


        /*
         * IMPORTANT:
         *
         * storeUpload.js already uploaded this
         * file to Cloudflare R2.
         *
         * We only need its key here.
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


        /* ----------------------------------------------------
           FIND STORE
        ---------------------------------------------------- */

        const store =
            await Store.findOne({

                where: {
                    userId:
                        req.user.id
                }

            });


        if (!store) {

            await deleteUploadedFileAfterFailure(
                uploadedKey
            );

            return res.status(404).json({

                success: false,

                message:
                    "Store not found."
            });
        }


        /* ----------------------------------------------------
           SAVE OLD LOGO
        ---------------------------------------------------- */

        const oldLogo =
            store.logo;


        /* ----------------------------------------------------
           SAVE NEW R2 KEY
        ---------------------------------------------------- */

        store.logo =
            uploadedKey;


        try {

            await store.save();

            databaseSaved = true;

        } catch (databaseError) {

            /*
             * Database failed.
             *
             * Remove the newly uploaded R2 object.
             */

            await deleteUploadedFileAfterFailure(
                uploadedKey
            );

            throw databaseError;
        }


        console.log(
            "[DATABASE] LOGO R2 KEY SAVED:",
            store.logo
        );


        /* ----------------------------------------------------
           DELETE OLD LOGO
        ---------------------------------------------------- */

        await deleteOldStoreImage(
            oldLogo
        );


        /* ----------------------------------------------------
           CREATE PUBLIC URL
        ---------------------------------------------------- */

        const logoUrl =
            resolveStoreImageUrl(
                uploadedKey
            );


        console.log(
            "[STORE R2] LOGO PUBLIC URL:",
            logoUrl
        );


        return res.status(200).json({

            success: true,

            message:
                "Logo uploaded successfully.",

            logo:
                logoUrl,

            store:
                formatStore(
                    store
                )
        });


    } catch (error) {

        console.error(
            "UPLOAD LOGO ERROR:",
            error
        );


        /*
         * CRITICAL:
         *
         * Do NOT delete uploadedKey here if
         * databaseSaved === true.
         *
         * Otherwise the newly saved logo would
         * be deleted from Cloudflare R2.
         */

        if (
            uploadedKey &&
            !databaseSaved
        ) {

            await deleteUploadedFileAfterFailure(
                uploadedKey
            );
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to upload logo.",

            error:
                error.message
        });
    }
};


/* ============================================================
   UPLOAD STORE BANNER
============================================================ */

exports.uploadBanner = async (
    req,
    res
) => {

    let uploadedKey = null;

    let databaseSaved = false;


    try {

        /* ----------------------------------------------------
           AUTHENTICATION
        ---------------------------------------------------- */

        if (
            !req.user ||
            !req.user.id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."
            });
        }


        console.log(
            "========================================"
        );

        console.log(
            "[STORE R2] BANNER UPLOAD"
        );

        console.log(
            "========================================"
        );


        /* ----------------------------------------------------
           CHECK FILE
        ---------------------------------------------------- */

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "No banner file was uploaded."
            });
        }


        console.log(
            "[STORE R2] Uploaded banner:",
            {
                originalname:
                    req.file.originalname,

                mimetype:
                    req.file.mimetype,

                size:
                    req.file.size,

                r2Key:
                    req.file.r2Key,

                url:
                    req.file.url
            }
        );


        /*
         * storeUpload.js already uploaded
         * the image to Cloudflare R2.
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


        /* ----------------------------------------------------
           FIND STORE
        ---------------------------------------------------- */

        const store =
            await Store.findOne({

                where: {
                    userId:
                        req.user.id
                }

            });


        if (!store) {

            await deleteUploadedFileAfterFailure(
                uploadedKey
            );

            return res.status(404).json({

                success: false,

                message:
                    "Store not found."
            });
        }


        /* ----------------------------------------------------
           SAVE OLD BANNER
        ---------------------------------------------------- */

        const oldBanner =
            store.banner;


        /* ----------------------------------------------------
           SAVE NEW R2 KEY
        ---------------------------------------------------- */

        store.banner =
            uploadedKey;


        try {

            await store.save();

            databaseSaved = true;

        } catch (databaseError) {

            /*
             * Database failed.
             *
             * Remove the newly uploaded R2 object.
             */

            await deleteUploadedFileAfterFailure(
                uploadedKey
            );

            throw databaseError;
        }


        console.log(
            "[DATABASE] BANNER R2 KEY SAVED:",
            store.banner
        );


        /* ----------------------------------------------------
           DELETE OLD BANNER
        ---------------------------------------------------- */

        await deleteOldStoreImage(
            oldBanner
        );


        /* ----------------------------------------------------
           PUBLIC R2 URL
        ---------------------------------------------------- */

        const bannerUrl =
            resolveStoreImageUrl(
                uploadedKey
            );


        console.log(
            "[STORE R2] BANNER PUBLIC URL:",
            bannerUrl
        );


        return res.status(200).json({

            success: true,

            message:
                "Banner uploaded successfully.",

            banner:
                bannerUrl,

            store:
                formatStore(
                    store
                )
        });


    } catch (error) {

        console.error(
            "UPLOAD BANNER ERROR:",
            error
        );


        /*
         * Never delete the new R2 image after
         * it has already been successfully saved.
         */

        if (
            uploadedKey &&
            !databaseSaved
        ) {

            await deleteUploadedFileAfterFailure(
                uploadedKey
            );
        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to upload banner.",

            error:
                error.message
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

            error:
                error.message
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
                formatStore(
                    store
                ),

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

            error:
                error.message
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

        if (
            !req.user ||
            !req.user.id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."
            });
        }


        const storeId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(
                storeId
            )
        ) {

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
            Number(
                store.userId
            ) ===
            Number(
                req.user.id
            )
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

            error:
                error.message
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

        if (
            !req.user ||
            !req.user.id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."
            });
        }


        const storeId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(
                storeId
            )
        ) {

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

            error:
                error.message
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
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(
                storeId
            )
        ) {

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

            error:
                error.message
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
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(
                storeId
            )
        ) {

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

            error:
                error.message
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
const Store = require("../models/Store");
const Product = require("../models/Product");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Review = require("../models/Review");

const sanitize = require("../services/sanitizeService");

const {
    getR2PublicUrl,
    deleteFromR2
} = require("../config/r2");


/* ============================================================
   KAD MARKETPLACE — STORE CONTROLLER
   ============================================================

   IMPORTANT:

   Store images are stored in Cloudflare R2.

   Database:
       logo   -> uploads/stores/xxxxx.png
       banner -> uploads/stores/xxxxx.jpg

   API response:
       logo   -> https://cdn....../uploads/stores/xxxxx.png
       banner -> https://cdn....../uploads/stores/xxxxx.jpg

   This keeps the database clean while allowing the frontend
   to receive a directly usable image URL.
============================================================ */


/* ============================================================
   SAFE SANITIZER
============================================================ */

function clean(value) {
    if (value === undefined || value === null) {
        return value;
    }

    try {
        return sanitize(value);
    } catch (error) {
        return value;
    }
}


/* ============================================================
   NORMALIZE STORED IMAGE VALUE
============================================================ */

function getStoredImageValue(image) {
    if (!image) {
        return null;
    }

    if (typeof image === "object") {
        return (
            image.r2Key ||
            image.key ||
            image.url ||
            image.location ||
            image.path ||
            image.filename ||
            null
        );
    }

    return String(image).trim() || null;
}


/* ============================================================
   CONVERT STORED IMAGE TO PUBLIC URL
============================================================ */

function resolveStoreImageUrl(image) {
    const value = getStoredImageValue(image);

    if (!value) {
        return null;
    }

    /* Already a full URL */
    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    const normalized = String(value)
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

    /*
     * R2 object.
     *
     * Current Store uploads use:
     *
     * uploads/stores/filename.ext
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
     * Legacy local upload.
     *
     * This is retained only so old store records
     * do not immediately break.
     */
    if (normalized.startsWith("uploads/")) {
        return `/${normalized}`;
    }

    /*
     * If an old record contains only a filename,
     * don't assume it is an R2 key unless it is
     * explicitly inside uploads/stores.
     */
    return `/${normalized}`;
}


/* ============================================================
   FORMAT STORE RESPONSE
============================================================ */

function formatStore(store) {
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
}


/* ============================================================
   PARSE PRODUCT IMAGES
============================================================ */

function parseImages(images) {
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
}


/* ============================================================
   FORMAT PRODUCT
============================================================ */

function formatProduct(product) {
    if (!product) {
        return null;
    }

    const plain =
        typeof product.toJSON === "function"
            ? product.toJSON()
            : { ...product };

    const images = parseImages(
        plain.images
    );

    return {
        ...plain,

        images: images
            .map(resolveStoreImageUrl)
            .filter(Boolean)
    };
}


/* ============================================================
   FORMAT PRODUCTS
============================================================ */

function formatProducts(products) {
    return (products || [])
        .map(formatProduct)
        .filter(Boolean);
}


/* ============================================================
   GET R2 KEY FROM STORED IMAGE
============================================================ */

function getR2KeyFromStoredImage(image) {
    const value = getStoredImageValue(image);

    if (!value) {
        return null;
    }

    let normalized = String(value)
        .trim()
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

    /*
     * Full R2 public URL
     */
    if (
        normalized.startsWith("http://") ||
        normalized.startsWith("https://")
    ) {
        try {
            const publicUrl =
                process.env.R2_PUBLIC_URL
                    ?.trim()
                    .replace(/\/+$/, "");

            if (
                publicUrl &&
                normalized.startsWith(publicUrl)
            ) {
                const parsed =
                    new URL(normalized);

                const key =
                    decodeURIComponent(
                        parsed.pathname
                    )
                    .replace(/^\/+/, "");

                if (
                    key.startsWith(
                        "uploads/stores/"
                    )
                ) {
                    return key;
                }
            }
        } catch {
            return null;
        }

        return null;
    }

    /*
     * Only delete files that are definitely
     * inside the Store R2 directory.
     */
    if (
        normalized.startsWith(
            "uploads/stores/"
        )
    ) {
        return normalized;
    }

    return null;
}


/* ============================================================
   DELETE OLD STORE IMAGE SAFELY
============================================================ */

async function deleteOldStoreImage(image) {
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
         * Do not fail the database update just
         * because deleting the previous image failed.
         */
        console.error(
            "[R2] Failed to delete old store image:",
            error.message
        );
    }
}


/* ============================================================
   FIND MY STORE
============================================================ */

async function findMyStore(userId) {
    if (!userId) {
        return null;
    }

    return Store.findOne({
        where: {
            userId
        }
    });
}


/* ============================================================
   MY STORE
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
            await findMyStore(req.user.id);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found."
            });
        }

        const formattedStore =
            formatStore(store);

        console.log(
            "MY STORE:",
            formattedStore
        );

        return res.json({
            success: true,
            store: formattedStore
        });

    } catch (error) {

        console.error(
            "GET MY STORE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to load your store."
        });
    }
};


/* ============================================================
   UPDATE STORE
============================================================ */

exports.updateStore = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const store =
            await findMyStore(req.user.id);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found."
            });
        }

        const {
            storeName,
            description,
            phone,
            email,
            website,
            businessHours,
            facebook,
            instagram,
            tiktok,
            x,
            whatsapp,
            region,
            city,
            address,
            location,
            accentColor,
            metaTitle,
            metaDescription
        } = req.body;


        /* ====================================================
           VALIDATION
        ==================================================== */

        if (
            storeName !== undefined &&
            !String(storeName).trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Store name is required."
            });
        }


        /* ====================================================
           BUILD UPDATE OBJECT

           IMPORTANT:
           logo and banner are deliberately NOT included.

           This prevents a normal "Save Store" request from
           accidentally erasing the R2 image values.
        ==================================================== */

        const updateData = {};


        if (storeName !== undefined) {
            updateData.storeName =
                clean(storeName);
        }

        if (description !== undefined) {
            updateData.description =
                clean(description);
        }

        if (phone !== undefined) {
            updateData.phone = phone;
        }

        if (email !== undefined) {
            updateData.email = email;
        }

        if (website !== undefined) {
            updateData.website =
                clean(website);
        }

        if (businessHours !== undefined) {
            updateData.businessHours =
                businessHours;
        }

        if (facebook !== undefined) {
            updateData.facebook =
                clean(facebook);
        }

        if (instagram !== undefined) {
            updateData.instagram =
                clean(instagram);
        }

        if (tiktok !== undefined) {
            updateData.tiktok =
                clean(tiktok);
        }

        if (x !== undefined) {
            updateData.x =
                clean(x);
        }

        if (whatsapp !== undefined) {
            updateData.whatsapp =
                clean(whatsapp);
        }

        if (region !== undefined) {
            updateData.region =
                region;
        }

        if (city !== undefined) {
            updateData.city =
                city;
        }

        if (address !== undefined) {
            updateData.address =
                clean(address);
        }

        /*
         * Some frontend versions use location instead
         * of address.
         */
        if (
            location !== undefined &&
            address === undefined
        ) {
            updateData.location =
                clean(location);
        }

        if (accentColor !== undefined) {
            updateData.accentColor =
                accentColor;
        }

        if (metaTitle !== undefined) {
            updateData.metaTitle =
                clean(metaTitle);
        }

        if (metaDescription !== undefined) {
            updateData.metaDescription =
                clean(metaDescription);
        }


        /* ====================================================
           UPDATE DATABASE
        ==================================================== */

        await store.update(
            updateData
        );


        /* ====================================================
           RELOAD STORE

           This guarantees that the response contains the
           values actually stored in the database.
        ==================================================== */

        const updatedStore =
            await Store.findByPk(
                store.id
            );

        const formattedStore =
            formatStore(updatedStore);


        console.log(
            "UPDATING STORE:",
            updateData
        );

        console.log(
            "UPDATE STORE RESPONSE:",
            formattedStore
        );


        return res.json({
            success: true,
            message:
                "Store updated successfully.",
            store: formattedStore
        });

    } catch (error) {

        console.error(
            "UPDATE STORE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update store."
        });
    }
};


/* ============================================================
   UPLOAD LOGO
============================================================ */

exports.uploadLogo = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }


        /* ====================================================
           CHECK FILE
        ==================================================== */

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a logo."
            });
        }


        /* ====================================================
           CHECK R2 UPLOAD

           storeUpload.js should have already uploaded
           the file to Cloudflare R2.
        ==================================================== */

        const r2Key =
            req.file.r2Key ||
            req.file.key;

        const r2Url =
            req.file.url ||
            req.file.location;


        if (!r2Key) {
            return res.status(500).json({
                success: false,
                message:
                    "Logo was received but no Cloudflare R2 key was generated."
            });
        }


        /* ====================================================
           FIND STORE
        ==================================================== */

        const store =
            await findMyStore(req.user.id);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found."
            });
        }


        /* ====================================================
           SAVE OLD LOGO
        ==================================================== */

        const oldLogo =
            store.logo;


        /* ====================================================
           SAVE R2 KEY

           IMPORTANT:

           Do NOT save req.file.filename here.

           Save the complete R2 object key.
        ==================================================== */

        await store.update({
            logo: r2Key
        });


        /* ====================================================
           DELETE PREVIOUS R2 IMAGE

           Only after the new image has successfully
           been uploaded and saved.
        ==================================================== */

        if (
            oldLogo &&
            oldLogo !== r2Key
        ) {
            await deleteOldStoreImage(
                oldLogo
            );
        }


        /* ====================================================
           RELOAD STORE
        ==================================================== */

        const updatedStore =
            await Store.findByPk(
                store.id
            );

        const formattedStore =
            formatStore(updatedStore);


        console.log(
            "[STORE LOGO] R2 KEY:",
            r2Key
        );

        console.log(
            "[STORE LOGO] R2 URL:",
            r2Url ||
                resolveStoreImageUrl(
                    r2Key
                )
        );


        return res.json({
            success: true,
            message:
                "Store logo uploaded successfully.",
            logo:
                formattedStore.logo,
            r2Key,
            store:
                formattedStore
        });

    } catch (error) {

        console.error(
            "UPLOAD STORE LOGO ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to upload store logo."
        });
    }
};


/* ============================================================
   UPLOAD BANNER
============================================================ */

exports.uploadBanner = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }


        /* ====================================================
           CHECK FILE
        ==================================================== */

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Please upload a banner."
            });
        }


        /* ====================================================
           CHECK R2
        ==================================================== */

        const r2Key =
            req.file.r2Key ||
            req.file.key;

        const r2Url =
            req.file.url ||
            req.file.location;


        if (!r2Key) {
            return res.status(500).json({
                success: false,
                message:
                    "Banner was received but no Cloudflare R2 key was generated."
            });
        }


        /* ====================================================
           FIND STORE
        ==================================================== */

        const store =
            await findMyStore(req.user.id);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found."
            });
        }


        /* ====================================================
           OLD BANNER
        ==================================================== */

        const oldBanner =
            store.banner;


        /* ====================================================
           SAVE R2 KEY
        ==================================================== */

        await store.update({
            banner: r2Key
        });


        /* ====================================================
           DELETE OLD BANNER
        ==================================================== */

        if (
            oldBanner &&
            oldBanner !== r2Key
        ) {
            await deleteOldStoreImage(
                oldBanner
            );
        }


        /* ====================================================
           RELOAD
        ==================================================== */

        const updatedStore =
            await Store.findByPk(
                store.id
            );

        const formattedStore =
            formatStore(updatedStore);


        console.log(
            "[STORE BANNER] R2 KEY:",
            r2Key
        );

        console.log(
            "[STORE BANNER] R2 URL:",
            r2Url ||
                resolveStoreImageUrl(
                    r2Key
                )
        );


        return res.json({
            success: true,
            message:
                "Store banner uploaded successfully.",
            banner:
                formattedStore.banner,
            r2Key,
            store:
                formattedStore
        });

    } catch (error) {

        console.error(
            "UPLOAD STORE BANNER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to upload store banner."
        });
    }
};


/* ============================================================
   FEATURED STORES
============================================================ */

exports.getFeaturedStores = async (
    req,
    res
) => {
    try {

        const stores =
            await Store.findAll({
                where: {
                    status: "Active"
                },

                include: [
                    {
                        model: User,
                        as: "owner",
                        attributes: [
                            "id",
                            "name"
                        ]
                    }
                ],

                order: [
                    [
                        "featured",
                        "DESC"
                    ],
                    [
                        "followers",
                        "DESC"
                    ],
                    [
                        "rating",
                        "DESC"
                    ]
                ],

                limit: 8
            });


        const formattedStores =
            stores.map(
                formatStore
            );


        return res.json({
            success: true,
            stores:
                formattedStores
        });

    } catch (error) {

        console.error(
            "GET FEATURED STORES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to load featured stores."
        });
    }
};


/* ============================================================
   PUBLIC STORE
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
                    storeSlug,
                    status: "Active"
                },

                include: [
                    {
                        model: User,
                        as: "owner",
                        attributes: [
                            "id",
                            "name",
                            "profileImage",
                            "createdAt"
                        ]
                    }
                ]
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
                        "Approved"
                },

                order: [
                    [
                        "createdAt",
                        "DESC"
                    ]
                ]
            });


        const formattedStore =
            formatStore(store);

        const formattedProducts =
            formatProducts(
                products
            );


        return res.json({
            success: true,

            store:
                formattedStore,

            products:
                formattedProducts,

            seller:
                store.owner || null
        });

    } catch (error) {

        console.error(
            "GET PUBLIC STORE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to load store."
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
                message:
                    "Authentication required."
            });
        }


        const store =
            await Store.findOne({
                where: {
                    userId:
                        req.params.id
                }
            });


        if (!store) {
            return res.status(404).json({
                success: false,
                message:
                    "Store not found."
            });
        }


        /*
         * Prevent owner from following their own store.
         */

        if (
            String(store.userId) ===
            String(req.user.id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot follow your own store."
            });
        }


        await store.increment(
            "followers"
        );


        await store.reload();


        return res.json({
            success: true,
            message:
                "Store followed successfully.",
            followers:
                store.followers || 0
        });

    } catch (error) {

        console.error(
            "FOLLOW STORE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to follow store."
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
                message:
                    "Authentication required."
            });
        }


        const store =
            await Store.findOne({
                where: {
                    userId:
                        req.params.id
                }
            });


        if (!store) {
            return res.status(404).json({
                success: false,
                message:
                    "Store not found."
            });
        }


        if (
            Number(store.followers || 0) >
            0
        ) {
            await store.decrement(
                "followers"
            );
        }


        await store.reload();


        return res.json({
            success: true,
            message:
                "Store unfollowed successfully.",
            followers:
                store.followers || 0
        });

    } catch (error) {

        console.error(
            "UNFOLLOW STORE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to unfollow store."
        });
    }
};


/* ============================================================
   STORE PRODUCTS
============================================================ */

exports.getStoreProducts = async (
    req,
    res
) => {
    try {

        const identifier =
            req.params.id;


        if (!identifier) {
            return res.status(400).json({
                success: false,
                message:
                    "Store identifier is required."
            });
        }


        /*
         * Your current route is:
         *
         * GET /products/:id
         *
         * Older controller code incorrectly treated
         * req.params.id as storeSlug.
         *
         * We support BOTH:
         *
         * /products/1
         * /products/asante-daniel-s-store-1
         */


        let store = null;


        /* Try database ID first */

        if (
            /^\d+$/.test(
                String(identifier)
            )
        ) {
            store =
                await Store.findByPk(
                    Number(identifier)
                );
        }


        /* Try store slug */

        if (!store) {
            store =
                await Store.findOne({
                    where: {
                        storeSlug:
                            identifier
                    }
                });
        }


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
                        "Approved"
                },

                order: [
                    [
                        "createdAt",
                        "DESC"
                    ]
                ]
            });


        const formattedProducts =
            formatProducts(
                products
            );


        return res.json({
            success: true,
            products:
                formattedProducts
        });

    } catch (error) {

        console.error(
            "GET STORE PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to load store products."
        });
    }
};


/* ============================================================
   STORE REVIEWS
============================================================ */

exports.getStoreReviews = async (
    req,
    res
) => {
    try {

        const sellerId =
            req.params.id;


        if (!sellerId) {
            return res.status(400).json({
                success: false,
                message:
                    "Seller ID is required."
            });
        }


        const reviews =
            await Review.findAll({
                where: {
                    sellerId
                },

                include: [
                    {
                        model: User,
                        as: "buyer",
                        attributes: [
                            "id",
                            "name"
                        ]
                    }
                ],

                order: [
                    [
                        "createdAt",
                        "DESC"
                    ]
                ]
            });


        return res.json({
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
                error.message ||
                "Failed to load store reviews."
        });
    }
};


/* ============================================================
   EXPORT IMAGE HELPERS
============================================================ */

/*
 * These are exported only if another controller/service
 * needs them.
 */

exports.resolveStoreImageUrl =
    resolveStoreImageUrl;

exports.formatStore =
    formatStore;

exports.formatProduct =
    formatProduct;

exports.formatProducts =
    formatProducts;

exports.getR2KeyFromStoredImage =
    getR2KeyFromStoredImage;
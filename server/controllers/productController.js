const { Op } = require("sequelize");

const sanitize = require("../services/sanitizeService");
const Product = require("../models/Product");
const User = require("../models/User");
const Store = require("../models/Store");
const Subscription = require("../models/Subscription");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const ProductView = require("../models/ProductView");
const Wishlist = require("../models/Wishlist");
const slugify = require("slugify");
const sequelize = require("../config/database");
const promotionController = require("./promotionController");
const ProductPromotion = require("../models/ProductPromotion");
const {
    getSetting,
    toBoolean
} = require("../services/marketplaceSettingsService");
const {
    getR2PublicUrl,
    deleteFromR2
} = require("../config/r2");

/* ===========================================================
   LOAD USER ACTIVE SUBSCRIPTION
=========================================================== */

async function getSubscription(userId) {
    return await Subscription.findOne({
        where: {
            userId: Number(userId),
            status: "active"
        },
        order: [["createdAt", "DESC"]]
    });
}


/* ===========================================================
   LOAD SUBSCRIPTION PLAN
=========================================================== */

async function getPlan(userId) {
    const subscription = await getSubscription(userId);

    if (!subscription) {
        return {
            subscription: null,
            plan: null
        };
    }

    const plan = await SubscriptionPlan.findByPk(
        subscription.subscriptionPlanId
    );

    if (!plan) {
        return {
            subscription,
            plan: null
        };
    }

    return {
        subscription,
        plan
    };
}


/* ===========================================================
   SUBSCRIPTION BENEFITS
=========================================================== */

function getSubscriptionBenefits(plan) {
    if (!plan) {
        return {
            uploadLimit: 5,
            boostCredits: 0,
            featuredCredits: 0,
            expressCredits: 0,
            featured: false,
            express: false,
            features: []
        };
    }

    return {
        uploadLimit: Number(plan.maxProducts || 5),

        boostCredits: Number(
            plan.boostCredits || 0
        ),

        featuredCredits: Number(
            plan.featuredCredits || 0
        ),

        expressCredits: Number(
            plan.expressCredits || 0
        ),

        featured:
            Number(plan.featuredCredits || 0) > 0,

        express:
            Number(plan.expressCredits || 0) > 0,

        features:
            Array.isArray(plan.features)
                ? plan.features
                : []
    };
}


/* ===========================================================
   UPLOAD LIMIT
=========================================================== */

function getUploadLimit(plan) {
    if (!plan) {
        return 5;
    }

    return Number(
        plan.maxProducts || 5
    );
}


/* ===========================================================
   PRODUCT PRIORITY
=========================================================== */

function getPriority(plan) {
    if (!plan) {
        return {
            listingPriority: 1,
            homepagePriority: 1,
            searchPriority: 1
        };
    }

    /*
       Your current SubscriptionPlan model does not contain
       listingPriority/homepagePriority fields.

       Therefore we derive a safe priority from the plan
       benefits instead of reading nonexistent columns.
    */

    const benefits =
        getSubscriptionBenefits(plan);

    let priority = 1;

    if (benefits.featured) {
        priority += 2;
    }

    if (benefits.express) {
        priority += 1;
    }

    if (benefits.boostCredits > 0) {
        priority += 1;
    }

    return {
        listingPriority: priority,
        homepagePriority:
            benefits.featured ? 2 : 1,
        searchPriority: priority
    };
}


/* ===========================================================
   PRODUCT FEATURES
=========================================================== */

function getFeatures(plan) {
    if (!plan) {
        return {
            featured: false,
            express: false,
            aiRecommended: false
        };
    }

    const benefits =
        getSubscriptionBenefits(plan);

    return {
        featured: benefits.featured,
        express: benefits.express,

        /*
           aiRecommended is not a field in the current
           SubscriptionPlan model.
        */
        aiRecommended: false
    };
}


/* ===========================================================
   PRODUCT SCORE
=========================================================== */

function calculateScore(plan) {
    let score = 100;

    if (!plan) {
        return score;
    }

    const priority =
        getPriority(plan);

    score +=
        Number(priority.listingPriority || 1) * 100;

    if (
        Number(priority.homepagePriority || 0) > 1
    ) {
        score += 300;
    }

    if (
        Number(plan.featuredCredits || 0) > 0
    ) {
        score += 500;
    }

    if (
        Number(plan.expressCredits || 0) > 0
    ) {
        score += 200;
    }

    if (
        Number(plan.boostCredits || 0) > 0
    ) {
        score += 100;
    }

    return score;
}

/* ===========================================================
   VALIDATE SUBSCRIPTION
=========================================================== */

async function validateSubscription(userId) {
    const {
        subscription,
        plan
    } = await getPlan(userId);

    if (!subscription || !plan) {
        return {
            valid: false,
            message: "No active subscription found."
        };
    }

    return {
        valid: true,
        subscription,
        plan
    };
}


/* ===========================================================
   GENERATE SLUG
=========================================================== */

function generateSlug(title) {
    return slugify(title, {
        lower: true,
        strict: true
    });
}


/* ===========================================================
   VALIDATE PRODUCT
=========================================================== */

function validateProduct(data) {
    const required = [
        "title",
        "description",
        "price",
        "category",
        "condition",
        "location",
        "region",
        "city"
    ];

    for (const field of required) {
        if (
            data[field] === undefined ||
            data[field] === null ||
            String(data[field]).trim() === ""
        ) {
            return {
                success: false,
                message: `${field} is required.`
            };
        }
    }

    const price = Number(data.price);

    if (!Number.isFinite(price) || price < 0) {
        return {
            success: false,
            message: "Price must be a valid non-negative number."
        };
    }

    return {
        success: true
    };
}

/* ===========================================================
   GET PLAN FEATURES
=========================================================== */

function getPlanFeatures(plan) {
    if (!plan) {
        return {
            listingPriority: 1,
            homepagePriority: 1,
            searchPriority: 1,
            featured: false,
            express: false,
            aiRecommended: false,
            verifiedStore: false
        };
    }

    const priority =
        getPriority(plan);

    const features =
        getFeatures(plan);

    return {
        listingPriority:
            priority.listingPriority,

        homepagePriority:
            priority.homepagePriority,

        searchPriority:
            priority.searchPriority,

        featured:
            features.featured,

        express:
            features.express,

        aiRecommended:
            features.aiRecommended,

        /*
           storeAccess does not exist in the
           current SubscriptionPlan model.
        */
        verifiedStore: false
    };
}

/* ===========================================================
   PROCESS IMAGES
=========================================================== */

function processImages(files) {
    if (!Array.isArray(files) || files.length === 0) {
        return [];
    }

    return files
        .map((file) => {
            if (!file) {
                return null;
            }

            return (
                file.r2Key ||
                file.key ||
                file.filename ||
                null
            );
        })
        .filter(Boolean);
}


/* ===========================================================
   PARSE PRODUCT IMAGES
=========================================================== */

function parseProductImages(images) {
    if (Array.isArray(images)) {
        return images;
    }

    if (typeof images === "string") {
        const value = images.trim();

        if (!value) {
            return [];
        }

        try {
            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {
                return parsed;
            }

            if (
                typeof parsed === "string" &&
                parsed.trim()
            ) {
                return [parsed.trim()];
            }
        } catch (error) {
            // Legacy filename format.
        }

        return [value];
    }

    return [];
}


/* ===========================================================
   RESOLVE IMAGE URL
=========================================================== */

function resolveImageUrl(image) {
    if (!image || typeof image !== "string") {
        return null;
    }

    const clean = image.trim();

    if (!clean) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Already a full URL
    |--------------------------------------------------------------------------
    */

    if (
        clean.startsWith("http://") ||
        clean.startsWith("https://")
    ) {
        return clean;
    }

    const normalizedKey = clean.replace(/^\/+/, "");

    /*
    |--------------------------------------------------------------------------
    | Cloudflare R2
    |--------------------------------------------------------------------------
    */

    if (normalizedKey.startsWith("uploads/")) {
        const r2Url = getR2PublicUrl(normalizedKey);

        if (r2Url) {
            return r2Url;
        }

        /*
        |--------------------------------------------------------------------------
        | Local fallback for old files
        |--------------------------------------------------------------------------
        */

        return `/uploads/${normalizedKey.replace(
            /^uploads\//i,
            ""
        )}`;
    }

    /*
    |--------------------------------------------------------------------------
    | Legacy local image
    |--------------------------------------------------------------------------
    */

    return `/uploads/${normalizedKey.replace(
        /^uploads\//i,
        ""
    )}`;
}


/* ===========================================================
   FORMAT PRODUCT
=========================================================== */

function formatProduct(product) {
    if (!product) {
        return null;
    }

    const item =
        typeof product.toJSON === "function"
            ? product.toJSON()
            : { ...product };

    /*
    |--------------------------------------------------------------------------
    | Product images
    |--------------------------------------------------------------------------
    */

    item.images = parseProductImages(item.images)
        .map(resolveImageUrl)
        .filter(Boolean);

    /*
    |--------------------------------------------------------------------------
    | Seller profile image
    |--------------------------------------------------------------------------
    */

    if (item.seller) {
        item.seller.profileImage =
            resolveImageUrl(
                item.seller.profileImage
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Store images
    |--------------------------------------------------------------------------
    */

    if (item.store) {
        item.store.logo =
            resolveImageUrl(
                item.store.logo
            );

        item.store.banner =
            resolveImageUrl(
                item.store.banner
            );
    }

    return item;
}


/* ===========================================================
   FORMAT PRODUCTS
=========================================================== */

function formatProducts(products) {
    if (!Array.isArray(products)) {
        return [];
    }

    return products
        .map(formatProduct)
        .filter(Boolean);
}


/* ===========================================================
   GET R2 PRODUCT IMAGE KEYS
=========================================================== */

function getProductImageKeys(product) {
    if (!product) {
        return [];
    }

    return parseProductImages(product.images)
        .filter((image) => {
            if (typeof image !== "string") {
                return false;
            }

            const key = image
                .trim()
                .replace(/^\/+/, "");

            return (
                key.startsWith("uploads/") &&
                !key.startsWith("http://") &&
                !key.startsWith("https://")
            );
        })
        .map((image) =>
            image
                .trim()
                .replace(/^\/+/, "")
        )
        .filter(Boolean);
}


/* ===========================================================
   DELETE PRODUCT IMAGES FROM R2
=========================================================== */

async function deleteProductImages(product) {
    const keys = [
        ...new Set(
            getProductImageKeys(product)
        )
    ];

    if (keys.length === 0) {
        return;
    }

    const results =
        await Promise.allSettled(
            keys.map((key) =>
                deleteFromR2(key)
            )
        );

    const failed =
        results.filter(
            (result) =>
                result.status === "rejected"
        );

    if (failed.length > 0) {
        console.error(
            "Some R2 product images could not be deleted:",
            failed.map(
                (result) =>
                    result.reason?.message ||
                    String(result.reason)
            )
        );
    }
}


/* ===========================================================
   GET UPLOADED R2 KEYS
=========================================================== */

function getUploadedR2Keys(files) {
    if (!Array.isArray(files)) {
        return [];
    }

    return [
        ...new Set(
            files
                .map(
                    (file) =>
                        file?.r2Key ||
                        file?.key
                )
                .filter(
                    (key) =>
                        typeof key === "string" &&
                        key.trim()
                )
        )
    ];
}


/* ===========================================================
   CLEANUP NEW R2 UPLOADS
=========================================================== */

async function cleanupUploadedFiles(files) {
    const keys =
        getUploadedR2Keys(files);

    if (keys.length === 0) {
        return;
    }

    await Promise.allSettled(
        keys.map((key) =>
            deleteFromR2(key)
        )
    );
}


/* ===========================================================
   ROLLBACK TRANSACTION
=========================================================== */

async function rollbackTransaction(
    transaction,
    files
) {
    try {
        if (transaction) {
            await transaction.rollback();
        }
    } catch (rollbackError) {
        console.error(
            "Transaction rollback failed:",
            rollbackError
        );
    }

    try {
        await cleanupUploadedFiles(files);
    } catch (cleanupError) {
        console.error(
            "R2 cleanup failed:",
            cleanupError
        );
    }
}


/* ===========================================================
   FORMAT PROMOTION PRODUCT
=========================================================== */

function formatPromotionProduct(product) {
    if (!product) {
        return null;
    }

    return formatProduct(product);
}


/* ===========================================================
   MONTHLY UPLOADS
=========================================================== */

async function getMonthlyUploads(userId) {
    const start = new Date();

    start.setDate(1);

    start.setHours(
        0,
        0,
        0,
        0
    );

    return await Product.count({
        where: {
            userId,

            createdAt: {
                [Op.gte]: start
            }
        }
    });
}


/* ===========================================================
   CREATE PRODUCT
   =========================================================== */

exports.createProduct =
    async (req, res) => {

        let transaction = null;

        try {

            // -------------------------------------------------
            // AUTHENTICATION
            // -------------------------------------------------

            if (!req.user) {

                await cleanupUploadedFiles(
                    req.files
                );

                return res.status(401).json({
                    success: false,
                    message: "Please login first."
                });
            }


            // -------------------------------------------------
            // START TRANSACTION
            // -------------------------------------------------

            transaction =
                await sequelize.transaction();


            // -------------------------------------------------
            // VALIDATE PRODUCT DATA
            // -------------------------------------------------

            const validation =
                validateProduct(
                    req.body
                );


            if (!validation.success) {

                await rollbackTransaction(
                    transaction,
                    req.files
                );

                return res.status(400).json(
                    validation
                );
            }


            // -------------------------------------------------
            // VALIDATE IMAGES
            // -------------------------------------------------

            if (
                !Array.isArray(req.files) ||
                req.files.length === 0
            ) {

                await rollbackTransaction(
                    transaction,
                    req.files
                );

                return res.status(400).json({
                    success: false,
                    message: "Upload at least one image."
                });
            }


            // -------------------------------------------------
            // MARKETPLACE PRODUCT APPROVAL SETTING
            //
            // When TRUE:
            //     Product starts as Pending
            //
            // When FALSE:
            //     Product is published immediately
            // -------------------------------------------------

            let requireProductApproval = true;

            try {

                requireProductApproval =
                    toBoolean(
                        await getSetting(
                            "require_product_approval",
                            true
                        ),
                        true
                    );

            } catch (settingsError) {

                console.error(
                    "PRODUCT APPROVAL SETTING ERROR:",
                    settingsError
                );

                // Fail safely:
                // if settings cannot be read,
                // require approval by default.
                requireProductApproval = true;
            }


            const initialProductStatus =
                requireProductApproval
                    ? "Pending"
                    : "Approved";


            const initialApprovedAt =
                requireProductApproval
                    ? null
                    : new Date();


            // -------------------------------------------------
            // SUBSCRIPTION VALIDATION
            // -------------------------------------------------

            const subscriptionResult =
                await validateSubscription(
                    req.user.id
                );


            let subscription = null;
            let plan = null;


            if (subscriptionResult.valid) {

                subscription =
                    subscriptionResult.subscription;

                plan =
                    subscriptionResult.plan;


                const uploadLimit =
                    getUploadLimit(plan);


                const uploadsUsed =
                    Number(
                        subscription.uploadsUsed || 0
                    );


                if (
                    uploadsUsed >=
                    uploadLimit
                ) {

                    await rollbackTransaction(
                        transaction,
                        req.files
                    );

                    return res.status(403).json({
                        success: false,
                        subscriptionLimitReached: true,
                        message:
                            `Your ${plan.name} plan allows ${uploadLimit} product listings per subscription period. You have used ${uploadsUsed}.`
                    });
                }

            } else {

                // -------------------------------------------------
                // FREE USER UPLOAD LIMIT
                // -------------------------------------------------

                const user =
                    await User.findByPk(
                        req.user.id,
                        {
                            transaction
                        }
                    );


                if (!user) {

                    await rollbackTransaction(
                        transaction,
                        req.files
                    );

                    return res.status(404).json({
                        success: false,
                        message: "User not found."
                    });
                }


                const FREE_UPLOAD_LIMIT = 5;


                if (
                    Number(
                        user.freeUploadsUsed || 0
                    ) >= FREE_UPLOAD_LIMIT
                ) {

                    await rollbackTransaction(
                        transaction,
                        req.files
                    );

                    return res.status(403).json({
                        success: false,
                        requiresSubscription: true,
                        message:
                            "You have reached your free upload limit. Please subscribe."
                    });
                }
            }


            // -------------------------------------------------
            // PLAN FEATURES / PRODUCT SCORE
            // -------------------------------------------------

            let features;
            let score;


            if (plan) {

                features =
                    getPlanFeatures(plan);


                score =
                    calculateScore(plan);

            } else {

                features = {
                    listingPriority: 1,
                    homepagePriority: 0,
                    searchPriority: 1,
                    featured: false,
                    express: false,
                    aiRecommended: false,
                    verifiedStore: false
                };


                score = 10;
            }


            // -------------------------------------------------
            // PROCESS IMAGES
            // -------------------------------------------------

            const images =
                processImages(
                    req.files
                );


            if (images.length === 0) {

                await rollbackTransaction(
                    transaction,
                    req.files
                );

                return res.status(400).json({
                    success: false,
                    message:
                        "No valid uploaded images were found."
                });
            }


            // -------------------------------------------------
            // SANITIZE PRODUCT INFORMATION
            // -------------------------------------------------

            const title =
                sanitize(
                    req.body.title
                );


            const description =
                sanitize(
                    req.body.description
                );


            // -------------------------------------------------
            // GENERATE PRODUCT SLUG
            // -------------------------------------------------

            const slug =
                generateSlug(title);


            if (!slug) {

                await rollbackTransaction(
                    transaction,
                    req.files
                );

                return res.status(400).json({
                    success: false,
                    message:
                        "A valid product title is required."
                });
            }


            // -------------------------------------------------
            // CREATE PRODUCT
            // -------------------------------------------------

            const product =
                await Product.create(
                    {

                        userId:
                            req.user.id,


                        subscriptionPlanId:
                            plan
                                ? plan.id
                                : null,


                        title,


                        description,


                        price:
                            Number(
                                req.body.price
                            ),


                        category:
                            req.body.category,


                        condition:
                            req.body.condition,


                        location:
                            req.body.location,


                        region:
                            req.body.region,


                        city:
                            req.body.city,


                        images:
                            JSON.stringify(
                                images
                            ),


                        slug,


                        // -----------------------------------------
                        // IMPORTANT:
                        // Product approval is now controlled
                        // from Marketplace Settings.
                        // -----------------------------------------

                        status:
                            initialProductStatus,


                        // -----------------------------------------
                        // Only automatically approved products
                        // receive an approval date.
                        // -----------------------------------------

                        approvedAt:
                            initialApprovedAt,


                        // -----------------------------------------
                        // No administrator approved an
                        // automatically published product.
                        // -----------------------------------------

                        approvedBy:
                            null,


                        // -----------------------------------------
                        // New products have no rejection reason.
                        // -----------------------------------------

                        rejectionReason:
                            null,


                        promotionType:
                            plan
                                ? plan.name
                                : "Free",


                        listingPriority:
                            features.listingPriority,


                        homepagePriority:
                            features.homepagePriority,


                        searchPriority:
                            features.searchPriority,


                        featured:
                            features.featured,


                        express:
                            features.express,


                        aiRecommended:
                            features.aiRecommended,


                        verifiedStore:
                            features.verifiedStore,


                        listingScore:
                            score,


                        qualityScore:
                            score,


                        displayDate:
                            new Date()

                    },
                    {
                        transaction
                    }
                );


            // -------------------------------------------------
            // UPDATE SUBSCRIPTION USAGE
            // -------------------------------------------------

            if (subscription) {

                subscription.uploadsUsed =
                    Number(
                        subscription.uploadsUsed || 0
                    ) + 1;


                await subscription.save({
                    transaction
                });

            } else {

                // -------------------------------------------------
                // UPDATE FREE USER UPLOAD USAGE
                // -------------------------------------------------

                const user =
                    await User.findByPk(
                        req.user.id,
                        {
                            transaction
                        }
                    );


                if (!user) {

                    throw new Error(
                        "User account was not found."
                    );
                }


                user.freeUploadsUsed =
                    Number(
                        user.freeUploadsUsed || 0
                    ) + 1;


                await user.save({
                    transaction
                });
            }


            // -------------------------------------------------
            // CHECK VERIFIED STORE
            // -------------------------------------------------

            const store =
                await Store.findOne({
                    where: {
                        userId:
                            req.user.id,

                        status:
                            "Verified"
                    },

                    transaction
                });


            if (store) {

                product.verifiedStore =
                    true;


                await product.save({
                    transaction
                });
            }


            // -------------------------------------------------
            // COMMIT TRANSACTION
            // -------------------------------------------------

            await transaction.commit();

            transaction = null;


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.status(201).json({

                success: true,


                message:
                    requireProductApproval
                        ? "Product created successfully. Awaiting admin approval."
                        : "Product created and published successfully.",


                approvalRequired:
                    requireProductApproval,


                product:
                    formatProduct(
                        product
                    )
            });


        } catch (error) {

            // -------------------------------------------------
            // ROLLBACK / CLEANUP
            // -------------------------------------------------

            if (transaction) {

                await rollbackTransaction(
                    transaction,
                    req.files
                );

            } else {

                await cleanupUploadedFiles(
                    req.files
                );
            }


            // -------------------------------------------------
            // ERROR LOG
            // -------------------------------------------------

            console.error(
                "CREATE PRODUCT ERROR:",
                error
            );


            // -------------------------------------------------
            // ERROR RESPONSE
            // -------------------------------------------------

            return res.status(500).json({
                success: false,
                message:
                    "Internal server error."
            });
        }
    };

/* ===========================================================
   GET ALL APPROVED PRODUCTS
=========================================================== */

exports.getProducts =
    async (req, res) => {

        try {

            const products =
                await Product.findAll({

                   where: {
    status: "Approved",
    sellerStatus: "Active",
    deleted: false
},

                    include: [

                        {
                            model:
                                User,

                            as:
                                "seller",

                            attributes: [
                                "id",
                                "name",
                                "email",
                                "profileImage"
                            ],

                            include: [

                                {
                                    model:
                                        Subscription,

                                    as:
                                        "subscriptions",

                                    required:
                                        false,

                                    where: {
                                        status:
                                            "active"
                                    },

                                    include: [

                                        {
                                            model:
                                                SubscriptionPlan,

                                            as:
                                                "subscriptionPlan",

                                            required:
                                                false
                                        }

                                    ]
                                },

                                {
                                    model:
                                        Store,

                                    as:
                                        "store",

                                    required:
                                        false,

                                    attributes: [
                                        "id",
                                        "storeName",
                                        "storeSlug",
                                        "logo",
                                        "banner",
                                        "verified",
                                        "status"
                                    ]
                                }

                            ]
                        }

                    ],

                    order: [
                        [
                            "listingPriority",
                            "DESC"
                        ],

                        [
                            "createdAt",
                            "DESC"
                        ]
                    ]

                });

            const formattedProducts =
                products.map(
                    (product) => {

                        const item =
                            product.toJSON();

                        let subscription =
                            null;

                        let planName =
                            "New User";

                        if (
                            item.seller &&
                            Array.isArray(
                                item.seller.subscriptions
                            ) &&
                            item.seller.subscriptions.length
                        ) {

                            const activeSubscription =
                                item.seller
                                    .subscriptions[0];

                            const plan =
                                activeSubscription
                                    .subscriptionPlan;

                            if (plan) {

                                planName =
                                    plan.name ||
                                    plan.planName ||
                                    "New User";

                                subscription = {
                                    id:
                                        activeSubscription.id,

                                    status:
                                        activeSubscription.status,

                                    subscriptionPlanId:
                                        activeSubscription
                                            .subscriptionPlanId,

                                    planName,

                                    plan: {
                                        id:
                                            plan.id,

                                        name:
                                            plan.name ||
                                            plan.planName ||
                                            "New User"
                                    }
                                };
                            }
                        }

                        if (item.seller) {

                            item.seller.subscription =
                                subscription || {
                                    planName:
                                        "New User",

                                    plan: {
                                        name:
                                            "New User"
                                    }
                                };

                            delete item
                                .seller
                                .subscriptions;

                            item.store =
                                item.seller.store ||
                                null;
                        }

                        return formatProduct(
                            item
                        );
                    }
                )
                .filter(Boolean);

            return res.status(200).json({
                success: true,
                products:
                    formattedProducts
            });

        } catch (error) {

            console.error(
                "GET PRODUCTS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load products.",
                error:
                    error.message
            });
        }
    };

/* ===========================================================
   GET PRODUCT BY ID
=========================================================== */

exports.getProductById = async (req, res) => {

    try {

        const product = await Product.findOne({

            where: {
    status: "Approved",
    sellerStatus: "Active",
    deleted: false
}

        });

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        | Do NOT increase product.views here.
        |
        | Product views are recorded separately through:
        | POST /products/:id/view
        |
        | This prevents one page refresh from counting twice.
        |--------------------------------------------------------------------------
        */

        const item = formatProduct(product);

        const relatedProducts =
            await Product.findAll({

                where: {

                    id: {
                        [Op.ne]: product.id
                    },

                    category: product.category,

                    status: "Approved",

                    deleted: false

                },

                limit: 8,

                order: [

                    [
                        "homepagePriority",
                        "DESC"
                    ],

                    [
                        "featured",
                        "DESC"
                    ],

                    [
                        "express",
                        "DESC"
                    ],

                    [
                        "listingPriority",
                        "DESC"
                    ],

                    [
                        "listingScore",
                        "DESC"
                    ]

                ]

            });

        return res.json({

            success: true,

            product: item,

            relatedProducts:
                formatProducts(
                    relatedProducts
                )

        });

    } catch (error) {

        console.error(
            "GET PRODUCT BY ID ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   SEARCH PRODUCTS
=========================================================== */

exports.searchProducts =
    async (req, res) => {

        try {

            const {
                keyword,
                category,
                region,
                city,
                minPrice,
                maxPrice
            } = req.query;

            const
             where = {
                status:
                    "Approved",

                sellerStatus: "Active",

                deleted:
                    false

            };

            if (keyword) {

                where[Op.or] = [

                    {
                        title: {
                            [Op.like]:
                                `%${keyword}%`
                        }
                    },

                    {
                        description: {
                            [Op.like]:
                                `%${keyword}%`
                        }
                    }

                ];
            }

            if (category) {
                where.category =
                    category;
            }

            if (region) {
                where.region =
                    region;
            }

            if (city) {
                where.city =
                    city;
            }

            if (
                minPrice !== undefined ||
                maxPrice !== undefined
            ) {

                where.price = {};

                if (
                    minPrice !== undefined &&
                    minPrice !== ""
                ) {

                    where.price[Op.gte] =
                        Number(minPrice);
                }

                if (
                    maxPrice !== undefined &&
                    maxPrice !== ""
                ) {

                    where.price[Op.lte] =
                        Number(maxPrice);
                }
            }

            const products =
                await Product.findAll({

                    where,

                    order: [

                        [
                            "homepagePriority",
                            "DESC"
                        ],

                        [
                            "featured",
                            "DESC"
                        ],

                        [
                            "express",
                            "DESC"
                        ],

                        [
                            "listingPriority",
                            "DESC"
                        ],

                        [
                            "qualityScore",
                            "DESC"
                        ],

                        [
                            "views",
                            "DESC"
                        ],

                        [
                            "createdAt",
                            "DESC"
                        ]
                    ]
                });

            return res.json({
                success: true,

                total:
                    products.length,

                products:
                    formatProducts(
                        products
                    )
            });

        } catch (error) {

            console.error(
                "SEARCH PRODUCTS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


/* ===========================================================
   HOMEPAGE PROMOTIONS
=========================================================== */

async function getHomepagePromotionProducts(
    promotionType
) {

    const promotions =
        await ProductPromotion.findAll({

            where: {

                promotionType,

                paymentStatus:
                    "PAID",

                status:
                    "APPROVED",

                showOnHomepage:
                    true,

                [Op.or]: [

                    {
                        endDate: {
                            [Op.gt]:
                                new Date()
                        }
                    },

                    {
                        endDate:
                            null
                    }

                ]
            },

            include: [

                {
                    model:
                        Product,

                    as:
                        "product",

                    required:
                        true,

                    where: {

                        status:
                            "Approved",

                        deleted:
                            false
                    }
                }

            ],

            order: [

                [
                    "homepageOrder",
                    "ASC"
                ],

                [
                    "approvedAt",
                    "DESC"
                ],

                [
                    "createdAt",
                    "DESC"
                ]

            ]
        });

    return promotions
        .map(
            (promotion) =>
                formatPromotionProduct(
                    promotion.product
                )
        )
        .filter(Boolean);
}


/* ===========================================================
   FEATURED PRODUCTS
=========================================================== */

exports.getFeaturedProducts =
    async (req, res) => {

        try {

            const products =
                await getHomepagePromotionProducts(
                    "FEATURED"
                );

            return res.json({
                success: true,
                products
            });

        } catch (error) {

            console.error(
                "GET FEATURED PRODUCTS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load featured products."
            });
        }
    };


/* ===========================================================
   EXPRESS PRODUCTS
=========================================================== */

exports.getExpressProducts =
    async (req, res) => {

        try {

            const products =
                await getHomepagePromotionProducts(
                    "EXPRESS"
                );

            return res.json({
                success: true,
                products
            });

        } catch (error) {

            console.error(
                "GET EXPRESS PRODUCTS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load express products."
            });
        }
    };


/* ===========================================================
   TRENDING PRODUCTS
=========================================================== */

exports.getTrendingProducts =
    async (req, res) => {

        try {

            const products =
                await getHomepagePromotionProducts(
                    "BOOST"
                );

            return res.json({
                success: true,
                products
            });

        } catch (error) {

            console.error(
                "GET TRENDING PRODUCTS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load trending products."
            });
        }
    };


/* ===========================================================
   NEW PRODUCTS
=========================================================== */

exports.getNewestProducts =
    async (req, res) => {

        try {

            const products =
                await Product.findAll({

                    where: {

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
                    ],

                    limit:
                        20
                });

            return res.json({
                success: true,

                products:
                    formatProducts(
                        products
                    )
            });

        } catch (error) {

            console.error(
                "GET NEWEST PRODUCTS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


/* ===========================================================
   MY PRODUCTS
=========================================================== */

exports.getMyProducts = async (req, res) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const products = await Product.findAll({
            where: {
                userId: req.user.id
            },

            order: [
                ["createdAt", "DESC"]
            ]
        });

        const data = formatProducts(products);

        return res.json({
            success: true,
            total: data.length,
            products: data
        });

    } catch (error) {

        console.error(
            "GET MY PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================================================
   UPDATE PRODUCT
=========================================================== */

exports.updateProduct =
    async (req, res) => {

        let transaction = null;

        try {

            // -------------------------------------------------
            // AUTHENTICATION
            // -------------------------------------------------

            if (!req.user) {

                await cleanupUploadedFiles(
                    req.files
                );

                return res.status(401).json({
                    success: false,
                    message:
                        "Unauthorized."
                });
            }


            // -------------------------------------------------
            // FIND PRODUCT
            // -------------------------------------------------

            const product =
                await Product.findByPk(
                    req.params.id
                );


            if (!product) {

                await cleanupUploadedFiles(
                    req.files
                );

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }


            // -------------------------------------------------
            // VERIFY PRODUCT OWNER
            // -------------------------------------------------

            if (
                Number(product.userId) !==
                Number(req.user.id)
            ) {

                await cleanupUploadedFiles(
                    req.files
                );

                return res.status(403).json({
                    success: false,
                    message:
                        "Unauthorized."
                });
            }


            // -------------------------------------------------
            // START TRANSACTION
            // -------------------------------------------------

            transaction =
                await sequelize.transaction();


            // -------------------------------------------------
            // GET MARKETPLACE APPROVAL SETTING
            //
            // TRUE:
            // Edited products must be reviewed again.
            //
            // FALSE:
            // Edited products remain approved.
            // -------------------------------------------------

            let requireProductApproval = true;

            try {

                requireProductApproval =
                    toBoolean(
                        await getSetting(
                            "require_product_approval",
                            true
                        ),
                        true
                    );

            } catch (settingsError) {

                console.error(
                    "PRODUCT APPROVAL SETTING ERROR:",
                    settingsError
                );

                // Fail safely.
                // If the setting cannot be read,
                // require admin approval.
                requireProductApproval = true;
            }


            // -------------------------------------------------
            // GET PRODUCT DATA
            // -------------------------------------------------

            const {
                title,
                description,
                price,
                category,
                condition,
                location,
                region,
                city
            } = req.body;


            // -------------------------------------------------
            // UPDATE TITLE
            // -------------------------------------------------

            if (
                title !== undefined &&
                String(title).trim()
            ) {

                product.title =
                    sanitize(title);


                product.slug =
                    generateSlug(
                        product.title
                    );


                if (!product.slug) {

                    await rollbackTransaction(
                        transaction,
                        req.files
                    );

                    return res.status(400).json({
                        success: false,
                        message:
                            "A valid product title is required."
                    });
                }
            }


            // -------------------------------------------------
            // UPDATE DESCRIPTION
            // -------------------------------------------------

            if (
                description !== undefined
            ) {

                product.description =
                    sanitize(
                        description
                    );
            }


            // -------------------------------------------------
            // UPDATE PRICE
            // -------------------------------------------------

            if (
                price !== undefined &&
                price !== ""
            ) {

                const numericPrice =
                    Number(price);


                if (
                    !Number.isFinite(
                        numericPrice
                    ) ||
                    numericPrice < 0
                ) {

                    await rollbackTransaction(
                        transaction,
                        req.files
                    );

                    return res.status(400).json({
                        success: false,
                        message:
                            "Price must be a valid non-negative number."
                    });
                }


                product.price =
                    numericPrice;
            }


            // -------------------------------------------------
            // UPDATE CATEGORY
            // -------------------------------------------------

            if (
                category !== undefined
            ) {

                product.category =
                    category;
            }


            // -------------------------------------------------
            // UPDATE CONDITION
            // -------------------------------------------------

            if (
                condition !== undefined
            ) {

                product.condition =
                    condition;
            }


            // -------------------------------------------------
            // UPDATE LOCATION
            // -------------------------------------------------

            if (
                location !== undefined
            ) {

                product.location =
                    location;
            }


            // -------------------------------------------------
            // UPDATE REGION
            // -------------------------------------------------

            if (
                region !== undefined
            ) {

                product.region =
                    region;
            }


            // -------------------------------------------------
            // UPDATE CITY
            // -------------------------------------------------

            if (
                city !== undefined
            ) {

                product.city =
                    city;
            }


            // -------------------------------------------------
            // UPDATE IMAGES
            // -------------------------------------------------

            let oldImages = [];


            if (
                Array.isArray(req.files) &&
                req.files.length > 0
            ) {

                oldImages =
                    parseProductImages(
                        product.images
                    );


                const newImages =
                    processImages(
                        req.files
                    );


                if (
                    newImages.length === 0
                ) {

                    await rollbackTransaction(
                        transaction,
                        req.files
                    );

                    return res.status(400).json({
                        success: false,
                        message:
                            "The uploaded images could not be processed."
                    });
                }


                product.images =
                    JSON.stringify(
                        newImages
                    );
            }


            // -------------------------------------------------
            // PRODUCT APPROVAL WORKFLOW
            //
            // If approval is enabled, any edited product
            // must return to Pending.
            //
            // If approval is disabled, the product remains
            // Approved and can continue displaying publicly.
            // -------------------------------------------------

            if (requireProductApproval) {

                product.status =
                    "Pending";


                product.approvedAt =
                    null;


                product.approvedBy =
                    null;


                product.rejectionReason =
                    null;


                product.displayDate =
                    new Date();

            } else {

                product.status =
                    "Approved";


                product.approvedAt =
                    product.approvedAt ||
                    new Date();


                product.approvedBy =
                    null;


                product.rejectionReason =
                    null;


                product.displayDate =
                    new Date();
            }


            // -------------------------------------------------
            // SAVE PRODUCT
            // -------------------------------------------------

            await product.save({
                transaction
            });


            // -------------------------------------------------
            // COMMIT TRANSACTION
            // -------------------------------------------------

            await transaction.commit();

            transaction = null;


            // -------------------------------------------------
            // REMOVE OLD R2 IMAGES
            // -------------------------------------------------

            if (
                oldImages.length > 0
            ) {

                const oldKeys =
                    oldImages
                        .filter(
                            (image) => {

                                if (
                                    typeof image !==
                                    "string"
                                ) {
                                    return false;
                                }


                                const key =
                                    image
                                        .trim()
                                        .replace(
                                            /^\/+/,
                                            ""
                                        );


                                return (
                                    key.startsWith(
                                        "uploads/"
                                    ) &&
                                    !key.startsWith(
                                        "http://"
                                    ) &&
                                    !key.startsWith(
                                        "https://"
                                    )
                                );
                            }
                        )
                        .map(
                            (image) =>
                                image
                                    .trim()
                                    .replace(
                                        /^\/+/,
                                        ""
                                    )
                        );


                await Promise.allSettled(
                    [
                        ...new Set(
                            oldKeys
                        )
                    ].map(
                        (key) =>
                            deleteFromR2(
                                key
                            )
                    )
                );
            }


            // -------------------------------------------------
            // RESPONSE MESSAGE
            // -------------------------------------------------

            const responseMessage =
                requireProductApproval
                    ? "Product updated successfully and submitted for admin approval."
                    : "Product updated and published successfully.";


            // -------------------------------------------------
            // RETURN UPDATED PRODUCT
            // -------------------------------------------------

            return res.json({

                success: true,

                message:
                    responseMessage,

                approvalRequired:
                    requireProductApproval,

                status:
                    product.status,

                product:
                    formatProduct(
                        product
                    )
            });


        } catch (error) {

            // -------------------------------------------------
            // ROLLBACK / CLEANUP
            // -------------------------------------------------

            if (transaction) {

                await rollbackTransaction(
                    transaction,
                    req.files
                );

            } else {

                await cleanupUploadedFiles(
                    req.files
                );
            }


            // -------------------------------------------------
            // ERROR LOG
            // -------------------------------------------------

            console.error(
                "UPDATE PRODUCT ERROR:",
                error
            );


            // -------------------------------------------------
            // ERROR RESPONSE
            // -------------------------------------------------

            return res.status(500).json({
                success: false,
                message:
                    "Unable to update product."
            });
        }
    };


/* ===========================================================
   DELETE PRODUCT
=========================================================== */

exports.deleteProduct =
    async (req, res) => {

        try {

            if (!req.user) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Unauthorized."
                });
            }

            const product =
                await Product.findByPk(
                    req.params.id
                );

            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }

            if (
                Number(product.userId) !==
                Number(req.user.id)
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Unauthorized."
                });
            }

            await product.destroy();

            await deleteProductImages(
                product
            );

            return res.json({
                success: true,
                message:
                    "Product deleted successfully."
            });

        } catch (error) {

            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to delete product."
            });
        }
    };

/* ===========================================================
   CHANGE PRODUCT STATUS
=========================================================== */

exports.changeProductStatus =
    async (req, res) => {

        try {

            // -------------------------------------------------
            // AUTHENTICATION
            // -------------------------------------------------

            if (!req.user) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Please login first."
                });
            }


            // -------------------------------------------------
            // FIND PRODUCT
            // -------------------------------------------------

            const product =
                await Product.findByPk(
                    req.params.id
                );


            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }


            // -------------------------------------------------
            // VERIFY PRODUCT OWNER
            // -------------------------------------------------

            if (
                Number(product.userId) !==
                Number(req.user.id)
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to change this product."
                });
            }


            // -------------------------------------------------
            // VALIDATE REQUESTED STATUS
            // -------------------------------------------------

            const requestedStatus =
                String(
                    req.body.status || ""
                )
                    .trim();


            if (!requestedStatus) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Product status is required."
                });
            }


            // -------------------------------------------------
            // APPROVAL SETTING
            //
            // If administrator approval is enabled,
            // sellers must never be able to manually
            // change a product to Approved.
            // -------------------------------------------------

            let requireProductApproval = true;

            try {

                requireProductApproval =
                    toBoolean(
                        await getSetting(
                            "require_product_approval",
                            true
                        ),
                        true
                    );

            } catch (settingsError) {

                console.error(
                    "PRODUCT APPROVAL SETTING ERROR:",
                    settingsError
                );

                // Fail safely.
                requireProductApproval = true;
            }


            // -------------------------------------------------
            // PROTECTED ADMINISTRATIVE STATUSES
            //
            // These statuses must only be controlled by
            // the administrator approval endpoints.
            // -------------------------------------------------

            const protectedStatuses = [
                "Approved",
                "Rejected",
                "Pending"
            ];


            // -------------------------------------------------
            // PREVENT SELLER FROM BYPASSING APPROVAL
            // -------------------------------------------------

            if (
                requireProductApproval &&
                protectedStatuses.includes(
                    requestedStatus
                )
            ) {

                return res.status(403).json({
                    success: false,
                    approvalRequired: true,
                    message:
                        "Product approval status can only be changed by an administrator."
                });
            }


            // -------------------------------------------------
            // VALID STATUS VALUES
            //
            // These are seller-controlled availability
            // statuses. They do NOT control administrator
            // approval.
            // -------------------------------------------------

            const allowedSellerStatuses = [
                "Active",
                "Inactive",
                "Sold",
                "Out of Stock"
            ];


            if (
                !allowedSellerStatuses.includes(
                    requestedStatus
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid product status."
                });
            }


            // -------------------------------------------------
            // DO NOT ALLOW SELLER TO MODIFY ADMIN APPROVAL
            //
            // If the product is Pending or Rejected,
            // changing its seller availability status must
            // not turn it into a publicly approved product.
            // -------------------------------------------------

            if (
                product.status === "Pending" ||
                product.status === "Rejected"
            ) {

                return res.status(403).json({
                    success: false,
                    approvalRequired: true,
                    message:
                        "This product must be approved by an administrator before its availability status can be changed."
                });
            }


            // -------------------------------------------------
            // CHANGE SELLER AVAILABILITY
            // -------------------------------------------------

            product.sellerStatus =
                requestedStatus;


            await product.save();


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.json({

                success: true,

                message:
                    "Product availability status updated successfully.",

                product:
                    formatProduct(
                        product
                    )
            });


        } catch (error) {

            console.error(
                "CHANGE PRODUCT STATUS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to update product status."
            });
        }
    };


/* ===========================================================
   SELLER DASHBOARD STATISTICS
=========================================================== */

exports.getSellerStatistics =
    async (req, res) => {

        try {

            const totalProducts =
                await Product.count({
                    where: {
                        userId:
                            req.user.id
                    }
                });

            const approved =
                await Product.count({
                    where: {
                        userId:
                            req.user.id,

                        status:
                            "Approved"
                    }
                });

            const pending =
                await Product.count({
                    where: {
                        userId:
                            req.user.id,

                        status:
                            "Pending"
                    }
                });

            const rejected =
                await Product.count({
                    where: {
                        userId:
                            req.user.id,

                        status:
                            "Rejected"
                    }
                });

            const totalViews =
                await Product.sum(
                    "views",
                    {
                        where: {
                            userId:
                                req.user.id
                        }
                    }
                );

            return res.json({
                success: true,

                statistics: {
                    totalProducts,
                    approved,
                    pending,
                    rejected,
                    totalViews:
                        totalViews || 0
                }
            });

        } catch (error) {

            console.error(
                "GET SELLER STATISTICS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


/* ===========================================================
   ADD TO WISHLIST
=========================================================== */

exports.addToWishlist =
    async (req, res) => {

        try {

            const product =
                await Product.findByPk(
                    req.params.id
                );

            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }

            const existing =
                await Wishlist.findOne({
                    where: {
                        userId:
                            req.user.id,

                        productId:
                            product.id
                    }
                });

            if (existing) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Product already in wishlist."
                });
            }

            await Wishlist.create({
                userId:
                    req.user.id,

                productId:
                    product.id
            });

            product.favourites =
                Number(
                    product.favourites || 0
                ) + 1;

            await product.save();

            return res.json({
                success: true,
                message:
                    "Added to wishlist."
            });

        } catch (error) {

            console.error(
                "ADD TO WISHLIST ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


/* ===========================================================
   REMOVE FROM WISHLIST
=========================================================== */

exports.removeFromWishlist =
    async (req, res) => {

        try {

            const wishlist =
                await Wishlist.findOne({
                    where: {
                        userId:
                            req.user.id,

                        productId:
                            req.params.id
                    }
                });

            if (!wishlist) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Wishlist item not found."
                });
            }

            await wishlist.destroy();

            const product =
                await Product.findByPk(
                    req.params.id
                );

            if (
                product &&
                Number(
                    product.favourites || 0
                ) > 0
            ) {

                product.favourites -= 1;

                await product.save();
            }

            return res.json({
                success: true,
                message:
                    "Removed from wishlist."
            });

        } catch (error) {

            console.error(
                "REMOVE FROM WISHLIST ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


/* ===========================================================
   GET WISHLIST
=========================================================== */

exports.getWishlist =
    async (req, res) => {

        try {

            const wishlist =
                await Wishlist.findAll({

                    where: {
                        userId:
                            req.user.id
                    },

                    include: [
                        {
                            model:
                                Product
                        }
                    ],

                    order: [
                        [
                            "createdAt",
                            "DESC"
                        ]
                    ]
                });

            const formattedWishlist =
                wishlist.map(
                    (item) => {

                        const data =
                            typeof item.toJSON ===
                            "function"
                                ? item.toJSON()
                                : item;

                        if (
                            data.product
                        ) {

                            data.product =
                                formatProduct(
                                    data.product
                                );
                        }

                        return data;
                    }
                );

            return res.json({
                success: true,
                wishlist:
                    formattedWishlist
            });

        } catch (error) {

            console.error(
                "GET WISHLIST ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };

/* ===========================================================
   RECORD PRODUCT VIEW
=========================================================== */

exports.recordProductView = async (req, res) => {

    try {

        const product = await Product.findOne({

            where: {
                id: req.params.id,
                status: "Approved",
                deleted: false
            }

        });

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }


        /*
        |--------------------------------------------------------------------------
        | LOGGED-IN USERS
        |--------------------------------------------------------------------------
        | A logged-in user should only create one ProductView record
        | for the same product.
        |--------------------------------------------------------------------------
        */

        if (req.user) {

            const viewed =
                await ProductView.findOne({

                    where: {

                        userId: req.user.id,

                        productId: product.id

                    }

                });


            /*
            |--------------------------------------------------------------------------
            | USER ALREADY VIEWED THIS PRODUCT
            |--------------------------------------------------------------------------
            | Do not increase the counter again.
            |--------------------------------------------------------------------------
            */

            if (viewed) {

                return res.json({

                    success: true,

                    counted: false,

                    message:
                        "Product view already recorded."

                });

            }


            /*
            |--------------------------------------------------------------------------
            | FIRST VIEW FROM THIS LOGGED-IN USER
            |--------------------------------------------------------------------------
            */

            await ProductView.create({

                userId: req.user.id,

                productId: product.id

            });

        }


        /*
        |--------------------------------------------------------------------------
        | INCREASE PRODUCT VIEW COUNT
        |--------------------------------------------------------------------------
        */

        product.views =
            Number(
                product.views || 0
            ) + 1;


        /*
        |--------------------------------------------------------------------------
        | UPDATE LISTING SCORE
        |--------------------------------------------------------------------------
        */

        product.listingScore =
            Number(
                product.listingScore || 0
            ) + 1;


        await product.save();


        return res.json({

            success: true,

            counted: true

        });

    } catch (error) {

        console.error(
            "RECORD PRODUCT VIEW ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to record product view."

        });

    }

};

/* ===========================================================
   RECENTLY VIEWED
=========================================================== */

exports.getRecentlyViewed =
    async (req, res) => {

        try {

            const views =
                await ProductView.findAll({

                    where: {
                        userId:
                            req.user.id
                    },

                    include: [
                        {
                            model:
                                Product
                        }
                    ],

                    order: [
                        [
                            "createdAt",
                            "DESC"
                        ]
                    ],

                    limit:
                        20
                });

            const products =
                views.map(
                    (view) => {

                        const data =
                            typeof view.toJSON ===
                            "function"
                                ? view.toJSON()
                                : view;

                        if (
                            data.product
                        ) {

                            data.product =
                                formatProduct(
                                    data.product
                                );
                        }

                        return data;
                    }
                );

            return res.json({
                success: true,
                products
            });

        } catch (error) {

            console.error(
                "GET RECENTLY VIEWED ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


/* ===========================================================
   RECOMMENDED PRODUCTS
=========================================================== */

exports.getRecommendedProducts =
    async (req, res) => {

        try {

            const products =
                await getHomepagePromotionProducts(
                    "BOOST"
                );

            return res.json({
                success: true,
                products
            });

        } catch (error) {

            console.error(
                "GET RECOMMENDED PRODUCTS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load recommended products."
            });
        }
    };


/* ===========================================================
   APPROVE PRODUCT
=========================================================== */

exports.approveProduct =
    async (req, res) => {

        try {

            const product =
                await Product.findByPk(
                    req.params.id
                );

            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }

            product.status =
                "Approved";

            product.displayDate =
                new Date();

            product.deleted =
                false;

            await product.save();

            return res.json({
                success: true,

                message:
                    "Product approved successfully.",

                product:
                    formatProduct(
                        product
                    )
            });

        } catch (error) {

            console.error(
                "APPROVE PRODUCT ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


/* ===========================================================
   REJECT PRODUCT
=========================================================== */

exports.rejectProduct =
    async (req, res) => {

        try {

            const product =
                await Product.findByPk(
                    req.params.id
                );

            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }

            product.status =
                "Rejected";

            product.rejectionReason =
                req.body.reason ||
                "Rejected by administrator.";

            await product.save();

            return res.json({
                success: true,
                message:
                    "Product rejected."
            });

        } catch (error) {

            console.error(
                "REJECT PRODUCT ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


/* ===========================================================
   RESTORE PRODUCT
=========================================================== */

exports.restoreProduct =
    async (req, res) => {

        try {

            const product =
                await Product.findByPk(
                    req.params.id
                );

            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }

            product.status =
                "Approved";

            product.deleted =
                false;

            await product.save();

            return res.json({
                success: true,

                message:
                    "Product restored.",

                product:
                    formatProduct(
                        product
                    )
            });

        } catch (error) {

            console.error(
                "RESTORE PRODUCT ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


/* ===========================================================
   ADMIN PERMANENT DELETE
=========================================================== */

exports.adminDeleteProduct =
    async (req, res) => {

        try {

            const product =
                await Product.findByPk(
                    req.params.id
                );

            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }

            await Wishlist.destroy({
                where: {
                    productId:
                        product.id
                }
            });

            await ProductView.destroy({
                where: {
                    productId:
                        product.id
                }
            });

            await product.destroy();

            await deleteProductImages(
                product
            );

            return res.json({
                success: true,
                message:
                    "Product permanently deleted."
            });

        } catch (error) {

            console.error(
                "ADMIN DELETE PRODUCT ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to permanently delete product."
            });
        }
    };


/* ===========================================================
   MARKETPLACE STATISTICS
=========================================================== */

exports.getMarketplaceStatistics =
    async (req, res) => {

        try {

            const totalProducts =
                await Product.count();

            const approvedProducts =
                await Product.count({
                    where: {
                        status:
                            "Approved"
                    }
                });

            const pendingProducts =
                await Product.count({
                    where: {
                        status:
                            "Pending"
                    }
                });

            const rejectedProducts =
                await Product.count({
                    where: {
                        status:
                            "Rejected"
                    }
                });

            const featuredProducts =
                await Product.count({
                    where: {
                        featured:
                            true
                    }
                });

            const expressProducts =
                await Product.count({
                    where: {
                        express:
                            true
                    }
                });

            const totalViews =
                await Product.sum(
                    "views"
                );

            return res.json({
                success: true,

                statistics: {
                    totalProducts,
                    approvedProducts,
                    pendingProducts,
                    rejectedProducts,
                    featuredProducts,
                    expressProducts,
                    totalViews:
                        totalViews || 0
                }
            });

        } catch (error) {

            console.error(
                "GET MARKETPLACE STATISTICS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


/* ===========================================================
   RECORD SHARE
=========================================================== */

exports.recordShare =
    async (req, res) => {

        try {

            const product =
                await Product.findByPk(
                    req.params.id
                );

            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }

            product.shares =
                Number(
                    product.shares || 0
                ) + 1;

            product.listingScore =
                Number(
                    product.listingScore || 0
                ) + 2;

            await product.save();

            return res.json({
                success: true,
                shares:
                    product.shares
            });

        } catch (error) {

            console.error(
                "RECORD SHARE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


/* ===========================================================
   RECORD CHAT
=========================================================== */

exports.recordChat =
    async (req, res) => {

        try {

            const product =
                await Product.findByPk(
                    req.params.id
                );

            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }

            product.chatCount =
                Number(
                    product.chatCount || 0
                ) + 1;

            product.listingScore =
                Number(
                    product.listingScore || 0
                ) + 5;

            await product.save();

            return res.json({
                success: true,
                chats:
                    product.chatCount
            });

        } catch (error) {

            console.error(
                "RECORD CHAT ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


/* ===========================================================
   NEARBY PRODUCTS
=========================================================== */

exports.getNearbyProducts =
    async (req, res) => {

        try {

            const user =
                await User.findByPk(
                    req.user.id
                );

            if (!user) {

                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            const products =
                await Product.findAll({

                    where: {

                        status:
                            "Approved",

                        deleted:
                            false,

                        region:
                            user.region
                    },

                    order: [

                        [
                            "homepagePriority",
                            "DESC"
                        ],

                        [
                            "featured",
                            "DESC"
                        ],

                        [
                            "listingScore",
                            "DESC"
                        ],

                        [
                            "createdAt",
                            "DESC"
                        ]
                    ],

                    limit:
                        20
                });

            return res.json({
                success: true,

                products:
                    formatProducts(
                        products
                    )
            });

        } catch (error) {

            console.error(
                "GET NEARBY PRODUCTS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


/* ===========================================================
   BOOST PRODUCT
=========================================================== */

exports.boostProduct =
    async (req, res) => {

        req.body.productId =
            req.params.id;

        req.body.promotionType =
            "Boost";

        return promotionController
            .initializePromotion(
                req,
                res
            );
    };


/* ===========================================================
   FEATURE PRODUCT
=========================================================== */

exports.featureProduct =
    async (req, res) => {

        req.body.productId =
            req.params.id;

        req.body.promotionType =
            "Feature";

        return promotionController
            .initializePromotion(
                req,
                res
            );
    };


/* ===========================================================
   EXPRESS PRODUCT
=========================================================== */

exports.expressProduct =
    async (req, res) => {

        req.body.productId =
            req.params.id;

        req.body.promotionType =
            "Express";

        return promotionController
            .initializePromotion(
                req,
                res
            );
    };


/* ===========================================================
   GET RELATED PRODUCTS
=========================================================== */

exports.getRelatedProducts =
    async (req, res) => {

        try {

            const product =
                await Product.findByPk(
                    req.params.id
                );

            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }

            const products =
                await Product.findAll({

                    where: {

                        id: {
                            [Op.ne]:
                                product.id
                        },

                        category:
                            product.category,

                        status:
                            "Approved",

                        deleted:
                            false
                    },

                    order: [

                        [
                            "homepagePriority",
                            "DESC"
                        ],

                        [
                            "featured",
                            "DESC"
                        ],

                        [
                            "express",
                            "DESC"
                        ],

                        [
                            "listingScore",
                            "DESC"
                        ],

                        [
                            "createdAt",
                            "DESC"
                        ]
                    ],

                    limit:
                        8
                });

            return res.json({
                success: true,

                products:
                    formatProducts(
                        products
                    )
            });

        } catch (error) {

            console.error(
                "GET RELATED PRODUCTS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };
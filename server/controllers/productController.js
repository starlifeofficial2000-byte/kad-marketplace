const { Op } = require("sequelize");



const sanitize = require("../services/sanitizeService");
const Product = require("../models/Product");
const User = require("../models/user");
const Store = require("../models/Store");
const Subscription = require("../models/Subscription");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const ProductView = require("../models/ProductView");
const Wishlist = require("../models/Wishlist");
const slugify = require("slugify");
const sequelize = require("../config/database");
const promotionController = require("./promotionController");
const ProductPromotion = require("../models/ProductPromotion");



/* ===========================================================
   LOAD USER SUBSCRIPTION
=========================================================== */

async function getSubscription(userId) {

    return await Subscription.findOne({

        where: {

            userId,

            status: "Active"

        }

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

        subscription.planId

    );

    return {

        subscription,

        plan

    };

}

/* ===========================================================
   UPLOAD LIMIT
=========================================================== */

function getUploadLimit(plan) {

    if (!plan)

        return 10;

    if (plan.unlimitedListings)

        return Number.MAX_SAFE_INTEGER;

    return plan.uploadLimit || 10;

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

    return {

        listingPriority:

            plan.listingPriority,

        homepagePriority:

            plan.homepagePriority ? 2 : 1,

        searchPriority:

            plan.listingPriority

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

    return {

        featured:

            plan.featuredProducts,

        express:

            plan.expressCredits > 0,

        aiRecommended:

            plan.aiRecommendation

    };

}

/* ===========================================================
   PRODUCT SCORE
=========================================================== */
function calculateScore(plan) {

    let score = 100;

    if (!plan)

        return score;

    score += plan.listingPriority * 100;

    if (plan.homepagePriority)

        score += 300;

    if (plan.featuredProducts)

        score += 500;

    if (plan.aiRecommendation)

        score += 200;

    if (plan.storeAccess)

        score += 100;

    return score;

}async function validateSubscription(userId) {

    const { subscription, plan } = await getPlan(userId);

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

}function generateSlug(title) {

    return slugify(title, {

        lower: true,

        strict: true

    });

}/* ===========================================================
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

        if (!data[field]) {

            return {

                success: false,

                message: `${field} is required.`

            };

        }

    }

    return {

        success: true

    };

}

/* ===========================================================
   GET PLAN FEATURES
=========================================================== */

function getPlanFeatures(plan) {

    return {

        listingPriority:

            plan?.listingPriority || 1,

        homepagePriority:

            plan?.homepagePriority ? 2 : 1,

        searchPriority:

            plan?.listingPriority || 1,

        featured:

            plan?.featuredProducts || false,

        express:

            (plan?.expressCredits || 0) > 0,

        aiRecommended:

            plan?.aiRecommendation || false,

        verifiedStore:

            plan?.storeAccess || false

    };

}

/* ===========================================================
   PROCESS IMAGES
=========================================================== */

function processImages(files) {

    if (!files)

        return [];

    return files.map(file => file.filename);

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

}/* ===========================================================
   CREATE PRODUCT
=========================================================== */

exports.createProduct = async (req, res) => {
    

    const transaction = await sequelize.transaction();
console.log("Logged in user:", req.user);
    try {

        if (!req.user) {

            await transaction.rollback();

            return res.status(401).json({

                success: false,

                message: "Please login first."

            });

        }

        /* ===============================
           VALIDATE INPUT
        =============================== */

        const validation = validateProduct(req.body);

        if (!validation.success) {

            await transaction.rollback();

            return res.status(400).json(validation);

        }

        if (!req.files || req.files.length === 0) {

            await transaction.rollback();

            return res.status(400).json({

                success: false,

                message: "Upload at least one image."

            });

        }

        /* ===============================
           SUBSCRIPTION
        =============================== */
console.log("Searching subscription for user:", req.user.id);
      

      /* ===============================
   FREE / SUBSCRIBED USER CHECK
=============================== */

const subscriptionResult = await validateSubscription(req.user.id);

let subscription = null;
let plan = null;

// User has an active subscription
if (subscriptionResult.valid) {

    subscription = subscriptionResult.subscription;
    plan = subscriptionResult.plan;

    const uploads = await getMonthlyUploads(req.user.id);

    const uploadLimit = getUploadLimit(plan);

    if (

        uploadLimit !== Number.MAX_SAFE_INTEGER &&
        uploads >= uploadLimit

    ) {

        await transaction.rollback();

        return res.status(403).json({

            success: false,

            message: `Your ${plan.name} plan allows only ${uploadLimit} uploads this month.`

        });

    }

}

// User has NO subscription
else {

    const user = await User.findByPk(req.user.id);

    const FREE_UPLOAD_LIMIT = 5;

    if (user.freeUploadsUsed >= FREE_UPLOAD_LIMIT) {

        await transaction.rollback();

        return res.status(403).json({

            success: false,

            requiresSubscription: true,

            message: "You have reached your free upload limit. Please subscribe."

        });

    }

}

       
/* ===============================
   PLAN FEATURES
=============================== */

let features;
let score;

if (plan) {

    features = getPlanFeatures(plan);

    score = calculateScore(plan);

} else {

    // Free user defaults
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

const images = processImages(req.files);

const slug = generateSlug(req.body.title);      /* ===============================
           CREATE PRODUCT
        =============================== */

        const product = await Product.create({

            
            userId: req.user.id,

           subscriptionPlanId: plan ? plan.id : null,

           title: sanitize(req.body.title),

description: sanitize(req.body.description),

            price: Number(req.body.price),

            category: req.body.category,

            condition: req.body.condition,

            location: req.body.location,

            region: req.body.region,

            city: req.body.city,

            images: JSON.stringify(images),

            slug,

            status: "Pending",

          promotionType: plan ? plan.name : "Free",

            listingPriority: features.listingPriority,

            homepagePriority: features.homepagePriority,

            searchPriority: features.searchPriority,

            featured: features.featured,

            express: features.express,

            aiRecommended: features.aiRecommended,

            verifiedStore: features.verifiedStore,

            listingScore: score,

            qualityScore: score,

            displayDate: new Date()

        },
        {

            transaction

        });
/* ===============================
   UPDATE UPLOAD COUNTERS
=============================== */

// User has a subscription
if (subscription) {

    subscription.uploadsUsed += 1;

    await subscription.save({

        transaction

    });

}

// Free user
else {

    const user = await User.findByPk(

        req.user.id,

        {

            transaction

        }

    );

    user.freeUploadsUsed += 1;

    await user.save({

        transaction

    });

}

        /* ===============================
           VERIFIED STORE
        =============================== */

        const store = await Store.findOne({

            where: {

                userId: req.user.id,

                status: "Verified"

            },

            transaction

        });

        if (store) {

            product.verifiedStore = true;

            await product.save({

                transaction

            });

        }

        /* ===============================
           COMMIT
        =============================== */

        await transaction.commit();

        return res.status(201).json({

            success: true,

            message:

                "Product created successfully. Awaiting admin approval.",

            product

        });

    }

    catch (error) {

        await transaction.rollback();

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/* ===========================================================
   GET ALL APPROVED PUBLIC PRODUCTS
=========================================================== */

exports.getProducts = async (req, res) => {

    try {

        const products = await Product.findAll({

            where: {

                status: "Approved",

                deleted: false

            },

            include: [

                {
                    model: User,

                    as: "seller",

                    attributes: [

                        "id",

                        "name",

                        "email",

                        "profileImage"

                    ],

                    include: [

                        /* =====================================
                           USER SUBSCRIPTION
                        ====================================== */

                        {
                            model: Subscription,

                            as: "subscriptions",

                            required: false,

                            where: {

                                status: "active"

                            },

                            include: [

                                {
                                    model: SubscriptionPlan,

                                    as: "subscriptionPlan",

                                    required: false

                                }

                            ],

                            order: [

                                ["createdAt", "DESC"]

                            ]

                        },

                        /* =====================================
                           USER STORE
                        ====================================== */

                        {
                            model: Store,

                            as: "store",

                            required: false,

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

                ["listingPriority", "DESC"],

                ["createdAt", "DESC"]

            ]

        });


        /* ===================================================
           FORMAT PRODUCTS
        =================================================== */

        const formattedProducts = products.map((product) => {

            const item = product.toJSON();


            /* ===============================================
               DEFAULT PLAN
            =============================================== */

            let subscription = null;

            let planName = "New User";


            /* ===============================================
               GET USER'S ACTIVE SUBSCRIPTION
            =============================================== */

            if (

                item.seller &&

                Array.isArray(item.seller.subscriptions) &&

                item.seller.subscriptions.length > 0

            ) {

                const activeSubscription =
                    item.seller.subscriptions[0];


                const plan =
                    activeSubscription.subscriptionPlan;


                if (plan) {

                    planName =
                        plan.name ||
                        plan.planName ||
                        "New User";


                    subscription = {

                        id: activeSubscription.id,

                        status: activeSubscription.status,

                        subscriptionPlanId:
                            activeSubscription.subscriptionPlanId,

                        planName: planName,

                        plan: {

                            id: plan.id,

                            name: plan.name ||

                                plan.planName ||

                                "New User"

                        }

                    };

                }

            }


            /* ===============================================
               FORMAT SELLER
            =============================================== */

            if (item.seller) {

                item.seller.subscription = subscription || {

                    planName: "New User",

                    plan: {

                        name: "New User"

                    }

                };

            }


            /* ===============================================
               ADD STORE TO PRODUCT DIRECTLY

               This allows:

               product.store.storeSlug
            =============================================== */

            item.store =

                item.seller?.store || null;


            /* ===============================================
               REMOVE UNNECESSARY SUBSCRIPTIONS ARRAY
            =============================================== */

            if (item.seller) {

                delete item.seller.subscriptions;

            }


            return item;

        });


        return res.status(200).json({

            success: true,

            products: formattedProducts

        });

    }

    catch (error) {

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

                id: req.params.id,

                status: "Approved"

            }

        });

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        /* ===============================
           UPDATE VIEW COUNT
        =============================== */

        product.views += 1;

        await product.save();

        const item = product.toJSON();

        try {

            item.images = JSON.parse(item.images);

        }

        catch {

            item.images = [];

        }

        /* ===============================
           RELATED PRODUCTS
        =============================== */

        const relatedProducts = await Product.findAll({

            where: {

                id: {

                    [Op.ne]: product.id

                },

                category: product.category,

                status: "Approved"

            },

            limit: 8,

            order: [

                ["homepagePriority", "DESC"],

                ["featured", "DESC"],

                ["express", "DESC"],

                ["listingPriority", "DESC"],

                ["listingScore", "DESC"]

            ]

        });

        const related = relatedProducts.map(p => {

            const data = p.toJSON();

            try {

                data.images = JSON.parse(data.images);

            }

            catch {

                data.images = [];

            }

            return data;

        });

        return res.json({

            success: true,

            product: item,

            relatedProducts: related

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};/* ===========================================================
   SEARCH PRODUCTS
=========================================================== */

exports.searchProducts = async (req, res) => {

    try {

        const {

            keyword,

            category,

            region,

            city,

            minPrice,

            maxPrice

        } = req.query;

        const where = {

            status: "Approved"

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

        if (category)

            where.category = category;

        if (region)

            where.region = region;

        if (city)

            where.city = city;

        if (minPrice || maxPrice) {

            where.price = {};

            if (minPrice)

                where.price[Op.gte] = Number(minPrice);

            if (maxPrice)

                where.price[Op.lte] = Number(maxPrice);

        }

        const products = await Product.findAll({

            where,

            order: [

                ["homepagePriority","DESC"],

                ["featured","DESC"],

                ["express","DESC"],

                ["listingPriority","DESC"],

                ["qualityScore","DESC"],

                ["views","DESC"],

                ["createdAt","DESC"]

            ]

        });

        return res.json({

            success: true,

            total: products.length,

            products

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   FEATURED PRODUCTS
=========================================================== */
exports.getFeaturedProducts = async (req, res) => {

    try {

        const promotions = await ProductPromotion.findAll({

            where: {

                promotionType: "FEATURED",

                paymentStatus: "PAID",

                status: "APPROVED",

                showOnHomepage: true,

                endDate: {

                    [Op.gt]: new Date()

                }

            },

            include: [

                {

                    model: Product,

                    as: "product",

                    where: {

                        status: "Approved",

                        deleted: false,

                        

                    }

                }

            ],

            order: [

                ["homepageOrder", "ASC"],

                ["approvedAt", "DESC"]

            ]

        });

        const products = promotions.map((promotion) => {

            const product = promotion.product;

            if (product && product.images) {

                try {

                    product.images = JSON.parse(product.images);

                }

                catch {

                    product.images = [];

                }

            }

            return product;

        });

        return res.json({

            success: true,

            products

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   EXPRESS PRODUCTS
=========================================================== */

exports.getExpressProducts = async (req, res) => {

    try {

        const promotions = await ProductPromotion.findAll({

            where: {

                promotionType: "EXPRESS",

                paymentStatus: "PAID",

                status: "APPROVED",

                showOnHomepage: true,

                endDate: {

                    [Op.gt]: new Date()

                }

            },

            include: [

                {

                    model: Product,

                    as: "product",

                    where: {

                        status: "Approved",

                        deleted: false,

                        express: true

                    }

                }

            ],

            order: [

                ["homepageOrder", "ASC"],

                ["approvedAt", "DESC"]

            ]

        });

        const products = promotions.map((promotion) => {

            const product = promotion.product;

            if (product && product.images) {

                try {

                    product.images = JSON.parse(product.images);

                }

                catch {

                    product.images = [];

                }

            }

            return product;

        });

        return res.json({

            success: true,

            products

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/* ===========================================================
   TRENDING PRODUCTS
=========================================================== */

exports.getTrendingProducts = async (req, res) => {

    try {

        const promotions = await ProductPromotion.findAll({

            where: {

                promotionType: "BOOST",

                paymentStatus: "PAID",

                status: "APPROVED",

                showOnHomepage: true,

                endDate: {

                    [Op.gt]: new Date()

                }

            },

            include: [

                {

                    model: Product,

                    as: "product",

                    where: {

                        status: "Approved",

                        deleted: false,

                     

                    }

                }

            ],

            order: [

                ["homepageOrder", "ASC"],

                ["approvedAt", "DESC"]

            ]

        });

        const products = promotions.map((promotion) => {

            const product = promotion.product;

            if (product && product.images) {

                try {

                    product.images = JSON.parse(product.images);

                }

                catch {

                    product.images = [];

                }

            }

            return product;

        });

        return res.json({

            success: true,

            products

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/* ===========================================================
   NEW PRODUCTS
=========================================================== */

exports.getNewestProducts = async(req,res)=>{

    try{

        const products = await Product.findAll({

            where:{

                status:"Approved"

            },

            order:[

                ["createdAt","DESC"]

            ],

            limit:20

        });

        return res.json({

            success:true,

            products

        });

    }

    catch(error){

        console.log(error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};/* ===========================================================
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

        const data = products.map(product => {

            const item = product.toJSON();

            try {

                item.images = JSON.parse(item.images);

            }

            catch {

                item.images = [];

            }

            return item;

        });

        return res.json({

            success: true,

            total: data.length,

            products: data

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   UPDATE PRODUCT
=========================================================== */

exports.updateProduct = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        if (product.userId !== req.user.id) {

            return res.status(403).json({

                success: false,

                message: "Unauthorized."

            });

        }

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

        if (title) product.title = title;

        if (description) product.description = description;

        if (price) product.price = price;

        if (category) product.category = category;

        if (condition) product.condition = condition;

        if (location) product.location = location;

        if (region) product.region = region;

        if (city) product.city = city;

        if (req.files && req.files.length > 0) {

            product.images = JSON.stringify(

                req.files.map(file => file.filename)

            );

        }

        await product.save();

        return res.json({

            success: true,

            message: "Product updated successfully.",

            product

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   DELETE PRODUCT
=========================================================== */

exports.deleteProduct = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        if (product.userId !== req.user.id) {

            return res.status(403).json({

                success: false,

                message: "Unauthorized."

            });

        }

        await product.destroy();

        return res.json({

            success: true,

            message: "Product deleted successfully."

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   CHANGE PRODUCT STATUS
=========================================================== */

exports.changeProductStatus = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        product.status = req.body.status;

        await product.save();

        return res.json({

            success: true,

            message: "Product status updated.",

            product

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   SELLER DASHBOARD STATS
=========================================================== */

exports.getSellerStatistics = async (req, res) => {

    try {

        const totalProducts = await Product.count({

            where: {

                userId: req.user.id

            }

        });

        const approved = await Product.count({

            where: {

                userId: req.user.id,

                status: "Approved"

            }

        });

        const pending = await Product.count({

            where: {

                userId: req.user.id,

                status: "Pending"

            }

        });

        const rejected = await Product.count({

            where: {

                userId: req.user.id,

                status: "Rejected"

            }

        });

        const totalViews = await Product.sum("views", {

            where: {

                userId: req.user.id

            }

        });

        return res.json({

            success: true,

            statistics: {

                totalProducts,

                approved,

                pending,

                rejected,

                totalViews: totalViews || 0

            }

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};/* ===========================================================
   ADD TO WISHLIST
=========================================================== */

exports.addToWishlist = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        const existing = await Wishlist.findOne({

            where: {

                userId: req.user.id,

                productId: product.id

            }

        });

        if (existing) {

            return res.status(400).json({

                success: false,

                message: "Product already in wishlist."

            });

        }

        await Wishlist.create({

            userId: req.user.id,

            productId: product.id

        });

        product.favourites += 1;

        await product.save();

        return res.json({

            success: true,

            message: "Added to wishlist."

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   REMOVE FROM WISHLIST
=========================================================== */

exports.removeFromWishlist = async (req, res) => {

    try {

        const wishlist = await Wishlist.findOne({

            where: {

                userId: req.user.id,

                productId: req.params.id

            }

        });

        if (!wishlist) {

            return res.status(404).json({

                success: false,

                message: "Wishlist item not found."

            });

        }

        await wishlist.destroy();

        const product = await Product.findByPk(req.params.id);

        if (product && product.favourites > 0) {

            product.favourites -= 1;

            await product.save();

        }

        return res.json({

            success: true,

            message: "Removed from wishlist."

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   GET MY WISHLIST
=========================================================== */

exports.getWishlist = async (req, res) => {

    try {

        const wishlist = await Wishlist.findAll({

            where: {

                userId: req.user.id

            },

            include: [

                {

                    model: Product

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });

        return res.json({

            success: true,

            wishlist

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   RECORD PRODUCT VIEW
=========================================================== */

exports.recordProductView = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        // Logged-in user
        if (req.user) {

            const viewed = await ProductView.findOne({

                where: {

                    userId: req.user.id,

                    productId: product.id

                }

            });

            if (!viewed) {

                await ProductView.create({

                    userId: req.user.id,

                    productId: product.id

                });

            }

        }

        // Increase product views
        product.views = (product.views || 0) + 1;

        product.listingScore = (product.listingScore || 0) + 1;

        await product.save();

        return res.json({

            success: true

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   RECENTLY VIEWED
=========================================================== */

exports.getRecentlyViewed = async (req, res) => {

    try {

        const views = await ProductView.findAll({

            where: {

                userId: req.user.id

            },

            include: [

                {

                    model: Product

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ],

            limit: 20

        });

        return res.json({

            success: true,

            products: views

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   RECOMMENDED PRODUCTS
=========================================================== */

exports.getRecommendedProducts = async (req, res) => {

    try {

        const products = await Product.findAll({

            where: {

                status: "Approved"

            },

            order: [

                ["aiRecommended", "DESC"],

                ["homepagePriority", "DESC"],

                ["featured", "DESC"],

                ["express", "DESC"],

                ["qualityScore", "DESC"],

                ["listingScore", "DESC"]

            ],

            limit: 20

        });

        return res.json({

            success: true,

            products

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};/* ===========================================================
   GET PENDING PRODUCTS (ADMIN)
=========================================================== */

exports.getRecommendedProducts = async (req, res) => {

    try {

        const promotions = await ProductPromotion.findAll({

            where: {

                promotionType: "BOOST",

                paymentStatus: "PAID",

                status: "APPROVED",

                showOnHomepage: true,

                endDate: {

                    [Op.gt]: new Date()

                }

            },

            include: [

                {

                    model: Product,

                    as: "product",

                    where: {

                        status: "Approved",

                        deleted: false,

                        boosted: true

                    }

                }

            ],

            order: [

                ["homepageOrder", "ASC"],

                ["approvedAt", "DESC"]

            ]

        });

        const products = promotions.map((promotion) => {

            const product = promotion.product;

            if (product && product.images) {

                try {

                    product.images = JSON.parse(product.images);

                }

                catch {

                    product.images = [];

                }

            }

            return product;

        });

        return res.json({

            success: true,

            products

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/* ===========================================================
   APPROVE PRODUCT
=========================================================== */

exports.approveProduct = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        product.status = "Approved";

        product.displayDate = new Date();

        await product.save();

        return res.json({

            success: true,

            message: "Product approved successfully.",

            product

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   REJECT PRODUCT
=========================================================== */

exports.rejectProduct = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        product.status = "Rejected";

        product.rejectionReason =

            req.body.reason ||

            "Rejected by administrator.";

        await product.save();

        return res.json({

            success: true,

            message: "Product rejected."

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   RESTORE PRODUCT
=========================================================== */

exports.restoreProduct = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        product.status = "Approved";

        await product.save();

        return res.json({

            success: true,

            message: "Product restored.",

            product

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   PERMANENT DELETE
=========================================================== */

exports.adminDeleteProduct = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        await Wishlist.destroy({

            where: {

                productId: product.id

            }

        });

        await ProductView.destroy({

            where: {

                productId: product.id

            }

        });

        await product.destroy();

        return res.json({

            success: true,

            message: "Product permanently deleted."

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   MARKETPLACE STATISTICS
=========================================================== */

exports.getMarketplaceStatistics = async (req, res) => {

    try {

        const totalProducts = await Product.count();

        const approvedProducts = await Product.count({

            where: {

                status: "Approved"

            }

        });

        const pendingProducts = await Product.count({

            where: {

                status: "Pending"

            }

        });

        const rejectedProducts = await Product.count({

            where: {

                status: "Rejected"

            }

        });

        const featuredProducts = await Product.count({

            where: {

                featured: true

            }

        });

        const expressProducts = await Product.count({

            where: {

                express: true

            }

        });

        const totalViews = await Product.sum(

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

                totalViews: totalViews || 0

            }

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};/* ===========================================================
   RECORD SHARE
=========================================================== */

exports.recordShare = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        product.shares += 1;

        product.listingScore += 2;

        await product.save();

        return res.json({

            success: true,

            shares: product.shares

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   RECORD CHAT
=========================================================== */

exports.recordChat = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        product.chatCount += 1;

        product.listingScore += 5;

        await product.save();

        return res.json({

            success: true,

            chats: product.chatCount

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   NEARBY PRODUCTS
=========================================================== */

exports.getNearbyProducts = async (req, res) => {

    try {

        const user = await User.findByPk(req.user.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        const products = await Product.findAll({

            where: {

                status: "Approved",

                region: user.region

            },

            order: [

                ["homepagePriority","DESC"],

                ["featured","DESC"],

                ["listingScore","DESC"],

                ["createdAt","DESC"]

            ],

            limit: 20

        });

        return res.json({

            success: true,

            products

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ===========================================================
   BOOST PRODUCT
=========================================================== */
exports.boostProduct = async (req, res) => {

    req.body.productId = req.params.id;

    req.body.promotionType = "Boost";

    return require("./promotionController")

        .initializePromotion(req, res);
return promotionController.initializePromotion(req, res);
};

/* ===========================================================
   FEATURE PRODUCT
=========================================================== */

exports.featureProduct = async (req, res) => {

    req.body.productId = req.params.id;

    req.body.promotionType = "Feature";

    return require("./promotionController")

        .initializePromotion(req, res);
return promotionController.initializePromotion(req, res);
};
/* ===========================================================
   EXPRESS PRODUCT
=========================================================== */

exports.expressProduct = async (req, res) => {

    req.body.productId = req.params.id;

    req.body.promotionType = "Express";

    return require("./promotionController")

        .initializePromotion(req, res);
return promotionController.initializePromotion(req, res);
};/* ===========================================================
   GET RELATED PRODUCTS
=========================================================== */

exports.getRelatedProducts = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        const products = await Product.findAll({

            where: {

                id: {

                    [Op.ne]: product.id

                },

                category: product.category,

                status: "Approved"

            },

            order: [

                ["homepagePriority", "DESC"],

                ["featured", "DESC"],

                ["express", "DESC"],

                ["listingScore", "DESC"],

                ["createdAt", "DESC"]

            ],

            limit: 8

        });

        return res.json({

            success: true,

            products

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

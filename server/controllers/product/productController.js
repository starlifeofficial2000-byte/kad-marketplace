const { Op } = require("sequelize");

const Product = require("../models/Product");
const User = require("../models/User");
const Store = require("../models/Store");
const Subscription = require("../models/Subscription");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const ProductView = require("../models/ProductView");
const Wishlist = require("../models/Wishlist");

const promotionController = require("./promotionController");

/* ===========================================================
   GET ACTIVE SUBSCRIPTION
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
   GET SUBSCRIPTION PLAN
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
   GET MONTHLY UPLOAD LIMIT
=========================================================== */

function getUploadLimit(plan) {

    if (!plan)

        return 10;

    if (plan.unlimitedListings)

        return Number.MAX_SAFE_INTEGER;

    return plan.uploadLimit || 10;

}

/* ===========================================================
   GET PRODUCT PRIORITY
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
   GET PRODUCT FEATURES
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
   CALCULATE PRODUCT SCORE
=========================================================== */

function calculateScore(plan) {

    if (!plan)

        return 100;

    let score = 100;

    score += plan.listingPriority * 100;

    if (plan.featuredProducts)

        score += 500;

    if (plan.homepagePriority)

        score += 300;

    if (plan.aiRecommendation)

        score += 200;

    return score;

}/* ===========================================================
   CREATE PRODUCT
=========================================================== */

exports.createProduct = async (req, res) => {

    try {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message: "Please login first."

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

        if (

            !title ||

            !description ||

            !price ||

            !category ||

            !condition ||

            !location ||

            !region ||

            !city

        ) {

            return res.status(400).json({

                success: false,

                message: "Please complete all required fields."

            });

        }

        if (!req.files || req.files.length === 0) {

            return res.status(400).json({

                success: false,

                message: "Upload at least one product image."

            });

        }

        const {

            subscription,

            plan

        } = await getPlan(req.user.id);

        const uploadLimit = getUploadLimit(plan);

        const priority = getPriority(plan);

        const features = getFeatures(plan);

        const startOfMonth = new Date();

        startOfMonth.setDate(1);

        startOfMonth.setHours(0,0,0,0);

        const uploadsThisMonth = await Product.count({

            where: {

                userId: req.user.id,

                createdAt: {

                    [Op.gte]: startOfMonth

                }

            }

        });

        if (uploadsThisMonth >= uploadLimit) {

            return res.status(400).json({

                success: false,

                message: `Monthly upload limit reached (${uploadLimit}).`

            });

        }

        const images = req.files.map(

            file => file.filename

        );

        const slug =

            title

            .toLowerCase()

            .replace(/[^a-z0-9]+/g,"-")

            .replace(/^-|-$/g,"")

            +

            "-"

            +

            Date.now();

        const product = await Product.create({

            userId: req.user.id,

            subscriptionPlanId:

                subscription?.planId || null,

            title,

            slug,

            description,

            price,

            category,

            condition,

            location,

            region,

            city,

            images: JSON.stringify(images),

            promotionType:

                plan?.name || "Basic",

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

            listingScore:

                calculateScore(plan),

            qualityScore: 100,

            verifiedStore:

                plan?.verifiedStoreRequest || false,

            status: "Pending"

        });

        if (subscription) {

            subscription.uploadsUsed += 1;

            await subscription.save();

        }

        return res.status(201).json({

            success: true,

            message: "Product submitted successfully. Awaiting admin approval.",

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

};/* ===========================================================
   GET PRODUCTS
=========================================================== */

exports.getProducts = async (req, res) => {

    try {

        const {

            page = 1,

            limit = 20,

            category,

            region,

            city,

            minPrice,

            maxPrice,

            condition,

            search

        } = req.query;

        const where = {

            status: "Approved",

            deleted: false

        };

        if (category)

            where.category = category;

        if (region)

            where.region = region;

        if (city)

            where.city = city;

        if (condition)

            where.condition = condition;

        if (minPrice || maxPrice) {

            where.price = {};

            if (minPrice)

                where.price[Op.gte] = Number(minPrice);

            if (maxPrice)

                where.price[Op.lte] = Number(maxPrice);

        }

        if (search) {

            where[Op.or] = [

                {

                    title: {

                        [Op.like]:

                        `%${search}%`

                    }

                },

                {

                    description: {

                        [Op.like]:

                        `%${search}%`

                    }

                }

            ];

        }

        const offset =

            (page - 1) * limit;

        const {

            rows,

            count

        } = await Product.findAndCountAll({

            where,

            offset,

            limit: Number(limit),

            order: [

                ["homepagePriority","DESC"],

                ["featured","DESC"],

                ["express","DESC"],

                ["listingPriority","DESC"],

                ["qualityScore","DESC"],

                ["listingScore","DESC"],

                ["displayDate","DESC"],

                ["createdAt","DESC"]

            ],

            include: [

                {

                    model: User,

                    as: "seller",

                    attributes: [

                        "id",

                        "fullname",

                        "email"

                    ]

                }

            ]

        });

        const products = rows.map(product => {

            const item = product.toJSON();

            try {

                item.images =

                    JSON.parse(item.images);

            }

            catch {

                item.images = [];

            }

            return item;

        });

        return res.json({

            success: true,

            totalProducts: count,

            totalPages: Math.ceil(

                count / limit

            ),

            currentPage: Number(page),

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
   GET PRODUCT BY ID
=========================================================== */

exports.getProductById = async (req, res) => {

    try {

        const product = await Product.findOne({

          where: {     status: "Approved", 
                deleted: false }  ,

            include: [

                {

                    model: User,

                    as: "seller",

                    attributes: [

                        "id",

                        "fullname",

                        "email",

                        "phone"

                    ]

                },

                {

                    model: Store,

                    as: "store"

                }

            ]

        });

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        product.views += 1;

        await product.save();

        const item = product.toJSON();

        try {

            item.images =

                JSON.parse(item.images);

        }

        catch {

            item.images = [];

        }

        return res.json({

            success: true,

            product: item

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
   RELATED PRODUCTS
=========================================================== */

exports.getRelatedProducts = async (req, res) => {

    try {

        const product = await Product.findByPk(

            req.params.id

        );

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        const relatedProducts = await Product.findAll({

            where: {

                id: {

                    [Op.ne]: product.id

                },

                category: product.category,

                status: "Approved",

                deleted: false

            },

            order: [

                ["featured","DESC"],

                ["express","DESC"],

                ["listingScore","DESC"],

                ["createdAt","DESC"]

            ],

            limit: 8

        });

        return res.json({

            success: true,

            products: relatedProducts

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

            status: "Approved",

            deleted: false

        };

        if (keyword) {

            where[Op.or] = [

                {

                    title: {

                        [Op.like]: `%${keyword}%`

                    }

                },

                {

                    description: {

                        [Op.like]: `%${keyword}%`

                    }

                },

                {

                    keywords: {

                        [Op.like]: `%${keyword}%`

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

                ["listingScore","DESC"],

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

    catch(error){

        console.log(error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

/* ===========================================================
   FEATURED PRODUCTS
=========================================================== */

exports.getFeaturedProducts = async (req,res)=>{

    try{

        const products = await Product.findAll({

            where:{

                status:"Approved",

                featured:true,

                deleted:false

            },

            order:[

                ["listingScore","DESC"],

                ["views","DESC"]

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

};

/* ===========================================================
   EXPRESS PRODUCTS
=========================================================== */

exports.getExpressProducts = async (req,res)=>{

    try{

        const products = await Product.findAll({

            where:{

                status:"Approved",

                express:true,

                deleted:false

            },

            order:[

                ["listingScore","DESC"],

                ["views","DESC"]

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

};

/* ===========================================================
   TRENDING PRODUCTS
=========================================================== */

exports.getTrendingProducts = async (req,res)=>{

    try{

        const products = await Product.findAll({

            where:{

                status:"Approved",

                deleted:false

            },

            order:[

                ["views","DESC"],

                ["favourites","DESC"],

                ["shares","DESC"],

                ["listingScore","DESC"]

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

};

/* ===========================================================
   NEW PRODUCTS
=========================================================== */

exports.getNewestProducts = async (req,res)=>{

    try{

        const products = await Product.findAll({

            where:{

                status:"Approved",

                deleted:false

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

};

/* ===========================================================
   RECOMMENDED PRODUCTS
=========================================================== */

exports.getRecommendedProducts = async (req,res)=>{

    try{

        const products = await Product.findAll({

            where:{

                status:"Approved",

                deleted:false

            },

            order:[

                ["aiRecommended","DESC"],

                ["homepagePriority","DESC"],

                ["featured","DESC"],

                ["express","DESC"],

                ["qualityScore","DESC"],

                ["listingScore","DESC"]

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

};

/* ===========================================================
   NEARBY PRODUCTS
=========================================================== */

exports.getNearbyProducts = async (req,res)=>{

    try{

        const user = await User.findByPk(req.user.id);

        if(!user){

            return res.status(404).json({

                success:false,

                message:"User not found."

            });

        }

        const products = await Product.findAll({

            where:{

                status:"Approved",

                deleted:false,

                region:user.region

            },

            order:[

                ["featured","DESC"],

                ["listingScore","DESC"],

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

exports.getUserProducts = async (req, res) => {

    try {

        const products = await Product.findAll({

            where: {

                userId: req.user.id,

                deleted: false

            },

            order: [

                ["createdAt", "DESC"]

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

        if (req.files && req.files.length > 0) {

            product.images = JSON.stringify(

                req.files.map(file => file.filename)

            );

        }

        await product.update({

            title: req.body.title || product.title,

            description: req.body.description || product.description,

            price: req.body.price || product.price,

            category: req.body.category || product.category,

            condition: req.body.condition || product.condition,

            location: req.body.location || product.location,

            region: req.body.region || product.region,

            city: req.body.city || product.city,

            images: product.images,

            status: "Pending"

        });

        return res.json({

            success: true,

            message: "Product updated successfully. Awaiting approval.",

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

        product.deleted = true;

        await product.save();

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
   CHANGE PRODUCT STATUS (ADMIN)
=========================================================== */

exports.changeProductStatus = async (req, res) => {

    try {

        const { status, reason } = req.body;

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        product.status = status;

        if (status === "Approved") {

            product.approvedAt = new Date();

            product.displayDate = new Date();

        }

        if (status === "Rejected") {

            product.rejectionReason = reason || null;

        }

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
   SELLER STATISTICS
=========================================================== */

exports.getSellerStatistics = async (req, res) => {

    try {

        const totalProducts = await Product.count({

            where: {

                userId: req.user.id,

                deleted: false

            }

        });

        const approvedProducts = await Product.count({

            where: {

                userId: req.user.id,

                status: "Approved",

                deleted: false

            }

        });

        const pendingProducts = await Product.count({

            where: {

                userId: req.user.id,

                status: "Pending",

                deleted: false

            }

        });

        const totalViews = await Product.sum(

            "views",

            {

                where: {

                    userId: req.user.id,

                    deleted: false

                }

            }

        );

        const totalFavourites = await Product.sum(

            "favourites",

            {

                where: {

                    userId: req.user.id,

                    deleted: false

                }

            }

        );

        const totalChats = await Product.sum(

            "chatCount",

            {

                where: {

                    userId: req.user.id,

                    deleted: false

                }

            }

        );

        return res.json({

            success: true,

            statistics: {

                totalProducts,

                approvedProducts,

                pendingProducts,

                totalViews: totalViews || 0,

                totalFavourites: totalFavourites || 0,

                totalChats: totalChats || 0

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
   RECORD PRODUCT VIEW
=========================================================== */

exports.recordView = async (req, res) => {

    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        let userId = null;

        if (req.user) {

            userId = req.user.id;

        }

        if (userId) {

            const existing = await ProductView.findOne({

                where: {

                    userId,

                    productId: product.id

                }

            });

            if (!existing) {

                await ProductView.create({

                    userId,

                    productId: product.id

                });

            }

        }

        product.views += 1;

        await product.save();

        return res.json({

            success: true,

            views: product.views

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

        await product.save();

        return res.json({

            success: true,

            chatCount: product.chatCount

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
   TOGGLE WISHLIST
=========================================================== */

exports.toggleWishlist = async (req, res) => {

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

            await existing.destroy();

            if (product.favourites > 0) {

                product.favourites--;

            }

            await product.save();

            return res.json({

                success: true,

                wishlisted: false,

                favourites: product.favourites

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

            wishlisted: true,

            favourites: product.favourites

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

    return promotionController.initializePromotion(

        req,

        res

    );

};

/* ===========================================================
   FEATURE PRODUCT
=========================================================== */

exports.featureProduct = async (req, res) => {

    req.body.productId = req.params.id;

    req.body.promotionType = "Feature";

    return promotionController.initializePromotion(

        req,

        res

    );

};

/* ===========================================================
   EXPRESS PRODUCT
=========================================================== */

exports.expressProduct = async (req, res) => {

    req.body.productId = req.params.id;

    req.body.promotionType = "Express";

    return promotionController.initializePromotion(

        req,

        res

    );

};/* ===========================================================
   GET PENDING PRODUCTS (ADMIN)
=========================================================== */

exports.getPendingProducts = async (req, res) => {

    try {

        const products = await Product.findAll({

            where: {

                status: "Pending",

                deleted: false

            },

            include: [

                {

                    model: User,

                    as: "seller",

                    attributes: [

                        "id",

                        "fullname",

                        "email",

                        "phone"

                    ]

                }

            ],

            order: [

                ["createdAt", "DESC"]

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
   GET PRODUCT STATISTICS (ADMIN)
=========================================================== */

exports.getProductStatistics = async (req, res) => {

    try {

        // -------------------------------------------------
        // TOTAL PRODUCTS
        // -------------------------------------------------

        const totalProducts =
            await Product.count({
                where: {
                    deleted: false
                }
            });


        // -------------------------------------------------
        // APPROVED PRODUCTS
        // -------------------------------------------------

        const approvedProducts =
            await Product.count({
                where: {
                    status: "Approved",
                    deleted: false
                }
            });


        // -------------------------------------------------
        // PENDING PRODUCTS
        // -------------------------------------------------

        const pendingProducts =
            await Product.count({
                where: {
                    status: "Pending",
                    deleted: false
                }
            });


        // -------------------------------------------------
        // REJECTED PRODUCTS
        // -------------------------------------------------

        const rejectedProducts =
            await Product.count({
                where: {
                    status: "Rejected",
                    deleted: false
                }
            });


        // -------------------------------------------------
        // SOLD PRODUCTS
        //
        // IMPORTANT:
        // Sold is now controlled by sellerStatus,
        // NOT the administrator approval status.
        // -------------------------------------------------

        const soldProducts =
            await Product.count({
                where: {
                    sellerStatus: "Sold",
                    deleted: false
                }
            });


        // -------------------------------------------------
        // ACTIVE PRODUCTS
        // -------------------------------------------------

        const activeProducts =
            await Product.count({
                where: {
                    sellerStatus: "Active",
                    deleted: false
                }
            });


        // -------------------------------------------------
        // INACTIVE PRODUCTS
        // -------------------------------------------------

        const inactiveProducts =
            await Product.count({
                where: {
                    sellerStatus: "Inactive",
                    deleted: false
                }
            });


        // -------------------------------------------------
        // OUT OF STOCK PRODUCTS
        // -------------------------------------------------

        const outOfStockProducts =
            await Product.count({
                where: {
                    sellerStatus: "Out of Stock",
                    deleted: false
                }
            });


        // -------------------------------------------------
        // FEATURED PRODUCTS
        // -------------------------------------------------

        const featuredProducts =
            await Product.count({
                where: {
                    featured: true,
                    deleted: false
                }
            });


        // -------------------------------------------------
        // EXPRESS PRODUCTS
        // -------------------------------------------------

        const expressProducts =
            await Product.count({
                where: {
                    express: true,
                    deleted: false
                }
            });


        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.json({

            success: true,

            statistics: {

                totalProducts,

                approvedProducts,

                pendingProducts,

                rejectedProducts,

                soldProducts,

                activeProducts,

                inactiveProducts,

                outOfStockProducts,

                featuredProducts,

                expressProducts

            }

        });

    }

    catch (error) {

        console.error(
            "GET PRODUCT STATISTICS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load product statistics."

        });

    }

};

/* ===========================================================
   MARK PRODUCT AS SOLD
=========================================================== */

exports.markAsSold = async (req, res) => {

    try {

        const product = await Product.findByPk(

            req.params.id

        );

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

        product.status = "Sold";

        product.soldAt = new Date();

        await product.save();

        return res.json({

            success: true,

            message: "Product marked as sold.",

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
   RESTORE PRODUCT
=========================================================== */

exports.restoreProduct = async (req, res) => {

    try {

        const product = await Product.findByPk(

            req.params.id

        );

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        product.deleted = false;

        product.status = "Pending";

        await product.save();

        return res.json({

            success: true,

            message: "Product restored successfully."

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
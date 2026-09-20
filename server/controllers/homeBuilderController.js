const Advertisement = require("../models/Advertisement");
const ProductPromotion = require("../models/ProductPromotion");
const Product = require("../models/Product");
const User = require("../models/User");

const { Op } = require("sequelize");


/* =====================================================
   HELPER: PARSE PRODUCT IMAGES
===================================================== */

const parseProductImages = (promotions) => {

    return promotions.map((promotion) => {

        const plainPromotion =
            promotion.get
                ? promotion.get({ plain: true })
                : promotion;


        if (plainPromotion.product?.images) {

            if (typeof plainPromotion.product.images === "string") {

                try {

                    plainPromotion.product.images =
                        JSON.parse(
                            plainPromotion.product.images
                        );

                } catch (error) {

                    plainPromotion.product.images = [];

                }

            }

        }


        return plainPromotion;

    });

};


/* =====================================================
   HELPER: GET ADMIN PROMOTED PRODUCTS

   Admin sees all valid approved promotions.

   showOnHomepage is NOT filtered here because
   the admin needs to manage hidden products too.
===================================================== */

const getAdminPromotedProducts = async (promotionType) => {

    const promotions =
        await ProductPromotion.findAll({

            where: {

                promotionType,

                paymentStatus: "PAID",

                status: "APPROVED",

                [Op.or]: [

                    {
                        endDate: {
                            [Op.gt]: new Date()
                        }
                    },

                    {
                        endDate: null
                    }

                ]

            },

            include: [

                {

                    model: Product,

                    as: "product",

                    required: true,

                    where: {

                        status: "Approved",

                        deleted: false

                    }

                },

                {

                    model: User,

                    as: "seller",

                    attributes: [

                        "id",
                        "name",
                        "email"

                    ]

                }

            ],

            order: [

                ["homepageOrder", "ASC"],

                ["approvedAt", "DESC"],

                ["createdAt", "DESC"]

            ]

        });


    return parseProductImages(promotions);

};


/* =====================================================
   HELPER: GET PUBLIC PROMOTED PRODUCTS

   Homepage only sees visible products.
===================================================== */

const getPublicPromotedProducts = async (promotionType) => {

    const promotions =
        await ProductPromotion.findAll({

            where: {

                promotionType,

                paymentStatus: "PAID",

                status: "APPROVED",

                showOnHomepage: true,

                [Op.or]: [

                    {
                        endDate: {
                            [Op.gt]: new Date()
                        }
                    },

                    {
                        endDate: null
                    }

                ]

            },

            include: [

                {

                    model: Product,

                    as: "product",

                    required: true,

                    where: {

                        status: "Approved",

                        deleted: false

                    }

                },

                {

                    model: User,

                    as: "seller",

                    attributes: [

                        "id",
                        "name",
                        "email"

                    ]

                }

            ],

            order: [

                ["homepageOrder", "ASC"],

                ["approvedAt", "DESC"],

                ["createdAt", "DESC"]

            ]

        });


    return parseProductImages(promotions);

};


/* =====================================================
   HERO BANNERS
===================================================== */


/* =====================================================
   ADMIN: GET ALL HERO BANNERS

   Important:
   Admin sees Running, Paused and Rejected banners.
===================================================== */

exports.getAdminHeroBanners = async (req, res) => {

    try {

        const banners =
            await Advertisement.findAll({

                order: [

                    ["priority", "ASC"],

                    ["createdAt", "DESC"]

                ]

            });


        return res.status(200).json({

            success: true,

            banners

        });

    }

    catch (error) {

        console.error(
            "GET ADMIN HERO BANNERS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load hero banners."

        });

    }

};


/* =====================================================
   PUBLIC: GET ACTIVE HERO BANNERS
===================================================== */

exports.getHeroBanners = async (req, res) => {

    try {

        const banners =
            await Advertisement.findAll({

                where: {

                    status: "Running",

                    [Op.and]: [

                        {

                            [Op.or]: [

                                {

                                    startDate: {

                                        [Op.lte]: new Date()

                                    }

                                },

                                {

                                    startDate: null

                                }

                            ]

                        },

                        {

                            [Op.or]: [

                                {

                                    endDate: {

                                        [Op.gte]: new Date()

                                    }

                                },

                                {

                                    endDate: null

                                }

                            ]

                        }

                    ]

                },

                order: [

                    ["priority", "ASC"],

                    ["createdAt", "DESC"]

                ]

            });


        return res.status(200).json({

            success: true,

            banners

        });

    }

    catch (error) {

        console.error(
            "GET PUBLIC HERO BANNERS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load hero banners."

        });

    }

};


/* =====================================================
   CREATE HERO BANNER
===================================================== */
exports.createHeroBanner = async (req, res) => {
    try {
        console.log("CREATE HERO BANNER FILE:", req.file);
        console.log("CREATE HERO BANNER BODY:", req.body);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Hero banner image is required."
            });
        }

        const {
            title,
            subtitle,
            description,
            buttonText,
            link,
            priority,
            placement,
            startDate,
            endDate
        } = req.body;

        const banner = await Advertisement.create({
            userId: req.user.id,

            title: title?.trim() || "",

            subtitle: subtitle?.trim() || "",

            description: description?.trim() || "",

            buttonText: buttonText?.trim() || "Shop Now",

            link: link?.trim() || "#",

            placement: placement || "Homepage",

            position: "Hero",

            priority: Number(priority) || 1,

            status: "Running",

            image: req.file.filename,

            startDate: startDate || null,

            endDate: endDate || null
        });

        console.log(
            "HERO BANNER CREATED:",
            banner.toJSON()
        );

        return res.status(201).json({
            success: true,
            message: "Hero banner created successfully.",
            banner
        });

    } catch (error) {
        console.error(
            "CREATE HERO BANNER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to create hero banner."
        });
    }
};


/* =====================================================
   UPDATE HERO BANNER
===================================================== */
exports.updateHeroBanner = async (req, res) => {
    try {
        console.log("UPDATE HERO BANNER FILE:", req.file);
        console.log("UPDATE HERO BANNER BODY:", req.body);

        const banner = await Advertisement.findByPk(
            req.params.id
        );

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found."
            });
        }

        const {
            title,
            subtitle,
            description,
            buttonText,
            link,
            priority,
            placement,
            startDate,
            endDate
        } = req.body;

        const updateData = {
            title:
                title !== undefined
                    ? title.trim()
                    : banner.title,

            subtitle:
                subtitle !== undefined
                    ? subtitle.trim()
                    : banner.subtitle,

            description:
                description !== undefined
                    ? description.trim()
                    : banner.description,

            buttonText:
                buttonText !== undefined
                    ? buttonText.trim()
                    : banner.buttonText,

            link:
                link !== undefined
                    ? link.trim()
                    : banner.link,

            priority:
                priority !== undefined
                    ? Number(priority)
                    : banner.priority,

            placement:
                placement !== undefined
                    ? placement
                    : banner.placement,

            startDate:
                startDate !== undefined
                    ? startDate || null
                    : banner.startDate,

            endDate:
                endDate !== undefined
                    ? endDate || null
                    : banner.endDate
        };

        // Only replace image when a new image was uploaded
        if (req.file) {
            updateData.image = req.file.filename;
        }

        await banner.update(updateData);

        console.log(
            "HERO BANNER UPDATED:",
            banner.toJSON()
        );

        return res.status(200).json({
            success: true,
            message: "Banner updated successfully.",
            banner
        });

    } catch (error) {
        console.error(
            "UPDATE HERO BANNER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update banner."
        });
    }
};

/* =====================================================
   DELETE HERO BANNER
===================================================== */

exports.deleteHeroBanner = async (req, res) => {

    try {

        const banner =
            await Advertisement.findByPk(
                req.params.id
            );


        if (!banner) {

            return res.status(404).json({

                success: false,

                message:
                    "Banner not found."

            });

        }


        await banner.destroy();


        return res.status(200).json({

            success: true,

            message:
                "Banner deleted successfully."

        });

    }

    catch (error) {

        console.error(
            "DELETE HERO BANNER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to delete banner."

        });

    }

};


/* =====================================================
   PAUSE / RESUME HERO BANNER
===================================================== */

exports.toggleHeroBanner = async (req, res) => {

    try {

        const banner =
            await Advertisement.findByPk(
                req.params.id
            );


        if (!banner) {

            return res.status(404).json({

                success: false,

                message:
                    "Banner not found."

            });

        }


        banner.status =
            banner.status === "Running"
                ? "Paused"
                : "Running";


        await banner.save();


        return res.status(200).json({

            success: true,

            message:
                `Banner ${banner.status.toLowerCase()} successfully.`,

            banner

        });

    }

    catch (error) {

        console.error(
            "TOGGLE HERO BANNER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to update banner status."

        });

    }

};


/* =====================================================
   REJECT HERO BANNER
===================================================== */

exports.rejectHeroBanner = async (req, res) => {

    try {

        const banner =
            await Advertisement.findByPk(
                req.params.id
            );


        if (!banner) {

            return res.status(404).json({

                success: false,

                message:
                    "Banner not found."

            });

        }


        banner.status = "Rejected";

        await banner.save();


        return res.status(200).json({

            success: true,

            message:
                "Banner rejected successfully.",

            banner

        });

    }

    catch (error) {

        console.error(
            "REJECT HERO BANNER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to reject banner."

        });

    }

};


/* =====================================================
   ADMIN: FEATURED PRODUCTS
===================================================== */

exports.getFeaturedProducts = async (req, res) => {

    try {

        const products =
            await getAdminPromotedProducts(
                "FEATURED"
            );


        return res.status(200).json({

            success: true,

            products

        });

    }

    catch (error) {

        console.error(
            "GET ADMIN FEATURED PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to load featured products."

        });

    }

};


/* =====================================================
   ADMIN: TRENDING PRODUCTS
===================================================== */

exports.getTrendingProducts = async (req, res) => {

    try {

        const products =
            await getAdminPromotedProducts(
                "EXPRESS"
            );


        return res.status(200).json({

            success: true,

            products

        });

    }

    catch (error) {

        console.error(
            "GET ADMIN TRENDING PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to load trending products."

        });

    }

};


/* =====================================================
   ADMIN: RECOMMENDED / BOOSTED PRODUCTS
===================================================== */

exports.getRecommendedProducts = async (req, res) => {

    try {

        const products =
            await getAdminPromotedProducts(
                "BOOST"
            );


        return res.status(200).json({

            success: true,

            products

        });

    }

    catch (error) {

        console.error(
            "GET ADMIN RECOMMENDED PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to load recommended products."

        });

    }

};


/* =====================================================
   PUBLIC: FEATURED PRODUCTS
===================================================== */

exports.getPublicFeaturedProducts = async (req, res) => {

    try {

        const products =
            await getPublicPromotedProducts(
                "FEATURED"
            );


        return res.status(200).json({

            success: true,

            products

        });

    }

    catch (error) {

        console.error(
            "GET PUBLIC FEATURED PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load featured products."

        });

    }

};


/* =====================================================
   PUBLIC: TRENDING PRODUCTS
===================================================== */

exports.getPublicTrendingProducts = async (req, res) => {

    try {

        const products =
            await getPublicPromotedProducts(
                "EXPRESS"
            );


        return res.status(200).json({

            success: true,

            products

        });

    }

    catch (error) {

        console.error(
            "GET PUBLIC TRENDING PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load trending products."

        });

    }

};


/* =====================================================
   PUBLIC: RECOMMENDED / BOOSTED PRODUCTS
===================================================== */

exports.getPublicRecommendedProducts = async (req, res) => {

    try {

        const products =
            await getPublicPromotedProducts(
                "BOOST"
            );


        return res.status(200).json({

            success: true,

            products

        });

    }

    catch (error) {

        console.error(
            "GET PUBLIC RECOMMENDED PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load recommended products."

        });

    }

};


/* =====================================================
   ADMIN: TOGGLE HOMEPAGE VISIBILITY
===================================================== */

exports.toggleHomepageVisibility = async (req, res) => {

    try {

        const promotion =
            await ProductPromotion.findByPk(
                req.params.id
            );


        if (!promotion) {

            return res.status(404).json({

                success: false,

                message:
                    "Promotion not found."

            });

        }


        promotion.showOnHomepage =
            !promotion.showOnHomepage;


        await promotion.save();


        return res.status(200).json({

            success: true,

            message:

                promotion.showOnHomepage
                    ? "Product is now visible on homepage."
                    : "Product is now hidden from homepage.",

            promotion

        });

    }

    catch (error) {

        console.error(
            "TOGGLE HOMEPAGE VISIBILITY ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to update homepage visibility."

        });

    }

};


/* =====================================================
   ADMIN: UPDATE HOMEPAGE ORDER
===================================================== */

exports.updateHomepageOrder = async (req, res) => {

    try {

        const {
            homepageOrder
        } = req.body;


        const order =
            Number(homepageOrder);


        if (

            Number.isNaN(order) ||

            !Number.isInteger(order) ||

            order < 0

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Homepage order must be a valid positive number."

            });

        }


        const promotion =
            await ProductPromotion.findByPk(
                req.params.id
            );


        if (!promotion) {

            return res.status(404).json({

                success: false,

                message:
                    "Promotion not found."

            });

        }


        promotion.homepageOrder = order;

        await promotion.save();


        return res.status(200).json({

            success: true,

            message:
                "Homepage order updated successfully.",

            promotion

        });

    }

    catch (error) {

        console.error(
            "UPDATE HOMEPAGE ORDER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to update homepage order."

        });

    }

};
const getPublicHeroBanners = async (req, res) => {

    try {

        const banners =
            await HeroBanner.findAll({

                where: {
                    status: "active"
                },

                order: [
                    ["displayOrder", "ASC"]
                ]

            });


        return res.status(200).json({

            success: true,

            banners

        });

    }

    catch (error) {

        console.error(
            "GET PUBLIC BANNERS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load banners."

        });

    }

};
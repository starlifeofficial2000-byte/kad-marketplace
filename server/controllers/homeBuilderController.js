const Advertisement = require("../models/Advertisement");
const ProductPromotion = require("../models/ProductPromotion");
const Product = require("../models/Product");
const User = require("../models/User");

const { Op } = require("sequelize");

const {
    getR2PublicUrl,
    deleteFromR2
} = require("../config/r2");


/* =========================================================
   MEDIA HELPERS
========================================================= */

const normalizeMediaKey = (value) => {
    if (!value) {
        return "";
    }

    return String(value)
        .trim()
        .replace(/^\/+/, "")
        .replace(/\\/g, "/");
};


const getMediaKey = (value) => {
    if (!value) {
        return null;
    }

    /*
     * If the database already contains a full URL,
     * there is no R2 key to extract here.
     */
    if (
        typeof value === "string" &&
        /^https?:\/\//i.test(value.trim())
    ) {
        return null;
    }

    let key = normalizeMediaKey(value);

    if (!key) {
        return null;
    }

    /*
     * R2 uploads created by the new middleware already
     * use the uploads/ prefix.
     */
    if (key.startsWith("uploads/")) {
        return key;
    }

    /*
     * Legacy database records may contain only:
     *
     * filename.jpg
     *
     * Treat those as objects under uploads/.
     */
    return `uploads/${key}`;
};


const resolveMediaUrl = (value) => {
    if (!value) {
        return null;
    }

    const clean = String(value).trim();

    if (!clean) {
        return null;
    }

    /*
     * Already a public URL.
     */
    if (
        clean.startsWith("http://") ||
        clean.startsWith("https://")
    ) {
        return clean;
    }

    /*
     * Convert stored R2 key / legacy filename
     * into the public R2 URL.
     */
    const key = getMediaKey(clean);

    if (!key) {
        return null;
    }

    return getR2PublicUrl(key);
};


/* =========================================================
   DELETE BANNER IMAGE FROM R2
========================================================= */

const deleteBannerImage = async (image) => {
    const key = getMediaKey(image);

    if (!key) {
        return;
    }

    try {
        await deleteFromR2(key);
    } catch (error) {
        console.error(
            `[R2] Failed to delete banner image ${key}:`,
            error.message
        );
    }
};


/* =========================================================
   FORMAT HERO BANNER
========================================================= */

const formatHeroBanner = (banner) => {
    if (!banner) {
        return null;
    }

    const plainBanner =
        typeof banner.get === "function"
            ? banner.get({ plain: true })
            : { ...banner };

    plainBanner.imageUrl =
        resolveMediaUrl(
            plainBanner.image
        );

    /*
     * Keep image for backward compatibility,
     * but make it the actual public R2 URL.
     */
    plainBanner.image =
        plainBanner.imageUrl;

    return plainBanner;
};


const formatHeroBanners = (banners) => {
    return banners
        .map(formatHeroBanner)
        .filter(Boolean);
};


/* =========================================================
   PARSE PRODUCT IMAGES
========================================================= */

const parseProductImages = (promotions) => {
    return promotions.map((promotion) => {
        const plainPromotion =
            promotion &&
            typeof promotion.get === "function"
                ? promotion.get({
                      plain: true
                  })
                : promotion;

        if (plainPromotion.product?.images) {
            if (
                typeof plainPromotion.product.images ===
                "string"
            ) {
                try {
                    plainPromotion.product.images =
                        JSON.parse(
                            plainPromotion.product.images
                        );
                } catch (error) {
                    plainPromotion.product.images =
                        [];
                }
            }

            if (
                !Array.isArray(
                    plainPromotion.product.images
                )
            ) {
                plainPromotion.product.images = [];
            }
        } else if (plainPromotion.product) {
            plainPromotion.product.images = [];
        }

        return plainPromotion;
    });
};


/* =========================================================
   ADMIN PROMOTED PRODUCTS
========================================================= */

const getAdminPromotedProducts = async (
    promotionType
) => {
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

    return parseProductImages(
        promotions
    );
};


/* =========================================================
   PUBLIC PROMOTED PRODUCTS
========================================================= */

const getPublicPromotedProducts = async (
    promotionType
) => {
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

    return parseProductImages(
        promotions
    );
};


/* =========================================================
   ADMIN: GET HERO BANNERS
========================================================= */

exports.getAdminHeroBanners =
    async (req, res) => {
        try {
            const banners =
                await Advertisement.findAll({
                    order: [
                        [
                            "priority",
                            "ASC"
                        ],
                        [
                            "createdAt",
                            "DESC"
                        ]
                    ]
                });

            return res.status(200).json({
                success: true,

                banners:
                    formatHeroBanners(
                        banners
                    )
            });

        } catch (error) {
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


/* =========================================================
   PUBLIC: GET ACTIVE HERO BANNERS
========================================================= */

exports.getHeroBanners =
    async (req, res) => {
        try {
            const now = new Date();

            const banners =
                await Advertisement.findAll({
                    where: {
                        status: "Running",

                        [Op.and]: [
                            {
                                [Op.or]: [
                                    {
                                        startDate: {
                                            [Op.lte]:
                                                now
                                        }
                                    },
                                    {
                                        startDate:
                                            null
                                    }
                                ]
                            },

                            {
                                [Op.or]: [
                                    {
                                        endDate: {
                                            [Op.gte]:
                                                now
                                        }
                                    },
                                    {
                                        endDate:
                                            null
                                    }
                                ]
                            }
                        ]
                    },

                    order: [
                        [
                            "priority",
                            "ASC"
                        ],
                        [
                            "createdAt",
                            "DESC"
                        ]
                    ]
                });

            return res.status(200).json({
                success: true,

                banners:
                    formatHeroBanners(
                        banners
                    )
            });

        } catch (error) {
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


/* =========================================================
   CREATE HERO BANNER
========================================================= */

exports.createHeroBanner =
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Hero banner image is required."
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

            /*
             * IMPORTANT:
             * Use the R2 object key created by
             * upload.js, not a Railway filename.
             */
            const imageKey =
                req.file.r2Key ||
                req.file.key;

            if (!imageKey) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Uploaded banner does not have an R2 object key."
                });
            }

            const banner =
                await Advertisement.create({
                    userId: req.user.id,

                    title:
                        typeof title ===
                        "string"
                            ? title.trim()
                            : "",

                    subtitle:
                        typeof subtitle ===
                        "string"
                            ? subtitle.trim()
                            : "",

                    description:
                        typeof description ===
                        "string"
                            ? description.trim()
                            : "",

                    buttonText:
                        typeof buttonText ===
                            "string" &&
                        buttonText.trim()
                            ? buttonText.trim()
                            : "Shop Now",

                    link:
                        typeof link ===
                            "string" &&
                        link.trim()
                            ? link.trim()
                            : "#",

                    placement:
                        placement ||
                        "Homepage",

                    position: "Hero",

                    priority:
                        Number.isFinite(
                            Number(priority)
                        )
                            ? Number(priority)
                            : 1,

                    status: "Running",

                    /*
                     * Database stores the R2 object key.
                     */
                    image: imageKey,

                    startDate:
                        startDate || null,

                    endDate:
                        endDate || null
                });

            return res.status(201).json({
                success: true,

                message:
                    "Hero banner created successfully.",

                banner:
                    formatHeroBanner(
                        banner
                    )
            });

        } catch (error) {
            console.error(
                "CREATE HERO BANNER ERROR:",
                error
            );

            /*
             * If the database creation failed after
             * the R2 upload succeeded, clean up the
             * orphaned R2 object.
             */
            if (
                req.file?.r2Key ||
                req.file?.key
            ) {
                try {
                    await deleteFromR2(
                        req.file.r2Key ||
                            req.file.key
                    );
                } catch (cleanupError) {
                    console.error(
                        "[R2] Failed to clean up banner upload:",
                        cleanupError.message
                    );
                }
            }

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Failed to create hero banner."
            });
        }
    };


/* =========================================================
   UPDATE HERO BANNER
========================================================= */

exports.updateHeroBanner =
    async (req, res) => {
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
                        ? String(
                              title
                          ).trim()
                        : banner.title,

                subtitle:
                    subtitle !== undefined
                        ? String(
                              subtitle
                          ).trim()
                        : banner.subtitle,

                description:
                    description !== undefined
                        ? String(
                              description
                          ).trim()
                        : banner.description,

                buttonText:
                    buttonText !== undefined
                        ? String(
                              buttonText
                          ).trim()
                        : banner.buttonText,

                link:
                    link !== undefined
                        ? String(
                              link
                          ).trim()
                        : banner.link,

                priority:
                    priority !== undefined
                        ? Number(
                              priority
                          )
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

            /*
             * Keep the old image unless a new image
             * was actually uploaded.
             */
            let oldImage = null;

            if (req.file) {
                const newImageKey =
                    req.file.r2Key ||
                    req.file.key;

                if (!newImageKey) {
                    return res.status(500).json({
                        success: false,
                        message:
                            "Uploaded banner does not have an R2 object key."
                    });
                }

                oldImage =
                    banner.image;

                updateData.image =
                    newImageKey;
            }

            await banner.update(
                updateData
            );

            /*
             * Delete old R2 object only after the
             * database update succeeded.
             */
            if (
                req.file &&
                oldImage
            ) {
                await deleteBannerImage(
                    oldImage
                );
            }

            return res.status(200).json({
                success: true,

                message:
                    "Banner updated successfully.",

                banner:
                    formatHeroBanner(
                        banner
                    )
            });

        } catch (error) {
            console.error(
                "UPDATE HERO BANNER ERROR:",
                error
            );

            /*
             * If a new R2 image was uploaded but the
             * database update failed, remove the new
             * orphaned object.
             */
            if (
                req.file?.r2Key ||
                req.file?.key
            ) {
                try {
                    await deleteFromR2(
                        req.file.r2Key ||
                            req.file.key
                    );
                } catch (cleanupError) {
                    console.error(
                        "[R2] Failed to clean up replacement banner:",
                        cleanupError.message
                    );
                }
            }

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Failed to update hero banner."
            });
        }
    };


/* =========================================================
   DELETE HERO BANNER
========================================================= */

exports.deleteHeroBanner =
    async (req, res) => {
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

            const image =
                banner.image;

            await banner.destroy();

            /*
             * Delete associated R2 object after
             * successful database deletion.
             */
            if (image) {
                await deleteBannerImage(
                    image
                );
            }

            return res.status(200).json({
                success: true,
                message:
                    "Banner deleted successfully."
            });

        } catch (error) {
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


/* =========================================================
   PAUSE / RESUME HERO BANNER
========================================================= */

exports.toggleHeroBanner =
    async (req, res) => {
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

                banner:
                    formatHeroBanner(
                        banner
                    )
            });

        } catch (error) {
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


/* =========================================================
   REJECT HERO BANNER
========================================================= */

exports.rejectHeroBanner =
    async (req, res) => {
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
                "Rejected";

            await banner.save();

            return res.status(200).json({
                success: true,

                message:
                    "Banner rejected successfully.",

                banner:
                    formatHeroBanner(
                        banner
                    )
            });

        } catch (error) {
            console.error(
                "REJECT HERO BANNER ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to reject hero banner."
            });
        }
    };


/* =========================================================
   ADMIN: FEATURED PRODUCTS
========================================================= */

exports.getFeaturedProducts =
    async (req, res) => {
        try {
            const products =
                await getAdminPromotedProducts(
                    "FEATURED"
                );

            return res.status(200).json({
                success: true,
                products
            });

        } catch (error) {
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


/* =========================================================
   ADMIN: TRENDING PRODUCTS
========================================================= */

exports.getTrendingProducts =
    async (req, res) => {
        try {
            const products =
                await getAdminPromotedProducts(
                    "EXPRESS"
                );

            return res.status(200).json({
                success: true,
                products
            });

        } catch (error) {
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


/* =========================================================
   ADMIN: RECOMMENDED PRODUCTS
========================================================= */

exports.getRecommendedProducts =
    async (req, res) => {
        try {
            const products =
                await getAdminPromotedProducts(
                    "BOOST"
                );

            return res.status(200).json({
                success: true,
                products
            });

        } catch (error) {
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


/* =========================================================
   PUBLIC: FEATURED PRODUCTS
========================================================= */

exports.getPublicFeaturedProducts =
    async (req, res) => {
        try {
            const products =
                await getPublicPromotedProducts(
                    "FEATURED"
                );

            return res.status(200).json({
                success: true,
                products
            });

        } catch (error) {
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


/* =========================================================
   PUBLIC: TRENDING PRODUCTS
========================================================= */

exports.getPublicTrendingProducts =
    async (req, res) => {
        try {
            const products =
                await getPublicPromotedProducts(
                    "EXPRESS"
                );

            return res.status(200).json({
                success: true,
                products
            });

        } catch (error) {
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


/* =========================================================
   PUBLIC: RECOMMENDED PRODUCTS
========================================================= */

exports.getPublicRecommendedProducts =
    async (req, res) => {
        try {
            const products =
                await getPublicPromotedProducts(
                    "BOOST"
                );

            return res.status(200).json({
                success: true,
                products
            });

        } catch (error) {
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


/* =========================================================
   TOGGLE HOMEPAGE VISIBILITY
========================================================= */

exports.toggleHomepageVisibility =
    async (req, res) => {
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

            if (
                promotion.paymentStatus !==
                    "PAID" ||
                promotion.status !==
                    "APPROVED"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Only paid and approved promotions can be shown on the homepage."
                });
            }

            promotion.showOnHomepage =
                !Boolean(
                    promotion.showOnHomepage
                );

            await promotion.save();

            return res.status(200).json({
                success: true,

                message:
                    promotion.showOnHomepage
                        ? "Product is now visible on homepage."
                        : "Product is now hidden from homepage.",

                promotion
            });

        } catch (error) {
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


/* =========================================================
   UPDATE HOMEPAGE ORDER
========================================================= */

exports.updateHomepageOrder =
    async (req, res) => {
        try {
            const {
                homepageOrder
            } = req.body;

            const order =
                Number(
                    homepageOrder
                );

            if (
                Number.isNaN(order) ||
                !Number.isInteger(order) ||
                order < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Homepage order must be a valid non-negative number."
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

            promotion.homepageOrder =
                order;

            await promotion.save();

            return res.status(200).json({
                success: true,

                message:
                    "Homepage order updated successfully.",

                promotion
            });

        } catch (error) {
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
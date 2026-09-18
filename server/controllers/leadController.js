const { Op } = require("sequelize");

const Lead = require("../models/Lead");
const Product = require("../models/Product");
const User = require("../models/User");
const Wishlist = require("../models/Wishlist");


/* ==========================================
   CREATE LEAD
========================================== */

exports.createLead = async (req, res) => {

    try {

        const {
            productId,
            type,
            message,
            offerPrice
        } = req.body;


        /* ==========================================
           VALIDATION
        ========================================== */

        if (!productId || !type) {

            return res.status(400).json({

                success: false,

                message: "Product ID and lead type are required."

            });

        }


        /* ==========================================
           FIND PRODUCT
        ========================================== */

        const product = await Product.findByPk(productId);


        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }


        /* ==========================================
           PREVENT SELLER FROM LEADING OWN PRODUCT
        ========================================== */

        if (Number(product.userId) === Number(req.user.id)) {

            return res.status(400).json({

                success: false,

                message: "You cannot create a lead for your own product."

            });

        }


        /* ==========================================
           FIND BUYER
        ========================================== */

        const buyer = await User.findByPk(req.user.id);


        if (!buyer) {

            return res.status(404).json({

                success: false,

                message: "Buyer account not found."

            });

        }


        /* ==========================================
           PREVENT DUPLICATE LEADS
        ========================================== */

        const existingLead = await Lead.findOne({

            where: {

                buyerId: req.user.id,

                productId,

                type

            }

        });


        if (existingLead) {

            return res.status(400).json({

                success: false,

                message: "You already submitted this lead."

            });

        }


        /* ==========================================
           CREATE LEAD
        ========================================== */

        const lead = await Lead.create({

            buyerId: req.user.id,

            sellerId: product.userId,

            productId,

            type,

            message: message || null,

            offerPrice: offerPrice || 0,

            buyerRegion: buyer.region || null,

            buyerCity: buyer.city || null,

            status: "New"

        });


        /* ==========================================
           SUCCESS RESPONSE
        ========================================== */

        return res.status(201).json({

            success: true,

            message: "Lead created successfully.",

            lead

        });

    }

    catch (error) {

        console.error(
            "CREATE LEAD ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to create lead.",

            error: error.message

        });

    }

};


/* ==========================================
   GET SELLER LEADS
========================================== */

exports.getSellerLeads = async (req, res) => {

    try {

        const {

            status,

            type

        } = req.query;


        /* ==========================================
           BUILD FILTER
        ========================================== */

        const where = {

            sellerId: req.user.id

        };


        if (status && status.trim() !== "") {

            where.status = status;

        }


        if (type && type.trim() !== "") {

            where.type = type;

        }


        /* ==========================================
           FETCH LEADS
        ========================================== */

        const leads = await Lead.findAll({

            where,

            include: [

                {

                    model: User,

                    as: "buyer",

                    attributes: [

                        "id",

                        "name",

                        "email",

                        "phone",

                        "profileImage"

                    ]

                },

                {

                    model: Product,

                    as: "product",

                    attributes: [

                        "id",

                        "title",

                        "price",

                        "images",

                        "slug"

                    ]

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });


        return res.status(200).json({

            success: true,

            count: leads.length,

            leads

        });

    }

    catch (error) {

        console.error(
            "GET SELLER LEADS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to load seller leads.",

            error: error.message

        });

    }

};


/* ==========================================
   UPDATE LEAD STATUS
========================================== */

exports.updateLeadStatus = async (req, res) => {

    try {

        const {

            status,

            sellerNotes

        } = req.body;


        /* ==========================================
           VALIDATE STATUS
        ========================================== */

        const allowedStatuses = [

            "New",

            "Contacted",

            "Negotiating",

            "Converted",

            "Closed"

        ];


        if (!status) {

            return res.status(400).json({

                success: false,

                message: "Status is required."

            });

        }


        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({

                success: false,

                message: "Invalid lead status."

            });

        }


        /* ==========================================
           FIND LEAD
        ========================================== */

        const lead = await Lead.findByPk(

            req.params.id

        );


        if (!lead) {

            return res.status(404).json({

                success: false,

                message: "Lead not found."

            });

        }


        /* ==========================================
           VERIFY SELLER
        ========================================== */

        if (

            Number(lead.sellerId) !==

            Number(req.user.id)

        ) {

            return res.status(403).json({

                success: false,

                message: "You are not authorized to update this lead."

            });

        }


        /* ==========================================
           UPDATE STATUS
        ========================================== */

        lead.status = status;


        if (sellerNotes !== undefined) {

            lead.sellerNotes = sellerNotes;

        }


        /* ==========================================
           STATUS TIMESTAMPS
        ========================================== */

        if (

            status === "Contacted" &&

            !lead.contactedAt

        ) {

            lead.contactedAt = new Date();

        }


        if (

            status === "Converted" &&

            !lead.convertedAt

        ) {

            lead.convertedAt = new Date();

        }


        if (

            status === "Closed" &&

            !lead.closedAt

        ) {

            lead.closedAt = new Date();

        }


        await lead.save();


        return res.status(200).json({

            success: true,

            message: "Lead updated successfully.",

            lead

        });

    }

    catch (error) {

        console.error(
            "UPDATE LEAD ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to update lead.",

            error: error.message

        });

    }

};


/* ==========================================
   DELETE LEAD
========================================== */

exports.deleteLead = async (req, res) => {

    try {

        const lead = await Lead.findByPk(

            req.params.id

        );


        if (!lead) {

            return res.status(404).json({

                success: false,

                message: "Lead not found."

            });

        }


        /* ==========================================
           VERIFY SELLER
        ========================================== */

        if (

            Number(lead.sellerId) !==

            Number(req.user.id)

        ) {

            return res.status(403).json({

                success: false,

                message: "You are not authorized to delete this lead."

            });

        }


        await lead.destroy();


        return res.status(200).json({

            success: true,

            message: "Lead deleted successfully."

        });

    }

    catch (error) {

        console.error(
            "DELETE LEAD ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to delete lead.",

            error: error.message

        });

    }

};


/* ==========================================
   GET LEAD ANALYTICS
========================================== */

exports.getLeadAnalytics = async (req, res) => {

    try {

        const sellerId = req.user.id;


        /* ==========================================
           GET SELLER PRODUCTS
        ========================================== */

        const products = await Product.findAll({

            where: {

                userId: sellerId,

                deleted: false

            }

        });


        const productIds = products.map(

            product => product.id

        );


        /* ==========================================
           PRODUCT ANALYTICS
        ========================================== */

        let totalViews = 0;

        let totalShares = 0;

        let totalChats = 0;


        products.forEach((product) => {

            totalViews += Number(

                product.views || 0

            );


            totalShares += Number(

                product.shares || 0

            );


            totalChats += Number(

                product.chatCount || 0

            );

        });


        /* ==========================================
           WISHLIST COUNT
        ========================================== */

        let wishlist = 0;


        if (productIds.length > 0) {

            wishlist = await Wishlist.count({

                where: {

                    productId: {

                        [Op.in]: productIds

                    }

                }

            });

        }


        /* ==========================================
           LEAD COUNTS
        ========================================== */

        const totalLeads = await Lead.count({

            where: {

                sellerId

            }

        });


        const newLeads = await Lead.count({

            where: {

                sellerId,

                status: "New"

            }

        });


        const contacted = await Lead.count({

            where: {

                sellerId,

                status: "Contacted"

            }

        });


        const negotiating = await Lead.count({

            where: {

                sellerId,

                status: "Negotiating"

            }

        });


        const converted = await Lead.count({

            where: {

                sellerId,

                status: "Converted"

            }

        });


        const closed = await Lead.count({

            where: {

                sellerId,

                status: "Closed"

            }

        });


        /* ==========================================
           LEAD TYPES
        ========================================== */

        const offers = await Lead.count({

            where: {

                sellerId,

                type: "Offer"

            }

        });


        const interested = await Lead.count({

            where: {

                sellerId,

                type: "Interested"

            }

        });


        const chats = await Lead.count({

            where: {

                sellerId,

                type: "Chat"

            }

        });


        const phoneRequests = await Lead.count({

            where: {

                sellerId,

                type: "Phone Request"

            }

        });


        const locationRequests = await Lead.count({

            where: {

                sellerId,

                type: "Location Request"

            }

        });


        const wishlistLeads = await Lead.count({

            where: {

                sellerId,

                type: "Wishlist"

            }

        });


        const shares = await Lead.count({

            where: {

                sellerId,

                type: "Share"

            }

        });


        /* ==========================================
           RESPONSE
        ========================================== */

        return res.status(200).json({

            success: true,

            analytics: {

                totalProducts: products.length,

                totalViews,

                totalShares,

                totalChats,

                wishlist,

                totalLeads,

                newLeads,

                contacted,

                negotiating,

                converted,

                closed,

                offers,

                interested,

                chats,

                phoneRequests,

                locationRequests,

                wishlistLeads,

                shares

            }

        });

    }

    catch (error) {

        console.error(
            "LEAD ANALYTICS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to load lead analytics.",

            error: error.message

        });

    }

};
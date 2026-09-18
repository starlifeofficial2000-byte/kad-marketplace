const {
    Store,
    User,
    Product,
    StoreFollow,
    Review
} = require("../models");

const path = require("path");


/* =====================================================
   HELPER: CREATE STORE SLUG
===================================================== */

const createSlug = (name) => {

    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

};


/* =====================================================
   GET MY STORE
===================================================== */

exports.getMyStore = async (req, res) => {

    try {

        console.log("GET MY STORE");
        console.log("USER ID:", req.user.id);


        let store = await Store.findOne({

            where: {
                userId: req.user.id
            }

        });


        /*
           CREATE STORE AUTOMATICALLY
           IF USER DOES NOT HAVE ONE
        */

        if (!store) {

            const storeName =
                `${req.user.name}'s Store`;


            let storeSlug =
                createSlug(storeName);


            storeSlug =
                `${storeSlug}-${req.user.id}`;


            store = await Store.create({

                userId: req.user.id,

                storeName,

                storeSlug,

                email: req.user.email,

                phone: req.user.phone || null,

                status: "Active"

            });

        }


        return res.status(200).json({

            success: true,

            store

        });

    }

    catch (error) {

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

        console.log("UPDATE STORE");

        console.log(
            "USER:",
            req.user.id
        );

        console.log(
            "BODY:",
            req.body
        );


        let store = await Store.findOne({

            where: {
                userId: req.user.id
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


        allowedFields.forEach((field) => {

            if (
                req.body[field] !== undefined
            ) {

                store[field] =
                    req.body[field];

            }

        });


        /*
           UPDATE SLUG IF NAME CHANGES
        */

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

            store

        });

    }

    catch (error) {

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

exports.uploadLogo = async (req, res) => {

    try {

        console.log("UPLOAD LOGO");
        console.log("FILE:", req.file);

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "No logo file uploaded."

            });

        }

        const store = await Store.findOne({

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


        const logoPath =

            `/uploads/stores/${req.file.filename}`;


        store.logo = logoPath;

        await store.save();


        console.log(
            "LOGO SAVED:",
            store.logo
        );


        return res.status(200).json({

            success: true,

            message:
                "Logo uploaded successfully.",

            logo:
                store.logo,

            store

        });

    }

    catch (error) {

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

        console.log("UPLOAD BANNER");
        console.log("FILE:", req.file);

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "No banner file uploaded."

            });

        }

        const store = await Store.findOne({

            where: {

                userId: req.user.id

            }

        });


        if (!store) {

            return res.status(404).json({

                success: false,

                message:
                    "Store not found."

            });

        }


        const bannerPath =

            `/uploads/stores/${req.file.filename}`;


        store.banner = bannerPath;

        await store.save();


        console.log(
            "BANNER SAVED:",
            store.banner
        );


        return res.status(200).json({

            success: true,

            message:
                "Banner uploaded successfully.",

            banner:
                store.banner,

            store

        });

    }

    catch (error) {

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

exports.getFeaturedStores = async (req, res) => {

    try {

        const stores = await Store.findAll({

            where: {

                featured: true,

                status: "Active"

            },

            order: [

                ["listingPriority", "DESC"],

                ["createdAt", "DESC"]

            ],

            limit: 10

        });


        return res.status(200).json({

            success: true,

            stores

        });

    }

    catch (error) {

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
exports.getPublicStore = async (req, res) => {

    try {

        const { storeSlug } = req.params;

        console.log(
            "PUBLIC STORE REQUEST:",
            storeSlug
        );


        if (!storeSlug) {

            return res.status(400).json({

                success: false,

                message: "Store slug is required."

            });

        }


        const store = await Store.findOne({

            where: {

                storeSlug: storeSlug

            }

        });


        if (!store) {

            console.log(
                "STORE NOT FOUND:",
                storeSlug
            );

            return res.status(404).json({

                success: false,

                message: "Store not found."

            });

        }


        const products = await Product.findAll({

            where: {

                userId: store.userId,

                status: "Approved",

                deleted: false

            },

            order: [

                ["displayDate", "DESC"]

            ]

        });


        return res.status(200).json({

            success: true,

            store,

            products

        });

    }

    catch (error) {

        console.error(
            "GET PUBLIC STORE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to load store.",

            error: error.message

        });

    }

};

/* =====================================================
   FOLLOW STORE
===================================================== */

exports.followStore = async (req, res) => {

    try {

        const store = await Store.findByPk(

            req.params.id

        );


        if (!store) {

            return res.status(404).json({

                success: false,

                message: "Store not found."

            });

        }


        /* Cannot follow own store */

        if (store.userId === req.user.id) {

            return res.status(400).json({

                success: false,

                message: "You cannot follow your own store."

            });

        }


        const existingFollow = await StoreFollow.findOne({

            where: {

                userId: req.user.id,

                storeId: store.id

            }

        });


        if (existingFollow) {

            return res.status(400).json({

                success: false,

                message: "You already follow this store."

            });

        }


        await StoreFollow.create({

            userId: req.user.id,

            storeId: store.id

        });


        store.followers = await StoreFollow.count({

            where: {

                storeId: store.id

            }

        });


        await store.save();


        return res.status(200).json({

            success: true,

            message: "Store followed successfully.",

            followers: store.followers

        });

    }

    catch (error) {

        console.error(
            "FOLLOW STORE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to follow store.",

            error: error.message

        });

    }

};

/* =====================================================
   UNFOLLOW STORE
===================================================== */

exports.unfollowStore = async (req, res) => {

    try {

        const store = await Store.findByPk(

            req.params.id

        );


        if (!store) {

            return res.status(404).json({

                success: false,

                message: "Store not found."

            });

        }


        const follow = await StoreFollow.findOne({

            where: {

                userId: req.user.id,

                storeId: store.id

            }

        });


        if (!follow) {

            return res.status(400).json({

                success: false,

                message: "You are not following this store."

            });

        }


        await follow.destroy();


        store.followers = await StoreFollow.count({

            where: {

                storeId: store.id

            }

        });


        await store.save();


        return res.status(200).json({

            success: true,

            message: "Store unfollowed successfully.",

            followers: store.followers

        });

    }

    catch (error) {

        console.error(
            "UNFOLLOW STORE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to unfollow store.",

            error: error.message

        });

    }

};


/* =====================================================
   GET STORE REVIEWS
===================================================== */

exports.getStoreReviews = async (req, res) => {

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

                    ["createdAt", "DESC"]

                ]

            });


        return res.status(200).json({

            success: true,

            reviews

        });

    }

    catch (error) {

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

exports.getStoreProducts = async (req, res) => {

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

                    ["createdAt", "DESC"]

                ]

            });


        return res.status(200).json({

            success: true,

            products

        });

    }

    catch (error) {

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
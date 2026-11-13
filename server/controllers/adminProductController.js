const Product = require("../models/Product");
const User = require("../models/User");
const { getR2PublicUrl } = require("../config/r2");


/* ==========================================
   HELPER: FORMAT PRODUCT
========================================== */

const formatProduct = (product) => {

    const data = product.toJSON();

    let images = [];

    try {

        images =
            typeof data.images === "string"
                ? JSON.parse(data.images || "[]")
                : data.images || [];

    }

    catch {

        images = [];

    }


    const imageUrls = images.map((image) => {
        if (!image) return null;
        const value = typeof image === "string"
            ? image
            : image.url || image.imageUrl || image.path || image.src;
        if (!value) return null;
        const clean = String(value).trim();
        if (/^https?:\/\//i.test(clean)) return clean;
        const key = clean.replace(/^\/+/, "");
        if (key.startsWith("uploads/")) {
            return getR2PublicUrl(key) || `/${key}`;
        }
        return getR2PublicUrl(`uploads/products/${key}`) || `/uploads/products/${key}`;
    }).filter(Boolean);

    return {
        ...data,
        images,
        imageUrls,
        primaryImageUrl: imageUrls[0] || null
    };

};


/* ==========================================
   GET ALL PRODUCTS
========================================== */

exports.getProducts = async (req, res) => {

    try {

        const products = await Product.findAll({

            where: {

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
                        "phone"

                    ]

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });


        const formattedProducts =
            products.map(formatProduct);


        return res.status(200).json({

            success: true,

            products: formattedProducts

        });

    }

    catch (error) {

        console.error(
            "GET ADMIN PRODUCTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to load products."

        });

    }

};


/* ==========================================
   GET PENDING PRODUCTS
   Products waiting for admin approval
========================================== */

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
                        "name",
                        "email",
                        "phone"

                    ]

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });


        const formattedProducts =
            products.map(formatProduct);


        return res.status(200).json({

            success: true,

            products: formattedProducts

        });

    }

    catch (error) {

        console.error(
            "GET PENDING PRODUCTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to load pending products."

        });

    }

};


/* ==========================================
   GET SINGLE PRODUCT
========================================== */

exports.getProduct = async (req, res) => {

    try {

        const product =
            await Product.findOne({

                where: {

                    id: req.params.id,

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
                            "phone"

                        ]

                    }

                ]

            });


        if (!product) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found."

            });

        }


        return res.status(200).json({

            success: true,

            product: formatProduct(product)

        });

    }

    catch (error) {

        console.error(
            "GET PRODUCT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to load product."

        });

    }

};


/* ==========================================
   APPROVE PRODUCT
========================================== */

exports.approveProduct = async (req, res) => {

    try {

        const product =
            await Product.findOne({

                where: {

                    id: req.params.id,

                    deleted: false

                }

            });


        if (!product) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found."

            });

        }


        /* Already approved */

        if (product.status === "Approved") {

            return res.status(400).json({

                success: false,

                message:
                    "Product is already approved."

            });

        }


        product.status = "Approved";

        product.approvedAt =
            new Date();

        product.approvedBy =
            req.user.id;

        product.rejectionReason =
            null;


        await product.save();


        return res.status(200).json({

            success: true,

            message:
                "Product approved successfully.",

            product:
                formatProduct(product)

        });

    }

    catch (error) {

        console.error(
            "APPROVE PRODUCT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to approve product."

        });

    }

};


/* ==========================================
   REJECT PRODUCT
========================================== */

exports.rejectProduct = async (req, res) => {

    try {

        const product =
            await Product.findOne({

                where: {

                    id: req.params.id,

                    deleted: false

                }

            });


        if (!product) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found."

            });

        }


        const {

            rejectionReason

        } = req.body;


        product.status = "Rejected";

        product.rejectionReason =
            rejectionReason ||
            "Product rejected by administrator.";

        product.approvedAt =
            null;

        product.approvedBy =
            null;


        await product.save();


        return res.status(200).json({

            success: true,

            message:
                "Product rejected successfully.",

            product:
                formatProduct(product)

        });

    }

    catch (error) {

        console.error(
            "REJECT PRODUCT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to reject product."

        });

    }

};


/* ==========================================
   DELETE PRODUCT
========================================== */

exports.deleteProduct = async (req, res) => {

    try {

        const product =
            await Product.findOne({

                where: {

                    id: req.params.id,

                    deleted: false

                }

            });


        if (!product) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found."

            });

        }


        /*
           Soft Delete

           The product remains in the database
           but will no longer appear anywhere.
        */

        product.deleted = true;

        await product.save();


        return res.status(200).json({

            success: true,

            message:
                "Product deleted successfully."

        });

    }

    catch (error) {

        console.error(
            "DELETE PRODUCT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to delete product."

        });

    }

};
exports.setProductPromotionFlag=async(req,res)=>{try{const flag=req.params.flag;if(!["featured","express"].includes(flag))return res.status(400).json({success:false,message:"Unsupported promotion flag."});const product=await Product.findByPk(req.params.id);if(!product||product.deleted)return res.status(404).json({success:false,message:"Product not found."});product[flag]=req.body.enabled===undefined?!Boolean(product[flag]):Boolean(req.body.enabled);await product.save();return res.json({success:true,product,message:`${flag} status updated.`});}catch(error){console.error("ADMIN PRODUCT PROMOTION UPDATE ERROR:",error);return res.status(500).json({success:false,message:"Unable to update product promotion."});}};

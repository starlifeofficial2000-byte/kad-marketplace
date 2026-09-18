const Product = require("../models/Product");
const Category = require("../models/Category");
const Advertisement = require("../models/Advertisement");
const Store = require("../models/Store");
const Subscription = require("../models/Subscription");
const User = require("../models/User");




const HomepageSection = require("../models/HomepageSection");

exports.getSections = async(req,res)=>{

    try{

        const sections=await HomepageSection.findAll({

            order:[["displayOrder","ASC"]]

        });

        res.json(sections);

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

exports.createSection=async(req,res)=>{

    try{

        const section=await HomepageSection.create(req.body);

        res.json(section);

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

exports.updateSection=async(req,res)=>{

    try{

        const section=await HomepageSection.findByPk(req.params.id);

        if(!section){

            return res.status(404).json({

                message:"Section not found"

            });

        }

        await section.update(req.body);

        res.json(section);

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

exports.deleteSection=async(req,res)=>{

    try{

        const section=await HomepageSection.findByPk(req.params.id);

        if(!section){

            return res.status(404).json({

                message:"Section not found"

            });

        }

        await section.destroy();

        res.json({

            success:true

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};
/* ==========================================
   HOMEPAGE DATA
========================================== */

exports.getHomepageData = async (req, res) => {

    try {

        const sections = await HomepageSection.findAll({

            where: {

                enabled: true

            },

            order: [

                ["displayOrder", "ASC"]

            ]

        });

        const featuredProducts = await Product.findAll({

            where: {

                status: "Approved",

                featured: true

            },

            order: [

                ["listingScore", "DESC"]

            ],

            limit: 12

        });

        const expressProducts = await Product.findAll({

            where: {

                status: "Approved",

                express: true

            },

            order: [

                ["listingScore", "DESC"]

            ],

            limit: 12

        });

        const latestProducts = await Product.findAll({

            where: {

                status: "Approved"

            },

            order: [

                ["displayDate", "DESC"]

            ],

            limit: 20

        });

        const categories = await Category.findAll({

            where: {

                homepage: true,

                status: true

            },

            order: [

                ["displayOrder", "ASC"]

            ]

        });

        const advertisements = await Advertisement.findAll({

            where: {

                active: true

            },

            order: [

                ["priority", "DESC"]

            ]

        });

        const stores = await Store.findAll({

            where: {

                status: "active"

            },

            order: [

                ["followers", "DESC"],

                ["rating", "DESC"]

            ],

            limit: 12

        });

        res.json({

            sections,

            featuredProducts,

            expressProducts,

            latestProducts,

            categories,

            advertisements,

            stores

        });

    }
catch(error){

    res.status(500).json({

        success:false,

        message:error.message

    });

}

};


const { Op } = require("sequelize");
const { Product } = require("../models");

exports.searchProducts = async (req, res) => {

    try {

        const {
            keyword = "",
            category = "",
            subcategory = "",
            condition = "",
            region = "",
            city = "",
            minPrice = "",
            maxPrice = "",
            sort = "newest"
        } = req.query;


        const where = {

            status: "Approved",

            deleted: false

        };


        /*
        ============================================================
        KEYWORD SEARCH
        ============================================================
        */

        const searchKeyword = keyword.trim();

        if (searchKeyword) {

            where[Op.or] = [

                {
                    title: {
                        [Op.like]: `%${searchKeyword}%`
                    }
                },

                {
                    description: {
                        [Op.like]: `%${searchKeyword}%`
                    }
                },

                {
                    category: {
                        [Op.like]: `%${searchKeyword}%`
                    }
                },

                {
                    subcategory: {
                        [Op.like]: `%${searchKeyword}%`
                    }
                },

                {
                    location: {
                        [Op.like]: `%${searchKeyword}%`
                    }
                },

                {
                    region: {
                        [Op.like]: `%${searchKeyword}%`
                    }
                },

                {
                    city: {
                        [Op.like]: `%${searchKeyword}%`
                    }
                }

            ];

        }


        /*
        ============================================================
        CATEGORY
        ============================================================
        */

        if (category.trim()) {

            where.category = {

                [Op.like]: category.trim()

            };

        }


        /*
        ============================================================
        SUBCATEGORY
        ============================================================
        */

        if (subcategory.trim()) {

            where.subcategory = {

                [Op.like]: subcategory.trim()

            };

        }


        /*
        ============================================================
        CONDITION
        ============================================================
        */

        if (condition.trim()) {

            where.condition = {

                [Op.like]: condition.trim()

            };

        }


        /*
        ============================================================
        REGION
        ============================================================
        */

        if (region.trim()) {

            where.region = {

                [Op.like]: region.trim()

            };

        }


        /*
        ============================================================
        CITY
        ============================================================
        */

        if (city.trim()) {

            where.city = {

                [Op.like]: city.trim()

            };

        }


        /*
        ============================================================
        PRICE
        ============================================================
        */

        if (minPrice !== "") {

            where.price = {

                ...(where.price || {}),

                [Op.gte]: Number(minPrice)

            };

        }


        if (maxPrice !== "") {

            where.price = {

                ...(where.price || {}),

                [Op.lte]: Number(maxPrice)

            };

        }


        /*
        ============================================================
        SORT
        ============================================================
        */

        let order = [

            ["createdAt", "DESC"]

        ];


        if (sort === "oldest") {

            order = [

                ["createdAt", "ASC"]

            ];

        }


        if (sort === "lowPrice") {

            order = [

                ["price", "ASC"]

            ];

        }


        if (sort === "highPrice") {

            order = [

                ["price", "DESC"]

            ];

        }


        if (sort === "popular") {

            order = [

                ["views", "DESC"]

            ];

        }


        /*
        ============================================================
        DATABASE SEARCH
        ============================================================
        */

        const products = await Product.findAll({

            where,

            order

        });


        return res.json({

            success: true,

            count: products.length,

            products

        });


    } catch (error) {

        console.error(
            "SEARCH PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to search products.",

            error: error.message

        });

    }

};
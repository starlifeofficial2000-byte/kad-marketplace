const express = require("express");
const router = express.Router();

const {
    Product,
    User,
    Store
} = require("../models");

const SITE_URL = "https://kadmarket.com";

/* =========================================================
   XML ESCAPE
========================================================= */

const escapeXml = (value) => {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
};


/* =========================================================
   SITEMAP
========================================================= */

router.get("/sitemap.xml", async (req, res) => {

    try {

        /* =====================================================
           GET PUBLIC PRODUCTS
        ===================================================== */

        const products = await Product.findAll({

            where: {
                status: "Approved",
                sellerStatus: "Active",
                deleted: false
            },

            attributes: [
                "id",
                "updatedAt"
            ],

            order: [
                ["updatedAt", "DESC"]
            ]

        });


        /* =====================================================
           GET PUBLIC SELLERS
           
           Only sellers who have at least one public product.
        ===================================================== */

        const sellers = await User.findAll({

            attributes: [
                "id",
                "updatedAt"
            ],

            include: [

                {
                    model: Product,

                    as: "products",

                    required: true,

                    attributes: [],

                    where: {
                        status: "Approved",
                        sellerStatus: "Active",
                        deleted: false
                    }

                }

            ],

            group: [
                "User.id"
            ]

        });


        /* =====================================================
           GET PUBLIC STORES
           
           Only stores belonging to sellers with public products.
        ===================================================== */

        const stores = await Store.findAll({

            attributes: [
                "storeSlug",
                "updatedAt"
            ],

            include: [

                {
                    model: Product,

                    as: "products",

                    required: true,

                    attributes: [],

                    where: {
                        status: "Approved",
                        sellerStatus: "Active",
                        deleted: false
                    }

                }

            ],

            where: {
                storeSlug: {
                    [require("sequelize").Op.ne]: null
                }
            },

            group: [
                "Store.id"
            ]

        });


        /* =====================================================
           URL COLLECTION
        ===================================================== */

        const urls = [];


        /* =====================================================
           STATIC PAGES
        ===================================================== */

        const staticPages = [

            {
                path: "/",
                priority: "1.0"
            },

            {
                path: "/featured",
                priority: "0.8"
            },

            {
                path: "/trending",
                priority: "0.8"
            },

            {
                path: "/recommended",
                priority: "0.8"
            },

            {
                path: "/about",
                priority: "0.6"
            },

            {
                path: "/contact",
                priority: "0.6"
            },

            {
                path: "/privacy-policy",
                priority: "0.4"
            }

        ];


        staticPages.forEach((page) => {

            urls.push(`
        <url>
            <loc>${SITE_URL}${page.path}</loc>
            <changefreq>daily</changefreq>
            <priority>${page.priority}</priority>
        </url>
            `);

        });


        /* =====================================================
           PRODUCT PAGES
        ===================================================== */

        products.forEach((product) => {

            urls.push(`
        <url>
            <loc>${SITE_URL}/product/${encodeURIComponent(product.id)}</loc>
            <lastmod>${new Date(
                product.updatedAt
            ).toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.9</priority>
        </url>
            `);

        });


        /* =====================================================
           SELLER PAGES
        ===================================================== */

        sellers.forEach((seller) => {

            urls.push(`
        <url>
            <loc>${SITE_URL}/seller/${encodeURIComponent(seller.id)}</loc>
            <lastmod>${new Date(
                seller.updatedAt
            ).toISOString()}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.6</priority>
        </url>
            `);

        });


        /* =====================================================
           STORE PAGES
        ===================================================== */

        stores.forEach((store) => {

            if (!store.storeSlug) {
                return;
            }

            urls.push(`
        <url>
            <loc>${SITE_URL}/store/${encodeURIComponent(
                store.storeSlug
            )}</loc>
            <lastmod>${new Date(
                store.updatedAt
            ).toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>
            `);

        });


        /* =====================================================
           BUILD XML
        ===================================================== */

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>

${urls.join("")}

</urlset>`;


        /* =====================================================
           RESPONSE
        ===================================================== */

        res.status(200);

        res.set({
            "Content-Type": "application/xml; charset=utf-8",

            "Cache-Control":
                "public, max-age=3600"
        });

        return res.send(sitemap);


    } catch (error) {

        console.error(
            "SITEMAP GENERATION ERROR:",
            error
        );

        return res
            .status(500)
            .send("Unable to generate sitemap.");

    }

});


module.exports = router;
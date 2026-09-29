const express = require("express");
const router = express.Router();

const {
    Product,
    User,
    Store
} = require("../models");

const { Op } = require("sequelize");

const SITE_URL = "https://kadmarket.com";

/* =========================================================
   XML ESCAPE
========================================================= */

const escapeXml = (value) => {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
};


/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (date) => {
    if (!date) {
        return new Date().toISOString();
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return new Date().toISOString();
    }

    return parsedDate.toISOString();
};


/* =========================================================
   ADD URL
========================================================= */

const createUrl = ({
    loc,
    lastmod,
    changefreq,
    priority
}) => {

    return `
    <url>
        <loc>${escapeXml(loc)}</loc>
        ${
            lastmod
                ? `<lastmod>${escapeXml(
                    formatDate(lastmod)
                )}</lastmod>`
                : ""
        }
        ${
            changefreq
                ? `<changefreq>${escapeXml(
                    changefreq
                )}</changefreq>`
                : ""
        }
        ${
            priority
                ? `<priority>${escapeXml(
                    priority
                )}</priority>`
                : ""
        }
    </url>`;
};


/* =========================================================
   SITEMAP
========================================================= */

router.get("/sitemap.xml", async (req, res) => {

    try {

        console.log("🗺️ Generating sitemap...");


        /* =====================================================
           URL COLLECTION
        ===================================================== */

        const urls = [];


        /* =====================================================
           STATIC PUBLIC PAGES
        ===================================================== */

        const staticPages = [

            {
                path: "/",
                changefreq: "daily",
                priority: "1.0"
            },

            {
                path: "/featured",
                changefreq: "daily",
                priority: "0.8"
            },

            {
                path: "/trending",
                changefreq: "daily",
                priority: "0.8"
            },

            {
                path: "/recommended",
                changefreq: "daily",
                priority: "0.8"
            },

            {
                path: "/categories",
                changefreq: "weekly",
                priority: "0.7"
            },

            {
                path: "/about",
                changefreq: "monthly",
                priority: "0.5"
            },

            {
                path: "/contact",
                changefreq: "monthly",
                priority: "0.5"
            },

            {
                path: "/privacy-policy",
                changefreq: "yearly",
                priority: "0.3"
            },

            {
                path: "/terms",
                changefreq: "yearly",
                priority: "0.3"
            }

        ];


        staticPages.forEach((page) => {

            urls.push(
                createUrl({
                    loc: `${SITE_URL}${page.path}`,
                    changefreq: page.changefreq,
                    priority: page.priority
                })
            );

        });


        /* =====================================================
           PUBLIC PRODUCTS
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


        console.log(
            `🛍️ Public products found: ${products.length}`
        );


        products.forEach((product) => {

            urls.push(
                createUrl({

                    loc:
                        `${SITE_URL}/product/` +
                        encodeURIComponent(
                            product.id
                        ),

                    lastmod:
                        product.updatedAt,

                    changefreq:
                        "daily",

                    priority:
                        "0.9"

                })
            );

        });


        /* =====================================================
           PUBLIC SELLERS
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


        console.log(
            `👤 Public sellers found: ${sellers.length}`
        );


        sellers.forEach((seller) => {

            urls.push(
                createUrl({

                    loc:
                        `${SITE_URL}/seller/` +
                        encodeURIComponent(
                            seller.id
                        ),

                    lastmod:
                        seller.updatedAt,

                    changefreq:
                        "weekly",

                    priority:
                        "0.6"

                })
            );

        });


        /* =====================================================
           PUBLIC STORES
        ===================================================== */

        const stores = await Store.findAll({

            attributes: [
                "id",
                "storeSlug",
                "updatedAt"
            ],

            where: {

                storeSlug: {
                    [Op.ne]: null
                }

            },

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
                "Store.id"
            ]

        });


        console.log(
            `🏪 Public stores found: ${stores.length}`
        );


        stores.forEach((store) => {

            if (!store.storeSlug) {
                return;
            }

            urls.push(
                createUrl({

                    loc:
                        `${SITE_URL}/store/` +
                        encodeURIComponent(
                            store.storeSlug
                        ),

                    lastmod:
                        store.updatedAt,

                    changefreq:
                        "daily",

                    priority:
                        "0.8"

                })
            );

        });


        /* =====================================================
           REMOVE DUPLICATE URLS
        ===================================================== */

        const uniqueUrls = [
            ...new Set(urls)
        ];


        /* =====================================================
           BUILD XML
        ===================================================== */

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>

${uniqueUrls.join("\n")}

</urlset>`;


        /* =====================================================
           RESPONSE HEADERS
        ===================================================== */

        res.status(200);

        res.set({

            "Content-Type":
                "application/xml; charset=utf-8",

            "Cache-Control":
                "public, max-age=3600, s-maxage=3600",

            "X-Robots-Tag":
                "noindex"

        });


        /* =====================================================
           SEND SITEMAP
        ===================================================== */

        return res.send(
            sitemap
        );

    }

    catch (error) {

        console.error(
            "❌ SITEMAP GENERATION ERROR:",
            error
        );

        return res
            .status(500)
            .type("text/plain")
            .send(
                "Unable to generate sitemap."
            );

    }

});


/* =========================================================
   ROBOTS.TXT
========================================================= */

router.get("/robots.txt", (req, res) => {

    const robots = `User-agent: *
Allow: /

Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-reset
Disallow: /verify-login-otp
Disallow: /dashboard
Disallow: /sell
Disallow: /profile
Disallow: /inbox
Disallow: /chat/
Disallow: /notifications
Disallow: /promotions
Disallow: /promotion-success
Disallow: /payment-success
Disallow: /payment-failed
Disallow: /edit-product
Disallow: /seller/leads
Disallow: /wishlist
Disallow: /support
Disallow: /my-tickets
Disallow: /admin/

Sitemap: ${SITE_URL}/sitemap.xml
`;

    res.status(200);

    res.set(
        "Content-Type",
        "text/plain; charset=utf-8"
    );

    res.set(
        "Cache-Control",
        "public, max-age=3600"
    );

    return res.send(
        robots
    );

});


module.exports = router;
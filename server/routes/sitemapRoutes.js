const express = require("express");
const router = express.Router();

const {
    Product,
    User,
    Store
} = require("../models");

const { Op } = require("sequelize");

/* =========================================================
   SITE CONFIGURATION
========================================================= */

const SITE_URL = "https://kadmarket.com";

/* =========================================================
   XML ESCAPE
========================================================= */

const escapeXml = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
};

/* =========================================================
   DATE FORMATTER
========================================================= */

const formatDate = (date) => {
    if (!date) {
        return null;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return parsedDate.toISOString();
};

/* =========================================================
   ADD URL
========================================================= */

const createUrl = ({
    loc,
    lastmod = null,
    changefreq = "weekly",
    priority = "0.5"
}) => {

    let xml = `
    <url>
        <loc>${escapeXml(loc)}</loc>`;

    if (lastmod) {
        xml += `
        <lastmod>${escapeXml(lastmod)}</lastmod>`;
    }

    xml += `
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
    </url>`;

    return xml;
};

/* =========================================================
   SITEMAP ROUTE
========================================================= */

router.get(
    "/sitemap.xml",
    async (req, res) => {

        try {

            console.log(
                "🗺️ Generating sitemap..."
            );

            /* =================================================
               URL COLLECTION
            ================================================= */

            const urls = [];

            /* =================================================
               STATIC PAGES
            ================================================= */

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

            /* =================================================
               PUBLIC PRODUCTS
               
               Only approved, active, non-deleted products
               are included.
            ================================================= */

            const products =
                await Product.findAll({

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

                const lastmod =
                    formatDate(
                        product.updatedAt
                    );

                urls.push(
                    createUrl({
                        loc:
                            `${SITE_URL}/product/${encodeURIComponent(
                                product.id
                            )}`,

                        lastmod,

                        changefreq: "daily",

                        priority: "0.9"
                    })
                );

            });

            /* =================================================
               PUBLIC SELLERS
               
               A seller is included only when the seller has
               at least one approved, active, non-deleted
               product.
            ================================================= */

            const sellers =
                await User.findAll({

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

                    order: [
                        ["updatedAt", "DESC"]
                    ]

                });

            console.log(
                `👤 Public sellers found: ${sellers.length}`
            );

            const uniqueSellerIds =
                new Set();

            sellers.forEach((seller) => {

                if (
                    !seller ||
                    !seller.id
                ) {
                    return;
                }

                const sellerId =
                    String(seller.id);

                if (
                    uniqueSellerIds.has(
                        sellerId
                    )
                ) {
                    return;
                }

                uniqueSellerIds.add(
                    sellerId
                );

                urls.push(
                    createUrl({
                        loc:
                            `${SITE_URL}/seller/${encodeURIComponent(
                                seller.id
                            )}`,

                        lastmod:
                            formatDate(
                                seller.updatedAt
                            ),

                        changefreq: "weekly",

                        priority: "0.6"
                    })
                );

            });

            /* =================================================
               PUBLIC STORES
               
               Only stores with a valid slug and at least one
               public product are included.
            ================================================= */

            const stores =
                await Store.findAll({

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

                    order: [
                        ["updatedAt", "DESC"]
                    ]

                });

            console.log(
                `🏪 Public stores found: ${stores.length}`
            );

            const uniqueStoreSlugs =
                new Set();

            stores.forEach((store) => {

                if (
                    !store ||
                    !store.storeSlug
                ) {
                    return;
                }

                const storeSlug =
                    String(
                        store.storeSlug
                    ).trim();

                if (!storeSlug) {
                    return;
                }

                if (
                    uniqueStoreSlugs.has(
                        storeSlug
                    )
                ) {
                    return;
                }

                uniqueStoreSlugs.add(
                    storeSlug
                );

                urls.push(
                    createUrl({
                        loc:
                            `${SITE_URL}/store/${encodeURIComponent(
                                storeSlug
                            )}`,

                        lastmod:
                            formatDate(
                                store.updatedAt
                            ),

                        changefreq: "daily",

                        priority: "0.8"
                    })
                );

            });

            /* =================================================
               REMOVE DUPLICATE URLS
            ================================================= */

            const uniqueUrls = [
                ...new Set(urls)
            ];

            /* =================================================
               BUILD XML
            ================================================= */

            const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${uniqueUrls.join("\n")}
</urlset>`;

            /* =================================================
               CACHE
            ================================================= */

            res.set({
                "Content-Type":
                    "application/xml; charset=utf-8",

                "Cache-Control":
                    "public, max-age=3600"
            });

            /* =================================================
               RESPONSE
            ================================================= */

            console.log(
                `✅ Sitemap generated successfully: ${uniqueUrls.length} URLs`
            );

            return res
                .status(200)
                .send(sitemap);

        } catch (error) {

            console.error(
                "❌ SITEMAP GENERATION ERROR:"
            );

            console.error(
                error
            );

            return res
                .status(500)
                .type("text/plain")
                .send(
                    "Unable to generate sitemap."
                );
        }

    }
);

/* =========================================================
   EXPORT ROUTER
========================================================= */

module.exports = router;
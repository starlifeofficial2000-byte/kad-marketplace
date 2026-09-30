require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const { Server } = require("socket.io");
const { Op } = require("sequelize");

const sequelize = require("./config/database");

/* =========================================================
   LOAD MODELS
========================================================= */

require("./models");

/* =========================================================
   ROUTES
========================================================= */

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const storeRoutes = require("./routes/storeRoutes");
const storeFollowRoutes = require("./routes/storeFollowRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const subscriptionPlanRoutes = require("./routes/subscriptionPlanRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const featuredProductRoutes = require("./routes/featuredProductRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const supportRoutes = require("./routes/supportRoutes");
const searchRoutes = require("./routes/searchRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const marketplaceSettingsRoutes = require("./routes/marketplaceSettingsRoutes");

const adminProductRoutes = require("./routes/adminProductRoutes");
const adminStoreRoutes = require("./routes/adminStoreRoutes");
const adminAdvertisementRoutes = require("./routes/adminAdvertisementRoutes");
const adminPaymentRoutes = require("./routes/adminPaymentRoutes");
const adminRevenueRoutes = require("./routes/adminRevenueRoutes");
const advertisementRoutes = require("./routes/advertisementRoutes");
const adminSubscriptionPlanRoutes = require("./routes/adminSubscriptionPlanRoutes");
const adminNotificationRoutes = require("./routes/adminNotificationRoutes");
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");
const adminSupportRoutes = require("./routes/adminSupportRoutes");

const wishlistRoutes = require("./routes/wishlistRoutes");
const leadRoutes = require("./routes/leadRoutes");
const brandingRoutes = require("./routes/brandingRoutes");

const homeBuilderRoutes = require("./routes/homeBuilderRoutes");
const homeBuilderAdminRoutes = require("./routes/homeBuilderAdminRoutes");

const contactRoutes = require("./routes/contactRoutes");

const securityRoutes = require("./routes/securityRoutes");
const roleRoutes = require("./routes/roleRoutes");
const permissionRoutes = require("./routes/permissionRoutes");

const backupRoutes = require("./routes/backupRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");

const userSettingsRoutes = require("./routes/userSettingsRoutes");
const adminSecurityRoutes = require("./routes/adminSecurityRoutes");

/* =========================================================
   OPTIONAL SITEMAP ROUTES

   Keep this only if sitemapRoutes contains additional
   sitemap-related routes.
========================================================= */

let sitemapRoutes = null;

try {
    sitemapRoutes = require("./routes/sitemapRoutes");
} catch (error) {
    console.log(
        "ℹ️ sitemapRoutes.js not loaded. Using built-in sitemap route."
    );
}

/* =========================================================
   MIDDLEWARE
========================================================= */

const maintenanceMode =
    require("./middleware/maintenanceMode");

/* =========================================================
   SERVICES
========================================================= */

const PromotionService =
    require("./services/promotionService");

/* =========================================================
   BACKGROUND JOBS
========================================================= */

require("./jobs/subscriptionCron");

/* =========================================================
   EXPRESS
========================================================= */

const app = express();

app.set("trust proxy", 1);

const server = http.createServer(app);

/* =========================================================
   ENVIRONMENT
========================================================= */

const NODE_ENV =
    process.env.NODE_ENV || "development";

const PORT =
    process.env.PORT || 5000;

/*
   IMPORTANT:
   SITE_URL must be a real URL, not Markdown.
*/

const SITE_URL = (
    process.env.SITE_URL ||
    "https://kadmarket.com"
)
    .trim()
    .replace(/\/+$/, "");

/* =========================================================
   FRONTEND BUILD DIRECTORY
========================================================= */

const clientDistPath =
    path.join(__dirname, "../client/dist");

/* =========================================================
   SECURITY
========================================================= */

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        }
    })
);

/* =========================================================
   CORS
========================================================= */

const normalizeOrigin = (url) => {
    if (!url) {
        return null;
    }

    return String(url)
        .trim()
        .replace(/\/+$/, "");
};

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    "https://kadmarket.com",
    "https://www.kadmarket.com",

    process.env.FRONTEND_URL,

    ...(process.env.FRONTEND_URLS
        ? process.env.FRONTEND_URLS.split(",")
        : [])
]
    .map(normalizeOrigin)
    .filter(Boolean);

const uniqueAllowedOrigins = [
    ...new Set(allowedOrigins)
];

console.log(
    "🌐 Allowed CORS Origins:",
    uniqueAllowedOrigins
);

const isAllowedOrigin = (origin) => {
    if (!origin) {
        return true;
    }

    return uniqueAllowedOrigins.includes(
        normalizeOrigin(origin)
    );
};

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }

        console.warn(
            "❌ CORS BLOCKED:",
            origin
        );

        return callback(
            new Error(
                `Not allowed by CORS: ${origin}`
            )
        );
    },

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With"
    ]
};

app.use(cors(corsOptions));

/* =========================================================
   BODY PARSERS
========================================================= */

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb"
    })
);

/* =========================================================
   UPLOAD DIRECTORY
========================================================= */

const uploadDirectory =
    path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );
}

app.use(
    "/uploads",
    express.static(uploadDirectory)
);

/* =========================================================
   ROBOTS.TXT
========================================================= */

app.get(
    "/robots.txt",
    (req, res) => {
        const robots = [
            "User-agent: *",
            "Allow: /",
            "",
            "Disallow: /login",
            "Disallow: /register",
            "Disallow: /forgot-password",
            "Disallow: /verify-reset",
            "Disallow: /reset-password",
            "Disallow: /verify-login-otp",
            "Disallow: /dashboard",
            "Disallow: /sell",
            "Disallow: /profile",
            "Disallow: /inbox",
            "Disallow: /chat/",
            "Disallow: /notifications",
            "Disallow: /promotions",
            "Disallow: /promotion-success",
            "Disallow: /payment-success",
            "Disallow: /payment-failed",
            "Disallow: /edit-product",
            "Disallow: /seller/leads",
            "Disallow: /wishlist",
            "Disallow: /support",
            "Disallow: /my-tickets",
            "Disallow: /admin/",
            "",
            `Sitemap: ${SITE_URL}/sitemap.xml`
        ].join("\n");

        res.status(200);

        res.set({
            "Content-Type":
                "text/plain; charset=utf-8",

            "Cache-Control":
                "public, max-age=3600"
        });

        return res.send(robots);
    }
);

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
   SITEMAP GENERATOR
========================================================= */

const generateSitemap = async () => {
    const {
        Product,
        User,
        Store
    } = require("./models");

    const urls = [];

    /* =====================================================
       STATIC PAGES
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
            path: "/about",
            changefreq: "monthly",
            priority: "0.6"
        },

        {
            path: "/contact",
            changefreq: "monthly",
            priority: "0.6"
        },

        {
            path: "/privacy-policy",
            changefreq: "yearly",
            priority: "0.4"
        }
    ];

    staticPages.forEach((page) => {
        urls.push(`
    <url>
        <loc>${escapeXml(
            `${SITE_URL}${page.path}`
        )}</loc>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>
`);
    });

    /* =====================================================
       PRODUCTS
    ===================================================== */

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

    products.forEach((product) => {
        const productUrl =
            `${SITE_URL}/product/${encodeURIComponent(
                product.id
            )}`;

        const lastmod =
            product.updatedAt
                ? new Date(
                    product.updatedAt
                ).toISOString()
                : new Date().toISOString();

        urls.push(`
    <url>
        <loc>${escapeXml(productUrl)}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
`);
    });

    /* =====================================================
       SELLERS
    ===================================================== */

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

            group: [
                "User.id",
                "User.updatedAt"
            ]
        });

    sellers.forEach((seller) => {
        const sellerUrl =
            `${SITE_URL}/seller/${encodeURIComponent(
                seller.id
            )}`;

        const lastmod =
            seller.updatedAt
                ? new Date(
                    seller.updatedAt
                ).toISOString()
                : new Date().toISOString();

        urls.push(`
    <url>
        <loc>${escapeXml(sellerUrl)}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>
`);
    });

    /* =====================================================
       STORES
    ===================================================== */

    const stores =
        await Store.findAll({
            attributes: [
                "id",
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
                    [Op.ne]: null
                }
            },

            group: [
                "Store.id",
                "Store.storeSlug",
                "Store.updatedAt"
            ]
        });

    stores.forEach((store) => {
        if (!store.storeSlug) {
            return;
        }

        const storeUrl =
            `${SITE_URL}/store/${encodeURIComponent(
                store.storeSlug
            )}`;

        const lastmod =
            store.updatedAt
                ? new Date(
                    store.updatedAt
                ).toISOString()
                : new Date().toISOString();

        urls.push(`
    <url>
        <loc>${escapeXml(storeUrl)}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
`);
    });

    /* =====================================================
       SITEMAP XML
    ===================================================== */

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;
};

/* =========================================================
   PUBLIC SITEMAP
========================================================= */

app.get(
    "/sitemap.xml",
    async (req, res) => {
        try {
            console.log(
                "🗺️ Sitemap requested:",
                req.originalUrl
            );

            const sitemap =
                await generateSitemap();

            res.status(200);

            res.set({
                "Content-Type":
                    "application/xml; charset=utf-8",

                "Cache-Control":
                    "public, max-age=3600"
            });

            return res.send(sitemap);

        } catch (error) {
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
    }
);

/* =========================================================
   OPTIONAL SITEMAP ROUTES
========================================================= */

if (sitemapRoutes) {
    app.use(
        "/",
        sitemapRoutes
    );
}

/* =========================================================
   DEBUG UPLOADS
========================================================= */

if (NODE_ENV !== "production") {
    app.get(
        "/api/debug/uploads",
        (req, res) => {
            try {
                const exists =
                    fs.existsSync(
                        uploadDirectory
                    );

                const files =
                    exists
                        ? fs.readdirSync(
                            uploadDirectory
                        )
                        : [];

                return res.status(200).json({
                    success: true,
                    uploadDir:
                        uploadDirectory,
                    exists,
                    fileCount:
                        files.length,
                    files:
                        files.slice(
                            0,
                            100
                        )
                });

            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message:
                        error.message
                });
            }
        }
    );
}

/* =========================================================
   SOCKET.IO
========================================================= */

const io =
    new Server(
        server,
        {
            path: "/socket.io",

            cors: {
                origin:
                    (
                        origin,
                        callback
                    ) => {
                        if (!origin) {
                            return callback(
                                null,
                                true
                            );
                        }

                        if (
                            isAllowedOrigin(
                                origin
                            )
                        ) {
                            return callback(
                                null,
                                true
                            );
                        }

                        console.warn(
                            "❌ SOCKET.IO CORS BLOCKED:",
                            origin
                        );

                        return callback(
                            new Error(
                                `Socket.IO CORS blocked: ${origin}`
                            )
                        );
                    },

                methods: [
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "OPTIONS"
                ],

                credentials: true
            },

            transports: [
                "websocket",
                "polling"
            ],

            allowEIO3: false,

            pingTimeout: 60000,

            pingInterval: 25000,

            connectTimeout: 45000
        }
    );

app.set(
    "io",
    io
);

console.log(
    "🔌 Socket.IO initialized successfully."
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
    "/api/health",
    async (req, res) => {
        try {
            await sequelize.authenticate();

            return res.status(200).json({
                success: true,
                status: "healthy",
                environment:
                    NODE_ENV,
                database:
                    "connected",
                timestamp:
                    new Date().toISOString()
            });

        } catch (error) {
            console.error(
                "Health check database error:",
                error.message
            );

            return res.status(503).json({
                success: false,
                status: "unhealthy",
                database:
                    "disconnected",
                message:
                    error.message
            });
        }
    }
);

/* =========================================================
   API HOME
========================================================= */

app.get(
    "/api",
    (req, res) => {
        return res.status(200).json({
            success: true,

            message:
                "🚀 KAD Marketplace API Running",

            environment:
                NODE_ENV,

            sitemap:
                `${SITE_URL}/sitemap.xml`,

            robots:
                `${SITE_URL}/robots.txt`
        });
    }
);

/* =========================================================
   PUBLIC SETTINGS / AUTH
========================================================= */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/settings",
    settingsRoutes
);

app.use(
    "/api/user/settings",
    userSettingsRoutes
);

/* =========================================================
   BRANDING
========================================================= */

app.use(
    "/api/admin/settings/branding",
    brandingRoutes
);

/* =========================================================
   MAINTENANCE MODE
========================================================= */

app.use(
    maintenanceMode
);

/* =========================================================
   PRODUCTS
========================================================= */

app.use(
    "/api/products",
    productRoutes
);

/* =========================================================
   STORE
========================================================= */

app.use(
    "/api/store",
    storeFollowRoutes
);

app.use(
    "/api/store",
    storeRoutes
);

/* =========================================================
   SELLER
========================================================= */

app.use(
    "/api/seller",
    sellerRoutes
);

/* =========================================================
   SUBSCRIPTIONS
========================================================= */

app.use(
    "/api/subscription",
    subscriptionRoutes
);

app.use(
    "/api/subscription-plans",
    subscriptionPlanRoutes
);

/* =========================================================
   PAYMENTS
========================================================= */

app.use(
    "/api/payments",
    paymentRoutes
);

/* =========================================================
   PROMOTIONS
========================================================= */

app.use(
    "/api/promotions",
    promotionRoutes
);

/* =========================================================
   MESSAGES
========================================================= */

app.use(
    "/api/messages",
    messageRoutes
);

/* =========================================================
   USERS
========================================================= */

app.use(
    "/api/users",
    userRoutes
);

/* =========================================================
   WISHLIST
========================================================= */

app.use(
    "/api/wishlist",
    wishlistRoutes
);

/* =========================================================
   REVIEWS
========================================================= */

app.use(
    "/api/reviews",
    reviewRoutes
);

/* =========================================================
   NOTIFICATIONS
========================================================= */

app.use(
    "/api/notifications",
    notificationRoutes
);

/* =========================================================
   REPORTS
========================================================= */

app.use(
    "/api/reports",
    reportRoutes
);

/* =========================================================
   ANALYTICS
========================================================= */

app.use(
    "/api/analytics",
    analyticsRoutes
);

/* =========================================================
   SEARCH
========================================================= */

app.use(
    "/api/search",
    searchRoutes
);

/* =========================================================
   SUPPORT
========================================================= */

app.use(
    "/api/support",
    supportRoutes
);

/* =========================================================
   CONTACT
========================================================= */

app.use(
    "/api/contact",
    contactRoutes
);

/* =========================================================
   LEADS
========================================================= */

app.use(
    "/api/leads",
    leadRoutes
);

/* =========================================================
   ADVERTISEMENTS
========================================================= */

app.use(
    "/api/advertisements",
    advertisementRoutes
);

/* =========================================================
   SECURITY
========================================================= */

app.use(
    "/api/security",
    securityRoutes
);

/* =========================================================
   ROLES
========================================================= */

app.use(
    "/api/roles",
    roleRoutes
);

/* =========================================================
   PERMISSIONS
========================================================= */

app.use(
    "/api/permissions",
    permissionRoutes
);

/* =========================================================
   BACKUPS
========================================================= */

app.use(
    "/api/backups",
    backupRoutes
);

/* =========================================================
   PUBLIC HOME BUILDER
========================================================= */

app.use(
    "/api/home-builder",
    homeBuilderRoutes
);

/* =========================================================
   ADMIN SECURITY
========================================================= */

app.use(
    "/api/admin",
    adminSecurityRoutes
);

/* =========================================================
   MAIN ADMIN
========================================================= */

app.use(
    "/api/admin",
    adminRoutes
);

/* =========================================================
   ADMIN PRODUCTS
========================================================= */

app.use(
    "/api/admin",
    adminProductRoutes
);

/* =========================================================
   ADMIN STORES
========================================================= */

app.use(
    "/api/admin",
    adminStoreRoutes
);

/* =========================================================
   ADMIN ADVERTISEMENTS
========================================================= */

app.use(
    "/api/admin",
    adminAdvertisementRoutes
);

/* =========================================================
   ADMIN PAYMENTS
========================================================= */

app.use(
    "/api/admin",
    adminPaymentRoutes
);

/* =========================================================
   ADMIN REVENUE
========================================================= */

app.use(
    "/api/admin",
    adminRevenueRoutes
);

/* =========================================================
   ADMIN SUBSCRIPTION PLANS
========================================================= */

app.use(
    "/api/admin",
    adminSubscriptionPlanRoutes
);

/* =========================================================
   ADMIN NOTIFICATIONS
========================================================= */

app.use(
    "/api/admin/notifications",
    adminNotificationRoutes
);

/* =========================================================
   ADMIN SETTINGS
========================================================= */

app.use(
    "/api/admin/settings",
    adminSettingsRoutes
);

/* =========================================================
   MARKETPLACE SETTINGS
========================================================= */

app.use(
    "/api/admin/settings",
    marketplaceSettingsRoutes
);

/* =========================================================
   ADMIN SUPPORT
========================================================= */

app.use(
    "/api/admin/support",
    adminSupportRoutes
);

/* =========================================================
   ADMIN CATEGORIES
========================================================= */

app.use(
    "/api/admin/categories",
    categoryRoutes
);

/* =========================================================
   ADMIN FEATURED PRODUCTS
========================================================= */

app.use(
    "/api/admin/featured-products",
    featuredProductRoutes
);

/* =========================================================
   ADMIN HOME BUILDER
========================================================= */

app.use(
    "/api/admin/home-builder",
    homeBuilderAdminRoutes
);

/* =========================================================
   ADMIN AUDIT LOGS
========================================================= */

app.use(
    "/api/admin/audit-logs",
    auditLogRoutes
);

/* =========================================================
   SOCKET EVENTS
========================================================= */

io.on(
    "connection",
    (socket) => {
        console.log(
            `🟢 Socket Connected: ${socket.id}`
        );

        socket.on(
            "join_conversation",
            (conversationId) => {
                if (!conversationId) {
                    return;
                }

                socket.join(
                    String(conversationId)
                );

                console.log(
                    `User joined conversation: ${conversationId}`
                );
            }
        );

        socket.on(
            "leave_conversation",
            (conversationId) => {
                if (!conversationId) {
                    return;
                }

                socket.leave(
                    String(conversationId)
                );

                console.log(
                    `User left conversation: ${conversationId}`
                );
            }
        );

        socket.on(
            "typing",
            (data) => {
                if (
                    !data ||
                    !data.conversationId
                ) {
                    return;
                }

                socket
                    .to(
                        String(
                            data.conversationId
                        )
                    )
                    .emit(
                        "typing",
                        data
                    );
            }
        );

        socket.on(
            "stop_typing",
            (data) => {
                if (
                    !data ||
                    !data.conversationId
                ) {
                    return;
                }

                socket
                    .to(
                        String(
                            data.conversationId
                        )
                    )
                    .emit(
                        "stop_typing",
                        data
                    );
            }
        );

        socket.on(
            "disconnect",
            (reason) => {
                console.log(
                    `🔴 Socket Disconnected: ${socket.id}`,
                    reason
                );
            }
        );

        socket.on(
            "error",
            (error) => {
                console.error(
                    `❌ Socket Error [${socket.id}]:`,
                    error
                );
            }
        );
    }
);

/* =========================================================
   PRODUCTION FRONTEND
========================================================= */

if (NODE_ENV === "production") {
    /*
       Serve React static assets.
    */

    app.use(
        express.static(
            clientDistPath,
            {
                index: false
            }
        )
    );

    /*
       React SPA fallback.

       IMPORTANT:
       This uses app.use() instead of app.get("/{*splat}")
       so we can safely use next().
    */

    app.use(
        (req, res, next) => {
            /*
               Only handle GET/HEAD requests.
            */

            if (
                req.method !== "GET" &&
                req.method !== "HEAD"
            ) {
                return next();
            }

            /*
               Never allow React fallback to intercept API,
               uploads, Socket.IO, sitemap or robots.
            */

            if (
                req.path.startsWith("/api") ||
                req.path.startsWith("/uploads") ||
                req.path.startsWith("/socket.io") ||
                req.path === "/sitemap.xml" ||
                req.path === "/robots.txt"
            ) {
                return next();
            }

            const indexPath =
                path.join(
                    clientDistPath,
                    "index.html"
                );

            if (
                !fs.existsSync(indexPath)
            ) {
                console.error(
                    "❌ Frontend build not found:",
                    indexPath
                );

                return res
                    .status(500)
                    .send(
                        "Frontend build not found."
                    );
            }

            return res.sendFile(
                indexPath
            );
        }
    );
}

/* =========================================================
   404 HANDLER
========================================================= */

app.use(
    (req, res) => {
        return res.status(404).json({
            success: false,

            message:
                `Route not found: ${req.method} ${req.originalUrl}`
        });
    }
);

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
    (error, req, res, next) => {
        console.error(
            "SERVER ERROR:",
            error
        );

        if (
            error.message &&
            (
                error.message.includes("CORS") ||
                error.message.includes(
                    "Not allowed by CORS"
                )
            )
        ) {
            return res.status(403).json({
                success: false,

                message:
                    error.message
            });
        }

        if (
            error.name === "MulterError"
        ) {
            return res.status(400).json({
                success: false,

                message:
                    error.message ||
                    "File upload error."
            });
        }

        return res.status(
            error.status || 500
        ).json({
            success: false,

            message:
                NODE_ENV === "production"
                    ? "Internal server error."
                    : (
                        error.message ||
                        "Internal server error."
                    )
        });
    }
);

/* =========================================================
   PROMOTION EXPIRY CHECKER
========================================================= */

let promotionExpiryInterval = null;

const startPromotionExpiryChecker = () => {
    if (promotionExpiryInterval) {
        console.warn(
            "⚠️ Promotion expiry checker is already running."
        );

        return;
    }

    console.log(
        "🚀 Promotion expiry checker started."
    );

    const checkExpiredPromotions =
        async () => {
            try {
                await PromotionService
                    .removeExpiredPromotions();

                console.log(
                    "Promotion expiry check completed."
                );

            } catch (error) {
                console.error(
                    "Promotion expiry check failed:",
                    error.message
                );
            }
        };

    /*
       Run immediately.
    */

    checkExpiredPromotions();

    /*
       Then run every minute.
    */

    promotionExpiryInterval =
        setInterval(
            checkExpiredPromotions,
            60 * 1000
        );
};

/* =========================================================
   DATABASE + SERVER STARTUP
========================================================= */

const startServer = async () => {
    try {
        /* =================================================
           DATABASE
        ================================================= */

        await sequelize.authenticate();

        console.log(
            "✅ MySQL Connected Successfully"
        );

        /* =================================================
           DATABASE SYNC
        ================================================= */

        await sequelize.sync();

        console.log(
            "✅ Database Synced Successfully"
        );

        /* =================================================
           ROLES + PERMISSIONS
        ================================================= */

        const seedRolesAndPermissions =
            require(
                "./seeders/rolePermissionSeeder"
            );

        await seedRolesAndPermissions();

        console.log(
            "✅ Roles and permissions checked."
        );

        /* =================================================
           BACKGROUND SERVICES
        ================================================= */

        startPromotionExpiryChecker();

        /* =================================================
           SERVER
        ================================================= */

        server.listen(
            PORT,
            () => {
                console.log("");

                console.log(
                    "=========================================="
                );

                console.log(
                    "🚀 KAD MARKETPLACE SERVER STARTED"
                );

                console.log(
                    "=========================================="
                );

                console.log(
                    `🌍 Port: ${PORT}`
                );

                console.log(
                    `📦 Environment: ${NODE_ENV}`
                );

                console.log(
                    `🌐 Site URL: ${SITE_URL}`
                );

                console.log(
                    `🗺️ Sitemap: ${SITE_URL}/sitemap.xml`
                );

                console.log(
                    `🤖 Robots: ${SITE_URL}/robots.txt`
                );

                console.log(
                    `⚙️ Public Settings: ${SITE_URL}/api/settings/public`
                );

                console.log(
                    `❤️ Health: ${SITE_URL}/api/health`
                );

                console.log(
                    `🌐 Allowed Origins: ${uniqueAllowedOrigins.join(", ")}`
                );

                console.log(
                    "🔌 Socket.IO: /socket.io"
                );

                console.log(
                    "=========================================="
                );

                console.log("");
            }
        );

    } catch (error) {
        console.error("");

        console.error(
            "❌ SERVER STARTUP FAILED"
        );

        console.error(
            error
        );

        console.error("");

        process.exit(1);
    }
};

/* =========================================================
   GRACEFUL SHUTDOWN
========================================================= */

const shutdown = async (signal) => {
    console.log(
        `\n${signal} received. Shutting down...`
    );

    try {
        /* =================================================
           STOP PROMOTION CHECKER
        ================================================= */

        if (
            promotionExpiryInterval
        ) {
            clearInterval(
                promotionExpiryInterval
            );

            promotionExpiryInterval =
                null;

            console.log(
                "Promotion expiry checker stopped."
            );
        }

        /* =================================================
           CLOSE SOCKET.IO
        ================================================= */

        await new Promise(
            (resolve) => {
                io.close(
                    () => {
                        console.log(
                            "Socket.IO server closed."
                        );

                        resolve();
                    }
                );
            }
        );

        /* =================================================
           CLOSE HTTP SERVER
        ================================================= */

        await new Promise(
            (resolve) => {
                server.close(
                    () => {
                        console.log(
                            "HTTP server closed."
                        );

                        resolve();
                    }
                );
            }
        );

        /* =================================================
           DATABASE
        ================================================= */

        await sequelize.close();

        console.log(
            "Database connection closed."
        );

        process.exit(0);

    } catch (error) {
        console.error(
            "Shutdown error:",
            error
        );

        process.exit(1);
    }
};

/* =========================================================
   PROCESS SIGNALS
========================================================= */

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);

process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);

/* =========================================================
   UNHANDLED PROMISE
========================================================= */

process.on(
    "unhandledRejection",
    (reason) => {
        console.error(
            "❌ UNHANDLED PROMISE REJECTION:",
            reason
        );
    }
);

/* =========================================================
   UNCAUGHT EXCEPTION
========================================================= */

process.on(
    "uncaughtException",
    (error) => {
        console.error(
            "❌ UNCAUGHT EXCEPTION:",
            error
        );

        shutdown(
            "UNCAUGHT_EXCEPTION"
        );
    }
);

/* =========================================================
   START APPLICATION
========================================================= */

startServer();
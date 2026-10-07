require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
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
========================================================= */

let sitemapRoutes = null;

try {
    sitemapRoutes = require("./routes/sitemapRoutes");

    console.log(
        "✅ sitemapRoutes.js loaded."
    );
} catch (error) {
    console.log(
        "ℹ️ sitemapRoutes.js not found. Using built-in sitemap route."
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

app.set(
    "trust proxy",
    1
);

const server =
    http.createServer(app);

/* =========================================================
   ENVIRONMENT
========================================================= */

const NODE_ENV =
    process.env.NODE_ENV ||
    "development";

const PORT =
    Number(process.env.PORT) ||
    5000;

const JWT_SECRET =
    process.env.JWT_SECRET;

/*
 * Production website URL.
 *
 * IMPORTANT:
 * Environment variables must contain normal URLs,
 * not Markdown links.
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
    path.join(
        __dirname,
        "../client/dist"
    );

console.log(
    "📁 Frontend directory:",
    clientDistPath
);


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

const normalizeOrigin = (
    url
) => {

    if (!url) {
        return null;
    }

    return String(url)
        .trim()
        .replace(
            /\/+$/,
            ""
        );
};


/*
 * Built-in allowed origins.
 */

const baseAllowedOrigins = [

    "http://localhost:5173",

    "http://127.0.0.1:5173",

    "https://kadmarket.com",

    "https://www.kadmarket.com"
];


/*
 * Environment-defined origins.
 */

const environmentOrigins = [

    process.env.FRONTEND_URL,

    ...(process.env.FRONTEND_URLS
        ? process.env.FRONTEND_URLS.split(",")
        : [])
];


/*
 * Final allowed origins.
 */

const allowedOrigins = [
    ...baseAllowedOrigins,
    ...environmentOrigins
]
    .map(normalizeOrigin)
    .filter(Boolean);


/*
 * Remove duplicates.
 */

const uniqueAllowedOrigins = [
    ...new Set(
        allowedOrigins
    )
];


console.log(
    "🌐 Allowed CORS Origins:",
    uniqueAllowedOrigins
);


/* =========================================================
   ORIGIN CHECK
========================================================= */

const isAllowedOrigin = (
    origin
) => {

    /*
     * Requests without an Origin header include:
     *
     * - server-to-server requests
     * - curl
     * - some mobile clients
     */

    if (!origin) {
        return true;
    }

    return uniqueAllowedOrigins.includes(
        normalizeOrigin(origin)
    );
};


/* =========================================================
   EXPRESS CORS
========================================================= */

const corsOptions = {

    origin: (
        origin,
        callback
    ) => {

        if (
            isAllowedOrigin(origin)
        ) {

            return callback(
                null,
                true
            );
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


app.use(
    cors(corsOptions)
);


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
    path.join(
        __dirname,
        "uploads"
    );


if (
    !fs.existsSync(
        uploadDirectory
    )
) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );
}


app.use(
    "/uploads",
    express.static(
        uploadDirectory
    )
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

            "# Authentication pages",

            "Disallow: /login",

            "Disallow: /register",

            "Disallow: /forgot-password",

            "Disallow: /verify-reset",

            "Disallow: /reset-password",

            "Disallow: /verify-login-otp",

            "",

            "# Private user pages",

            "Disallow: /dashboard",

            "Disallow: /profile",

            "Disallow: /sell",

            "Disallow: /inbox",

            "Disallow: /messages",

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

            "",

            "# Admin",

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


        return res.send(
            robots
        );
    }
);


/* =========================================================
   XML ESCAPE
========================================================= */

const escapeXml = (
    value
) => {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&apos;"
        );
};


/* =========================================================
   SITEMAP GENERATOR
========================================================= */

const generateSitemap =
    async () => {

        const {
            Product,
            User,
            Store
        } = require("./models");


        const urls = [];


        /* ================================================
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


        staticPages.forEach(
            (page) => {

                urls.push(`
    <url>
        <loc>${escapeXml(
            `${SITE_URL}${page.path}`
        )}</loc>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>
`);
            }
        );


        /* ================================================
           PRODUCTS
        ================================================= */

        const products =
            await Product.findAll({

                where: {

                    status:
                        "Approved",

                    sellerStatus:
                        "Active",

                    deleted:
                        false
                },

                attributes: [
                    "id",
                    "updatedAt"
                ],

                order: [
                    [
                        "updatedAt",
                        "DESC"
                    ]
                ]
            });


        products.forEach(
            (product) => {

                const productUrl =
                    `${SITE_URL}/product/${encodeURIComponent(
                        product.id
                    )}`;


                const lastmod =
                    product.updatedAt
                        ? new Date(
                            product.updatedAt
                        ).toISOString()
                        : new Date()
                            .toISOString();


                urls.push(`
    <url>
        <loc>${escapeXml(
            productUrl
        )}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
`);
            }
        );


        /* ================================================
           SELLERS
        ================================================= */

        const sellers =
            await User.findAll({

                attributes: [
                    "id",
                    "updatedAt"
                ],

                include: [

                    {
                        model:
                            Product,

                        as:
                            "products",

                        required:
                            true,

                        attributes:
                            [],

                        where: {

                            status:
                                "Approved",

                            sellerStatus:
                                "Active",

                            deleted:
                                false
                        }
                    }
                ],

                group: [
                    "User.id",
                    "User.updatedAt"
                ]
            });


        sellers.forEach(
            (seller) => {

                const sellerUrl =
                    `${SITE_URL}/seller/${encodeURIComponent(
                        seller.id
                    )}`;


                const lastmod =
                    seller.updatedAt
                        ? new Date(
                            seller.updatedAt
                        ).toISOString()
                        : new Date()
                            .toISOString();


                urls.push(`
    <url>
        <loc>${escapeXml(
            sellerUrl
        )}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>
`);
            }
        );


        /* ================================================
           STORES
        ================================================= */

        const stores =
            await Store.findAll({

                attributes: [
                    "id",
                    "storeSlug",
                    "updatedAt"
                ],

                include: [

                    {
                        model:
                            Product,

                        as:
                            "products",

                        required:
                            true,

                        attributes:
                            [],

                        where: {

                            status:
                                "Approved",

                            sellerStatus:
                                "Active",

                            deleted:
                                false
                        }
                    }
                ],

                where: {

                    storeSlug: {
                        [Op.ne]:
                            null
                    }
                },

                group: [
                    "Store.id",
                    "Store.storeSlug",
                    "Store.updatedAt"
                ]
            });


        stores.forEach(
            (store) => {

                if (
                    !store.storeSlug
                ) {
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
                        : new Date()
                            .toISOString();


                urls.push(`
    <url>
        <loc>${escapeXml(
            storeUrl
        )}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
`);
            }
        );


        /* ================================================
           FINAL SITEMAP
        ================================================= */

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


            return res.send(
                sitemap
            );

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

if (
    NODE_ENV !==
    "production"
) {

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


                return res
                    .status(200)
                    .json({

                        success:
                            true,

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

                return res
                    .status(500)
                    .json({

                        success:
                            false,

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

            path:
                "/socket.io",


            cors: {

                origin: (
                    origin,
                    callback
                ) => {

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
                    "POST"
                ],


                credentials:
                    true
            },


            transports: [
                "websocket",
                "polling"
            ],


            allowEIO3:
                false,


            pingTimeout:
                60000,


            pingInterval:
                25000,


            connectTimeout:
                45000
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
   SOCKET.IO AUTHENTICATION
========================================================= */

io.use(
    async (
        socket,
        next
    ) => {

        try {

            if (
                !JWT_SECRET
            ) {

                console.error(
                    "❌ JWT_SECRET is not configured."
                );

                return next(
                    new Error(
                        "Server authentication is not configured."
                    )
                );
            }


            /*
             * Accept token from:
             *
             * socket.auth.token
             *
             * OR
             *
             * Authorization header.
             */

            const token =
                socket.handshake
                    ?.auth
                    ?.token ||
                socket.handshake
                    ?.headers
                    ?.authorization
                    ?.replace(
                        /^Bearer\s+/i,
                        ""
                    );


            if (
                !token
            ) {

                console.warn(
                    "❌ Socket connection rejected: No authentication token."
                );

                return next(
                    new Error(
                        "Authentication required."
                    )
                );
            }


            /*
             * Verify JWT.
             */

            const decoded =
                jwt.verify(
                    token,
                    JWT_SECRET
                );


            /*
             * Support both common
             * JWT payload formats.
             */

            const userId =
                decoded.id ||
                decoded.userId;


            if (
                !userId
            ) {

                return next(
                    new Error(
                        "Invalid authentication token."
                    )
                );
            }


            const numericUserId =
                Number(userId);


            if (
                !Number.isInteger(
                    numericUserId
                ) ||
                numericUserId <= 0
            ) {

                return next(
                    new Error(
                        "Invalid user ID in authentication token."
                    )
                );
            }


            /*
             * IMPORTANT:
             *
             * Never trust userId supplied by
             * the client.
             *
             * The verified JWT is the source
             * of truth.
             */

            socket.userId =
                numericUserId;


            console.log(
                `🔐 Socket authenticated for user: ${socket.userId}`
            );


            return next();

        } catch (error) {

            console.error(
                "❌ Socket authentication failed:",
                error.message
            );


            return next(
                new Error(
                    "Invalid or expired authentication token."
                )
            );
        }
    }
);


/* =========================================================
   SOCKET EVENTS
========================================================= */

io.on(
    "connection",
    (socket) => {

        const userId =
            socket.userId;


        console.log(
            `🟢 Socket Connected: ${socket.id} | User: ${userId}`
        );


        /* =================================================
           PRIVATE USER ROOM
        ================================================= */

        const userRoom =
            `user:${userId}`;


        socket.join(
            userRoom
        );


        console.log(
            `👤 User ${userId} joined private room: ${userRoom}`
        );


        /* =================================================
           JOIN CONVERSATION
        ================================================= */

        socket.on(
            "join_conversation",
            (conversationId) => {

                if (
                    !conversationId
                ) {
                    return;
                }


                const room =
                    String(
                        conversationId
                    );


                socket.join(
                    room
                );


                console.log(
                    `💬 User ${userId} joined conversation: ${room}`
                );
            }
        );


        /* =================================================
           LEAVE CONVERSATION
        ================================================= */

        socket.on(
            "leave_conversation",
            (conversationId) => {

                if (
                    !conversationId
                ) {
                    return;
                }


                const room =
                    String(
                        conversationId
                    );


                socket.leave(
                    room
                );


                console.log(
                    `🚪 User ${userId} left conversation: ${room}`
                );
            }
        );


        /* =================================================
           TYPING
        ================================================= */

        socket.on(
            "typing",
            (data) => {

                if (
                    !data ||
                    !data.conversationId
                ) {

                    return;
                }


                const room =
                    String(
                        data.conversationId
                    );


                /*
                 * Do not trust a client-supplied
                 * userId.
                 */

                socket
                    .to(room)
                    .emit(
                        "typing",
                        {
                            conversationId:
                                data.conversationId,

                            userId
                        }
                    );
            }
        );


        /* =================================================
           STOP TYPING
        ================================================= */

        socket.on(
            "stop_typing",
            (data) => {

                if (
                    !data ||
                    !data.conversationId
                ) {

                    return;
                }


                const room =
                    String(
                        data.conversationId
                    );


                socket
                    .to(room)
                    .emit(
                        "stop_typing",
                        {
                            conversationId:
                                data.conversationId,

                            userId
                        }
                    );
            }
        );


        /* =================================================
           DISCONNECT
        ================================================= */

        socket.on(
            "disconnect",
            (reason) => {

                console.log(
                    `🔴 Socket Disconnected: ${socket.id} | User: ${userId}`,
                    reason
                );
            }
        );


        /* =================================================
           SOCKET ERROR
        ================================================= */

        socket.on(
            "error",
            (error) => {

                console.error(
                    `❌ Socket Error [${socket.id}] User ${userId}:`,
                    error
                );
            }
        );
    }
);


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
    "/api/health",
    async (req, res) => {

        try {

            await sequelize.authenticate();


            return res
                .status(200)
                .json({

                    success:
                        true,

                    status:
                        "healthy",

                    environment:
                        NODE_ENV,

                    database:
                        "connected",

                    socket:
                        "enabled",

                    timestamp:
                        new Date()
                            .toISOString()
                });

        } catch (error) {

            console.error(
                "Health check database error:",
                error.message
            );


            return res
                .status(503)
                .json({

                    success:
                        false,

                    status:
                        "unhealthy",

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

        return res
            .status(200)
            .json({

                success:
                    true,

                message:
                    "🚀 KAD Marketplace API Running",

                environment:
                    NODE_ENV,

                api:
                    `${SITE_URL}/api`,

                sitemap:
                    `${SITE_URL}/sitemap.xml`,

                robots:
                    `${SITE_URL}/robots.txt`,

                socket:
                    "/socket.io"
            });
    }
);


/* =========================================================
   PUBLIC AUTH
========================================================= */

app.use(
    "/api/auth",
    authRoutes
);


/* =========================================================
   PUBLIC SETTINGS
========================================================= */

app.use(
    "/api/settings",
    settingsRoutes
);


/* =========================================================
   USER SETTINGS
========================================================= */

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
   PRODUCTION FRONTEND
========================================================= */

if (
    NODE_ENV ===
    "production"
) {

    /*
     * Serve React/Vite production files.
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
     * React SPA fallback.
     */

    app.use(
        (
            req,
            res,
            next
        ) => {

            if (
                req.method !== "GET" &&
                req.method !== "HEAD"
            ) {

                return next();
            }


            /*
             * Never send index.html for
             * backend/static endpoints.
             */

            if (
                req.path.startsWith(
                    "/api"
                ) ||

                req.path.startsWith(
                    "/uploads"
                ) ||

                req.path.startsWith(
                    "/socket.io"
                ) ||

                req.path ===
                    "/sitemap.xml" ||

                req.path ===
                    "/robots.txt"
            ) {

                return next();
            }


            /*
             * Only browser HTML requests
             * should receive index.html.
             */

            const acceptHeader =
                req.headers.accept ||
                "";


            if (
                !acceptHeader.includes(
                    "text/html"
                )
            ) {

                return next();
            }


            const indexPath =
                path.join(
                    clientDistPath,
                    "index.html"
                );


            if (
                !fs.existsSync(
                    indexPath
                )
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
    (
        req,
        res
    ) => {

        return res
            .status(404)
            .json({

                success:
                    false,

                message:
                    `Route not found: ${req.method} ${req.originalUrl}`
            });
    }
);


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "SERVER ERROR:",
            error
        );


        /*
         * CORS
         */

        if (
            error.message &&
            (
                error.message.includes(
                    "CORS"
                ) ||

                error.message.includes(
                    "Not allowed by CORS"
                )
            )
        ) {

            return res
                .status(403)
                .json({

                    success:
                        false,

                    message:
                        error.message
                });
        }


        /*
         * Multer
         */

        if (
            error.name ===
            "MulterError"
        ) {

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        error.message ||
                        "File upload error."
                });
        }


        /*
         * JWT
         */

        if (
            error.name ===
            "JsonWebTokenError"
        ) {

            return res
                .status(401)
                .json({

                    success:
                        false,

                    message:
                        "Invalid authentication token."
                });
        }


        if (
            error.name ===
            "TokenExpiredError"
        ) {

            return res
                .status(401)
                .json({

                    success:
                        false,

                    message:
                        "Authentication token expired."
                });
        }


        /*
         * Generic server error
         */

        return res
            .status(
                error.status ||
                500
            )
            .json({

                success:
                    false,

                message:
                    NODE_ENV ===
                    "production"

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

let promotionExpiryInterval =
    null;


const startPromotionExpiryChecker =
    () => {

        if (
            promotionExpiryInterval
        ) {

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
         * Run immediately.
         */

        checkExpiredPromotions();


        /*
         * Then every minute.
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

const startServer =
    async () => {

        try {

            /*
             * Validate critical environment
             * variables before starting.
             */

            if (
                !JWT_SECRET
            ) {

                throw new Error(
                    "JWT_SECRET is missing from environment variables."
                );
            }


            /* ==============================================
               DATABASE
            ============================================== */

            await sequelize.authenticate();


            console.log(
                "✅ MySQL Connected Successfully"
            );


            /* ==============================================
               DATABASE SYNC
            ============================================== */

            await sequelize.sync();


            console.log(
                "✅ Database Synced Successfully"
            );


            /* ==============================================
               ROLES + PERMISSIONS
            ============================================== */

            const seedRolesAndPermissions =
                require(
                    "./seeders/rolePermissionSeeder"
                );


            await seedRolesAndPermissions();


            console.log(
                "✅ Roles and permissions checked."
            );


            /* ==============================================
               BACKGROUND SERVICES
            ============================================== */

            startPromotionExpiryChecker();


            /* ==============================================
               SERVER
            ============================================== */

            server.listen(
                PORT,
                "0.0.0.0",
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
                        `📁 Frontend: ${clientDistPath}`
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

const shutdown =
    async (signal) => {

        console.log(
            `\n${signal} received. Shutting down...`
        );


        try {

            /*
             * Stop promotion checker.
             */

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


            /*
             * Close Socket.IO.
             */

            await new Promise(
                (
                    resolve
                ) => {

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


            /*
             * Close HTTP server.
             */

            await new Promise(
                (
                    resolve
                ) => {

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


            /*
             * Close database.
             */

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
    () => shutdown(
        "SIGTERM"
    )
);


process.on(
    "SIGINT",
    () => shutdown(
        "SIGINT"
    )
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
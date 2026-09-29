import { useEffect } from "react";
import api from "../config/axios";

const SITE_URL = (
    import.meta.env.VITE_SITE_URL ||
    "https://kadmarket.com"
).replace(/\/+$/, "");

const GOOGLE_ANALYTICS_ID =
    import.meta.env.VITE_GOOGLE_ANALYTICS_ID || "";


/* =========================================================
   META TAG
========================================================= */

function setMetaTag({
    name,
    property,
    content
}) {
    if (!content) {
        return;
    }

    const selector = name
        ? `meta[name="${name}"]`
        : `meta[property="${property}"]`;

    let element =
        document.head.querySelector(selector);

    if (!element) {
        element = document.createElement("meta");

        if (name) {
            element.setAttribute("name", name);
        }

        if (property) {
            element.setAttribute("property", property);
        }

        document.head.appendChild(element);
    }

    element.setAttribute(
        "content",
        String(content)
    );
}


/* =========================================================
   LINK TAG
========================================================= */

function setLinkTag({
    rel,
    href,
    type
}) {
    if (!href) {
        return;
    }

    let element =
        document.head.querySelector(
            `link[rel="${rel}"]`
        );

    if (!element) {
        element = document.createElement("link");

        element.setAttribute(
            "rel",
            rel
        );

        document.head.appendChild(element);
    }

    element.setAttribute(
        "href",
        href
    );

    if (type) {
        element.setAttribute(
            "type",
            type
        );
    }
}


/* =========================================================
   FAVICON
========================================================= */

function setFavicon(favicon) {
    if (!favicon) {
        return;
    }

    let element =
        document.head.querySelector(
            'link[rel="icon"]'
        );

    if (!element) {
        element = document.createElement("link");

        element.setAttribute(
            "rel",
            "icon"
        );

        document.head.appendChild(element);
    }

    element.setAttribute(
        "href",
        favicon
    );

    element.setAttribute(
        "type",
        "image/png"
    );
}


/* =========================================================
   BOOLEAN
========================================================= */

function toBoolean(
    value,
    fallback = true
) {
    if (
        value === true ||
        value === 1 ||
        value === "1" ||
        value === "true" ||
        value === "yes"
    ) {
        return true;
    }

    if (
        value === false ||
        value === 0 ||
        value === "0" ||
        value === "false" ||
        value === "no"
    ) {
        return false;
    }

    return fallback;
}


/* =========================================================
   NORMALIZE URL
========================================================= */

function normalizeUrl(url) {
    if (!url) {
        return "";
    }

    const value =
        String(url).trim();

    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    if (value.startsWith("//")) {
        return `https:${value}`;
    }

    if (value.startsWith("/")) {
        return `${SITE_URL}${value}`;
    }

    return `${SITE_URL}/${value}`;
}


/* =========================================================
   CANONICAL URL
========================================================= */

function getCanonicalUrl(canonical) {
    if (canonical) {
        return normalizeUrl(canonical);
    }

    return `${SITE_URL}${window.location.pathname}`;
}


/* =========================================================
   GOOGLE ANALYTICS 4
========================================================= */

function loadGoogleAnalytics(
    analyticsId
) {
    if (!analyticsId) {
        return;
    }

    const existingScript =
        document.querySelector(
            `script[data-kad-ga="${analyticsId}"]`
        );

    if (existingScript) {
        return;
    }

    const script =
        document.createElement("script");

    script.async = true;

    script.src =
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
            analyticsId
        )}`;

    script.setAttribute(
        "data-kad-ga",
        analyticsId
    );

    document.head.appendChild(script);


    if (!window.dataLayer) {
        window.dataLayer = [];
    }

    if (!window.gtag) {
        window.gtag = function () {
            window.dataLayer.push(
                arguments
            );
        };
    }

    window.gtag(
        "js",
        new Date()
    );

    window.gtag(
        "config",
        analyticsId,
        {
            send_page_view: true
        }
    );
}


/* =========================================================
   GOOGLE VERIFICATION
========================================================= */

function setGoogleVerification(
    verificationCode
) {
    if (!verificationCode) {
        return;
    }

    setMetaTag({
        name: "google-site-verification",
        content: verificationCode
    });
}


/* =========================================================
   STRUCTURED DATA
========================================================= */

function setStructuredData(
    structuredData
) {
    const SCRIPT_ID =
        "kad-marketplace-structured-data";

    const existing =
        document.getElementById(
            SCRIPT_ID
        );

    if (existing) {
        existing.remove();
    }

    if (!structuredData) {
        return;
    }

    const script =
        document.createElement(
            "script"
        );

    script.id =
        SCRIPT_ID;

    script.type =
        "application/ld+json";

    script.textContent =
        JSON.stringify(
            structuredData
        );

    document.head.appendChild(
        script
    );
}


/* =========================================================
   DEFAULT WEBSITE SCHEMA
========================================================= */

function createWebsiteStructuredData(
    marketplaceName,
    description
) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",

        name: marketplaceName,

        description: description,

        url: SITE_URL,

        potentialAction: {
            "@type": "SearchAction",

            target: {
                "@type": "EntryPoint",

                urlTemplate:
                    `${SITE_URL}/search?q={search_term_string}`
            },

            "query-input":
                "required name=search_term_string"
        }
    };
}


/* =========================================================
   SEO COMPONENT
========================================================= */

function SEO({
    title,
    description,
    keywords,
    image,
    canonical,
    noIndex = false,
    structuredData,
    children
}) {
    useEffect(() => {

        let cancelled = false;


        /* =================================================
           APPLY SEO
        ================================================= */

        const applySEO = (
            settings = {}
        ) => {

            if (cancelled) {
                return;
            }


            /* =============================================
               MARKETPLACE NAME
            ============================================= */

            const marketplaceName =
                settings.marketplace_name ||
                "KAD Marketplace Ghana";


            /* =============================================
               TITLE
            ============================================= */

            const seoTitle =
                title ||
                settings.seo_title ||
                marketplaceName;


            /* =============================================
               DESCRIPTION
            ============================================= */

            const seoDescription =
                description ||
                settings.seo_description ||
                `Buy and sell products, services and opportunities on ${marketplaceName}.`;


            /* =============================================
               KEYWORDS
            ============================================= */

            const seoKeywords =
                keywords ||
                settings.seo_keywords ||
                "KAD Marketplace, Ghana marketplace, buy and sell Ghana, online marketplace Ghana";


            /* =============================================
               IMAGE
            ============================================= */

            const seoImage =
                normalizeUrl(
                    image ||
                    settings.logo ||
                    "/favicon.svg"
                );


            /* =============================================
               CANONICAL
            ============================================= */

            const currentCanonical =
                getCanonicalUrl(
                    canonical
                );


            /* =============================================
               SEARCH ENGINE INDEXING
            ============================================= */

            const indexingEnabled =
                toBoolean(
                    settings.search_engine_indexing,
                    true
                );


            /* =============================================
               PRIVATE ROUTES
            ============================================= */

            const pathname =
                window.location.pathname;

            const privateRoute =
                pathname === "/login" ||
                pathname === "/register" ||
                pathname === "/forgot-password" ||
                pathname === "/verify-reset" ||
                pathname === "/reset-password" ||
                pathname === "/verify-login-otp" ||
                pathname === "/dashboard" ||
                pathname === "/sell" ||
                pathname === "/profile" ||
                pathname === "/inbox" ||
                pathname.startsWith("/chat/") ||
                pathname === "/notifications" ||
                pathname === "/promotions" ||
                pathname === "/promotion-success" ||
                pathname === "/payment-success" ||
                pathname === "/payment-failed" ||
                pathname === "/edit-product" ||
                pathname.startsWith("/edit-product/") ||
                pathname === "/seller/leads" ||
                pathname === "/wishlist" ||
                pathname === "/support" ||
                pathname === "/my-tickets" ||
                pathname.startsWith("/my-tickets/") ||
                pathname.startsWith("/admin/");


            /* =============================================
               ROBOTS
            ============================================= */

            const robotsContent =
                noIndex ||
                privateRoute ||
                !indexingEnabled
                    ? "noindex, nofollow"
                    : "index, follow";


            /* =============================================
               TITLE
            ============================================= */

            document.title =
                seoTitle;


            /* =============================================
               DESCRIPTION
            ============================================= */

            setMetaTag({
                name: "description",
                content:
                    seoDescription.substring(
                        0,
                        160
                    )
            });


            /* =============================================
               KEYWORDS
            ============================================= */

            setMetaTag({
                name: "keywords",
                content: seoKeywords
            });


            /* =============================================
               ROBOTS
            ============================================= */

            setMetaTag({
                name: "robots",
                content: robotsContent
            });


            /* =============================================
               GOOGLEBOT
            ============================================= */

            setMetaTag({
                name: "googlebot",
                content: robotsContent
            });


            /* =============================================
               GOOGLE SEARCH CONSOLE
            ============================================= */

            const verificationCode =
                settings.google_site_verification ||
                import.meta.env
                    .VITE_GOOGLE_SITE_VERIFICATION;

            if (verificationCode) {
                setGoogleVerification(
                    verificationCode
                );
            }


            /* =============================================
               OPEN GRAPH
            ============================================= */

            const ogTitle =
                settings.og_title ||
                seoTitle;

            const ogDescription =
                settings.og_description ||
                seoDescription;


            setMetaTag({
                property: "og:title",
                content: ogTitle
            });

            setMetaTag({
                property: "og:description",
                content: ogDescription
            });

            setMetaTag({
                property: "og:type",
                content:
                    structuredData?.["@type"] ===
                    "Product"
                        ? "product"
                        : "website"
            });

            setMetaTag({
                property: "og:url",
                content:
                    currentCanonical
            });

            setMetaTag({
                property: "og:site_name",
                content:
                    marketplaceName
            });

            setMetaTag({
                property: "og:image",
                content:
                    seoImage
            });

            setMetaTag({
                property: "og:image:alt",
                content:
                    seoTitle
            });


            /* =============================================
               TWITTER / X
            ============================================= */

            setMetaTag({
                name: "twitter:card",
                content:
                    "summary_large_image"
            });

            setMetaTag({
                name: "twitter:title",
                content:
                    ogTitle
            });

            setMetaTag({
                name: "twitter:description",
                content:
                    ogDescription
            });

            setMetaTag({
                name: "twitter:image",
                content:
                    seoImage
            });


            /* =============================================
               CANONICAL
            ============================================= */

            setLinkTag({
                rel: "canonical",
                href:
                    currentCanonical
            });


            /* =============================================
               FAVICON
            ============================================= */

            if (settings.favicon) {
                setFavicon(
                    normalizeUrl(
                        settings.favicon
                    )
                );
            }


            /* =============================================
               THEME COLOR
            ============================================= */

            setMetaTag({
                name: "theme-color",
                content:
                    settings.primary_color ||
                    "#0D8ABC"
            });


            /* =============================================
               STRUCTURED DATA
            ============================================= */

            const schema =
                structuredData ||
                createWebsiteStructuredData(
                    marketplaceName,
                    seoDescription
                );

            setStructuredData(
                schema
            );


            /* =============================================
               GOOGLE ANALYTICS
            ============================================= */

            const analyticsId =
                settings.google_analytics_id ||
                GOOGLE_ANALYTICS_ID;

            const analyticsEnabled =
                toBoolean(
                    settings.analytics_enabled,
                    Boolean(
                        GOOGLE_ANALYTICS_ID
                    )
                );

            if (
                analyticsEnabled &&
                analyticsId
            ) {
                loadGoogleAnalytics(
                    analyticsId
                );
            }
        };


        /* =================================================
           LOAD PUBLIC SETTINGS
        ================================================= */

        const loadSettings =
            async () => {

                try {

                    const response =
                        await api.get(
                            "/settings/public"
                        );

                    const result =
                        response.data;


                    if (
                        result?.success &&
                        result?.settings
                    ) {

                        applySEO(
                            result.settings
                        );

                    } else {

                        applySEO();

                    }

                } catch (error) {

                    console.error(
                        "SEO SETTINGS ERROR:",
                        error.response?.data ||
                        error.message
                    );

                    applySEO();
                }
            };


        loadSettings();


        /* =================================================
           CLEANUP
        ================================================= */

        return () => {
            cancelled = true;
        };

    }, [
        title,
        description,
        keywords,
        image,
        canonical,
        noIndex,
        structuredData
    ]);


    return children || null;
}


export default SEO;
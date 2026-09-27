import { useEffect } from "react";

/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const SITE_URL =
    import.meta.env.VITE_SITE_URL ||
    "https://kadmarket.com";


/* =========================================================
   HELPERS
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

        element =
            document.createElement("meta");

        if (name) {
            element.setAttribute(
                "name",
                name
            );
        }

        if (property) {
            element.setAttribute(
                "property",
                property
            );
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
    href
}) {

    if (!href) {
        return;
    }

    let element =
        document.head.querySelector(
            `link[rel="${rel}"]`
        );

    if (!element) {

        element =
            document.createElement("link");

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

        element =
            document.createElement("link");

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
   BOOLEAN CONVERTER
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

    const value = String(url).trim();

    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    if (value.startsWith("/")) {
        return `${SITE_URL}${value}`;
    }

    return value;
}


/* =========================================================
   GOOGLE ANALYTICS
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

    /* -----------------------------------------
       Google Analytics library
    ----------------------------------------- */

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


    /* -----------------------------------------
       Google Analytics configuration
    ----------------------------------------- */

    if (
        !document.querySelector(
            `script[data-kad-ga-config="${analyticsId}"]`
        )
    ) {

        const configScript =
            document.createElement("script");

        configScript.setAttribute(
            "data-kad-ga-config",
            analyticsId
        );

        configScript.textContent = `
            window.dataLayer =
                window.dataLayer || [];

            function gtag() {
                window.dataLayer.push(arguments);
            }

            gtag(
                "js",
                new Date()
            );

            gtag(
                "config",
                "${analyticsId}"
            );
        `;

        document.head.appendChild(
            configScript
        );
    }
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


            /* ---------------------------------------------
               MARKETPLACE
            --------------------------------------------- */

            const marketplaceName =
                settings.marketplace_name ||
                "KAD Marketplace Ghana";


            /* ---------------------------------------------
               TITLE
            --------------------------------------------- */

            const seoTitle =
                title ||
                settings.seo_title ||
                marketplaceName;


            /* ---------------------------------------------
               DESCRIPTION
            --------------------------------------------- */

            const seoDescription =
                description ||
                settings.seo_description ||
                `Buy and sell products on ${marketplaceName}.`;


            /* ---------------------------------------------
               KEYWORDS
            --------------------------------------------- */

            const seoKeywords =
                keywords ||
                settings.seo_keywords ||
                "";


            /* ---------------------------------------------
               OPEN GRAPH
            --------------------------------------------- */

            const ogTitle =
                settings.og_title ||
                seoTitle;

            const ogDescription =
                settings.og_description ||
                seoDescription;


            /* ---------------------------------------------
               IMAGE
            --------------------------------------------- */

            const seoImage =
                normalizeUrl(
                    image ||
                    settings.logo ||
                    `${SITE_URL}/favicon.svg`
                );


            /* ---------------------------------------------
               CANONICAL
            --------------------------------------------- */

            const currentPath =
                window.location.pathname;

            const currentCanonical =
                canonical ||
                `${SITE_URL}${currentPath}`;


            /* ---------------------------------------------
               SEARCH ENGINE INDEXING
            --------------------------------------------- */

            const indexingEnabled =
                toBoolean(
                    settings.search_engine_indexing,
                    true
                );

            const shouldNoIndex =
                noIndex === true ||
                !indexingEnabled;


            /* =================================================
               PAGE TITLE
            ================================================= */

            document.title =
                seoTitle;


            /* =================================================
               BASIC SEO
            ================================================= */

            setMetaTag({
                name: "description",
                content: seoDescription
            });


            if (seoKeywords) {

                setMetaTag({
                    name: "keywords",
                    content: seoKeywords
                });

            }


            /* =================================================
               ROBOTS
            ================================================= */

          const pathname = window.location.pathname;

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

const robotsContent =
    noIndex || privateRoute
        ? "noindex, nofollow"
        : "index, follow";

setMetaTag(
    "robots",
    robotsContent
);

            /* =================================================
               GOOGLE SEARCH CONSOLE
            ================================================= */

            if (
                settings.google_site_verification
            ) {

                setMetaTag({
                    name:
                        "google-site-verification",
                    content:
                        settings.google_site_verification
                });

            }


            /* =================================================
               OPEN GRAPH
            ================================================= */

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
                content: "website"
            });

            setMetaTag({
                property: "og:url",
                content: currentCanonical
            });

            setMetaTag({
                property: "og:site_name",
                content: marketplaceName
            });

            setMetaTag({
                property: "og:image",
                content: seoImage
            });

            setMetaTag({
                property: "og:image:alt",
                content: ogTitle
            });


            /* =================================================
               TWITTER / X
            ================================================= */

            setMetaTag({
                name: "twitter:card",
                content: "summary_large_image"
            });

            setMetaTag({
                name: "twitter:title",
                content: ogTitle
            });

            setMetaTag({
                name: "twitter:description",
                content: ogDescription
            });

            setMetaTag({
                name: "twitter:image",
                content: seoImage
            });


            /* =================================================
               CANONICAL
            ================================================= */

            setLinkTag({
                rel: "canonical",
                href: currentCanonical
            });


            /* =================================================
               FAVICON
            ================================================= */

            if (settings.favicon) {

                setFavicon(
                    normalizeUrl(
                        settings.favicon
                    )
                );

            }


            /* =================================================
               THEME COLOR
            ================================================= */

            if (
                settings.primary_color
            ) {

                setMetaTag({
                    name: "theme-color",
                    content:
                        settings.primary_color
                });

            }


            /* =================================================
               GOOGLE ANALYTICS
            ================================================= */

            const analyticsId =
                settings.google_analytics_id;

            const analyticsEnabled =
                toBoolean(
                    settings.analytics_enabled,
                    false
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

                    /*
                     * IMPORTANT:
                     * Public SEO settings are available at
                     *
                     * /api/settings/public
                     *
                     * NOT /api/settings
                     */

                    const response =
                        await fetch(
                            `${API_BASE_URL}/settings/public`,
                            {
                                method: "GET",
                                headers: {
                                    Accept:
                                        "application/json"
                                }
                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            `Settings request failed: ${response.status}`
                        );

                    }


                    const result =
                        await response.json();


                    if (
                        result?.success &&
                        result?.settings
                    ) {

                        applySEO(
                            result.settings
                        );

                    }
                    else {

                        applySEO();

                    }

                }

                catch (error) {

                    console.error(
                        "SEO SETTINGS ERROR:",
                        error
                    );

                    /*
                     * Even if the backend is temporarily
                     * unavailable, still apply fallback SEO.
                     */

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
        noIndex
    ]);


    return children || null;
}


export default SEO;
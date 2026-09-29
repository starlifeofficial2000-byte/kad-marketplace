import { useEffect } from "react";

function SEOManager({ settings }) {
    useEffect(() => {
        const seo = settings?.configuration?.seo || {};

        /*
        =====================================================
        GOOGLE SEARCH CONSOLE VERIFICATION
        =====================================================
        */

        const verification =
            typeof seo.googleSiteVerification === "string"
                ? seo.googleSiteVerification.trim()
                : "";

        let verificationTag = document.querySelector(
            'meta[name="google-site-verification"]'
        );

        if (verification) {
            if (!verificationTag) {
                verificationTag = document.createElement("meta");

                verificationTag.setAttribute(
                    "name",
                    "google-site-verification"
                );

                document.head.appendChild(verificationTag);
            }

            verificationTag.setAttribute(
                "content",
                verification
            );
        } else if (verificationTag) {
            verificationTag.remove();
        }

        /*
        =====================================================
        PAGE TITLE
        =====================================================
        */

        const title =
            typeof seo.title === "string"
                ? seo.title.trim()
                : "";

        if (title) {
            document.title = title;
        }

        /*
        =====================================================
        META DESCRIPTION
        =====================================================
        */

        const description =
            typeof seo.description === "string"
                ? seo.description.trim()
                : "";

        let descriptionTag = document.querySelector(
            'meta[name="description"]'
        );

        if (description) {
            if (!descriptionTag) {
                descriptionTag = document.createElement("meta");

                descriptionTag.setAttribute(
                    "name",
                    "description"
                );

                document.head.appendChild(descriptionTag);
            }

            descriptionTag.setAttribute(
                "content",
                description
            );
        } else if (descriptionTag) {
            descriptionTag.remove();
        }

        /*
        =====================================================
        OPEN GRAPH TITLE
        =====================================================
        */

        const openGraphTitle =
            typeof seo.openGraphTitle === "string"
                ? seo.openGraphTitle.trim()
                : title;

        let ogTitleTag = document.querySelector(
            'meta[property="og:title"]'
        );

        if (openGraphTitle) {
            if (!ogTitleTag) {
                ogTitleTag = document.createElement("meta");

                ogTitleTag.setAttribute(
                    "property",
                    "og:title"
                );

                document.head.appendChild(ogTitleTag);
            }

            ogTitleTag.setAttribute(
                "content",
                openGraphTitle
            );
        }

        /*
        =====================================================
        OPEN GRAPH DESCRIPTION
        =====================================================
        */

        const openGraphDescription =
            typeof seo.openGraphDescription === "string"
                ? seo.openGraphDescription.trim()
                : description;

        let ogDescriptionTag = document.querySelector(
            'meta[property="og:description"]'
        );

        if (openGraphDescription) {
            if (!ogDescriptionTag) {
                ogDescriptionTag = document.createElement("meta");

                ogDescriptionTag.setAttribute(
                    "property",
                    "og:description"
                );

                document.head.appendChild(
                    ogDescriptionTag
                );
            }

            ogDescriptionTag.setAttribute(
                "content",
                openGraphDescription
            );
        }

        /*
        =====================================================
        SEO KEYWORDS
        =====================================================
        */

        const keywords =
            typeof seo.keywords === "string"
                ? seo.keywords.trim()
                : "";

        let keywordsTag = document.querySelector(
            'meta[name="keywords"]'
        );

        if (keywords) {
            if (!keywordsTag) {
                keywordsTag = document.createElement("meta");

                keywordsTag.setAttribute(
                    "name",
                    "keywords"
                );

                document.head.appendChild(keywordsTag);
            }

            keywordsTag.setAttribute(
                "content",
                keywords
            );
        } else if (keywordsTag) {
            keywordsTag.remove();
        }

        /*
        =====================================================
        GOOGLE ANALYTICS
        =====================================================
        */

        const analyticsId =
            typeof seo.googleAnalyticsId === "string"
                ? seo.googleAnalyticsId.trim()
                : "";

        if (
            analyticsId &&
            /^G-[A-Z0-9]+$/i.test(analyticsId)
        ) {
            const existingScript = document.querySelector(
                `script[data-google-analytics="${analyticsId}"]`
            );

            if (!existingScript) {
                const script = document.createElement("script");

                script.async = true;

                script.src =
                    `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;

                script.setAttribute(
                    "data-google-analytics",
                    analyticsId
                );

                document.head.appendChild(script);

                const inlineScript =
                    document.createElement("script");

                inlineScript.setAttribute(
                    "data-google-analytics-config",
                    analyticsId
                );

                inlineScript.innerHTML = `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${analyticsId}');
                `;

                document.head.appendChild(
                    inlineScript
                );
            }
        }

        /*
        =====================================================
        CLEANUP
        =====================================================
        */

        return () => {
            // Do not remove the Google verification tag
            // during normal React re-renders.

            // React StrictMode may run effects twice.
            // Keeping the tags prevents unnecessary flickering.
        };

    }, [settings]);

    return null;
}

export default SEOManager;
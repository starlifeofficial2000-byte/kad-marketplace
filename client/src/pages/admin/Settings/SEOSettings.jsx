function SEOSettings({ settings, handleChange }) {

    /*
    =====================================================
    SEO CONFIGURATION
    =====================================================
    */

    const seo =
        settings?.configuration?.seo || {};


    /*
    =====================================================
    GET SEO VALUE
    =====================================================
    */

    const getValue = (
        key,
        fallback = ""
    ) => {

        const value = seo?.[key];

        if (
            value === undefined ||
            value === null
        ) {
            return fallback;
        }

        return value;

    };


    /*
    =====================================================
    GET BOOLEAN VALUE
    =====================================================
    */

    const isEnabled = (
        key,
        fallback = true
    ) => {

        const value =
            seo?.[key];

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return fallback;
        }

        if (
            value === true ||
            value === 1 ||
            value === "true" ||
            value === "1" ||
            value === "yes"
        ) {
            return true;
        }

        if (
            value === false ||
            value === 0 ||
            value === "false" ||
            value === "0" ||
            value === "no"
        ) {
            return false;
        }

        return fallback;

    };


    /*
    =====================================================
    UPDATE SEO
    =====================================================
    */

    const updateSEO = (
        key,
        value
    ) => {

        handleChange(
            "configuration",
            {
                ...(settings?.configuration || {}),

                seo: {

                    ...(settings?.configuration?.seo || {}),

                    [key]:
                        value

                }
            }
        );

    };


    /*
    =====================================================
    TOGGLE SEO
    =====================================================
    */

    const toggleSEO = (
        key
    ) => {

        updateSEO(
            key,
            !isEnabled(
                key,
                true
            )
        );

    };


    return (

        <div className="settings-section">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="section-header">

                <div>

                    <h2>
                        SEO Settings
                    </h2>

                    <p>
                        Control how KAD Marketplace appears
                        on Google and other search engines.
                    </p>

                </div>

            </div>


            {/* =================================================
                BASIC SEO
            ================================================= */}

            <div className="settings-card">

                <h3 className="settings-subtitle">
                    Basic SEO
                </h3>


                {/* =================================================
                    WEBSITE TITLE
                ================================================= */}

                <div className="form-group">

                    <label htmlFor="seo-title">
                        Website Title
                    </label>

                    <input
                        id="seo-title"
                        type="text"
                        value={getValue(
                            "title"
                        )}
                        onChange={(event) =>
                            updateSEO(
                                "title",
                                event.target.value
                            )
                        }
                        placeholder="KAD Marketplace | Buy & Sell in Ghana"
                        maxLength={70}
                    />

                    <small>
                        Recommended: 50–60 characters.
                    </small>

                </div>


                {/* =================================================
                    META DESCRIPTION
                ================================================= */}

                <div className="form-group">

                    <label htmlFor="seo-description">
                        Meta Description
                    </label>

                    <textarea
                        id="seo-description"
                        rows="4"
                        value={getValue(
                            "description"
                        )}
                        onChange={(event) =>
                            updateSEO(
                                "description",
                                event.target.value
                            )
                        }
                        placeholder="Buy and sell products and services across Ghana on KAD Marketplace."
                        maxLength={160}
                    />

                    <small>
                        Recommended: 150–160 characters.
                    </small>

                </div>


                {/* =================================================
                    KEYWORDS
                ================================================= */}

                <div className="form-group">

                    <label htmlFor="seo-keywords">
                        SEO Keywords
                    </label>

                    <input
                        id="seo-keywords"
                        type="text"
                        value={getValue(
                            "keywords"
                        )}
                        onChange={(event) =>
                            updateSEO(
                                "keywords",
                                event.target.value
                            )
                        }
                        placeholder="Ghana marketplace, buy and sell Ghana, online marketplace"
                    />

                    <small>
                        Separate keywords with commas.
                    </small>

                </div>

            </div>


            {/* =================================================
                GOOGLE
            ================================================= */}

            <div className="settings-card">

                <h3 className="settings-subtitle">
                    Google
                </h3>


                {/* =================================================
                    GOOGLE ANALYTICS
                ================================================= */}

                <div className="form-group">

                    <label htmlFor="google-analytics">
                        Google Analytics Measurement ID
                    </label>

                    <input
                        id="google-analytics"
                        type="text"
                        value={getValue(
                            "googleAnalyticsId"
                        )}
                        onChange={(event) =>
                            updateSEO(
                                "googleAnalyticsId",
                                event.target.value
                            )
                        }
                        placeholder="G-XXXXXXXXXX"
                    />

                </div>


                {/* =================================================
                    SEARCH CONSOLE
                ================================================= */}

                <div className="form-group">

                    <label htmlFor="google-verification">
                        Google Search Console Verification
                    </label>

                    <input
                        id="google-verification"
                        type="text"
                        value={getValue(
                            "googleSiteVerification"
                        )}
                        onChange={(event) =>
                            updateSEO(
                                "googleSiteVerification",
                                event.target.value
                            )
                        }
                        placeholder="Google verification code"
                    />

                </div>

            </div>


            {/* =================================================
                SOCIAL / OPEN GRAPH
            ================================================= */}

            <div className="settings-card">

                <h3 className="settings-subtitle">
                    Social Media
                </h3>


                {/* =================================================
                    OPEN GRAPH TITLE
                ================================================= */}

                <div className="form-group">

                    <label htmlFor="og-title">
                        Open Graph Title
                    </label>

                    <input
                        id="og-title"
                        type="text"
                        value={getValue(
                            "openGraphTitle"
                        )}
                        onChange={(event) =>
                            updateSEO(
                                "openGraphTitle",
                                event.target.value
                            )
                        }
                        placeholder="KAD Marketplace | Buy & Sell in Ghana"
                        maxLength={200}
                    />

                </div>


                {/* =================================================
                    OPEN GRAPH DESCRIPTION
                ================================================= */}

                <div className="form-group">

                    <label htmlFor="og-description">
                        Open Graph Description
                    </label>

                    <textarea
                        id="og-description"
                        rows="4"
                        value={getValue(
                            "openGraphDescription"
                        )}
                        onChange={(event) =>
                            updateSEO(
                                "openGraphDescription",
                                event.target.value
                            )
                        }
                        placeholder="Buy and sell products and services across Ghana."
                        maxLength={320}
                    />

                </div>

            </div>


            {/* =================================================
                SEARCH ENGINE VISIBILITY
            ================================================= */}

            <div className="settings-card">

                <h3 className="settings-subtitle">
                    Search Engine Visibility
                </h3>


                {/* =================================================
                    SEARCH ENGINE INDEXING
                ================================================= */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Allow Search Engine Indexing
                        </strong>

                        <p>
                            Allow Google and other search engines
                            to index public marketplace pages.
                        </p>

                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "searchEngineIndexing",
                            true
                        )}
                        onChange={() =>
                            toggleSEO(
                                "searchEngineIndexing"
                            )
                        }
                    />

                </div>


                {/* =================================================
                    XML SITEMAP
                ================================================= */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Enable XML Sitemap
                        </strong>

                        <p>
                            Allow search engines to discover
                            public marketplace pages through
                            the XML sitemap.
                        </p>

                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "sitemapEnabled",
                            true
                        )}
                        onChange={() =>
                            toggleSEO(
                                "sitemapEnabled"
                            )
                        }
                    />

                </div>

            </div>


            {/* =================================================
                SEO STATUS
            ================================================= */}

            <div className="settings-info">

                <strong>
                    SEO Status
                </strong>


                <p>
                    Indexing:{" "}
                    {isEnabled(
                        "searchEngineIndexing",
                        true
                    )
                        ? "Enabled"
                        : "Disabled"}
                </p>


                <p>
                    Sitemap:{" "}
                    {isEnabled(
                        "sitemapEnabled",
                        true
                    )
                        ? "Enabled"
                        : "Disabled"}
                </p>


                <p>
                    Google Analytics:{" "}
                    {getValue(
                        "googleAnalyticsId"
                    )
                        ? "Configured"
                        : "Not configured"}
                </p>


                <p>
                    Search Console:{" "}
                    {getValue(
                        "googleSiteVerification"
                    )
                        ? "Configured"
                        : "Not configured"}
                </p>

            </div>

        </div>

    );

}


export default SEOSettings;
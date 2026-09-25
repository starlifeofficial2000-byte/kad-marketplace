function SEOSettings({ settings, handleChange }) {
    const isEnabled = (key, fallback = true) => {
        const value = settings?.[key];

        if (value === undefined || value === null || value === "") {
            return fallback;
        }

        return value === true || value === "true";
    };

    const toggle = (key) => {
        handleChange(key, (!isEnabled(key)).toString());
    };

    return (
        <div className="settings-section">

            {/* =====================================
                HEADER
            ====================================== */}

            <div className="section-header">
                <div>
                    <h2>SEO Settings</h2>

                    <p>
                        Configure how your marketplace appears on
                        Google and other search engines.
                    </p>
                </div>
            </div>

            {/* =====================================
                SEARCH ENGINE SETTINGS
            ====================================== */}

            <div className="settings-card">

                <h3 className="settings-subtitle">
                    Search Engine Optimization
                </h3>

                {/* WEBSITE TITLE */}

                <div className="form-group">
                    <label htmlFor="seo_title">
                        Website Title
                    </label>

                    <input
                        id="seo_title"
                        type="text"
                        value={settings?.seo_title || ""}
                        onChange={(e) =>
                            handleChange(
                                "seo_title",
                                e.target.value
                            )
                        }
                        placeholder="e.g. Ghana's Best Online Marketplace"
                        maxLength={70}
                    />

                    <small>
                        The main title displayed in search engine
                        results.
                    </small>
                </div>

                {/* META DESCRIPTION */}

                <div className="form-group">
                    <label htmlFor="seo_description">
                        Meta Description
                    </label>

                    <textarea
                        id="seo_description"
                        rows="4"
                        value={settings?.seo_description || ""}
                        onChange={(e) =>
                            handleChange(
                                "seo_description",
                                e.target.value
                            )
                        }
                        placeholder="Describe your marketplace for search engines..."
                        maxLength={320}
                    />

                    <small>
                        Recommended length: approximately 150–160
                        characters.
                    </small>
                </div>

                {/* SEO KEYWORDS */}

                <div className="form-group">
                    <label htmlFor="seo_keywords">
                        SEO Keywords
                    </label>

                    <input
                        id="seo_keywords"
                        type="text"
                        value={settings?.seo_keywords || ""}
                        onChange={(e) =>
                            handleChange(
                                "seo_keywords",
                                e.target.value
                            )
                        }
                        placeholder="marketplace, buy and sell, Ghana, online shopping"
                    />

                    <small>
                        Separate keywords using commas.
                    </small>
                </div>

                {/* =====================================
                    GOOGLE
                ====================================== */}

                <h3 className="settings-subtitle">
                    Google Integration
                </h3>

                {/* GOOGLE ANALYTICS */}

                <div className="form-group">
                    <label htmlFor="google_analytics_id">
                        Google Analytics Measurement ID
                    </label>

                    <input
                        id="google_analytics_id"
                        type="text"
                        value={
                            settings?.google_analytics_id || ""
                        }
                        onChange={(e) =>
                            handleChange(
                                "google_analytics_id",
                                e.target.value
                            )
                        }
                        placeholder="G-XXXXXXXXXX"
                    />

                    <small>
                        Optional. Used to connect the marketplace
                        to Google Analytics.
                    </small>
                </div>

                {/* GOOGLE SITE VERIFICATION */}

                <div className="form-group">
                    <label htmlFor="google_site_verification">
                        Google Site Verification Code
                    </label>

                    <input
                        id="google_site_verification"
                        type="text"
                        value={
                            settings?.google_site_verification || ""
                        }
                        onChange={(e) =>
                            handleChange(
                                "google_site_verification",
                                e.target.value
                            )
                        }
                        placeholder="Google verification code"
                    />

                    <small>
                        Used to verify ownership of your marketplace
                        in Google Search Console.
                    </small>
                </div>

                {/* =====================================
                    SOCIAL / OPEN GRAPH
                ====================================== */}

                <h3 className="settings-subtitle">
                    Social Media Sharing
                </h3>

                {/* OG TITLE */}

                <div className="form-group">
                    <label htmlFor="og_title">
                        Social Media Title
                    </label>

                    <input
                        id="og_title"
                        type="text"
                        value={settings?.og_title || ""}
                        onChange={(e) =>
                            handleChange(
                                "og_title",
                                e.target.value
                            )
                        }
                        placeholder="Title shown when sharing your website"
                        maxLength={200}
                    />

                    <small>
                        Used when your marketplace is shared on
                        Facebook, WhatsApp, LinkedIn, and other
                        platforms that support Open Graph metadata.
                    </small>
                </div>

                {/* OG DESCRIPTION */}

                <div className="form-group">
                    <label htmlFor="og_description">
                        Social Media Description
                    </label>

                    <textarea
                        id="og_description"
                        rows="4"
                        value={
                            settings?.og_description || ""
                        }
                        onChange={(e) =>
                            handleChange(
                                "og_description",
                                e.target.value
                            )
                        }
                        placeholder="Description shown when sharing your website"
                        maxLength={320}
                    />

                    <small>
                        Description displayed with your marketplace
                        when shared on supported social platforms.
                    </small>
                </div>

                {/* =====================================
                    INDEXING
                ====================================== */}

                <h3 className="settings-subtitle">
                    Search Engine Visibility
                </h3>

                <div className="toggle-setting">
                    <div>
                        <strong>
                            Allow Search Engine Indexing
                        </strong>

                        <p>
                            Allow Google, Bing, and other search
                            engines to index your marketplace.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "search_engine_indexing",
                            true
                        )}
                        onChange={() =>
                            toggle("search_engine_indexing")
                        }
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>
                            Enable XML Sitemap
                        </strong>

                        <p>
                            Allow search engines to discover
                            marketplace pages through an XML sitemap.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "enable_sitemap",
                            true
                        )}
                        onChange={() =>
                            toggle("enable_sitemap")
                        }
                    />
                </div>

            </div>

            {/* =====================================
                SEO STATUS
            ====================================== */}

            <div className="settings-info">

                <strong>
                    SEO Configuration Status
                </strong>

                <p>
                    Search Engine Indexing:{" "}
                    {isEnabled(
                        "search_engine_indexing",
                        true
                    )
                        ? "Enabled"
                        : "Disabled"}
                </p>

                <p>
                    XML Sitemap:{" "}
                    {isEnabled(
                        "enable_sitemap",
                        true
                    )
                        ? "Enabled"
                        : "Disabled"}
                </p>

                <p>
                    Google Analytics:{" "}
                    {settings?.google_analytics_id
                        ? "Configured"
                        : "Not configured"}
                </p>

                <p>
                    Google Search Console:{" "}
                    {settings?.google_site_verification
                        ? "Configured"
                        : "Not configured"}
                </p>

            </div>

            {/* =====================================
                SEO INFORMATION
            ====================================== */}

            <div className="settings-info">

                <strong>
                    💡 SEO Information
                </strong>

                <p>
                    These settings are saved in the marketplace
                    configuration. The public frontend must use the
                    saved values to generate page titles, meta
                    descriptions, Open Graph metadata, indexing
                    directives, and sitemap configuration.
                </p>

            </div>

        </div>
    );
}

export default SEOSettings;
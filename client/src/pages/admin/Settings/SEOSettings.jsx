function SEOSettings({

    settings,

    handleChange

}) {

    return (

        <div className="settings-section">


            {/* =====================================
               HEADER
            ====================================== */}

            <div className="section-header">

                <div>

                    <h2>
                        SEO Settings
                    </h2>

                    <p>
                        Configure how your marketplace appears on Google and other search engines.
                    </p>

                </div>

            </div>


            {/* =====================================
               SEO SETTINGS CARD
            ====================================== */}

            <div className="settings-card">


                {/* SITE TITLE */}

                <div className="form-group">

                    <label>
                        Website Title
                    </label>

                    <input

                        type="text"

                        value={
                            settings.seo_title || ""
                        }

                        onChange={(e) =>

                            handleChange(

                                "seo_title",

                                e.target.value

                            )

                        }

                        placeholder="e.g. Ghana's Best Online Marketplace"

                    />

                    <small>
                        The main title displayed in search engine results.
                    </small>

                </div>


                {/* META DESCRIPTION */}

                <div className="form-group">

                    <label>
                        Meta Description
                    </label>

                    <textarea

                        rows="4"

                        value={
                            settings.seo_description || ""
                        }

                        onChange={(e) =>

                            handleChange(

                                "seo_description",

                                e.target.value

                            )

                        }

                        placeholder="Describe your marketplace for search engines..."

                    />

                    <small>

                        Recommended length: 150–160 characters.

                    </small>

                </div>


                {/* SEO KEYWORDS */}

                <div className="form-group">

                    <label>
                        SEO Keywords
                    </label>

                    <input

                        type="text"

                        value={
                            settings.seo_keywords || ""
                        }

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


                {/* GOOGLE ANALYTICS */}

                <div className="form-group">

                    <label>
                        Google Analytics Measurement ID
                    </label>

                    <input

                        type="text"

                        value={
                            settings.google_analytics_id || ""
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

                        Optional. Used to connect your website to Google Analytics.

                    </small>

                </div>


                {/* GOOGLE SEARCH CONSOLE */}

                <div className="form-group">

                    <label>
                        Google Site Verification Code
                    </label>

                    <input

                        type="text"

                        value={
                            settings.google_site_verification || ""
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

                        Used to verify ownership of your website in Google Search Console.

                    </small>

                </div>


                {/* OG TITLE */}

                <div className="form-group">

                    <label>
                        Social Media Title
                    </label>

                    <input

                        type="text"

                        value={
                            settings.og_title || ""
                        }

                        onChange={(e) =>

                            handleChange(

                                "og_title",

                                e.target.value

                            )

                        }

                        placeholder="Title shown when sharing your website"

                    />

                    <small>

                        This title appears when your marketplace is shared on Facebook, WhatsApp, LinkedIn, etc.

                    </small>

                </div>


                {/* OG DESCRIPTION */}

                <div className="form-group">

                    <label>
                        Social Media Description
                    </label>

                    <textarea

                        rows="4"

                        value={
                            settings.og_description || ""
                        }

                        onChange={(e) =>

                            handleChange(

                                "og_description",

                                e.target.value

                            )

                        }

                        placeholder="Description shown when sharing your website"

                    />

                </div>


                {/* SEARCH ENGINE INDEXING */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Allow Search Engine Indexing
                        </strong>

                        <p>

                            Allow Google, Bing and other search engines to index your marketplace.

                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.search_engine_indexing !== "false"
                        }

                        onChange={(e) =>

                            handleChange(

                                "search_engine_indexing",

                                e.target.checked.toString()

                            )

                        }

                    />

                </div>


                {/* SITEMAP */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Enable XML Sitemap
                        </strong>

                        <p>

                            Allow search engines to discover your marketplace pages through a sitemap.

                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.enable_sitemap !== "false"
                        }

                        onChange={(e) =>

                            handleChange(

                                "enable_sitemap",

                                e.target.checked.toString()

                            )

                        }

                    />

                </div>


            </div>


            {/* =====================================
               SEO INFORMATION
            ====================================== */}

            <div className="settings-info">

                <strong>
                    💡 SEO Tip
                </strong>

                <p>

                    Changes made here will be saved in your marketplace settings.
                    To make them affect Google search results, your frontend must
                    dynamically use these settings for page titles and meta tags.

                </p>

            </div>


        </div>

    );

}


export default SEOSettings;
function AnalyticsSettings({ settings, handleChange }) {

    return (

        <div className="settings-section">


            {/* =====================================
                HEADER
            ====================================== */}

            <div className="section-header">

                <div>

                    <h2>Analytics Settings</h2>

                    <p>

                        Configure analytics and visitor tracking integrations.

                    </p>

                </div>

            </div>


            {/* =====================================
                ANALYTICS CONTROL
            ====================================== */}

            <div className="settings-card">

                <h3 className="settings-card-title">

                    Analytics Control

                </h3>


                <div className="toggle-setting">

                    <div>

                        <h4>

                            Enable Analytics

                        </h4>

                        <p>

                            Allow the marketplace to collect website traffic
                            and visitor analytics.

                        </p>

                    </div>


                    <label className="switch">

                        <input

                            type="checkbox"

                            checked={
                                settings.analytics_enabled === "true" ||
                                settings.analytics_enabled === true
                            }

                            onChange={(e) =>

                                handleChange(

                                    "analytics_enabled",

                                    e.target.checked

                                        ? "true"

                                        : "false"

                                )

                            }

                        />

                        <span className="slider"></span>

                    </label>

                </div>

            </div>


            {/* =====================================
                GOOGLE ANALYTICS
            ====================================== */}

            <div className="settings-card">

                <h3 className="settings-card-title">

                    Google Analytics

                </h3>


                <div className="form-group">

                    <label>

                        Google Analytics Measurement ID

                    </label>

                    <input

                        type="text"

                        placeholder="G-XXXXXXXXXX"

                        value={
                            settings.google_analytics_id || ""
                        }

                        onChange={(e) =>

                            handleChange(

                                "google_analytics_id",

                                e.target.value

                            )

                        }

                    />

                    <small>

                        Example: G-XXXXXXXXXX

                    </small>

                </div>

            </div>


            {/* =====================================
                GOOGLE TAG MANAGER
            ====================================== */}

            <div className="settings-card">

                <h3 className="settings-card-title">

                    Google Tag Manager

                </h3>


                <div className="form-group">

                    <label>

                        Google Tag Manager ID

                    </label>

                    <input

                        type="text"

                        placeholder="GTM-XXXXXXX"

                        value={
                            settings.google_tag_manager_id || ""
                        }

                        onChange={(e) =>

                            handleChange(

                                "google_tag_manager_id",

                                e.target.value

                            )

                        }

                    />

                    <small>

                        Example: GTM-XXXXXXX

                    </small>

                </div>

            </div>


            {/* =====================================
                FACEBOOK PIXEL
            ====================================== */}

            <div className="settings-card">

                <h3 className="settings-card-title">

                    Meta / Facebook Pixel

                </h3>


                <div className="form-group">

                    <label>

                        Facebook Pixel ID

                    </label>

                    <input

                        type="text"

                        placeholder="Enter Facebook Pixel ID"

                        value={
                            settings.facebook_pixel_id || ""
                        }

                        onChange={(e) =>

                            handleChange(

                                "facebook_pixel_id",

                                e.target.value

                            )

                        }

                    />

                </div>

            </div>


            {/* =====================================
                GOOGLE SEARCH CONSOLE
            ====================================== */}

            <div className="settings-card">

                <h3 className="settings-card-title">

                    Google Search Console

                </h3>


                <div className="form-group">

                    <label>

                        Search Console Verification Code

                    </label>

                    <input

                        type="text"

                        placeholder="Enter verification code"

                        value={
                            settings.google_search_console_verification || ""
                        }

                        onChange={(e) =>

                            handleChange(

                                "google_search_console_verification",

                                e.target.value

                            )

                        }

                    />

                </div>

            </div>


            {/* =====================================
                PRIVACY
            ====================================== */}

            <div className="settings-card">

                <h3 className="settings-card-title">

                    Tracking Privacy

                </h3>


                <div className="toggle-setting">

                    <div>

                        <h4>

                            Anonymous Analytics

                        </h4>

                        <p>

                            Collect analytics without storing personally
                            identifiable visitor information.

                        </p>

                    </div>


                    <label className="switch">

                        <input

                            type="checkbox"

                            checked={
                                settings.anonymous_analytics === "true" ||
                                settings.anonymous_analytics === true
                            }

                            onChange={(e) =>

                                handleChange(

                                    "anonymous_analytics",

                                    e.target.checked

                                        ? "true"

                                        : "false"

                                )

                            }

                        />

                        <span className="slider"></span>

                    </label>

                </div>

            </div>


        </div>

    );

}

export default AnalyticsSettings;
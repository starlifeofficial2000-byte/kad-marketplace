function AnalyticsSettings({ settings, handleChange }) {
    const isEnabled = (key, fallback = false) => {
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
                    <h2>Analytics Settings</h2>

                    <p>
                        Configure analytics, visitor tracking,
                        measurement integrations, and privacy options.
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
                            Allow the marketplace to collect website
                            traffic and visitor analytics.
                        </p>
                    </div>

                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={isEnabled(
                                "analytics_enabled",
                                false
                            )}
                            onChange={() =>
                                toggle("analytics_enabled")
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
                    <label htmlFor="google_analytics_id">
                        Google Analytics Measurement ID
                    </label>

                    <input
                        id="google_analytics_id"
                        type="text"
                        placeholder="G-XXXXXXXXXX"
                        value={
                            settings?.google_analytics_id || ""
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
                    <label htmlFor="google_tag_manager_id">
                        Google Tag Manager ID
                    </label>

                    <input
                        id="google_tag_manager_id"
                        type="text"
                        placeholder="GTM-XXXXXXX"
                        value={
                            settings?.google_tag_manager_id || ""
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
                META / FACEBOOK PIXEL
            ====================================== */}

            <div className="settings-card">
                <h3 className="settings-card-title">
                    Meta / Facebook Pixel
                </h3>

                <div className="form-group">
                    <label htmlFor="facebook_pixel_id">
                        Facebook Pixel ID
                    </label>

                    <input
                        id="facebook_pixel_id"
                        type="text"
                        placeholder="Enter Facebook Pixel ID"
                        value={
                            settings?.facebook_pixel_id || ""
                        }
                        onChange={(e) =>
                            handleChange(
                                "facebook_pixel_id",
                                e.target.value
                            )
                        }
                    />

                    <small>
                        Optional. Used for supported Meta
                        advertising and conversion tracking.
                    </small>
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
                    <label htmlFor="google_search_console_verification">
                        Search Console Verification Code
                    </label>

                    <input
                        id="google_search_console_verification"
                        type="text"
                        placeholder="Enter verification code"
                        value={
                            settings
                                ?.google_search_console_verification ||
                            ""
                        }
                        onChange={(e) =>
                            handleChange(
                                "google_search_console_verification",
                                e.target.value
                            )
                        }
                    />

                    <small>
                        Verification value used for Search Console
                        configuration.
                    </small>
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
                            Collect analytics without intentionally
                            storing personally identifiable visitor
                            information.
                        </p>
                    </div>

                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={isEnabled(
                                "anonymous_analytics",
                                true
                            )}
                            onChange={() =>
                                toggle("anonymous_analytics")
                            }
                        />

                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            {/* =====================================
                ANALYTICS STATUS
            ====================================== */}

            <div className="settings-info">
                <strong>
                    Analytics Status
                </strong>

                <p>
                    Analytics:{" "}
                    {isEnabled(
                        "analytics_enabled",
                        false
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
                    Google Tag Manager:{" "}
                    {settings?.google_tag_manager_id
                        ? "Configured"
                        : "Not configured"}
                </p>

                <p>
                    Meta Pixel:{" "}
                    {settings?.facebook_pixel_id
                        ? "Configured"
                        : "Not configured"}
                </p>

                <p>
                    Anonymous Analytics:{" "}
                    {isEnabled(
                        "anonymous_analytics",
                        true
                    )
                        ? "Enabled"
                        : "Disabled"}
                </p>
            </div>

        </div>
    );
}

export default AnalyticsSettings;
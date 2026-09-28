import React from "react";

function AnalyticsSettings({ settings = {}, handleChange }) {
    const getValue = (key, fallback = "") => {
        const value = settings?.[key];

        if (value === undefined || value === null) {
            return fallback;
        }

        return String(value);
    };

    const isEnabled = (key, fallback = false) => {
        const value = settings?.[key];

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return fallback;
        }

        return (
            value === true ||
            value === "true" ||
            value === 1 ||
            value === "1"
        );
    };

    const toggle = (key) => {
        handleChange(
            key,
            isEnabled(key) ? "false" : "true"
        );
    };

    const updateField = (key, value) => {
        handleChange(key, value);
    };

    return (
        <div className="settings-section analytics-settings">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="section-header">
                <div>
                    <h2>Analytics Settings</h2>

                    <p>
                        Configure website analytics, visitor tracking,
                        marketing integrations, search verification,
                        and privacy options for KAD Marketplace.
                    </p>
                </div>
            </div>


            {/* =====================================================
                ANALYTICS CONTROL
            ====================================================== */}

            <div className="settings-card">

                <h3 className="settings-card-title">
                    Analytics Control
                </h3>

                <div className="toggle-setting">

                    <div className="toggle-content">

                        <h4>
                            Enable Analytics
                        </h4>

                        <p>
                            Allow KAD Marketplace to collect website
                            traffic and visitor analytics.
                        </p>

                    </div>

                    <label
                        className="switch"
                        title={
                            isEnabled(
                                "analytics_enabled",
                                false
                            )
                                ? "Disable analytics"
                                : "Enable analytics"
                        }
                    >

                        <input
                            type="checkbox"
                            checked={isEnabled(
                                "analytics_enabled",
                                false
                            )}
                            onChange={() =>
                                toggle(
                                    "analytics_enabled"
                                )
                            }
                        />

                        <span className="slider"></span>

                    </label>

                </div>


                <div className="analytics-status-inline">

                    <span
                        className={
                            isEnabled(
                                "analytics_enabled",
                                false
                            )
                                ? "status-dot enabled"
                                : "status-dot disabled"
                        }
                    ></span>

                    <span>
                        Analytics are{" "}

                        <strong>
                            {isEnabled(
                                "analytics_enabled",
                                false
                            )
                                ? "enabled"
                                : "disabled"}
                        </strong>
                    </span>

                </div>

            </div>


            {/* =====================================================
                GOOGLE ANALYTICS
            ====================================================== */}

            <div className="settings-card">

                <h3 className="settings-card-title">
                    Google Analytics
                </h3>

                <p className="settings-card-description">
                    Connect Google Analytics to measure visitors,
                    traffic sources, page views, and website activity.
                </p>

                <div className="form-group">

                    <label htmlFor="google_analytics_id">
                        Google Analytics Measurement ID
                    </label>

                    <input
                        id="google_analytics_id"
                        name="google_analytics_id"
                        type="text"
                        value={getValue(
                            "google_analytics_id"
                        )}
                        placeholder="G-XXXXXXXXXX"
                        autoComplete="off"
                        onChange={(e) =>
                            updateField(
                                "google_analytics_id",
                                e.target.value.trim()
                            )
                        }
                    />

                    <small>
                        Example: G-XXXXXXXXXX
                    </small>

                </div>

            </div>


            {/* =====================================================
                GOOGLE TAG MANAGER
            ====================================================== */}

            <div className="settings-card">

                <h3 className="settings-card-title">
                    Google Tag Manager
                </h3>

                <p className="settings-card-description">
                    Manage analytics, advertising, and other tracking
                    tags through Google Tag Manager.
                </p>

                <div className="form-group">

                    <label htmlFor="google_tag_manager_id">
                        Google Tag Manager ID
                    </label>

                    <input
                        id="google_tag_manager_id"
                        name="google_tag_manager_id"
                        type="text"
                        value={getValue(
                            "google_tag_manager_id"
                        )}
                        placeholder="GTM-XXXXXXX"
                        autoComplete="off"
                        onChange={(e) =>
                            updateField(
                                "google_tag_manager_id",
                                e.target.value.trim()
                            )
                        }
                    />

                    <small>
                        Example: GTM-XXXXXXX
                    </small>

                </div>

            </div>


            {/* =====================================================
                META PIXEL
            ====================================================== */}

            <div className="settings-card">

                <h3 className="settings-card-title">
                    Meta / Facebook Pixel
                </h3>

                <p className="settings-card-description">
                    Connect Meta Pixel to measure traffic and
                    advertising conversions from Facebook and Instagram.
                </p>

                <div className="form-group">

                    <label htmlFor="facebook_pixel_id">
                        Facebook Pixel ID
                    </label>

                    <input
                        id="facebook_pixel_id"
                        name="facebook_pixel_id"
                        type="text"
                        value={getValue(
                            "facebook_pixel_id"
                        )}
                        placeholder="Enter Facebook Pixel ID"
                        autoComplete="off"
                        onChange={(e) =>
                            updateField(
                                "facebook_pixel_id",
                                e.target.value.trim()
                            )
                        }
                    />

                    <small>
                        Optional. Used for supported Meta advertising
                        and conversion tracking.
                    </small>

                </div>

            </div>


            {/* =====================================================
                GOOGLE SEARCH CONSOLE
            ====================================================== */}

            <div className="settings-card">

                <h3 className="settings-card-title">
                    Google Search Console
                </h3>

                <p className="settings-card-description">
                    Verify KAD Marketplace with Google Search Console
                    so search performance and indexing can be monitored.
                </p>

                <div className="form-group">

                    <label htmlFor="google_search_console_verification">
                        Search Console Verification Code
                    </label>

                    <input
                        id="google_search_console_verification"
                        name="google_search_console_verification"
                        type="text"
                        value={getValue(
                            "google_search_console_verification"
                        )}
                        placeholder="Enter verification code"
                        autoComplete="off"
                        onChange={(e) =>
                            updateField(
                                "google_search_console_verification",
                                e.target.value.trim()
                            )
                        }
                    />

                    <small>
                        Enter the verification value provided by
                        Google Search Console.
                    </small>

                </div>

            </div>


            {/* =====================================================
                PRIVACY
            ====================================================== */}

            <div className="settings-card">

                <h3 className="settings-card-title">
                    Tracking Privacy
                </h3>

                <div className="toggle-setting">

                    <div className="toggle-content">

                        <h4>
                            Anonymous Analytics
                        </h4>

                        <p>
                            Collect analytics while reducing the
                            intentional storage of personally
                            identifiable visitor information.
                        </p>

                    </div>

                    <label
                        className="switch"
                        title={
                            isEnabled(
                                "anonymous_analytics",
                                true
                            )
                                ? "Disable anonymous analytics"
                                : "Enable anonymous analytics"
                        }
                    >

                        <input
                            type="checkbox"
                            checked={isEnabled(
                                "anonymous_analytics",
                                true
                            )}
                            onChange={() =>
                                toggle(
                                    "anonymous_analytics"
                                )
                            }
                        />

                        <span className="slider"></span>

                    </label>

                </div>

            </div>


            {/* =====================================================
                CONFIGURATION STATUS
            ====================================================== */}

            <div className="settings-info analytics-status-card">

                <div className="analytics-status-header">

                    <div>

                        <strong>
                            Analytics Status
                        </strong>

                        <p>
                            Current analytics configuration for
                            KAD Marketplace.
                        </p>

                    </div>

                    <span
                        className={
                            isEnabled(
                                "analytics_enabled",
                                false
                            )
                                ? "analytics-badge enabled"
                                : "analytics-badge disabled"
                        }
                    >
                        {isEnabled(
                            "analytics_enabled",
                            false
                        )
                            ? "Active"
                            : "Disabled"}
                    </span>

                </div>


                <div className="analytics-status-grid">

                    <div className="analytics-status-item">

                        <span>
                            Analytics
                        </span>

                        <strong>
                            {isEnabled(
                                "analytics_enabled",
                                false
                            )
                                ? "Enabled"
                                : "Disabled"}
                        </strong>

                    </div>


                    <div className="analytics-status-item">

                        <span>
                            Google Analytics
                        </span>

                        <strong>
                            {settings?.google_analytics_id
                                ? "Configured"
                                : "Not configured"}
                        </strong>

                    </div>


                    <div className="analytics-status-item">

                        <span>
                            Google Tag Manager
                        </span>

                        <strong>
                            {settings?.google_tag_manager_id
                                ? "Configured"
                                : "Not configured"}
                        </strong>

                    </div>


                    <div className="analytics-status-item">

                        <span>
                            Meta Pixel
                        </span>

                        <strong>
                            {settings?.facebook_pixel_id
                                ? "Configured"
                                : "Not configured"}
                        </strong>

                    </div>


                    <div className="analytics-status-item">

                        <span>
                            Search Console
                        </span>

                        <strong>
                            {settings?.google_search_console_verification
                                ? "Configured"
                                : "Not configured"}
                        </strong>

                    </div>


                    <div className="analytics-status-item">

                        <span>
                            Anonymous Analytics
                        </span>

                        <strong>
                            {isEnabled(
                                "anonymous_analytics",
                                true
                            )
                                ? "Enabled"
                                : "Disabled"}
                        </strong>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AnalyticsSettings;
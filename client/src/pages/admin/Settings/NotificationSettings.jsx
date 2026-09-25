function NotificationSettings({ settings, handleChange }) {
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
            <div className="section-header">
                <div>
                    <h2>Notification Settings</h2>
                    <p>
                        Configure notifications for users,
                        administrators, security events, and
                        marketplace activities.
                    </p>
                </div>
            </div>

            <div className="settings-card">

                {/* =====================================================
                    EMAIL NOTIFICATIONS
                ====================================================== */}

                <h3 className="settings-subtitle">
                    Email Notifications
                </h3>

                <div className="toggle-setting">
                    <div>
                        <strong>Enable Email Notifications</strong>
                        <p>
                            Allow the marketplace to send notifications
                            through email.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("email_notifications", true)}
                        onChange={() => toggle("email_notifications")}
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>Welcome Email</strong>
                        <p>
                            Send a welcome email when a new user creates
                            an account.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("welcome_email", true)}
                        onChange={() => toggle("welcome_email")}
                        disabled={!isEnabled("email_notifications", true)}
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>Product Notifications</strong>
                        <p>
                            Send notifications related to product
                            activities and marketplace listings.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("product_notifications", true)}
                        onChange={() => toggle("product_notifications")}
                        disabled={!isEnabled("email_notifications", true)}
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>Order Notifications</strong>
                        <p>
                            Send email notifications about orders and
                            order-related activities.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("order_notifications", true)}
                        onChange={() => toggle("order_notifications")}
                        disabled={!isEnabled("email_notifications", true)}
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>Payment Notifications</strong>
                        <p>
                            Send email notifications when payments are
                            completed or updated.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("payment_notifications", true)}
                        onChange={() => toggle("payment_notifications")}
                        disabled={!isEnabled("email_notifications", true)}
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>Seller Notifications</strong>
                        <p>
                            Notify sellers about important marketplace
                            activities affecting their accounts.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("seller_notifications", true)}
                        onChange={() => toggle("seller_notifications")}
                        disabled={!isEnabled("email_notifications", true)}
                    />
                </div>

                {/* =====================================================
                    SMS NOTIFICATIONS
                ====================================================== */}

                <h3 className="settings-subtitle">
                    SMS Notifications
                </h3>

                <div className="toggle-setting">
                    <div>
                        <strong>Enable SMS Notifications</strong>
                        <p>
                            Allow the marketplace to send important
                            notifications through SMS.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("sms_enabled", false)}
                        onChange={() => toggle("sms_enabled")}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="sms_provider">
                        SMS Provider
                    </label>

                    <select
                        id="sms_provider"
                        value={settings?.sms_provider || "Hubtel"}
                        onChange={(e) =>
                            handleChange(
                                "sms_provider",
                                e.target.value
                            )
                        }
                        disabled={!isEnabled("sms_enabled", false)}
                    >
                        <option value="Hubtel">
                            Hubtel
                        </option>

                        <option value="Arkesel">
                            Arkesel
                        </option>

                        <option value="Twilio">
                            Twilio
                        </option>

                        <option value="Custom">
                            Custom Provider
                        </option>
                    </select>
                </div>

                {/* =====================================================
                    ADMINISTRATOR NOTIFICATIONS
                ====================================================== */}

                <h3 className="settings-subtitle">
                    Administrator Notifications
                </h3>

                <div className="toggle-setting">
                    <div>
                        <strong>Administrator Alerts</strong>
                        <p>
                            Enable important notifications for marketplace
                            administrators.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("admin_alerts", true)}
                        onChange={() => toggle("admin_alerts")}
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>New User Registration Alert</strong>
                        <p>
                            Notify administrators when a new user
                            registers on the marketplace.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("admin_alerts", true)}
                        onChange={() => toggle("admin_alerts")}
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>New Product Alert</strong>
                        <p>
                            Notify administrators when a seller creates
                            a new product.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("product_notifications", true)}
                        onChange={() => toggle("product_notifications")}
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>New Store Alert</strong>
                        <p>
                            Notify administrators when a new store is
                            created.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("seller_notifications", true)}
                        onChange={() => toggle("seller_notifications")}
                    />
                </div>

                {/* =====================================================
                    SECURITY NOTIFICATIONS
                ====================================================== */}

                <h3 className="settings-subtitle">
                    Security Notifications
                </h3>

                <div className="toggle-setting">
                    <div>
                        <strong>Security Alerts</strong>
                        <p>
                            Send alerts for important security events and
                            suspicious activities.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("security_alerts", true)}
                        onChange={() => toggle("security_alerts")}
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>Failed Login Alerts</strong>
                        <p>
                            Alert administrators when suspicious failed
                            login attempts are detected.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("security_alerts", true)}
                        onChange={() => toggle("security_alerts")}
                    />
                </div>

                {/* =====================================================
                    SYSTEM NOTIFICATIONS
                ====================================================== */}

                <h3 className="settings-subtitle">
                    System Notifications
                </h3>

                <div className="toggle-setting">
                    <div>
                        <strong>Maintenance Alerts</strong>
                        <p>
                            Notify users when the marketplace is under
                            maintenance.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled("maintenance_alerts", true)}
                        onChange={() => toggle("maintenance_alerts")}
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>Promotional Notifications</strong>
                        <p>
                            Allow promotional messages, promotions,
                            featured products, and marketplace
                            announcements.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "promotional_notifications",
                            true
                        )}
                        onChange={() =>
                            toggle("promotional_notifications")
                        }
                    />
                </div>

                {/* =====================================================
                    NOTIFICATION STATUS
                ====================================================== */}

                <div
                    className="settings-info"
                    style={{
                        marginTop: "24px",
                        padding: "16px",
                        borderRadius: "8px",
                        background: "#f5f7fa"
                    }}
                >
                    <strong>Notification Status</strong>

                    <p style={{ marginTop: "8px" }}>
                        Email:{" "}
                        {isEnabled("email_notifications", true)
                            ? "Enabled"
                            : "Disabled"}
                    </p>

                    <p>
                        SMS:{" "}
                        {isEnabled("sms_enabled", false)
                            ? "Enabled"
                            : "Disabled"}
                    </p>

                    <p>
                        Security Alerts:{" "}
                        {isEnabled("security_alerts", true)
                            ? "Enabled"
                            : "Disabled"}
                    </p>

                    <p>
                        Promotional Notifications:{" "}
                        {isEnabled(
                            "promotional_notifications",
                            true
                        )
                            ? "Enabled"
                            : "Disabled"}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default NotificationSettings;
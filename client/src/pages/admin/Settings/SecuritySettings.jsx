function SecuritySettings({ settings, handleChange }) {
    const isEnabled = (key, fallback = false) => {
        const value = settings?.[key];

        if (value === undefined || value === null || value === "") {
            return fallback;
        }

        return value === true || value === "true";
    };

    const numberValue = (key, fallback) => {
        const value = settings?.[key];

        if (value === undefined || value === null || value === "") {
            return fallback;
        }

        return value;
    };

    const toggle = (key) => {
        handleChange(key, (!isEnabled(key)).toString());
    };

    return (
        <div className="settings-section">
            <div className="section-header">
                <div>
                    <h2>Security Settings</h2>
                    <p>
                        Configure account security, login protection,
                        password policies, IP monitoring, and
                        administrator security.
                    </p>
                </div>
            </div>

            <div className="settings-card">

                {/* =====================================================
                    LOGIN SECURITY
                ====================================================== */}

                <h3 className="settings-subtitle">
                    Login Security
                </h3>

                <div className="form-group">
                    <label htmlFor="max_failed_login_attempts">
                        Maximum Failed Login Attempts
                    </label>

                    <input
                        id="max_failed_login_attempts"
                        type="number"
                        min="1"
                        max="20"
                        value={numberValue(
                            "max_failed_login_attempts",
                            5
                        )}
                        onChange={(e) =>
                            handleChange(
                                "max_failed_login_attempts",
                                e.target.value
                            )
                        }
                    />

                    <small>
                        Number of failed login attempts allowed before
                        an account is temporarily locked.
                    </small>
                </div>

                <div className="form-group">
                    <label htmlFor="account_lock_duration">
                        Account Lock Duration (Minutes)
                    </label>

                    <input
                        id="account_lock_duration"
                        type="number"
                        min="1"
                        value={numberValue(
                            "account_lock_duration",
                            30
                        )}
                        onChange={(e) =>
                            handleChange(
                                "account_lock_duration",
                                e.target.value
                            )
                        }
                    />

                    <small>
                        How long an account remains locked after too
                        many failed login attempts.
                    </small>
                </div>

                <div className="form-group">
                    <label htmlFor="session_timeout">
                        Session Timeout (Minutes)
                    </label>

                    <input
                        id="session_timeout"
                        type="number"
                        min="5"
                        value={numberValue(
                            "session_timeout",
                            60
                        )}
                        onChange={(e) =>
                            handleChange(
                                "session_timeout",
                                e.target.value
                            )
                        }
                    />

                    <small>
                        Automatically expire inactive user sessions
                        after this period.
                    </small>
                </div>

                {/* =====================================================
                    TWO FACTOR AUTHENTICATION
                ====================================================== */}

                <h3 className="settings-subtitle">
                    Two-Factor Authentication
                </h3>

                <div className="toggle-setting">
                    <div>
                        <strong>
                            Enable Two-Factor Authentication
                        </strong>

                        <p>
                            Allow users to secure their accounts using
                            an additional verification step.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "two_factor_enabled",
                            false
                        )}
                        onChange={() =>
                            toggle("two_factor_enabled")
                        }
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>
                            Require Two-Factor Authentication for Admins
                        </strong>

                        <p>
                            Require administrators to use two-factor
                            authentication when accessing the admin panel.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "require_admin_two_factor",
                            false
                        )}
                        onChange={() =>
                            toggle("require_admin_two_factor")
                        }
                        disabled={
                            !isEnabled(
                                "two_factor_enabled",
                                false
                            )
                        }
                    />
                </div>

                {/* =====================================================
                    PASSWORD POLICY
                ====================================================== */}

                <h3 className="settings-subtitle">
                    Password Policy
                </h3>

                <div className="form-group">
                    <label htmlFor="minimum_password_length">
                        Minimum Password Length
                    </label>

                    <input
                        id="minimum_password_length"
                        type="number"
                        min="6"
                        max="50"
                        value={numberValue(
                            "minimum_password_length",
                            8
                        )}
                        onChange={(e) =>
                            handleChange(
                                "minimum_password_length",
                                e.target.value
                            )
                        }
                    />

                    <small>
                        Minimum number of characters required for
                        user passwords.
                    </small>
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>
                            Require Strong Passwords
                        </strong>

                        <p>
                            Require users to follow the configured
                            password security requirements.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "require_strong_passwords",
                            true
                        )}
                        onChange={() =>
                            toggle("require_strong_passwords")
                        }
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>
                            Require Uppercase Letter
                        </strong>

                        <p>
                            Passwords must contain at least one
                            uppercase letter.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "require_uppercase_password",
                            true
                        )}
                        onChange={() =>
                            toggle("require_uppercase_password")
                        }
                        disabled={
                            !isEnabled(
                                "require_strong_passwords",
                                true
                            )
                        }
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>
                            Require Number
                        </strong>

                        <p>
                            Passwords must contain at least one number.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "require_number_password",
                            true
                        )}
                        onChange={() =>
                            toggle("require_number_password")
                        }
                        disabled={
                            !isEnabled(
                                "require_strong_passwords",
                                true
                            )
                        }
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>
                            Require Special Character
                        </strong>

                        <p>
                            Passwords must contain at least one
                            special character.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "require_special_character",
                            true
                        )}
                        onChange={() =>
                            toggle("require_special_character")
                        }
                        disabled={
                            !isEnabled(
                                "require_strong_passwords",
                                true
                            )
                        }
                    />
                </div>

                {/* =====================================================
                    PASSWORD EXPIRY
                ====================================================== */}

                <h3 className="settings-subtitle">
                    Password Expiry
                </h3>

                <div className="toggle-setting">
                    <div>
                        <strong>
                            Enable Password Expiry
                        </strong>

                        <p>
                            Require users to change their password
                            periodically.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "password_expiry_enabled",
                            false
                        )}
                        onChange={() =>
                            toggle("password_expiry_enabled")
                        }
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password_expiry_days">
                        Password Expiry Period (Days)
                    </label>

                    <input
                        id="password_expiry_days"
                        type="number"
                        min="1"
                        value={numberValue(
                            "password_expiry_days",
                            90
                        )}
                        onChange={(e) =>
                            handleChange(
                                "password_expiry_days",
                                e.target.value
                            )
                        }
                        disabled={
                            !isEnabled(
                                "password_expiry_enabled",
                                false
                            )
                        }
                    />

                    <small>
                        Number of days before users are required to
                        change their password.
                    </small>
                </div>

                {/* =====================================================
                    IP & ACCESS SECURITY
                ====================================================== */}

                <h3 className="settings-subtitle">
                    IP & Access Security
                </h3>

                <div className="toggle-setting">
                    <div>
                        <strong>
                            Enable IP Monitoring
                        </strong>

                        <p>
                            Monitor user IP addresses for suspicious
                            login activity.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "ip_monitoring",
                            false
                        )}
                        onChange={() =>
                            toggle("ip_monitoring")
                        }
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>
                            Block Suspicious IP Addresses
                        </strong>

                        <p>
                            Automatically block IP addresses detected
                            as potentially malicious.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "suspicious_ip_blocking",
                            false
                        )}
                        onChange={() =>
                            toggle("suspicious_ip_blocking")
                        }
                        disabled={
                            !isEnabled(
                                "ip_monitoring",
                                false
                            )
                        }
                    />
                </div>

                {/* =====================================================
                    AUDIT & ADMIN SECURITY
                ====================================================== */}

                <h3 className="settings-subtitle">
                    Administrator Security
                </h3>

                <div className="toggle-setting">
                    <div>
                        <strong>
                            Enable Audit Logging
                        </strong>

                        <p>
                            Record important administrator actions
                            in the audit log system.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "audit_logging",
                            true
                        )}
                        onChange={() =>
                            toggle("audit_logging")
                        }
                    />
                </div>

                <div className="toggle-setting">
                    <div>
                        <strong>
                            Security Administrator Alerts
                        </strong>

                        <p>
                            Notify administrators when suspicious
                            security activity is detected.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={isEnabled(
                            "security_admin_alerts",
                            true
                        )}
                        onChange={() =>
                            toggle("security_admin_alerts")
                        }
                    />
                </div>

                {/* =====================================================
                    SECURITY STATUS
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
                    <strong>Security Status</strong>

                    <p style={{ marginTop: "8px" }}>
                        Two-Factor Authentication:{" "}
                        {isEnabled(
                            "two_factor_enabled",
                            false
                        )
                            ? "Enabled"
                            : "Disabled"}
                    </p>

                    <p>
                        Strong Passwords:{" "}
                        {isEnabled(
                            "require_strong_passwords",
                            true
                        )
                            ? "Enabled"
                            : "Disabled"}
                    </p>

                    <p>
                        IP Monitoring:{" "}
                        {isEnabled(
                            "ip_monitoring",
                            false
                        )
                            ? "Enabled"
                            : "Disabled"}
                    </p>

                    <p>
                        Audit Logging:{" "}
                        {isEnabled(
                            "audit_logging",
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

export default SecuritySettings;
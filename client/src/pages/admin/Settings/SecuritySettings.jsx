import React from "react";
import "./SecuritySettings.css";

/* =========================================================
   SECURITY SETTINGS
   ========================================================= */

function SecuritySettings({
    settings = {},
    handleChange
}) {

    /* =====================================================
       HELPERS
    ===================================================== */

    const isEnabled = (
        key,
        fallback = false
    ) => {

        const value =
            settings?.[key];

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


    const numberValue = (
        key,
        fallback
    ) => {

        const value =
            Number(settings?.[key]);

        return Number.isFinite(value)
            ? value
            : fallback;
    };


    const toggle = (
        key,
        fallback = false
    ) => {

        handleChange(
            key,
            (
                !isEnabled(
                    key,
                    fallback
                )
            ).toString()
        );

    };


    const updateNumber = (
        key,
        value
    ) => {

        handleChange(
            key,
            value
        );

    };


    /* =====================================================
       SECURITY STATUS
    ===================================================== */

    const securityStatus = {

        loginLock:
            numberValue(
                "login_attempt_limit",
                5
            ) > 0,

        passwordSecurity:
            isEnabled(
                "require_strong_passwords",
                true
            ),

        ipMonitoring:
            isEnabled(
                "ip_monitoring",
                true
            ),

        ipBlocking:
            isEnabled(
                "suspicious_ip_blocking",
                true
            ),

        alerts:
            isEnabled(
                "security_alerts",
                true
            ),

        audit:
            isEnabled(
                "audit_logging",
                true
            )

    };


    /* =====================================================
       COMPONENT
    ===================================================== */

    return (

        <div className="security-settings">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="security-settings-header">

                <div className="security-settings-header-icon">
                    🔐
                </div>

                <div>

                    <h2>
                        Security Settings
                    </h2>

                    <p>
                        Protect your marketplace accounts,
                        administrators, sessions and network
                        access.
                    </p>

                </div>

            </div>


            {/* =================================================
                SECURITY STATUS
            ================================================= */}

            <div className="security-status-grid">

                <div className="security-status-card">

                    <span className="security-status-icon">
                        🔒
                    </span>

                    <div>

                        <strong>
                            Login Protection
                        </strong>

                        <span>
                            {securityStatus.loginLock
                                ? "Enabled"
                                : "Disabled"}
                        </span>

                    </div>

                </div>


                <div className="security-status-card">

                    <span className="security-status-icon">
                        🔑
                    </span>

                    <div>

                        <strong>
                            Password Security
                        </strong>

                        <span>
                            {securityStatus.passwordSecurity
                                ? "Enabled"
                                : "Disabled"}
                        </span>

                    </div>

                </div>


                <div className="security-status-card">

                    <span className="security-status-icon">
                        🌐
                    </span>

                    <div>

                        <strong>
                            IP Monitoring
                        </strong>

                        <span>
                            {securityStatus.ipMonitoring
                                ? "Enabled"
                                : "Disabled"}
                        </span>

                    </div>

                </div>


                <div className="security-status-card">

                    <span className="security-status-icon">
                        🚨
                    </span>

                    <div>

                        <strong>
                            Security Alerts
                        </strong>

                        <span>
                            {securityStatus.alerts
                                ? "Enabled"
                                : "Disabled"}
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================================
                LOGIN SECURITY
            ================================================= */}

            <section className="security-card">

                <div className="security-card-header">

                    <div className="security-card-title">

                        <span className="security-section-icon">
                            🔒
                        </span>

                        <div>

                            <h3>
                                Login Security
                            </h3>

                            <p>
                                Control failed-login attempts,
                                account locking and sessions.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="security-form-grid">

                    {/* FAILED ATTEMPTS */}

                    <div className="security-field">

                        <label>
                            Maximum Failed Login Attempts
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={
                                settings.login_attempt_limit ??
                                "5"
                            }
                            onChange={(event) =>
                                updateNumber(
                                    "login_attempt_limit",
                                    event.target.value
                                )
                            }
                        />

                        <small>
                            Number of incorrect passwords allowed
                            before the account is temporarily locked.
                        </small>

                    </div>


                    {/* LOCK DURATION */}

                    <div className="security-field">

                        <label>
                            Account Lock Duration
                            <span> minutes</span>
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="1440"
                            value={
                                settings.account_lock_duration ??
                                "30"
                            }
                            onChange={(event) =>
                                updateNumber(
                                    "account_lock_duration",
                                    event.target.value
                                )
                            }
                        />

                        <small>
                            How long an account remains locked after
                            reaching the failed-login limit.
                        </small>

                    </div>


                    {/* SESSION TIMEOUT */}

                    <div className="security-field">

                        <label>
                            Session Timeout
                            <span> minutes</span>
                        </label>

                        <input
                            type="number"
                            min="5"
                            max="1440"
                            value={
                                settings.session_timeout ??
                                "120"
                            }
                            onChange={(event) =>
                                updateNumber(
                                    "session_timeout",
                                    event.target.value
                                )
                            }
                        />

                        <small>
                            Automatically expire inactive user sessions.
                        </small>

                    </div>

                </div>

            </section>


            {/* =================================================
                TWO FACTOR AUTHENTICATION
            ================================================= */}

            <section className="security-card">

                <div className="security-card-header">

                    <div className="security-card-title">

                        <span className="security-section-icon">
                            📱
                        </span>

                        <div>

                            <h3>
                                Two-Factor Authentication
                            </h3>

                            <p>
                                Add an additional verification step
                                when users sign in.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="security-toggle-list">

                    <div className="security-toggle-row">

                        <div>

                            <strong>
                                Enable Two-Factor Authentication
                            </strong>

                            <p>
                                Require users to verify their identity
                                with a second authentication factor.
                            </p>

                        </div>

                        <button
                            type="button"
                            className={
                                `security-toggle ${
                                    isEnabled(
                                        "two_factor_authentication",
                                        false
                                    )
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggle(
                                    "two_factor_authentication"
                                )
                            }
                            aria-pressed={
                                isEnabled(
                                    "two_factor_authentication",
                                    false
                                )
                            }
                        >

                            <span />

                        </button>

                    </div>


                    <div className="security-toggle-row">

                        <div>

                            <strong>
                                Require 2FA for Administrators
                            </strong>

                            <p>
                                Require administrator accounts to complete
                                two-factor authentication.
                            </p>

                        </div>

                        <button
                            type="button"
                            className={
                                `security-toggle ${
                                    isEnabled(
                                        "require_admin_two_factor",
                                        true
                                    )
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggle(
                                    "require_admin_two_factor",
                                    true
                                )
                            }
                            aria-pressed={
                                isEnabled(
                                    "require_admin_two_factor",
                                    true
                                )
                            }
                        >

                            <span />

                        </button>

                    </div>

                </div>

            </section>


            {/* =================================================
                PASSWORD SECURITY
            ================================================= */}

            <section className="security-card">

                <div className="security-card-header">

                    <div className="security-card-title">

                        <span className="security-section-icon">
                            🔑
                        </span>

                        <div>

                            <h3>
                                Password Security
                            </h3>

                            <p>
                                Define the password requirements for
                                marketplace accounts.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="security-form-grid">

                    {/* MINIMUM LENGTH */}

                    <div className="security-field">

                        <label>
                            Minimum Password Length
                        </label>

                        <input
                            type="number"
                            min="6"
                            max="128"
                            value={
                                settings.password_min_length ??
                                "8"
                            }
                            onChange={(event) =>
                                updateNumber(
                                    "password_min_length",
                                    event.target.value
                                )
                            }
                        />

                        <small>
                            Minimum number of characters required.
                        </small>

                    </div>


                    {/* PASSWORD HISTORY */}

                    <div className="security-field">

                        <label>
                            Password History
                        </label>

                        <input
                            type="number"
                            min="0"
                            max="20"
                            value={
                                settings.password_history_count ??
                                "5"
                            }
                            onChange={(event) =>
                                updateNumber(
                                    "password_history_count",
                                    event.target.value
                                )
                            }
                        />

                        <small>
                            Number of previous passwords that cannot
                            be reused.
                        </small>

                    </div>

                </div>


                <div className="security-toggle-list">

                    {/* STRONG PASSWORD */}

                    <div className="security-toggle-row">

                        <div>

                            <strong>
                                Require Strong Passwords
                            </strong>

                            <p>
                                Enforce the configured password
                                complexity requirements.
                            </p>

                        </div>

                        <button
                            type="button"
                            className={
                                `security-toggle ${
                                    isEnabled(
                                        "require_strong_passwords",
                                        true
                                    )
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggle(
                                    "require_strong_passwords",
                                    true
                                )
                            }
                        >

                            <span />

                        </button>

                    </div>


                    {/* UPPERCASE */}

                    <div className="security-toggle-row">

                        <div>

                            <strong>
                                Require Uppercase Letter
                            </strong>

                            <p>
                                Passwords must contain at least one
                                uppercase character.
                            </p>

                        </div>

                        <button
                            type="button"
                            className={
                                `security-toggle ${
                                    isEnabled(
                                        "require_uppercase_password",
                                        true
                                    )
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggle(
                                    "require_uppercase_password",
                                    true
                                )
                            }
                        >

                            <span />

                        </button>

                    </div>


                    {/* LOWERCASE */}

                    <div className="security-toggle-row">

                        <div>

                            <strong>
                                Require Lowercase Letter
                            </strong>

                            <p>
                                Passwords must contain at least one
                                lowercase character.
                            </p>

                        </div>

                        <button
                            type="button"
                            className={
                                `security-toggle ${
                                    isEnabled(
                                        "require_lowercase_password",
                                        true
                                    )
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggle(
                                    "require_lowercase_password",
                                    true
                                )
                            }
                        >

                            <span />

                        </button>

                    </div>


                    {/* NUMBER */}

                    <div className="security-toggle-row">

                        <div>

                            <strong>
                                Require Number
                            </strong>

                            <p>
                                Passwords must contain at least one
                                numeric character.
                            </p>

                        </div>

                        <button
                            type="button"
                            className={
                                `security-toggle ${
                                    isEnabled(
                                        "require_number_password",
                                        true
                                    )
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggle(
                                    "require_number_password",
                                    true
                                )
                            }
                        >

                            <span />

                        </button>

                    </div>


                    {/* SPECIAL CHARACTER */}

                    <div className="security-toggle-row">

                        <div>

                            <strong>
                                Require Special Character
                            </strong>

                            <p>
                                Passwords must contain at least one
                                special character such as ! @ # $ %.
                            </p>

                        </div>

                        <button
                            type="button"
                            className={
                                `security-toggle ${
                                    isEnabled(
                                        "require_special_character",
                                        true
                                    )
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggle(
                                    "require_special_character",
                                    true
                                )
                            }
                        >

                            <span />

                        </button>

                    </div>

                </div>

            </section>


            {/* =================================================
                PASSWORD EXPIRY
            ================================================= */}

            <section className="security-card">

                <div className="security-card-header">

                    <div className="security-card-title">

                        <span className="security-section-icon">
                            ⏳
                        </span>

                        <div>

                            <h3>
                                Password Expiry
                            </h3>

                            <p>
                                Require users to periodically change
                                their passwords.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="security-toggle-row">

                    <div>

                        <strong>
                            Enable Password Expiry
                        </strong>

                        <p>
                            Automatically require users to change
                            passwords after the configured period.
                        </p>

                    </div>

                    <button
                        type="button"
                        className={
                            `security-toggle ${
                                isEnabled(
                                    "password_expiry_enabled",
                                    false
                                )
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            toggle(
                                "password_expiry_enabled",
                                false
                            )
                        }
                    >

                        <span />

                    </button>

                </div>


                {isEnabled(
                    "password_expiry_enabled",
                    false
                ) && (

                    <div className="security-field security-field-single">

                        <label>
                            Password Expiry Period
                            <span> days</span>
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="3650"
                            value={
                                settings.password_expiry_days ??
                                "90"
                            }
                            onChange={(event) =>
                                updateNumber(
                                    "password_expiry_days",
                                    event.target.value
                                )
                            }
                        />

                        <small>
                            Users will be required to change their
                            password after this number of days.
                        </small>

                    </div>

                )}

            </section>


            {/* =================================================
                IP MONITORING
            ================================================= */}

            <section className="security-card">

                <div className="security-card-header">

                    <div className="security-card-title">

                        <span className="security-section-icon">
                            🌐
                        </span>

                        <div>

                            <h3>
                                IP Monitoring & Blocking
                            </h3>

                            <p>
                                Monitor suspicious login activity and
                                protect the marketplace from abusive IPs.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="security-toggle-list">

                    {/* IP MONITORING */}

                    <div className="security-toggle-row">

                        <div>

                            <strong>
                                Enable IP Monitoring
                            </strong>

                            <p>
                                Record and monitor IP addresses used
                                during authentication.
                            </p>

                        </div>

                        <button
                            type="button"
                            className={
                                `security-toggle ${
                                    isEnabled(
                                        "ip_monitoring",
                                        true
                                    )
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggle(
                                    "ip_monitoring",
                                    true
                                )
                            }
                        >

                            <span />

                        </button>

                    </div>


                    {/* IP BLOCKING */}

                    <div className="security-toggle-row">

                        <div>

                            <strong>
                                Block Suspicious IP Addresses
                            </strong>

                            <p>
                                Temporarily block IP addresses that
                                exceed the configured failed-login limit.
                            </p>

                        </div>

                        <button
                            type="button"
                            className={
                                `security-toggle ${
                                    isEnabled(
                                        "suspicious_ip_blocking",
                                        true
                                    )
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggle(
                                    "suspicious_ip_blocking",
                                    true
                                )
                            }
                        >

                            <span />

                        </button>

                    </div>

                </div>


                <div className="security-form-grid">

                    {/* IP FAILURE THRESHOLD */}

                    <div className="security-field">

                        <label>
                            IP Failed Login Threshold
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={
                                settings.ip_failed_login_threshold ??
                                "10"
                            }
                            onChange={(event) =>
                                updateNumber(
                                    "ip_failed_login_threshold",
                                    event.target.value
                                )
                            }
                        />

                        <small>
                            Number of failed login attempts from one
                            IP before it can be blocked.
                        </small>

                    </div>


                    {/* IP BLOCK DURATION */}

                    <div className="security-field">

                        <label>
                            IP Block Duration
                            <span> minutes</span>
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="10080"
                            value={
                                settings.ip_block_duration ??
                                "60"
                            }
                            onChange={(event) =>
                                updateNumber(
                                    "ip_block_duration",
                                    event.target.value
                                )
                            }
                        />

                        <small>
                            How long a suspicious IP address remains
                            blocked.
                        </small>

                    </div>

                </div>

            </section>


            {/* =================================================
                SECURITY ALERTS
            ================================================= */}

            <section className="security-card">

                <div className="security-card-header">

                    <div className="security-card-title">

                        <span className="security-section-icon">
                            🚨
                        </span>

                        <div>

                            <h3>
                                Security Alerts
                            </h3>

                            <p>
                                Choose which security events should
                                generate alerts for administrators.
                            </p>

                        </div>

                    </div>

                </div>


                {/* MASTER ALERT */}

                <div className="security-toggle-row security-master-toggle">

                    <div>

                        <strong>
                            Enable Security Alerts
                        </strong>

                        <p>
                            Enable security event notifications and
                            alerts throughout the marketplace.
                        </p>

                    </div>

                    <button
                        type="button"
                        className={
                            `security-toggle ${
                                isEnabled(
                                    "security_alerts",
                                    true
                                )
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            toggle(
                                "security_alerts",
                                true
                            )
                        }
                    >

                        <span />

                    </button>

                </div>


                {isEnabled(
                    "security_alerts",
                    true
                ) && (

                    <div className="security-toggle-list">

                        {/* FAILED LOGIN */}

                        <div className="security-toggle-row">

                            <div>

                                <strong>
                                    Failed Login Alerts
                                </strong>

                                <p>
                                    Generate an alert after suspicious
                                    failed authentication attempts.
                                </p>

                            </div>

                            <button
                                type="button"
                                className={
                                    `security-toggle ${
                                        isEnabled(
                                            "security_alert_failed_login",
                                            true
                                        )
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    toggle(
                                        "security_alert_failed_login",
                                        true
                                    )
                                }
                            >

                                <span />

                            </button>

                        </div>


                        {/* ACCOUNT LOCK */}

                        <div className="security-toggle-row">

                            <div>

                                <strong>
                                    Account Lock Alerts
                                </strong>

                                <p>
                                    Alert administrators when an account
                                    is temporarily locked.
                                </p>

                            </div>

                            <button
                                type="button"
                                className={
                                    `security-toggle ${
                                        isEnabled(
                                            "security_alert_account_lock",
                                            true
                                        )
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    toggle(
                                        "security_alert_account_lock",
                                        true
                                    )
                                }
                            >

                                <span />

                            </button>

                        </div>


                        {/* SUSPICIOUS IP */}

                        <div className="security-toggle-row">

                            <div>

                                <strong>
                                    Suspicious IP Alerts
                                </strong>

                                <p>
                                    Alert administrators when an IP
                                    address is blocked.
                                </p>

                            </div>

                            <button
                                type="button"
                                className={
                                    `security-toggle ${
                                        isEnabled(
                                            "security_alert_suspicious_ip",
                                            true
                                        )
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    toggle(
                                        "security_alert_suspicious_ip",
                                        true
                                    )
                                }
                            >

                                <span />

                            </button>

                        </div>


                        {/* ADMIN LOGIN */}

                        <div className="security-toggle-row">

                            <div>

                                <strong>
                                    Administrator Login Alerts
                                </strong>

                                <p>
                                    Alert when an administrator
                                    successfully signs in.
                                </p>

                            </div>

                            <button
                                type="button"
                                className={
                                    `security-toggle ${
                                        isEnabled(
                                            "security_alert_admin_login",
                                            true
                                        )
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    toggle(
                                        "security_alert_admin_login",
                                        true
                                    )
                                }
                            >

                                <span />

                            </button>

                        </div>


                        {/* PASSWORD CHANGE */}

                        <div className="security-toggle-row">

                            <div>

                                <strong>
                                    Password Change Alerts
                                </strong>

                                <p>
                                    Alert when a user's password
                                    is changed.
                                </p>

                            </div>

                            <button
                                type="button"
                                className={
                                    `security-toggle ${
                                        isEnabled(
                                            "security_alert_password_change",
                                            true
                                        )
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    toggle(
                                        "security_alert_password_change",
                                        true
                                    )
                                }
                            >

                                <span />

                            </button>

                        </div>


                        {/* NEW DEVICE */}

                        <div className="security-toggle-row">

                            <div>

                                <strong>
                                    New Device Login Alerts
                                </strong>

                                <p>
                                    Alert when a user signs in from
                                    a previously unseen device.
                                </p>

                            </div>

                            <button
                                type="button"
                                className={
                                    `security-toggle ${
                                        isEnabled(
                                            "security_alert_new_device",
                                            true
                                        )
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    toggle(
                                        "security_alert_new_device",
                                        true
                                    )
                                }
                            >

                                <span />

                            </button>

                        </div>

                    </div>

                )}

            </section>


            {/* =================================================
                AUDIT LOGGING
            ================================================= */}

            <section className="security-card">

                <div className="security-card-header">

                    <div className="security-card-title">

                        <span className="security-section-icon">
                            📋
                        </span>

                        <div>

                            <h3>
                                Audit & Administrator Security
                            </h3>

                            <p>
                                Record important security activity
                                and protect administrator accounts.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="security-toggle-list">

                    {/* AUDIT */}

                    <div className="security-toggle-row">

                        <div>

                            <strong>
                                Enable Audit Logging
                            </strong>

                            <p>
                                Record security-sensitive actions
                                for investigation and auditing.
                            </p>

                        </div>

                        <button
                            type="button"
                            className={
                                `security-toggle ${
                                    isEnabled(
                                        "audit_logging",
                                        true
                                    )
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggle(
                                    "audit_logging",
                                    true
                                )
                            }
                        >

                            <span />

                        </button>

                    </div>


                    {/* ADMIN ALERTS */}

                    <div className="security-toggle-row">

                        <div>

                            <strong>
                                Administrator Security Alerts
                            </strong>

                            <p>
                                Allow important security events to
                                notify marketplace administrators.
                            </p>

                        </div>

                        <button
                            type="button"
                            className={
                                `security-toggle ${
                                    isEnabled(
                                        "security_admin_alerts",
                                        true
                                    )
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggle(
                                    "security_admin_alerts",
                                    true
                                )
                            }
                        >

                            <span />

                        </button>

                    </div>

                </div>

            </section>


            {/* =================================================
                SECURITY SUMMARY
            ================================================= */}

            <div className="security-summary">

                <div className="security-summary-icon">
                    🛡️
                </div>

                <div>

                    <h3>
                        Security Protection Status
                    </h3>

                    <p>

                        Your marketplace currently has{" "}

                        <strong>
                            {securityStatus.loginLock
                                ? "login protection"
                                : "no login protection"}
                        </strong>

                        ,{" "}

                        <strong>
                            {securityStatus.passwordSecurity
                                ? "password protection"
                                : "basic password protection"}
                        </strong>

                        ,{" "}

                        <strong>
                            {securityStatus.ipMonitoring
                                ? "IP monitoring"
                                : "IP monitoring disabled"}
                        </strong>

                        {" "}and{" "}

                        <strong>
                            {securityStatus.audit
                                ? "audit logging"
                                : "audit logging disabled"}
                        </strong>.

                    </p>

                </div>

            </div>

        </div>

    );

}


export default SecuritySettings;
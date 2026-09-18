function SecuritySettings({
    settings,
    handleChange
}) {

    return (

        <div className="settings-section">

            <div className="section-header">

                <div>

                    <h2>Security Settings</h2>

                    <p>
                        Configure account security, login protection,
                        password policies, and administrator security.
                    </p>

                </div>

            </div>


            <div className="settings-card">


                {/* ================= LOGIN SECURITY ================= */}

                <h3 className="settings-subtitle">

                    Login Security

                </h3>


                <div className="form-group">

                    <label>
                        Maximum Failed Login Attempts
                    </label>

                    <input
                        type="number"
                        min="1"
                        max="20"

                        value={
                            settings.max_failed_login_attempts || 5
                        }

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

                    <label>
                        Account Lock Duration (Minutes)
                    </label>

                    <input
                        type="number"
                        min="1"

                        value={
                            settings.account_lock_duration || 30
                        }

                        onChange={(e) =>
                            handleChange(
                                "account_lock_duration",
                                e.target.value
                            )
                        }
                    />

                    <small>
                        How long a user account remains locked after
                        too many failed login attempts.
                    </small>

                </div>


                <div className="form-group">

                    <label>
                        Session Timeout (Minutes)
                    </label>

                    <input
                        type="number"
                        min="5"

                        value={
                            settings.session_timeout || 60
                        }

                        onChange={(e) =>
                            handleChange(
                                "session_timeout",
                                e.target.value
                            )
                        }
                    />

                    <small>
                        Automatically log users out after this period
                        of inactivity.
                    </small>

                </div>



                {/* ================= TWO FACTOR AUTHENTICATION ================= */}

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

                        checked={
                            settings.enable_two_factor_auth === "true"
                        }

                        onChange={(e) =>
                            handleChange(
                                "enable_two_factor_auth",
                                e.target.checked.toString()
                            )
                        }
                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Require Two-Factor Authentication for Admins
                        </strong>

                        <p>
                            Administrators must use two-factor
                            authentication when accessing the admin panel.
                        </p>

                    </div>

                    <input
                        type="checkbox"

                        checked={
                            settings.require_admin_two_factor === "true"
                        }

                        onChange={(e) =>
                            handleChange(
                                "require_admin_two_factor",
                                e.target.checked.toString()
                            )
                        }
                    />

                </div>



                {/* ================= PASSWORD SECURITY ================= */}

                <h3 className="settings-subtitle">

                    Password Policy

                </h3>


                <div className="form-group">

                    <label>
                        Minimum Password Length
                    </label>

                    <input
                        type="number"
                        min="6"
                        max="50"

                        value={
                            settings.minimum_password_length || 8
                        }

                        onChange={(e) =>
                            handleChange(
                                "minimum_password_length",
                                e.target.value
                            )
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

                        checked={
                            settings.require_uppercase_password === "true"
                        }

                        onChange={(e) =>
                            handleChange(
                                "require_uppercase_password",
                                e.target.checked.toString()
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

                        checked={
                            settings.require_number_password === "true"
                        }

                        onChange={(e) =>
                            handleChange(
                                "require_number_password",
                                e.target.checked.toString()
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
                            Passwords must contain at least one special
                            character.
                        </p>

                    </div>

                    <input
                        type="checkbox"

                        checked={
                            settings.require_special_character === "true"
                        }

                        onChange={(e) =>
                            handleChange(
                                "require_special_character",
                                e.target.checked.toString()
                            )
                        }
                    />

                </div>



                {/* ================= PASSWORD EXPIRY ================= */}

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

                        checked={
                            settings.enable_password_expiry === "true"
                        }

                        onChange={(e) =>
                            handleChange(
                                "enable_password_expiry",
                                e.target.checked.toString()
                            )
                        }
                    />

                </div>


                <div className="form-group">

                    <label>
                        Password Expiry Period (Days)
                    </label>

                    <input
                        type="number"
                        min="1"

                        value={
                            settings.password_expiry_days || 90
                        }

                        onChange={(e) =>
                            handleChange(
                                "password_expiry_days",
                                e.target.value
                            )
                        }
                    />

                </div>



                {/* ================= IP SECURITY ================= */}

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

                        checked={
                            settings.enable_ip_monitoring === "true"
                        }

                        onChange={(e) =>
                            handleChange(
                                "enable_ip_monitoring",
                                e.target.checked.toString()
                            )
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

                        checked={
                            settings.block_suspicious_ips === "true"
                        }

                        onChange={(e) =>
                            handleChange(
                                "block_suspicious_ips",
                                e.target.checked.toString()
                            )
                        }
                    />

                </div>



                {/* ================= ADMIN SECURITY ================= */}

                <h3 className="settings-subtitle">

                    Administrator Security

                </h3>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Log Administrator Activities
                        </strong>

                        <p>
                            Record administrator actions in the
                            audit log system.
                        </p>

                    </div>

                    <input
                        type="checkbox"

                        checked={
                            settings.enable_audit_logging === "true"
                        }

                        onChange={(e) =>
                            handleChange(
                                "enable_audit_logging",
                                e.target.checked.toString()
                            )
                        }
                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Notify Admins of Suspicious Activity
                        </strong>

                        <p>
                            Send alerts when suspicious activity
                            is detected in the marketplace.
                        </p>

                    </div>

                    <input
                        type="checkbox"

                        checked={
                            settings.security_admin_alerts === "true"
                        }

                        onChange={(e) =>
                            handleChange(
                                "security_admin_alerts",
                                e.target.checked.toString()
                            )
                        }
                    />

                </div>


            </div>

        </div>

    );

}

export default SecuritySettings;
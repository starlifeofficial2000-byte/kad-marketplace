function NotificationSettings({
    settings,
    handleChange
}) {

    return (

        <div className="settings-section">

            <div className="section-header">

                <div>

                    <h2>Notification Settings</h2>

                    <p>
                        Configure notifications for users,
                        administrators, and marketplace activities.
                    </p>

                </div>

            </div>


            <div className="settings-card">


                {/* ================= EMAIL NOTIFICATIONS ================= */}

                <h3 className="settings-subtitle">

                    Email Notifications

                </h3>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Enable Email Notifications
                        </strong>

                        <p>
                            Allow the system to send notifications
                            through email.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.enable_email_notifications === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "enable_email_notifications",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Welcome Email
                        </strong>

                        <p>
                            Send a welcome email when a new user
                            creates an account.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.send_welcome_email === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "send_welcome_email",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Payment Email Notifications
                        </strong>

                        <p>
                            Send email notifications when payments
                            are completed.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.send_payment_email === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "send_payment_email",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


                {/* ================= SMS NOTIFICATIONS ================= */}

                <h3 className="settings-subtitle">

                    SMS Notifications

                </h3>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Enable SMS Notifications
                        </strong>

                        <p>
                            Allow the system to send important
                            notifications through SMS.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.enable_sms_notifications === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "enable_sms_notifications",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


                <div className="form-group">

                    <label>
                        SMS Provider
                    </label>


                    <select

                        value={
                            settings.sms_provider || "Hubtel"
                        }

                        onChange={(e) =>

                            handleChange(
                                "sms_provider",
                                e.target.value
                            )

                        }

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


                {/* ================= ADMIN NOTIFICATIONS ================= */}

                <h3 className="settings-subtitle">

                    Administrator Notifications

                </h3>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            New User Registration Alert
                        </strong>

                        <p>
                            Notify administrators when a new user
                            registers on the marketplace.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.admin_new_user_alert === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "admin_new_user_alert",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            New Product Alert
                        </strong>

                        <p>
                            Notify administrators when a seller
                            creates a new product.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.admin_new_product_alert === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "admin_new_product_alert",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            New Store Alert
                        </strong>

                        <p>
                            Notify administrators when a new store
                            is created.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.admin_new_store_alert === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "admin_new_store_alert",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


                {/* ================= SECURITY NOTIFICATIONS ================= */}

                <h3 className="settings-subtitle">

                    Security Notifications

                </h3>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Failed Login Alerts
                        </strong>

                        <p>
                            Alert administrators when suspicious
                            failed login attempts are detected.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.failed_login_alerts === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "failed_login_alerts",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Security Alerts
                        </strong>

                        <p>
                            Send alerts for important security
                            events and suspicious activities.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.enable_security_alerts === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "enable_security_alerts",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


                {/* ================= SYSTEM NOTIFICATIONS ================= */}

                <h3 className="settings-subtitle">

                    System Notifications

                </h3>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            System Maintenance Alerts
                        </strong>

                        <p>
                            Notify users when the system is under
                            maintenance.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.system_maintenance_alerts === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "system_maintenance_alerts",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Promotional Notifications
                        </strong>

                        <p>
                            Allow promotional messages and
                            marketplace announcements.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.promotional_notifications === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "promotional_notifications",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


            </div>

        </div>

    );

}

export default NotificationSettings;
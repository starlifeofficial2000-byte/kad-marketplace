import { useState } from "react";
import api from "../../../config/axios";

function EmailSettings({
    settings,
    handleChange
}) {

    const token = localStorage.getItem("token");

    const [testing, setTesting] = useState(false);
    const [message, setMessage] = useState("");

    const handleTestEmail = async () => {

        try {

            setTesting(true);
            setMessage("");

            const response = await axios.post(

                "/api/settings/test-email",

                {
                    email:
                        settings.test_email ||
                        settings.smtp_from_email
                },

                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );


            setMessage(

                response.data.message ||
                "Test email sent successfully."

            );

        }

        catch (error) {

            console.error(error);

            setMessage(

                error.response?.data?.message ||
                "Failed to send test email."

            );

        }

        finally {

            setTesting(false);

        }

    };


    return (

        <div className="settings-section">

            <div className="section-header">

                <div>

                    <h2>Email Settings</h2>

                    <p>
                        Configure SMTP and marketplace email settings.
                    </p>

                </div>

            </div>


            <div className="settings-card">


                {/* SMTP HOST */}

                <div className="form-group">

                    <label>
                        SMTP Host
                    </label>

                    <input

                        type="text"

                        value={
                            settings.smtp_host || ""
                        }

                        onChange={(e) =>
                            handleChange(
                                "smtp_host",
                                e.target.value
                            )
                        }

                        placeholder="smtp.gmail.com"

                    />

                </div>


                {/* SMTP PORT */}

                <div className="form-group">

                    <label>
                        SMTP Port
                    </label>

                    <input

                        type="number"

                        value={
                            settings.smtp_port || ""
                        }

                        onChange={(e) =>
                            handleChange(
                                "smtp_port",
                                e.target.value
                            )
                        }

                        placeholder="587"

                    />

                    <small>
                        Common ports: 587 for TLS or 465 for SSL.
                    </small>

                </div>


                {/* SMTP USERNAME */}

                <div className="form-group">

                    <label>
                        SMTP Username
                    </label>

                    <input

                        type="text"

                        value={
                            settings.smtp_username || ""
                        }

                        onChange={(e) =>
                            handleChange(
                                "smtp_username",
                                e.target.value
                            )
                        }

                        placeholder="your@email.com"

                    />

                </div>


                {/* SMTP PASSWORD */}

                <div className="form-group">

                    <label>
                        SMTP Password
                    </label>

                    <input

                        type="password"

                        value={
                            settings.smtp_password || ""
                        }

                        onChange={(e) =>
                            handleChange(
                                "smtp_password",
                                e.target.value
                            )
                        }

                        placeholder="Enter SMTP password"

                    />

                    <small>
                        For Gmail, use an App Password instead of your normal password.
                    </small>

                </div>


                {/* SMTP ENCRYPTION */}

                <div className="form-group">

                    <label>
                        Encryption
                    </label>

                    <select

                        value={
                            settings.smtp_encryption || "tls"
                        }

                        onChange={(e) =>
                            handleChange(
                                "smtp_encryption",
                                e.target.value
                            )
                        }

                    >

                        <option value="tls">
                            TLS
                        </option>

                        <option value="ssl">
                            SSL
                        </option>

                        <option value="none">
                            None
                        </option>

                    </select>

                </div>


                {/* FROM NAME */}

                <div className="form-group">

                    <label>
                        Sender Name
                    </label>

                    <input

                        type="text"

                        value={
                            settings.smtp_from_name || ""
                        }

                        onChange={(e) =>
                            handleChange(
                                "smtp_from_name",
                                e.target.value
                            )
                        }

                        placeholder="Marketplace Name"

                    />

                </div>


                {/* FROM EMAIL */}

                <div className="form-group">

                    <label>
                        Sender Email
                    </label>

                    <input

                        type="email"

                        value={
                            settings.smtp_from_email || ""
                        }

                        onChange={(e) =>
                            handleChange(
                                "smtp_from_email",
                                e.target.value
                            )
                        }

                        placeholder="noreply@example.com"

                    />

                </div>


                {/* EMAIL ENABLE */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Enable Email System
                        </strong>

                        <p>
                            Allow the marketplace to send system emails.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.email_enabled === "true"
                        }

                        onChange={(e) =>
                            handleChange(
                                "email_enabled",
                                e.target.checked.toString()
                            )
                        }

                    />

                </div>


                {/* REGISTRATION EMAIL */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Registration Emails
                        </strong>

                        <p>
                            Send welcome emails when new users register.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.registration_email === "true"
                        }

                        onChange={(e) =>
                            handleChange(
                                "registration_email",
                                e.target.checked.toString()
                            )
                        }

                    />

                </div>


                {/* PASSWORD RESET */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Password Reset Emails
                        </strong>

                        <p>
                            Allow users to receive password reset emails.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.password_reset_email === "true"
                        }

                        onChange={(e) =>
                            handleChange(
                                "password_reset_email",
                                e.target.checked.toString()
                            )
                        }

                    />

                </div>


                {/* TEST EMAIL */}

                <div className="form-group">

                    <label>
                        Test Email Address
                    </label>

                    <input

                        type="email"

                        value={
                            settings.test_email || ""
                        }

                        onChange={(e) =>
                            handleChange(
                                "test_email",
                                e.target.value
                            )
                        }

                        placeholder="test@example.com"

                    />

                </div>


                {/* TEST BUTTON */}

                <div className="email-test-section">

                    <button

                        type="button"

                        className="test-email-btn"

                        onClick={handleTestEmail}

                        disabled={testing}

                    >

                        {testing

                            ? "Sending Test Email..."

                            : "Send Test Email"

                        }

                    </button>


                    {message && (

                        <p className="email-test-message">

                            {message}

                        </p>

                    )}

                </div>


            </div>

        </div>

    );

}

export default EmailSettings;
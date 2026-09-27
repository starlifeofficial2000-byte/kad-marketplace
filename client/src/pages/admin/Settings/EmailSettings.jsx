import { useState } from "react";
import api from "../../../config/axios";
import "./EmailSettings.css";

function EmailSettings({
    settings,
    handleChange
}) {

    const [testing, setTesting] = useState(false);

    const [message, setMessage] = useState("");

    const emailEnabled =
        settings?.email_enabled === "true";

    const emailProvider =
        settings?.email_provider || "resend";

    const resendFromName =
        settings?.resend_from_name ||
        settings?.marketplace_name ||
        "KAD Marketplace";

    const resendFromEmail =
        settings?.resend_from_email ||
        "";

    const smtpHost =
        settings?.smtp_host || "";

    const smtpPort =
        settings?.smtp_port || "587";

    const smtpUsername =
        settings?.smtp_username || "";

    const smtpPassword =
        settings?.smtp_password || "";

    const smtpEncryption =
        settings?.smtp_encryption || "tls";

    const smtpFromName =
        settings?.smtp_from_name ||
        settings?.marketplace_name ||
        "KAD Marketplace";

    const smtpFromEmail =
        settings?.smtp_from_email ||
        settings?.support_email ||
        "";

    const registrationEmail =
        settings?.registration_email === "true";

    const passwordResetEmail =
        settings?.password_reset_email === "true";

    const orderEmail =
        settings?.order_email === "true";

    const paymentEmail =
        settings?.payment_email === "true";

    const testEmail =
        settings?.test_email || "";


    /* =====================================================
       BOOLEAN HANDLER
    ===================================================== */

    const updateBoolean = (
        key,
        value
    ) => {

        handleChange(
            key,
            value
                ? "true"
                : "false"
        );

    };


    /* =====================================================
       PROVIDER HANDLER
    ===================================================== */

    const changeProvider = (
        provider
    ) => {

        handleChange(
            "email_provider",
            provider
        );

        setMessage("");

    };


    /* =====================================================
       TEST EMAIL
    ===================================================== */

    const handleTestEmail =
        async () => {

            try {

                setTesting(true);

                setMessage("");


                const recipient =
                    testEmail ||
                    (
                        emailProvider === "resend"
                            ? resendFromEmail
                            : smtpFromEmail
                    );


                if (!recipient) {

                    setMessage(
                        "Please enter a test email address or configure a sender email address."
                    );

                    return;

                }


                /*
                 * IMPORTANT:
                 *
                 * We intentionally do NOT send
                 * SMTP credentials or Resend API
                 * credentials from the frontend.
                 *
                 * The backend emailService decides
                 * which provider to use.
                 */

                const response =
                    await api.post(
                        "/settings/test-email",
                        {
                            email: recipient
                        }
                    );


                setMessage(
                    response.data?.message ||
                    "Test email sent successfully."
                );


            } catch (error) {

                console.error(
                    "TEST EMAIL ERROR:",
                    error
                );


                setMessage(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to send test email."
                );


            } finally {

                setTesting(false);

            }

        };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="settings-section">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="section-header">

                <div>

                    <h2>
                        Email Settings
                    </h2>

                    <p>
                        Configure the marketplace email
                        system and delivery provider.
                    </p>

                </div>

            </div>


            {/* =================================================
                MAIN CARD
            ================================================= */}

            <div className="settings-card">


                {/* =================================================
                    EMAIL SYSTEM
                ================================================= */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Enable Email System
                        </strong>

                        <p>
                            Allow the marketplace to
                            send system emails.
                        </p>

                    </div>


                    <input
                        type="checkbox"
                        checked={emailEnabled}
                        onChange={(e) =>
                            updateBoolean(
                                "email_enabled",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* =================================================
                    EMAIL PROVIDER
                ================================================= */}

                <div className="form-group">

                    <label>
                        Email Provider
                    </label>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(2, minmax(0, 1fr))",
                            gap: "10px",
                            marginTop: "8px"
                        }}
                    >

                        <button
                            type="button"
                            disabled={!emailEnabled}
                            onClick={() =>
                                changeProvider("resend")
                            }
                            style={{
                                padding: "14px 16px",
                                borderRadius: "10px",
                                border:
                                    emailProvider === "resend"
                                        ? "2px solid #7c3aed"
                                        : "1px solid #d1d5db",
                                background:
                                    emailProvider === "resend"
                                        ? "#f5f3ff"
                                        : "#ffffff",
                                color:
                                    emailProvider === "resend"
                                        ? "#6d28d9"
                                        : "#374151",
                                fontWeight: 700,
                                cursor:
                                    emailEnabled
                                        ? "pointer"
                                        : "not-allowed"
                            }}
                        >
                            🟣 Resend API

                            <div
                                style={{
                                    fontSize: "12px",
                                    fontWeight: 400,
                                    marginTop: "4px"
                                }}
                            >
                                HTTPS email delivery
                            </div>

                        </button>


                        <button
                            type="button"
                            disabled={!emailEnabled}
                            onClick={() =>
                                changeProvider("smtp")
                            }
                            style={{
                                padding: "14px 16px",
                                borderRadius: "10px",
                                border:
                                    emailProvider === "smtp"
                                        ? "2px solid #2563eb"
                                        : "1px solid #d1d5db",
                                background:
                                    emailProvider === "smtp"
                                        ? "#eff6ff"
                                        : "#ffffff",
                                color:
                                    emailProvider === "smtp"
                                        ? "#1d4ed8"
                                        : "#374151",
                                fontWeight: 700,
                                cursor:
                                    emailEnabled
                                        ? "pointer"
                                        : "not-allowed"
                            }}
                        >
                            🔵 SMTP

                            <div
                                style={{
                                    fontSize: "12px",
                                    fontWeight: 400,
                                    marginTop: "4px"
                                }}
                            >
                                SMTP / Nodemailer
                            </div>

                        </button>

                    </div>

                </div>


                {/* =================================================
                    RESEND CONFIGURATION
                ================================================= */}

                {emailProvider === "resend" && (

                    <>

                        <div
                            className="settings-info-card"
                            style={{
                                marginTop: "18px"
                            }}
                        >

                            <div className="settings-info-icon">
                                🚀
                            </div>

                            <div>

                                <strong>
                                    Resend API
                                </strong>

                                <p>
                                    The marketplace will send
                                    emails through Resend using
                                    the RESEND_API_KEY configured
                                    on the server.
                                </p>

                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Resend From Name
                            </label>

                            <input
                                type="text"
                                value={resendFromName}
                                disabled={!emailEnabled}
                                onChange={(e) =>
                                    handleChange(
                                        "resend_from_name",
                                        e.target.value
                                    )
                                }
                                placeholder="KAD Marketplace"
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Resend From Email
                            </label>

                            <input
                                type="email"
                                value={resendFromEmail}
                                disabled={!emailEnabled}
                                onChange={(e) =>
                                    handleChange(
                                        "resend_from_email",
                                        e.target.value
                                    )
                                }
                                placeholder="noreply@kadmarket.com"
                                autoComplete="email"
                            />

                            <small>
                                This sender must be verified
                                with your Resend account/domain.
                            </small>

                        </div>

                    </>

                )}


                {/* =================================================
                    SMTP CONFIGURATION
                ================================================= */}

                {emailProvider === "smtp" && (

                    <>

                        <div
                            className="settings-info-card"
                            style={{
                                marginTop: "18px"
                            }}
                        >

                            <div className="settings-info-icon">
                                🔐
                            </div>

                            <div>

                                <strong>
                                    SMTP / Nodemailer
                                </strong>

                                <p>
                                    Use this provider when your
                                    hosting environment supports
                                    outbound SMTP connections.
                                </p>

                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                SMTP Host
                            </label>

                            <input
                                type="text"
                                value={smtpHost}
                                disabled={!emailEnabled}
                                onChange={(e) =>
                                    handleChange(
                                        "smtp_host",
                                        e.target.value
                                    )
                                }
                                placeholder="smtp.gmail.com"
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                SMTP Port
                            </label>

                            <input
                                type="number"
                                min="1"
                                max="65535"
                                value={smtpPort}
                                disabled={!emailEnabled}
                                onChange={(e) =>
                                    handleChange(
                                        "smtp_port",
                                        e.target.value
                                    )
                                }
                                placeholder="587"
                            />

                            <small>
                                Common ports: 587 for TLS
                                or 465 for SSL.
                            </small>

                        </div>


                        <div className="form-group">

                            <label>
                                SMTP Username
                            </label>

                            <input
                                type="text"
                                value={smtpUsername}
                                disabled={!emailEnabled}
                                onChange={(e) =>
                                    handleChange(
                                        "smtp_username",
                                        e.target.value
                                    )
                                }
                                placeholder="your@email.com"
                                autoComplete="username"
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                SMTP Password
                            </label>

                            <input
                                type="password"
                                value={smtpPassword}
                                disabled={!emailEnabled}
                                onChange={(e) =>
                                    handleChange(
                                        "smtp_password",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter SMTP password"
                                autoComplete="new-password"
                            />

                            <small>
                                For Gmail, use an App Password
                                instead of your normal password.
                            </small>

                        </div>


                        <div className="form-group">

                            <label>
                                Encryption
                            </label>

                            <select
                                value={smtpEncryption}
                                disabled={!emailEnabled}
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


                        <div className="form-group">

                            <label>
                                Sender Name
                            </label>

                            <input
                                type="text"
                                value={smtpFromName}
                                disabled={!emailEnabled}
                                onChange={(e) =>
                                    handleChange(
                                        "smtp_from_name",
                                        e.target.value
                                    )
                                }
                                placeholder="KAD Marketplace"
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Sender Email
                            </label>

                            <input
                                type="email"
                                value={smtpFromEmail}
                                disabled={!emailEnabled}
                                onChange={(e) =>
                                    handleChange(
                                        "smtp_from_email",
                                        e.target.value
                                    )
                                }
                                placeholder="noreply@kadmarket.com"
                                autoComplete="email"
                            />

                        </div>

                    </>

                )}


                {/* =================================================
                    EMAIL TYPES
                ================================================= */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Registration Emails
                        </strong>

                        <p>
                            Send welcome emails when
                            new users register.
                        </p>

                    </div>

                    <input
                        type="checkbox"
                        checked={registrationEmail}
                        disabled={!emailEnabled}
                        onChange={(e) =>
                            updateBoolean(
                                "registration_email",
                                e.target.checked
                            )
                        }
                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Password Reset Emails
                        </strong>

                        <p>
                            Allow users to receive
                            password reset emails.
                        </p>

                    </div>

                    <input
                        type="checkbox"
                        checked={passwordResetEmail}
                        disabled={!emailEnabled}
                        onChange={(e) =>
                            updateBoolean(
                                "password_reset_email",
                                e.target.checked
                            )
                        }
                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Order Emails
                        </strong>

                        <p>
                            Send email notifications
                            related to marketplace orders.
                        </p>

                    </div>

                    <input
                        type="checkbox"
                        checked={orderEmail}
                        disabled={!emailEnabled}
                        onChange={(e) =>
                            updateBoolean(
                                "order_email",
                                e.target.checked
                            )
                        }
                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Payment Emails
                        </strong>

                        <p>
                            Send email notifications
                            when payments are completed.
                        </p>

                    </div>

                    <input
                        type="checkbox"
                        checked={paymentEmail}
                        disabled={!emailEnabled}
                        onChange={(e) =>
                            updateBoolean(
                                "payment_email",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* =================================================
                    TEST EMAIL
                ================================================= */}

                <div className="form-group">

                    <label>
                        Test Email Address
                    </label>

                    <input
                        type="email"
                        value={testEmail}
                        disabled={!emailEnabled}
                        onChange={(e) =>
                            handleChange(
                                "test_email",
                                e.target.value
                            )
                        }
                        placeholder="test@example.com"
                    />

                    <small>
                        Enter an email address where
                        you want to receive a test message.
                    </small>

                </div>


                <div className="email-test-section">

                    <button
                        type="button"
                        className="test-email-btn"
                        onClick={handleTestEmail}
                        disabled={
                            testing ||
                            !emailEnabled
                        }
                    >

                        {testing
                            ? "Sending Test Email..."
                            : `Send Test Email via ${
                                emailProvider === "resend"
                                    ? "Resend"
                                    : "SMTP"
                            }`
                        }

                    </button>


                    {message && (

                        <p className="email-test-message">
                            {message}
                        </p>

                    )}

                </div>


            </div>


            {/* =================================================
                EMAIL STATUS
            ================================================= */}

            <div className="settings-info-card">

                <div className="settings-info-icon">
                    ✉️
                </div>

                <div>

                    <strong>
                        Email Configuration
                    </strong>

                    <p>

                        The email system is{" "}

                        <strong>
                            {emailEnabled
                                ? "enabled"
                                : "disabled"}
                        </strong>

                        {" "}and currently configured to use{" "}

                        <strong>
                            {emailProvider === "resend"
                                ? "Resend API"
                                : "SMTP"}
                        </strong>.

                    </p>

                </div>

            </div>

        </div>

    );

}

export default EmailSettings;
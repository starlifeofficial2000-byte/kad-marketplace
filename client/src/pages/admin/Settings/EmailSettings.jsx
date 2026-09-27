import { useState } from "react";
import api from "../../../config/axios";
import "./EmailSettings.css";

function EmailSettings({
    settings,
    handleChange
}) {

    const [testing, setTesting] = useState(false);
    const [message, setMessage] = useState("");

    /* =====================================================
       EMAIL SYSTEM
    ===================================================== */

    const emailEnabled =
        settings?.email_enabled === "true";

    /* =====================================================
       EMAIL PROVIDER
    ===================================================== */

    const emailProvider =
        settings?.email_provider || "resend";

    /* =====================================================
       RESEND SETTINGS
    ===================================================== */

    const resendFromName =
        settings?.resend_from_name ||
        settings?.marketplace_name ||
        "KAD Marketplace";

    const resendFromEmail =
        settings?.resend_from_email ||
        "";

    /* =====================================================
       SMTP SETTINGS
    ===================================================== */

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

    /* =====================================================
       EMAIL TYPE SETTINGS
    ===================================================== */

    const registrationEmail =
        settings?.registration_email === "true";

    const passwordResetEmail =
        settings?.password_reset_email === "true";

    const orderEmail =
        settings?.order_email === "true";
const paymentEmail =
    settings?.payment_email === "true";

const subscriptionEmail =
    settings?.subscription_email === "true";

    /* =====================================================
       TEST EMAIL
    ===================================================== */

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


                /*
                 * The recipient is the address that
                 * should RECEIVE the test email.
                 *
                 * It is NOT the Resend sender address.
                 */

                const recipient =
                    testEmail.trim();


                if (!recipient) {

                    setMessage(
                        "Please enter the email address that should receive the test email."
                    );

                    return;

                }


                /*
                 * The frontend never sends:
                 *
                 * - RESEND_API_KEY
                 * - SMTP password
                 * - SMTP credentials
                 *
                 * The backend emailService determines
                 * which provider should be used.
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


                    <select
                        value={emailProvider}
                        disabled={!emailEnabled}
                        onChange={(e) =>
                            changeProvider(
                                e.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            padding: "14px 16px",
                            marginTop: "8px",
                            borderRadius: "10px",
                            border: "1px solid #d1d5db",
                            background: "#ffffff",
                            color: "#111827",
                            fontSize: "15px",
                            fontWeight: 600,
                            cursor: emailEnabled
                                ? "pointer"
                                : "not-allowed"
                        }}
                    >

                        <option value="resend">
                            🟣 Resend API — HTTPS email delivery
                        </option>

                        <option value="smtp">
                            🔵 SMTP / Nodemailer
                        </option>

                    </select>


                    <small>
                        Select how KAD Marketplace should
                        send emails. Resend uses the
                        RESEND_API_KEY stored securely on
                        the server. SMTP uses the SMTP
                        credentials configured below.
                    </small>

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


                        {/* =========================================
                            RESEND FROM NAME
                        ========================================= */}

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


                        {/* =========================================
                            RESEND FROM EMAIL
                        ========================================= */}

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
                                This email must use a domain
                                verified with your Resend account.
                                Example:
                                noreply@kadmarket.com
                            </small>

                        </div>


                        {/* =========================================
                            RESEND STATUS
                        ========================================= */}

                        <div
                            className="settings-info-card"
                            style={{
                                marginTop: "10px"
                            }}
                        >

                            <div className="settings-info-icon">
                                🔐
                            </div>


                            <div>

                                <strong>
                                    Resend API Key
                                </strong>

                                <p>
                                    The Resend API key is stored
                                    only on the backend/server.
                                    It is never stored or exposed
                                    in this frontend settings page.
                                </p>

                            </div>

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


                        {/* =========================================
                            SMTP HOST
                        ========================================= */}

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


                        {/* =========================================
                            SMTP PORT
                        ========================================= */}

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


                        {/* =========================================
                            SMTP USERNAME
                        ========================================= */}

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


                        {/* =========================================
                            SMTP PASSWORD
                        ========================================= */}

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


                        {/* =========================================
                            SMTP ENCRYPTION
                        ========================================= */}

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


                        {/* =========================================
                            SMTP FROM NAME
                        ========================================= */}

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


                        {/* =========================================
                            SMTP FROM EMAIL
                        ========================================= */}

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
                <div className="toggle-setting">

                    <div>

                        <strong>
                            Subscription Emails
                        </strong>

                        <p>
                            Send email notifications when
                            subscriptions are activated.
                        </p>

                    </div>


                    <input
                        type="checkbox"
                        checked={subscriptionEmail}
                        disabled={!emailEnabled}
                        onChange={(e) =>
                            updateBoolean(
                                "subscription_email",
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
                        autoComplete="email"
                    />


                    <small>
                        Enter the email address where you
                        want to receive the test message.
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

                        {" "}and currently configured
                        to use{" "}

                        <strong>
                            {emailProvider === "resend"
                                ? "Resend API"
                                : "SMTP"}
                        </strong>.

                    </p>


                    {emailProvider === "resend" && (

                        <p>

                            Sender:

                            {" "}

                            <strong>
                                {resendFromEmail ||
                                    "Not configured"}
                            </strong>

                        </p>

                    )}


                    {emailProvider === "smtp" && (

                        <p>

                            SMTP Host:

                            {" "}

                            <strong>
                                {smtpHost ||
                                    "Not configured"}
                            </strong>

                        </p>

                    )}

                </div>

            </div>


        </div>

    );

}

export default EmailSettings;
import { useState } from "react";

import api from "../../../config/axios";


function EmailSettings({
    settings,
    handleChange
}) {

    /* =====================================================
       STATE
    ===================================================== */

    const [
        testing,
        setTesting
    ] = useState(false);


    const [
        message,
        setMessage
    ] = useState("");


    /* =====================================================
       SAFE SETTINGS
    ===================================================== */

    const emailEnabled =
        settings?.email_enabled === "true";


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
       TEST EMAIL
    ===================================================== */

    const handleTestEmail =
        async () => {

            try {

                setTesting(true);

                setMessage("");


                /*
                =================================================
                VALIDATE TEST EMAIL
                =================================================
                */

                const recipient =
                    testEmail ||
                    smtpFromEmail;


                if (!recipient) {

                    setMessage(
                        "Please enter a test email address or sender email address."
                    );

                    return;

                }


                /*
                =================================================
                SEND TEST EMAIL
                =================================================

                Use the existing authenticated Axios
                instance instead of an undefined axios
                variable.
                */

                const response =
                    await api.post(
                        "/settings/test-email",
                        {
                            email: recipient,

                            smtp: {

                                host:
                                    smtpHost,

                                port:
                                    Number(
                                        smtpPort
                                    ) || 587,

                                username:
                                    smtpUsername,

                                password:
                                    smtpPassword,

                                encryption:
                                    smtpEncryption,

                                fromName:
                                    smtpFromName,

                                fromEmail:
                                    smtpFromEmail

                            }

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
       COMPONENT
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
                        Configure SMTP and marketplace
                        email settings.
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
                        checked={
                            emailEnabled
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "email_enabled",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* =================================================
                    SMTP HOST
                ================================================= */}

                <div className="form-group">

                    <label>
                        SMTP Host
                    </label>


                    <input
                        type="text"
                        value={
                            smtpHost
                        }
                        disabled={
                            !emailEnabled
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


                {/* =================================================
                    SMTP PORT
                ================================================= */}

                <div className="form-group">

                    <label>
                        SMTP Port
                    </label>


                    <input
                        type="number"
                        min="1"
                        max="65535"
                        value={
                            smtpPort
                        }
                        disabled={
                            !emailEnabled
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
                        Common ports: 587 for TLS
                        or 465 for SSL.
                    </small>

                </div>


                {/* =================================================
                    SMTP USERNAME
                ================================================= */}

                <div className="form-group">

                    <label>
                        SMTP Username
                    </label>


                    <input
                        type="text"
                        value={
                            smtpUsername
                        }
                        disabled={
                            !emailEnabled
                        }
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


                {/* =================================================
                    SMTP PASSWORD
                ================================================= */}

                <div className="form-group">

                    <label>
                        SMTP Password
                    </label>


                    <input
                        type="password"
                        value={
                            smtpPassword
                        }
                        disabled={
                            !emailEnabled
                        }
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
                        instead of your normal account
                        password.
                    </small>

                </div>


                {/* =================================================
                    SMTP ENCRYPTION
                ================================================= */}

                <div className="form-group">

                    <label>
                        Encryption
                    </label>


                    <select
                        value={
                            smtpEncryption
                        }
                        disabled={
                            !emailEnabled
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


                {/* =================================================
                    SENDER NAME
                ================================================= */}

                <div className="form-group">

                    <label>
                        Sender Name
                    </label>


                    <input
                        type="text"
                        value={
                            smtpFromName
                        }
                        disabled={
                            !emailEnabled
                        }
                        onChange={(e) =>
                            handleChange(
                                "smtp_from_name",
                                e.target.value
                            )
                        }
                        placeholder="KAD Marketplace"
                    />

                </div>


                {/* =================================================
                    SENDER EMAIL
                ================================================= */}

                <div className="form-group">

                    <label>
                        Sender Email
                    </label>


                    <input
                        type="email"
                        value={
                            smtpFromEmail
                        }
                        disabled={
                            !emailEnabled
                        }
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


                {/* =================================================
                    REGISTRATION EMAIL
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
                        checked={
                            registrationEmail
                        }
                        disabled={
                            !emailEnabled
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "registration_email",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* =================================================
                    PASSWORD RESET EMAIL
                ================================================= */}

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
                        checked={
                            passwordResetEmail
                        }
                        disabled={
                            !emailEnabled
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "password_reset_email",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* =================================================
                    ORDER EMAIL
                ================================================= */}

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
                        checked={
                            orderEmail
                        }
                        disabled={
                            !emailEnabled
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "order_email",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* =================================================
                    PAYMENT EMAIL
                ================================================= */}

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
                        checked={
                            paymentEmail
                        }
                        disabled={
                            !emailEnabled
                        }
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
                        value={
                            testEmail
                        }
                        disabled={
                            !emailEnabled
                        }
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


                {/* =================================================
                    TEST BUTTON
                ================================================= */}

                <div className="email-test-section">

                    <button
                        type="button"
                        className="test-email-btn"
                        onClick={
                            handleTestEmail
                        }
                        disabled={
                            testing ||
                            !emailEnabled
                        }
                    >

                        {testing
                            ? "Sending Test Email..."
                            : "Send Test Email"
                        }

                    </button>


                    {message && (

                        <p
                            className="email-test-message"
                        >
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

                        {smtpHost
                            ? ` and configured to use ${smtpHost}.`
                            : "."
                        }

                    </p>

                </div>

            </div>


        </div>

    );

}


export default EmailSettings;
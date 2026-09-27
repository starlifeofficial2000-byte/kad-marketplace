const nodemailer = require("nodemailer");
const { Resend } = require("resend");

const {
    getMarketplaceSettings
} = require("./marketplaceSettingsService");


/* =========================================================
   GET EMAIL CONFIGURATION
========================================================= */

async function getEmailConfiguration() {

    const settings =
        await getMarketplaceSettings();

    const configuration =
        settings?.configuration || {};

    const email =
        configuration.email || {};


    /*
     * IMPORTANT
     *
     * Resend and SMTP are completely separate.
     *
     * We intentionally do NOT copy SMTP sender
     * information into the Resend configuration.
     */

    return {

        enabled:
            email.enabled !== false,

        provider:
            String(
                email.provider || "resend"
            ).toLowerCase(),

        /* ==============================
           RESEND
        ============================== */

        resendFromName:
            String(
                email.resendFromName ||
                "KAD Marketplace"
            ).trim(),

        resendFromEmail:
            String(
                email.resendFromEmail ||
                ""
            ).trim(),

        /* ==============================
           SMTP
        ============================== */

        smtpHost:
            String(
                email.smtpHost ||
                ""
            ).trim(),

        smtpPort:
            Number(
                email.smtpPort
            ) || 587,

        smtpUsername:
            String(
                email.smtpUsername ||
                ""
            ).trim(),

        smtpPassword:
            String(
                email.smtpPassword ||
                ""
            ),

        encryption:
            String(
                email.encryption ||
                "tls"
            ).toLowerCase(),

        fromName:
            String(
                email.fromName ||
                "KAD Marketplace"
            ).trim(),

        fromEmail:
            String(
                email.fromEmail ||
                ""
            ).trim(),

        /* ==============================
           EMAIL TYPES
        ============================== */

        registrationEmail:
            email.registrationEmail !== false,

        passwordResetEmail:
            email.passwordResetEmail !== false,

        orderEmail:
            email.orderEmail !== false,

        paymentEmail:
            email.paymentEmail !== false

    };

}


/* =========================================================
   SEND WITH RESEND
========================================================= */

async function sendWithResend(
    emailConfig,
    {
        to,
        subject,
        html,
        text
    }
) {

    const apiKey =
        process.env.RESEND_API_KEY;


    /* =====================================================
       CHECK API KEY
    ===================================================== */

    if (!apiKey) {

        throw new Error(
            "RESEND_API_KEY is not configured on the server."
        );

    }


    /* =====================================================
       RESEND SENDER
    ===================================================== */

    const fromName =
        emailConfig.resendFromName ||
        "KAD Marketplace";


    /*
     * IMPORTANT:
     *
     * DO NOT FALL BACK TO:
     *
     * emailConfig.fromEmail
     *
     * because that belongs to SMTP.
     *
     * This prevents an old Gmail SMTP address
     * from accidentally being sent to Resend.
     */

    const fromEmail =
        emailConfig.resendFromEmail;


    /* =====================================================
       VALIDATE RESEND SENDER
    ===================================================== */

    if (!fromEmail) {

        throw new Error(
            "Resend From Email is not configured. Set a verified sender such as noreply@kadmarket.com in Admin Settings."
        );

    }


    /*
     * Basic email validation.
     */

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(fromEmail)) {

        throw new Error(
            `Invalid Resend From Email: ${fromEmail}`
        );

    }


    /* =====================================================
       LOG SAFE CONFIGURATION
       NEVER LOG THE API KEY
    ===================================================== */

    console.log(
        "[EMAIL][RESEND]",
        {
            fromName,
            fromEmail,
            to,
            subject
        }
    );


    /* =====================================================
       CREATE RESEND CLIENT
    ===================================================== */

    const resend =
        new Resend(apiKey);


    /* =====================================================
       SEND EMAIL
    ===================================================== */

    const result =
        await resend.emails.send({

            from:
                `${fromName} <${fromEmail}>`,

            to: [to],

            subject,

            html,

            text:
                text || ""

        });


    /* =====================================================
       HANDLE RESEND ERROR
    ===================================================== */

    if (result?.error) {

        console.error(
            "[EMAIL][RESEND] ERROR:",
            result.error
        );


        throw new Error(
            result.error.message ||
            "Resend failed to send the email."
        );

    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    console.log(
        "[EMAIL][RESEND] SENT:",
        result?.data?.id || null
    );


    return {

        provider: "resend",

        id:
            result?.data?.id ||
            null

    };

}


/* =========================================================
   CREATE SMTP TRANSPORTER
========================================================= */

function createSMTPTransporter(
    emailConfig
) {

    const host =
        String(
            emailConfig.smtpHost || ""
        ).trim();


    const port =
        Number(
            emailConfig.smtpPort
        ) || 587;


    const username =
        String(
            emailConfig.smtpUsername || ""
        ).trim();


    const password =
        String(
            emailConfig.smtpPassword || ""
        );


    const encryption =
        String(
            emailConfig.encryption ||
            "tls"
        ).toLowerCase();


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!host) {

        throw new Error(
            "SMTP host is not configured."
        );

    }


    if (!username) {

        throw new Error(
            "SMTP username is not configured."
        );

    }


    if (!password) {

        throw new Error(
            "SMTP password is not configured."
        );

    }


    /* =====================================================
       SECURITY SETTINGS
    ===================================================== */

    let secure = false;

    let requireTLS = false;


    if (
        encryption === "ssl" ||
        port === 465
    ) {

        secure = true;

    }

    else if (
        encryption === "tls" ||
        encryption === "starttls"
    ) {

        secure = false;

        requireTLS = true;

    }


    /* =====================================================
       CREATE TRANSPORT
    ===================================================== */

    return nodemailer.createTransport({

        host,

        port,

        secure,

        requireTLS,

        connectionTimeout: 10000,

        greetingTimeout: 10000,

        socketTimeout: 15000,

        auth: {

            user:
                username,

            pass:
                password

        }

    });

}


/* =========================================================
   SEND WITH SMTP
========================================================= */

async function sendWithSMTP(
    emailConfig,
    {
        to,
        subject,
        html,
        text
    }
) {

    const transporter =
        createSMTPTransporter(
            emailConfig
        );


    /* =====================================================
       SMTP SENDER
    ===================================================== */

    const fromName =
        emailConfig.fromName ||
        "KAD Marketplace";


    const fromEmail =
        emailConfig.fromEmail ||
        emailConfig.smtpUsername;


    if (!fromEmail) {

        throw new Error(
            "SMTP sender email is not configured."
        );

    }


    console.log(
        "[EMAIL][SMTP]",
        {
            host:
                emailConfig.smtpHost,

            port:
                emailConfig.smtpPort,

            fromEmail,

            to,

            subject
        }
    );


    /* =====================================================
       SEND
    ===================================================== */

    const info =
        await transporter.sendMail({

            from:
                `${fromName} <${fromEmail}>`,

            to,

            subject,

            html,

            text:
                text || ""

        });


    console.log(
        "[EMAIL][SMTP] SENT:",
        info.messageId || null
    );


    return {

        provider: "smtp",

        id:
            info.messageId ||
            null

    };

}


/* =========================================================
   MAIN SEND EMAIL FUNCTION
========================================================= */

async function sendEmail(
    to,
    subject,
    html,
    text = ""
) {

    /* =====================================================
       VALIDATE RECIPIENT
    ===================================================== */

    if (!to) {

        throw new Error(
            "Recipient email address is required."
        );

    }


    /* =====================================================
       GET CONFIGURATION
    ===================================================== */

    const emailConfig =
        await getEmailConfiguration();


    /* =====================================================
       CHECK EMAIL SYSTEM
    ===================================================== */

    if (
        emailConfig.enabled === false
    ) {

        throw new Error(
            "Email system is disabled."
        );

    }


    /* =====================================================
       PROVIDER
    ===================================================== */

    const provider =
        String(
            emailConfig.provider ||
            "resend"
        ).toLowerCase();


    console.log(
        `[EMAIL] Provider selected: ${provider}`
    );


    /* =====================================================
       RESEND
    ===================================================== */

    if (
        provider === "resend"
    ) {

        return sendWithResend(

            emailConfig,

            {
                to,
                subject,
                html,
                text
            }

        );

    }


    /* =====================================================
       SMTP
    ===================================================== */

    if (
        provider === "smtp"
    ) {

        return sendWithSMTP(

            emailConfig,

            {
                to,
                subject,
                html,
                text
            }

        );

    }


    /* =====================================================
       INVALID PROVIDER
    ===================================================== */

    throw new Error(
        `Unsupported email provider: ${provider}. Use "resend" or "smtp".`
    );

}


/* =========================================================
   TEST EMAIL
========================================================= */

async function sendTestEmail(
    to
) {

    if (!to) {

        throw new Error(
            "Test email recipient is required."
        );

    }


    /* =====================================================
       GET SETTINGS
    ===================================================== */

    const marketplaceSettings =
        await getMarketplaceSettings();


    const emailConfig =
        marketplaceSettings
            ?.configuration
            ?.email || {};


    const provider =
        String(
            emailConfig.provider ||
            "resend"
        ).toLowerCase();


    const marketplaceName =
        marketplaceSettings
            ?.marketplaceName ||
        marketplaceSettings
            ?.marketplace_name ||
        "KAD Marketplace";


    /* =====================================================
       SUBJECT
    ===================================================== */

    const subject =
        `${marketplaceName} - Test Email`;


    /* =====================================================
       HTML
    ===================================================== */

    const html = `

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>
                ${marketplaceName} Test Email
            </title>

        </head>


        <body
            style="
                margin:0;
                padding:0;
                background:#f3f4f6;
                font-family:Arial,Helvetica,sans-serif;
            "
        >

            <div
                style="
                    max-width:600px;
                    margin:40px auto;
                    padding:20px;
                "
            >

                <div
                    style="
                        background:#ffffff;
                        border:1px solid #e5e7eb;
                        border-radius:14px;
                        padding:32px;
                    "
                >

                    <h2
                        style="
                            margin:0 0 20px;
                            color:#111827;
                        "
                    >
                        ${marketplaceName}
                    </h2>


                    <p
                        style="
                            color:#374151;
                            line-height:1.7;
                        "
                    >
                        This is a test email from your
                        ${marketplaceName} email configuration.
                    </p>


                    <div
                        style="
                            margin:24px 0;
                            padding:16px;
                            background:#f9fafb;
                            border-radius:10px;
                        "
                    >

                        <p
                            style="
                                margin:0;
                                color:#374151;
                            "
                        >

                            <strong>
                                Email Provider:
                            </strong>

                            ${provider.toUpperCase()}

                        </p>

                    </div>


                    <p
                        style="
                            color:#374151;
                            line-height:1.7;
                        "
                    >
                        Your marketplace email service has
                        successfully processed this test request.
                    </p>


                    <hr
                        style="
                            border:none;
                            border-top:1px solid #e5e7eb;
                            margin:25px 0;
                        "
                    />


                    <p
                        style="
                            margin:0;
                            color:#6b7280;
                            font-size:13px;
                        "
                    >
                        This message was generated automatically
                        by ${marketplaceName}.
                    </p>

                </div>

            </div>

        </body>

        </html>

    `;


    /* =====================================================
       TEXT VERSION
    ===================================================== */

    const text =
        `This is a test email from ${marketplaceName}. ` +
        `Provider: ${provider.toUpperCase()}`;


    /* =====================================================
       SEND THROUGH CENTRAL EMAIL SERVICE
    ===================================================== */

    return sendEmail(
        to,
        subject,
        html,
        text
    );

}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {

    sendEmail,

    sendTestEmail,

    getEmailConfiguration

};
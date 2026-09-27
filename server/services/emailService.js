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

    return email;

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


    if (!apiKey) {

        throw new Error(
            "RESEND_API_KEY is not configured on the server."
        );

    }


    const resend =
        new Resend(apiKey);


    const fromName =
        emailConfig.resendFromName ||
        emailConfig.fromName ||
        "KAD Marketplace";


    const fromEmail =
        emailConfig.resendFromEmail ||
        emailConfig.fromEmail;


    if (!fromEmail) {

        throw new Error(
            "Resend sender email is not configured."
        );

    }


    const result =
        await resend.emails.send({

            from:
                `"${fromName}" <${fromEmail}>`,

            to: [to],

            subject,

            html,

            text:
                text ||
                ""

        });


    if (result.error) {

        throw new Error(
            result.error.message ||
            "Resend failed to send the email."
        );

    }


    return {

        provider: "resend",

        id:
            result.data?.id || null

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
            emailConfig.encryption || "tls"
        ).toLowerCase();


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


    const info =
        await transporter.sendMail({

            from:
                `"${fromName}" <${fromEmail}>`,

            to,

            subject,

            html,

            text:
                text ||
                ""

        });


    return {

        provider: "smtp",

        id:
            info.messageId || null

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

    if (!to) {

        throw new Error(
            "Recipient email address is required."
        );

    }


    const emailConfig =
        await getEmailConfiguration();


    if (
        emailConfig.enabled === false
    ) {

        throw new Error(
            "Email system is disabled."
        );

    }


    const provider =
        String(
            emailConfig.provider ||
            "resend"
        ).toLowerCase();


    console.log(
        `[EMAIL] Sending using provider: ${provider}`
    );


    if (provider === "resend") {

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


    if (provider === "smtp") {

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


    throw new Error(
        `Unsupported email provider: ${provider}`
    );

}


/* =========================================================
   TEST EMAIL
========================================================= */

async function sendTestEmail(
    to
) {

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
            ?.marketplace_name ||
        "KAD Marketplace";


    const subject =
        `${marketplaceName} - Test Email`;


    const html = `

        <div
            style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 40px auto;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                background: #ffffff;
            "
        >

            <h2
                style="
                    margin-top: 0;
                "
            >
                ${marketplaceName}
            </h2>


            <p>
                This is a test email from your
                ${marketplaceName} email configuration.
            </p>


            <p>
                Your email provider is configured
                successfully.
            </p>


            <p>
                <strong>
                    Provider:
                </strong>

                ${provider.toUpperCase()}
            </p>


            <hr
                style="
                    border: none;
                    border-top: 1px solid #e5e7eb;
                    margin: 25px 0;
                "
            />


            <p
                style="
                    color: #6b7280;
                    font-size: 13px;
                "
            >
                This message was generated automatically
                by ${marketplaceName}.
            </p>

        </div>

    `;


    return sendEmail(
        to,
        subject,
        html,
        `This is a test email from ${marketplaceName}. Provider: ${provider.toUpperCase()}`
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
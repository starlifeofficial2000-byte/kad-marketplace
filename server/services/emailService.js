const nodemailer = require("nodemailer");
const { Setting } = require("../models");

const getTransporter = async () => {

    const settings = await Setting.findAll();

    const config = {};

    settings.forEach(setting => {

        config[setting.settingKey] = setting.settingValue;

    });

    // Fall back to .env values if database values are missing
    return nodemailer.createTransport({

        host: config.smtpHost || process.env.SMTP_HOST,

        port: Number(config.smtpPort || process.env.SMTP_PORT || 587),

        secure: (config.smtpEncryption || process.env.SMTP_ENCRYPTION) === "SSL",

        auth: {

            user: config.smtpUsername || process.env.EMAIL_USER,

            pass: config.smtpPassword || process.env.EMAIL_PASS

        }

    });

};

exports.sendEmail = async (to, subject, html) => {

    const transporter = await getTransporter();

    const settings = await Setting.findAll();

    const config = {};

    settings.forEach(setting => {

        config[setting.settingKey] = setting.settingValue;

    });

    await transporter.sendMail({

        from: `"${config.senderName || "KAD Marketplace"}" <${config.senderEmail || process.env.EMAIL_USER}>`,

        to,

        subject,

        html

    });

};
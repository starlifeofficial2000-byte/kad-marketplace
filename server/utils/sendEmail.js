const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    family: 4
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"KAD Marketplace" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log("✅ Email sent successfully.");
    } catch (error) {
        console.error("❌ Email Error:", error);
        throw error;
    }
};

module.exports = sendEmail;
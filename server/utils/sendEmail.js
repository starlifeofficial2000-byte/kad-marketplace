const sendEmail = async (to, subject, html) => {
    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: "KAD Marketplace <onboarding@resend.dev>",
                to: [to],
                subject,
                html
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Resend Email Error:", data);
            throw new Error(
                data?.message || "Failed to send email through Resend"
            );
        }

        console.log("✅ Email sent successfully through Resend:", data.id);

        return data;
    } catch (error) {
        console.error("❌ Email Error:", error);
        throw error;
    }
};

module.exports = sendEmail;
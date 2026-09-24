const sendEmail = async (to, subject, html) => {
    try {

        /* ==========================================
           VALIDATE REQUIRED ENVIRONMENT VARIABLES
        ========================================== */

        if (!process.env.RESEND_API_KEY) {
            throw new Error(
                "RESEND_API_KEY is not configured."
            );
        }


        /* ==========================================
           VALIDATE RECIPIENT
        ========================================== */

        if (!to) {
            throw new Error(
                "Recipient email address is required."
            );
        }


        /* ==========================================
           SEND EMAIL THROUGH RESEND
        ========================================== */

        const response = await fetch(
            "https://api.resend.com/emails",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    Authorization:
                        `Bearer ${process.env.RESEND_API_KEY}`
                },

                body: JSON.stringify({

                    /*
                        IMPORTANT:
                        kadmarket.com is now verified
                        in Resend.
                    */

                    from:
                        "KAD Marketplace <no-reply@kadmarket.com>",

                    to: [to],

                    subject,

                    html
                })
            }
        );


        /* ==========================================
           READ RESEND RESPONSE
        ========================================== */

        const data = await response.json();


        /* ==========================================
           HANDLE RESEND ERROR
        ========================================== */

        if (!response.ok) {

            console.error(
                "❌ Resend Email Error:",
                {
                    status: response.status,
                    statusText: response.statusText,
                    data
                }
            );

            throw new Error(
                data?.message ||
                "Failed to send email through Resend."
            );
        }


        /* ==========================================
           SUCCESS
        ========================================== */

        console.log(
            "✅ Email sent successfully through Resend:",
            {
                id: data.id,
                to,
                subject
            }
        );


        return data;

    } catch (error) {

        console.error(
            "❌ Email Error:",
            error
        );

        throw error;
    }
};


module.exports = sendEmail;
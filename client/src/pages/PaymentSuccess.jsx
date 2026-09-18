import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../config/axios";

function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const [status, setStatus] = useState("processing");
    const [message, setMessage] = useState(
        "Processing your payment. Please wait..."
    );

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        const reference =
            searchParams.get("reference") ||
            searchParams.get("trxref");

        console.log("PAYMENT REFERENCE:", reference);

        if (!reference) {
            setStatus("error");
            setMessage("Invalid payment reference.");

            setTimeout(() => {
                navigate("/dashboard");
            }, 3000);

            return;
        }

        try {
            console.log("VERIFYING PAYMENT...");

            /* ==========================================
               VERIFY PAYMENT / SUBSCRIPTION
            ========================================== */

          const response = await api.get(
    "/settings"
);

            console.log("PAYMENT VERIFICATION RESPONSE:", response.data);

            if (!response.data.success) {
                throw new Error(
                    response.data.message || "Payment verification failed."
                );
            }

            /* ==========================================
               REFRESH CURRENT USER
            ========================================== */

            try {
                const response = await api.get(
    "/settings"
);

                console.log("REFRESHED USER:", userResponse.data);

                if (userResponse.data.user) {
                    localStorage.setItem(
                        "user",
                        JSON.stringify(userResponse.data.user)
                    );
                }
            } catch (refreshError) {
                console.log(
                    "USER REFRESH ERROR:",
                    refreshError.response?.data || refreshError.message
                );
            }

            /* ==========================================
               SUCCESS
            ========================================== */

            setStatus("success");

            setMessage(
                response.data.message ||
                "Payment successful! Your subscription has been activated."
            );

            setTimeout(() => {
                navigate("/dashboard");
            }, 3000);

        } catch (error) {
            console.log(
                "PAYMENT VERIFICATION ERROR:",
                error.response?.data || error.message
            );

            setStatus("error");

            setMessage(
                error.response?.data?.message ||
                error.message ||
                "Payment verification failed."
            );
        }
    };

    const getIcon = () => {
        if (status === "success") return "✓";
        if (status === "error") return "✕";
        return "⏳";
    };

    const getIconColor = () => {
        if (status === "success") return "#22c55e";
        if (status === "error") return "#ef4444";
        return "#1976d2";
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f5f7fb",
                padding: "20px",
            }}
        >
            <div
                style={{
                    background: "#ffffff",
                    padding: "45px 35px",
                    borderRadius: "18px",
                    boxShadow: "0 10px 35px rgba(0,0,0,0.12)",
                    textAlign: "center",
                    width: "100%",
                    maxWidth: "450px",
                }}
            >
                <div
                    style={{
                        width: "85px",
                        height: "85px",
                        borderRadius: "50%",
                        background: getIconColor(),
                        color: "#ffffff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "42px",
                        fontWeight: "bold",
                        margin: "0 auto 25px",
                    }}
                >
                    {getIcon()}
                </div>

                <h2
                    style={{
                        marginBottom: "15px",
                        color:
                            status === "error"
                                ? "#dc2626"
                                : status === "success"
                                ? "#16a34a"
                                : "#1f2937",
                    }}
                >
                    {status === "success"
                        ? "Payment Successful!"
                        : status === "error"
                        ? "Payment Failed"
                        : "Processing Payment"}
                </h2>

                <p
                    style={{
                        color: "#6b7280",
                        lineHeight: "1.6",
                        fontSize: "16px",
                    }}
                >
                    {message}
                </p>

                {status === "processing" && (
                    <p
                        style={{
                            color: "#9ca3af",
                            fontSize: "14px",
                            marginTop: "15px",
                        }}
                    >
                        Please do not close this page...
                    </p>
                )}

                {status === "success" && (
                    <p
                        style={{
                            color: "#9ca3af",
                            fontSize: "14px",
                            marginTop: "15px",
                        }}
                    >
                        Redirecting to your dashboard...
                    </p>
                )}

                {status === "error" && (
                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            marginTop: "20px",
                            background: "#1976d2",
                            color: "#ffffff",
                            border: "none",
                            padding: "12px 25px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "15px",
                        }}
                    >
                        Return to Dashboard
                    </button>
                )}
            </div>
        </div>
    );
}

export default PaymentSuccess;
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../config/axios";

function PromotionSuccess() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState(
        "Verifying Promotion Payment..."
    );

    const [error, setError] = useState("");

    const verificationStarted = useRef(false);

    useEffect(() => {
        if (verificationStarted.current) {
            return;
        }

        verificationStarted.current = true;

        verifyPromotion();
    }, []);

    const verifyPromotion = async () => {
        try {
            const reference =
                params.get("reference") ||
                params.get("trxref");

            if (!reference) {
                setError(
                    "Payment reference was not found."
                );

                setStatus(
                    "We could not verify your promotion payment."
                );

                return;
            }

            setStatus(
                "Confirming your payment..."
            );

            setError("");

            const response = await api.get(
                `/promotions/verify/${encodeURIComponent(
                    reference
                )}`
            );

            if (
                response.status === 202 ||
                response.data?.pending
            ) {
                setStatus(
                    "Your payment is still being processed."
                );

                setError(
                    "Please wait a few seconds and try again."
                );

                return;
            }

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Promotion payment verification failed."
                );
            }

            setStatus(
                response.data?.message ||
                "Promotion payment verified successfully."
            );

            setError("");

            setTimeout(() => {
                navigate("/dashboard", {
                    replace: true
                });
            }, 1500);
        } catch (error) {
            console.error(
                "PROMOTION VERIFICATION ERROR:",
                error.response?.data ||
                error.message
            );

            setStatus(
                "Promotion payment verification failed."
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "We could not confirm your promotion payment."
            );
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "24px",
                textAlign: "center",
                background: "#f7f7f7"
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "520px",
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "32px 24px",
                    boxShadow:
                        "0 10px 30px rgba(0,0,0,0.08)"
                }}
            >
                <div
                    style={{
                        fontSize: "48px",
                        marginBottom: "16px"
                    }}
                >
                    {error ? "⚠️" : "💳"}
                </div>

                <h2
                    style={{
                        marginBottom: "12px"
                    }}
                >
                    {status}
                </h2>

                <p
                    style={{
                        color: "#666",
                        lineHeight: 1.6
                    }}
                >
                    {error ||
                        "Please wait while we confirm your payment."}
                </p>

                {error && (
                    <button
                        onClick={() => {
                            verificationStarted.current =
                                false;

                            setError("");

                            setStatus(
                                "Retrying payment verification..."
                            );

                            verificationStarted.current =
                                true;

                            verifyPromotion();
                        }}
                        style={{
                            marginTop: "20px",
                            padding:
                                "12px 22px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: 600
                        }}
                    >
                        Retry Verification
                    </button>
                )}

                <button
                    onClick={() =>
                        navigate("/dashboard")
                    }
                    style={{
                        marginTop: "12px",
                        display: "block",
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        background: "#fff",
                        cursor: "pointer"
                    }}
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}

export default PromotionSuccess;
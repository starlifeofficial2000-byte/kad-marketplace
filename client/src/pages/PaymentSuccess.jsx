import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../config/axios";

function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState("processing");
    const [message, setMessage] = useState(
        "Processing your payment. Please wait..."
    );

    const [paymentType, setPaymentType] = useState(null);
    const [reference, setReference] = useState("");

    // Prevent duplicate verification in React StrictMode
    const verificationStarted = useRef(false);

    useEffect(() => {
        if (verificationStarted.current) {
            return;
        }

        verificationStarted.current = true;

        verifyPayment();
    }, []);

    /**
     * ==========================================================
     * GET PAYMENT REFERENCE
     * ==========================================================
     */
    const getPaymentReference = () => {
        const urlReference =
            searchParams.get("reference") ||
            searchParams.get("trxref");

        if (urlReference) {
            return urlReference;
        }

        // Fallback in case Paystack redirects without query params
        const storedReference =
            localStorage.getItem("pendingPaymentReference");

        return storedReference || null;
    };

    /**
     * ==========================================================
     * DETECT PAYMENT TYPE
     * ==========================================================
     */
    const getPaymentType = (paymentReference) => {
        if (
            typeof paymentReference === "string" &&
            paymentReference.startsWith("PROMO-")
        ) {
            return "promotion";
        }

        return "subscription";
    };

    /**
     * ==========================================================
     * VERIFY PAYMENT
     * ==========================================================
     */
    const verifyPayment = async () => {
        const paymentReference = getPaymentReference();

        console.log(
            "PAYMENT REFERENCE:",
            paymentReference
        );

        // ======================================================
        // CHECK PAYMENT REFERENCE
        // ======================================================

        if (!paymentReference) {
            console.error(
                "NO PAYMENT REFERENCE FOUND"
            );

            setStatus("error");

            setMessage(
                "We could not find your payment reference. Please contact support if money was deducted from your account."
            );

            return;
        }

        const detectedPaymentType =
            getPaymentType(paymentReference);

        setReference(paymentReference);
        setPaymentType(detectedPaymentType);

        console.log(
            "PAYMENT TYPE:",
            detectedPaymentType
        );

        try {
            setStatus("processing");

            // ==================================================
            // SELECT CORRECT VERIFICATION ENDPOINT
            // ==================================================

            const encodedReference =
                encodeURIComponent(paymentReference);

            let verificationEndpoint;

            if (
                detectedPaymentType ===
                "promotion"
            ) {
                verificationEndpoint =
                    `/promotions/verify/${encodedReference}`;
            } else {
                verificationEndpoint =
                    `/payments/verify/${encodedReference}`;
            }

            console.log(
                "VERIFYING PAYMENT..."
            );

            console.log(
                "VERIFICATION ENDPOINT:",
                verificationEndpoint
            );

            // ==================================================
            // VERIFY WITH BACKEND
            // ==================================================

            const paymentResponse =
                await api.get(
                    verificationEndpoint
                );

            console.log(
                "PAYMENT VERIFICATION RESPONSE:",
                paymentResponse.data
            );

            if (
                !paymentResponse.data ||
                !paymentResponse.data.success
            ) {
                throw new Error(
                    paymentResponse.data?.message ||
                    "Payment verification failed."
                );
            }

            // ==================================================
            // REFRESH CURRENT USER
            // ==================================================

            try {
                const userResponse =
                    await api.get("/auth/me");

                console.log(
                    "REFRESHED USER:",
                    userResponse.data
                );

                if (
                    userResponse.data?.user
                ) {
                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            userResponse.data.user
                        )
                    );
                }
            } catch (refreshError) {
                console.warn(
                    "USER REFRESH ERROR:",
                    refreshError.response?.data ||
                        refreshError.message
                );

                /*
                 * Do NOT mark the payment as failed.
                 *
                 * The backend has already confirmed
                 * the payment successfully.
                 */
            }

            // ==================================================
            // PAYMENT SUCCESS
            // ==================================================

            setStatus("success");

            if (
                detectedPaymentType ===
                "promotion"
            ) {
                setMessage(
                    paymentResponse.data.message ||
                    "Payment successful! Your product promotion has been activated."
                );
            } else {
                setMessage(
                    paymentResponse.data.message ||
                    "Payment successful! Your subscription has been activated."
                );
            }

            // ==================================================
            // CLEAR STORED PAYMENT REFERENCE
            // ==================================================

            localStorage.removeItem(
                "pendingPaymentReference"
            );

            // ==================================================
            // CLEAN PAYMENT REFERENCE FROM URL
            // ==================================================

            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );

            // ==================================================
            // REDIRECT
            // ==================================================

            setTimeout(() => {
                if (
                    detectedPaymentType ===
                    "promotion"
                ) {
                    navigate("/promotions");
                } else {
                    navigate("/dashboard");
                }
            }, 4000);

        } catch (error) {
            console.error(
                "PAYMENT VERIFICATION ERROR:",
                error.response?.data ||
                    error.message
            );

            setStatus("error");

            setMessage(
                error.response?.data?.message ||
                error.message ||
                "We could not verify your payment."
            );

            /*
             * IMPORTANT:
             *
             * Do NOT remove pendingPaymentReference
             * here. If the network temporarily fails,
             * the user can retry verification.
             */
        }
    };

    /**
     * ==========================================================
     * RETRY PAYMENT VERIFICATION
     * ==========================================================
     */
    const retryVerification = () => {
        verificationStarted.current = false;

        setStatus("processing");

        setMessage(
            "Retrying payment verification. Please wait..."
        );

        verifyPayment();
    };

    /**
     * ==========================================================
     * ICON
     * ==========================================================
     */
    const getIcon = () => {
        if (status === "success") {
            return "✓";
        }

        if (status === "error") {
            return "✕";
        }

        return "⏳";
    };

    /**
     * ==========================================================
     * ICON COLOR
     * ==========================================================
     */
    const getIconColor = () => {
        if (status === "success") {
            return "#22c55e";
        }

        if (status === "error") {
            return "#ef4444";
        }

        return "#1976d2";
    };

    /**
     * ==========================================================
     * TITLE
     * ==========================================================
     */
    const getTitle = () => {
        if (status === "success") {
            if (paymentType === "promotion") {
                return "Promotion Activated!";
            }

            return "Payment Successful!";
        }

        if (status === "error") {
            return "Payment Verification Failed";
        }

        return "Processing Payment";
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
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    background: "#ffffff",
                    padding: "45px 35px",
                    borderRadius: "18px",
                    boxShadow:
                        "0 10px 35px rgba(0,0,0,0.12)",
                    textAlign: "center",
                    width: "100%",
                    maxWidth: "450px",
                    boxSizing: "border-box",
                }}
            >
                {/* ==================================================
                    STATUS ICON
                ================================================== */}

                <div
                    style={{
                        width: "85px",
                        height: "85px",
                        borderRadius: "50%",
                        background:
                            getIconColor(),
                        color: "#ffffff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "42px",
                        fontWeight: "bold",
                        margin:
                            "0 auto 25px",
                        boxShadow:
                            `0 8px 20px ${getIconColor()}33`,
                    }}
                >
                    {getIcon()}
                </div>

                {/* ==================================================
                    TITLE
                ================================================== */}

                <h2
                    style={{
                        marginBottom: "15px",
                        color:
                            status ===
                            "error"
                                ? "#dc2626"
                                : status ===
                                  "success"
                                ? "#16a34a"
                                : "#1f2937",
                        fontSize: "25px",
                        fontWeight: "700",
                    }}
                >
                    {getTitle()}
                </h2>

                {/* ==================================================
                    PAYMENT TYPE
                ================================================== */}

                {paymentType && (
                    <div
                        style={{
                            display:
                                "inline-block",
                            padding:
                                "6px 12px",
                            borderRadius:
                                "999px",
                            background:
                                paymentType ===
                                "promotion"
                                    ? "#fff7ed"
                                    : "#eff6ff",
                            color:
                                paymentType ===
                                "promotion"
                                    ? "#c2410c"
                                    : "#1d4ed8",
                            fontSize:
                                "12px",
                            fontWeight:
                                "600",
                            marginBottom:
                                "18px",
                        }}
                    >
                        {paymentType ===
                        "promotion"
                            ? "PRODUCT PROMOTION"
                            : "SUBSCRIPTION"}
                    </div>
                )}

                {/* ==================================================
                    MESSAGE
                ================================================== */}

                <p
                    style={{
                        color: "#6b7280",
                        lineHeight: "1.6",
                        fontSize: "16px",
                        margin:
                            "0 0 10px",
                    }}
                >
                    {message}
                </p>

                {/* ==================================================
                    REFERENCE
                ================================================== */}

                {reference && (
                    <div
                        style={{
                            marginTop: "20px",
                            padding:
                                "12px",
                            background:
                                "#f8fafc",
                            borderRadius:
                                "8px",
                            wordBreak:
                                "break-all",
                            fontSize:
                                "12px",
                            color:
                                "#64748b",
                        }}
                    >
                        <strong>
                            Reference:
                        </strong>{" "}
                        {reference}
                    </div>
                )}

                {/* ==================================================
                    PROCESSING
                ================================================== */}

                {status ===
                    "processing" && (
                    <div
                        style={{
                            marginTop:
                                "20px",
                        }}
                    >
                        <div
                            style={{
                                width:
                                    "32px",
                                height:
                                    "32px",
                                border:
                                    "3px solid #dbeafe",
                                borderTop:
                                    "3px solid #1976d2",
                                borderRadius:
                                    "50%",
                                animation:
                                    "paymentSpin 1s linear infinite",
                                margin:
                                    "0 auto 12px",
                            }}
                        />

                        <p
                            style={{
                                color:
                                    "#9ca3af",
                                fontSize:
                                    "14px",
                                margin:
                                    0,
                            }}
                        >
                            Please do not
                            close this
                            page...
                        </p>
                    </div>
                )}

                {/* ==================================================
                    SUCCESS
                ================================================== */}

                {status ===
                    "success" && (
                    <p
                        style={{
                            color:
                                "#9ca3af",
                            fontSize:
                                "14px",
                            marginTop:
                                "20px",
                        }}
                    >
                        Redirecting you
                        shortly...
                    </p>
                )}

                {/* ==================================================
                    ERROR
                ================================================== */}

                {status === "error" && (
                    <div
                        style={{
                            marginTop:
                                "20px",
                            display: "flex",
                            flexDirection:
                                "column",
                            gap: "10px",
                        }}
                    >
                        <button
                            onClick={
                                retryVerification
                            }
                            style={{
                                background:
                                    "#1976d2",
                                color:
                                    "#ffffff",
                                border:
                                    "none",
                                padding:
                                    "12px 25px",
                                borderRadius:
                                    "8px",
                                cursor:
                                    "pointer",
                                fontSize:
                                    "15px",
                                fontWeight:
                                    "600",
                            }}
                        >
                            Retry Verification
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    paymentType ===
                                        "promotion"
                                        ? "/promotions"
                                        : "/dashboard"
                                )
                            }
                            style={{
                                background:
                                    "#f1f5f9",
                                color:
                                    "#334155",
                                border:
                                    "none",
                                padding:
                                    "12px 25px",
                                borderRadius:
                                    "8px",
                                cursor:
                                    "pointer",
                                fontSize:
                                    "15px",
                            }}
                        >
                            {paymentType ===
                            "promotion"
                                ? "Return to Promotions"
                                : "Return to Dashboard"}
                        </button>
                    </div>
                )}
            </div>

            {/* ======================================================
                SPINNER ANIMATION
            ====================================================== */}

            <style>
                {`
                    @keyframes paymentSpin {
                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default PaymentSuccess;
import { useNavigate } from "react-router-dom";

function PaymentFailed() {

    const navigate = useNavigate();

    return (

        <div
            style={{

                minHeight: "100vh",

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                background: "#f5f7fb",

                padding: "20px"

            }}
        >

            <div
                style={{

                    background: "#ffffff",

                    width: "100%",

                    maxWidth: "450px",

                    padding: "45px 35px",

                    borderRadius: "18px",

                    textAlign: "center",

                    boxShadow:
                        "0 15px 40px rgba(0,0,0,0.12)"

                }}
            >

                <div
                    style={{

                        fontSize: "65px",

                        marginBottom: "20px"

                    }}
                >

                    ❌

                </div>

                <h1
                    style={{

                        color: "#dc2626",

                        marginBottom: "15px"

                    }}
                >

                    Payment Failed

                </h1>

                <p
                    style={{

                        color: "#6b7280",

                        lineHeight: "1.6"

                    }}
                >

                    Your payment could not be completed.
                    No subscription has been activated.

                </p>

                <button

                    onClick={() => navigate("/dashboard")}

                    style={{

                        marginTop: "25px",

                        padding: "12px 25px",

                        border: "none",

                        borderRadius: "8px",

                        background: "#1976d2",

                        color: "#ffffff",

                        cursor: "pointer",

                        fontWeight: "600",

                        fontSize: "15px"

                    }}

                >

                    Return to Dashboard

                </button>

            </div>

        </div>

    );

}

export default PaymentFailed;
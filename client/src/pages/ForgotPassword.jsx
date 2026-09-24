import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import "./Login.css";

function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const sendOTP = async (e) => {

        e.preventDefault();

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {

            alert("Please enter your email address.");

            return;
        }

        try {

            setLoading(true);

            const response = await api.post(
                "/auth/forgot-password",
                {
                    email: normalizedEmail
                }
            );

            alert(
                response.data?.message ||
                "Password reset code sent to your email."
            );

            navigate(
                "/verify-reset",
                {
                    state: {
                        email: normalizedEmail
                    }
                }
            );

        }
        catch (error) {

            console.error(
                "FORGOT PASSWORD ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to send password reset code. Please try again."
            );

        }
        finally {

            setLoading(false);

        }

    };

    return (

        <div className="login-page">

            <div className="login-card">

                <h1>
                    Forgot Password
                </h1>

                <p>
                    Enter your registered email address
                    to receive a verification code.
                </p>

                <form onSubmit={sendOTP}>

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        autoComplete="email"
                        disabled={loading}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Sending Code..."
                            : "Send Verification Code"
                        }

                    </button>

                </form>

            </div>

        </div>

    );

}

export default ForgotPassword;
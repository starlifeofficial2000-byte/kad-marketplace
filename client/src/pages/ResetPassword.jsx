import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../config/axios";
import "./Login.css";

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    /* =========================================
       PROTECT PAGE
    ========================================= */

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password", { replace: true });
        }
    }, [email, navigate]);

    /* =========================================
       RESET PASSWORD
    ========================================= */

    const resetPassword = async (e) => {
        e.preventDefault();

        if (!email) {
            alert("Your password reset session has expired.");
            navigate("/forgot-password", { replace: true });
            return;
        }

        if (!newPassword || !confirmPassword) {
            alert("Please enter and confirm your new password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!passwordRegex.test(newPassword)) {
            alert(
                "Password must contain:\n\n" +
                "• At least 8 characters\n" +
                "• One uppercase letter\n" +
                "• One lowercase letter\n" +
                "• One number\n" +
                "• One special character"
            );
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/reset-password",
                {
                    email: email.trim().toLowerCase(),
                    newPassword
                }
            );

            alert(
                response.data?.message ||
                "Password changed successfully. Please login."
            );

            navigate("/login", { replace: true });

        } catch (error) {
            console.error(
                "RESET PASSWORD ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to reset your password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <h1>Change Password</h1>

                <p>
                    Create a new password for
                    <br />
                    <b>{email}</b>
                </p>

                <form onSubmit={resetPassword}>

                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) =>
                            setNewPassword(e.target.value)
                        }
                        autoComplete="new-password"
                        disabled={loading}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        autoComplete="new-password"
                        disabled={loading}
                        required
                    />

                    <p
                        style={{
                            fontSize: "13px",
                            textAlign: "left",
                            marginTop: "5px"
                        }}
                    >
                        Password must contain at least 8 characters,
                        including uppercase, lowercase, number and
                        special character.
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Changing Password..."
                            : "Change Password"}
                    </button>

                </form>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/login", { replace: true })
                    }
                    disabled={loading}
                    style={{
                        marginTop: "10px"
                    }}
                >
                    Back to Login
                </button>

            </div>

        </div>
    );
}

export default ResetPassword;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../config/axios";

import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    /* ==========================================
       INPUT CHANGE
    ========================================== */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* ==========================================
       LOGIN
    ========================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        // Basic validation
        if (!formData.email.trim()) {
            alert("Please enter your email address.");
            return;
        }

        if (!formData.password) {
            alert("Please enter your password.");
            return;
        }

        try {
            setLoading(true);

            console.log("=================================");
            console.log("LOGIN REQUEST");
            console.log("Email:", formData.email);
            console.log("=================================");

            /*
            ==========================================
            SEND LOGIN REQUEST TO BACKEND
            ==========================================
            */

            const response = await api.post(
                "/auth/login",
                {
                    email: formData.email.trim(),
                    password: formData.password,
                }
            );

            console.log(
                "LOGIN RESPONSE:",
                response.data
            );

            /*
            ==========================================
            CHECK RESPONSE
            ==========================================
            */

            if (!response.data) {
                alert("No response received from the server.");
                return;
            }

            /*
            ==========================================
            OTP LOGIN
            ==========================================
            */

            if (response.data.requiresOTP) {
                console.log("OTP LOGIN REQUIRED");

                navigate(
                    "/verify-login-otp",
                    {
                        state: {
                            email:
                                response.data.email ||
                                formData.email.trim(),
                        },
                    }
                );

                return;
            }

            /*
            ==========================================
            CHECK LOGIN TOKEN
            ==========================================
            */

            if (!response.data.token) {
                console.error(
                    "LOGIN RESPONSE DOES NOT CONTAIN TOKEN:",
                    response.data
                );

                alert(
                    response.data.message ||
                    "Invalid login response. The server did not return a login token."
                );

                return;
            }

            /*
            ==========================================
            CHECK USER
            ==========================================
            */

            if (!response.data.user) {
                console.error(
                    "LOGIN RESPONSE DOES NOT CONTAIN USER:",
                    response.data
                );

                alert(
                    "Login response is missing user information."
                );

                return;
            }

            const user = response.data.user;

            /*
            ==========================================
            SAVE TOKEN
            ==========================================
            */

            localStorage.setItem(
                "token",
                response.data.token
            );

            /*
            ==========================================
            SAVE USER
            ==========================================
            */

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            console.log(
                "Logged In User:",
                user
            );

            console.log(
                "Roles:",
                user.roles
            );

            console.log(
                "Permissions:",
                user.permissions
            );

            /*
            ==========================================
            NORMALIZE ROLES
            ==========================================
            */

            const permissions =
                Array.isArray(user.permissions)
                    ? user.permissions
                    : [];

            const roles =
                Array.isArray(user.roles)
                    ? user.roles
                    : [];

            /*
            ==========================================
            LOGIN SUCCESS
            ==========================================
            */

            alert("Login Successful");

            /*
            ==========================================
            ADMIN / PERMISSION REDIRECTION
            ==========================================
            */

            if (permissions.length > 0) {
                console.log(
                    "Redirecting to Admin Dashboard..."
                );

                navigate(
                    "/admin/dashboard",
                    {
                        replace: true,
                    }
                );

                return;
            }

            /*
            ==========================================
            SELLER REDIRECTION
            ==========================================
            */

            if (roles.includes("Seller")) {
                console.log(
                    "Redirecting to Seller Dashboard..."
                );

                navigate(
                    "/seller/dashboard",
                    {
                        replace: true,
                    }
                );

                return;
            }

            /*
            ==========================================
            NORMAL USER REDIRECTION
            ==========================================
            */

            console.log(
                "Redirecting to Marketplace..."
            );

            navigate(
                "/",
                {
                    replace: true,
                }
            );
        } catch (error) {
            console.error(
                "LOGIN ERROR:",
                error
            );

            /*
            ==========================================
            SERVER ERROR MESSAGE
            ==========================================
            */

            const serverMessage =
                error.response?.data?.message;

            if (serverMessage) {
                alert(serverMessage);
            } else if (
                error.response?.status === 401
            ) {
                alert(
                    "Invalid email or password."
                );
            } else if (
                error.response?.status === 403
            ) {
                alert(
                    "Your account is not permitted to log in."
                );
            } else if (
                error.response?.status >= 500
            ) {
                alert(
                    "The server encountered an error. Please try again later."
                );
            } else if (!error.response) {
                alert(
                    "Unable to connect to the server. Please check your internet connection."
                );
            } else {
                alert(
                    "Login failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    /* ==========================================
       PAGE
    ========================================== */

    return (
        <div className="login-page">

            <div className="login-card">

                <h1>
                    Welcome Back
                </h1>

                <p>
                    Login to your KAD Marketplace account
                </p>

                <form onSubmit={handleSubmit}>

                    {/* EMAIL */}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                        disabled={loading}
                    />

                    {/* PASSWORD */}

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                        disabled={loading}
                    />

                    {/* FORGOT PASSWORD */}

                    <div className="forgot-password">

                        <Link to="/forgot-password">
                            Forgot Password?
                        </Link>

                    </div>

                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                {/* REGISTER */}

                <p className="register-link">

                    Don't have an account?{" "}

                    <Link to="/register">
                        Register
                    </Link>

                </p>

            </div>

        </div>
    );
}

export default Login;
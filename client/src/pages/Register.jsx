import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../config/axios";
import "./Register.css";

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
        setErrorMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const username = formData.username.trim();
        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        if (username.length < 3 || username.length > 60) {
            setErrorMessage("Enter a username between 3 and 60 characters.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrorMessage("Enter a valid email address.");
            return;
        }
        if (password.length < 8) {
            setErrorMessage("Password must be at least 8 characters long.");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post("/auth/register", {
                // The existing mobile backend accepts username as an alias for name.
                username,
                name: username,
                email,
                password,
            });
            navigate("/login", {
                state: { registrationSuccess: response.data?.message || "Account created. Please log in." },
            });
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message ||
                "Registration failed. Please check your details and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <h1>Create Account</h1>
                <p>Start using KAD Marketplace with your username, email and password. Complete your profile only when you want to sell or create a store.</p>
                {errorMessage && <div className="register-error" role="alert">{errorMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="register-username">Username</label>
                    <input
                        id="register-username"
                        type="text"
                        name="username"
                        placeholder="Your username or display name"
                        value={formData.username}
                        onChange={handleChange}
                        minLength={3}
                        maxLength={60}
                        autoComplete="username"
                        required
                    />
                    <label htmlFor="register-email">Email address</label>
                    <input
                        id="register-email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                    />
                    <label htmlFor="register-password">Password</label>
                    <input
                        id="register-password"
                        type="password"
                        name="password"
                        placeholder="At least 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                        minLength={8}
                        autoComplete="new-password"
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Creating account…" : "Create Account"}
                    </button>
                </form>
                <p className="login-link">Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
}

export default Register;

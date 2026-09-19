import { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";
import api from "../config/axios";


import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({

        email: "",

        password: ""

    });

    /* ==========================================
       INPUT CHANGE
    ========================================== */

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    /* ==========================================
       LOGIN
    ========================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);
const response = await api.get(
    "/settings/public"
);

            /* ==================================
               OTP LOGIN
            ================================== */

            if (response.data.requiresOTP) {

                navigate(

                    "/verify-login-otp",

                    {

                        state: {

                            email:
                                response.data.email

                        }

                    }

                );

                return;

            }

            /* ==================================
               VALIDATE LOGIN RESPONSE
            ================================== */

            if (

                !response.data.token ||

                !response.data.user

            ) {

                alert(
                    "Invalid login response."
                );

                return;

            }

            const user =
                response.data.user;

            /* ==================================
               SAVE LOGIN
            ================================== */

            localStorage.setItem(

                "token",

                response.data.token

            );

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

            alert("Login Successful");

            /* ==================================
               PERMISSION BASED REDIRECTION
            ================================== */

            const permissions =
                Array.isArray(user.permissions)

                    ? user.permissions

                    : [];

            const roles =
                Array.isArray(user.roles)

                    ? user.roles

                    : [];

            /*
               Any account with administrative
               permissions enters the admin panel.
            */

            if (permissions.length > 0) {

                navigate(
                    "/admin/dashboard",
                    {
                        replace: true
                    }
                );

                return;

            }

            /* ==================================
               SELLER
            ================================== */

            if (

                roles.includes("Seller")

            ) {

                navigate(
                    "/seller/dashboard",
                    {
                        replace: true
                    }
                );

                return;

            }

            /* ==================================
               NORMAL USER
            ================================== */

            navigate(
                "/",
                {
                    replace: true
                }
            );

        }

        catch (error) {

            console.log(
                "LOGIN ERROR:",
                error
            );

            alert(

                error.response?.data?.message ||

                "Login Failed"

            );

        }

        finally {

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

                    <input

                        type="email"

                        name="email"

                        placeholder="Email Address"

                        value={formData.email}

                        onChange={handleChange}

                        required

                    />

                    <input

                        type="password"

                        name="password"

                        placeholder="Password"

                        value={formData.password}

                        onChange={handleChange}

                        required

                    />

                    <div className="forgot-password">

                        <Link to="/forgot-password">

                            Forgot Password?

                        </Link>

                    </div>

                    <button

                        type="submit"

                        disabled={loading}

                    >

                        {

                            loading

                                ? "Logging in..."

                                : "Login"

                        }

                    </button>

                </form>

                <p className="register-link">

                    Don't have an account?

                    <Link to="/register">

                        Register

                    </Link>

                </p>

            </div>

        </div>

    );

}

export default Login;
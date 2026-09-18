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

        if (!email) {

            alert("Please enter your email address.");

            return;

        }

        try {

            setLoading(true);

           const response = await api.get(
    "/settings"
);

            alert(res.data.message);

            navigate(

                "/verify-reset",

                {

                    state: {

                        email

                    }

                }

            );

        }

        catch (error) {

            alert(

                error.response?.data?.message ||

                "Unable to send verification code."

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="login-page">

            <div className="login-card">

                <h1>Forgot Password</h1>

                <p>

                    Enter your registered email address.

                </p>

                <form onSubmit={sendOTP}>

                    <input

                        type="email"

                        placeholder="Email Address"

                        value={email}

                        onChange={(e) =>

                            setEmail(e.target.value)

                        }

                        required

                    />

                    <button

                        type="submit"

                        disabled={loading}

                    >

                        {

                            loading

                            ?

                            "Sending Code..."

                            :

                            "Send Verification Code"

                        }

                    </button>

                </form>

            </div>

        </div>

    );

}

export default ForgotPassword;
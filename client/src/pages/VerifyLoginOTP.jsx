import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../config/axios";

import "./VerifyLoginOTP.css";


function VerifyLoginOTP() {

    const navigate = useNavigate();

    const location = useLocation();

    const email = location.state?.email || "";


    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);

    const [resending, setResending] = useState(false);


    /* ==========================================
       PROTECT PAGE
    ========================================== */

    useEffect(() => {

        if (!email) {

            navigate("/login", {
                replace: true
            });

        }

    }, [email, navigate]);


    /* ==========================================
       VERIFY OTP
    ========================================== */

    const verifyOTP = async (e) => {

        e.preventDefault();


        if (!/^\d{6}$/.test(otp)) {

            alert(
                "Please enter a valid 6-digit verification code."
            );

            return;

        }


        try {

            setLoading(true);


            const response = await api.post(

                "/auth/verify-login-otp",

                {
                    email,
                    otp
                }

            );


            console.log(
                "OTP VERIFY RESPONSE:",
                response.data
            );


            /* =====================================
               SAVE LOGIN DATA
            ====================================== */

            if (!response.data?.token) {

                throw new Error(
                    "Login token was not received."
                );

            }


            localStorage.setItem(

                "token",

                response.data.token

            );


            if (response.data.user) {

                localStorage.setItem(

                    "user",

                    JSON.stringify(
                        response.data.user
                    )

                );

            }


            /* =====================================
               REDIRECT BASED ON USER ROLE
            ====================================== */

            const user = response.data.user;


            const isAdmin =

                user?.role === "admin" ||

                user?.role === "super_admin" ||

                user?.roles?.includes("Super Admin") ||

                user?.roles?.includes("Administrator");


            if (isAdmin) {

                navigate(
                    "/admin/dashboard",
                    {
                        replace: true
                    }
                );

            }

            else {

                navigate(
                    "/dashboard",
                    {
                        replace: true
                    }
                );

            }


        }

        catch (error) {

            console.error(

                "OTP VERIFICATION ERROR:",

                error.response?.data || error.message

            );


            alert(

                error.response?.data?.message ||

                error.message ||

                "Invalid or expired verification code."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       RESEND OTP
    ========================================== */

    const resendOTP = async () => {

        if (!email) {

            alert(
                "Email address is missing. Please login again."
            );

            navigate("/login");

            return;

        }


        try {

            setResending(true);


            const response = await api.post(

                "/auth/resend-login-otp",

                {
                    email
                }

            );


            alert(

                response.data?.message ||

                "A new verification code has been sent."

            );


            setOtp("");


        }

        catch (error) {

            console.error(

                "RESEND OTP ERROR:",

                error.response?.data || error.message

            );


            alert(

                error.response?.data?.message ||

                "Unable to resend verification code."

            );

        }

        finally {

            setResending(false);

        }

    };


    /* ==========================================
       HANDLE OTP INPUT
    ========================================== */

    const handleOTPChange = (e) => {

        const value =

            e.target.value.replace(
                /\D/g,
                ""
            );


        setOtp(

            value.slice(0, 6)

        );

    };


    return (

        <div className="otp-page">

            <form
                className="otp-card"
                onSubmit={verifyOTP}
            >


                {/* ICON */}

                <div className="otp-icon">

                    🔐

                </div>


                {/* TITLE */}

                <h1>

                    Administrator Verification

                </h1>


                {/* DESCRIPTION */}

                <p className="otp-description">

                    A verification code has been sent to

                    <br />

                    <strong>

                        {email}

                    </strong>

                </p>


                {/* OTP INPUT */}

                <input

                    type="text"

                    inputMode="numeric"

                    maxLength={6}

                    value={otp}

                    onChange={handleOTPChange}

                    placeholder="Enter 6-digit code"

                    autoFocus

                    disabled={loading || resending}

                />


                {/* VERIFY BUTTON */}

                <button
                    type="submit"
                    disabled={
                        loading ||
                        resending ||
                        otp.length !== 6
                    }
                >

                    {

                        loading

                            ?

                            "Verifying..."

                            :

                            "Verify & Continue"

                    }

                </button>


                {/* RESEND */}

                <div className="resend">

                    Didn't receive the code?

                    <button

                        type="button"

                        className="resend-button"

                        onClick={resendOTP}

                        disabled={resending || loading}

                    >

                        {

                            resending

                                ?

                                " Sending..."

                                :

                                " Resend Code"

                        }

                    </button>

                </div>


                {/* SECURITY NOTICE */}

                <div className="security-box">

                    <strong>

                        🔒 Security Notice

                    </strong>

                    <br />

                    <br />

                    This verification code expires in 5 minutes.
                    Never share your verification code with anyone,
                    including KAD Marketplace staff.

                </div>


                {/* BACK BUTTON */}

                <button

                    type="button"

                    className="back-button"

                    onClick={() => navigate("/login")}

                    disabled={loading || resending}

                >

                    ← Back to Login

                </button>


            </form>

        </div>

    );

}


export default VerifyLoginOTP;
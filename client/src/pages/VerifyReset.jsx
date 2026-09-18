import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../config/axios";

function VerifyReset() {

    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);


    /* =========================================
       PROTECT PAGE
    ========================================= */

    useEffect(() => {

        if (!email) {

            navigate("/forgot-password");

        }

    }, [email, navigate]);


    /* =========================================
       HANDLE OTP INPUT
    ========================================= */

    const handleOTPChange = (e) => {

        const value = e.target.value.replace(/\D/g, "");

        setOtp(value.slice(0, 6));

    };


    /* =========================================
       VERIFY OTP
    ========================================= */

    const verifyOTP = async () => {

        if (!otp || otp.length !== 6) {

            alert("Please enter a valid 6-digit OTP.");

            return;

        }

        try {

            setLoading(true);

            const res = await api.post(

                "/auth/verify-reset-otp",

                {
                    email,
                    otp
                }

            );


            alert(

                res.data.message ||
                "OTP verified successfully."
            );


            navigate(

                "/reset-password",

                {

                    state: {

                        email,
                        otp

                    }

                }

            );

        }

        catch (error) {

            console.error(

                "VERIFY RESET OTP ERROR:",

                error.response?.data || error.message

            );


            alert(

                error.response?.data?.message ||

                "Invalid or expired OTP."

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

                    Verify OTP

                </h1>


                <p>

                    Enter the 6-digit verification code sent to

                    <br />

                    <b>

                        {email}

                    </b>

                </p>


                <input

                    type="text"

                    inputMode="numeric"

                    value={otp}

                    maxLength={6}

                    onChange={handleOTPChange}

                    placeholder="Enter 6-digit OTP"

                    disabled={loading}

                />


                <button

                    onClick={verifyOTP}

                    disabled={loading}

                >

                    {

                        loading

                            ?

                            "Verifying..."

                            :

                            "Verify Code"

                    }

                </button>


                <button

                    type="button"

                    onClick={() => navigate("/forgot-password")}

                    style={{

                        marginTop: "10px"

                    }}

                >

                    Back

                </button>

            </div>

        </div>

    );

}

export default VerifyReset;
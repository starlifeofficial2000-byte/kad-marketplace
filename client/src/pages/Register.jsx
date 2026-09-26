import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../config/axios";

import "./Register.css";


function Register() {

    const navigate = useNavigate();


    const [formData, setFormData] = useState({

        name: "",
        email: "",
        phone: "",
        ghanaCard: "",
        region: "",
        city: "",
        address: "",
        password: "",
        confirmPassword: "",
        role: "user"

    });


    const [loading, setLoading] = useState(false);


    /* =========================================
       HANDLE INPUT CHANGE
    ========================================= */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previous) => ({

            ...previous,

            [name]: value

        }));

    };


    /* =========================================
       HANDLE REGISTRATION
    ========================================= */

    const handleSubmit = async (e) => {

        e.preventDefault();


        /* ===============================
           FULL NAME VALIDATION
        =============================== */

        const nameRegex = /^[A-Za-z\s'-]{3,}$/;

        if (!nameRegex.test(formData.name.trim())) {

            alert(
                "Please enter a valid full name."
            );

            return;

        }


        /* ===============================
           EMAIL VALIDATION
        =============================== */

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email.trim())) {

            alert(
                "Please enter a valid email address."
            );

            return;

        }


        /* ===============================
           GHANA PHONE VALIDATION
        =============================== */

        const phoneRegex =
            /^(?:\+233|233|0)(20|23|24|25|26|27|28|50|53|54|55|56|57|59)\d{7}$/;

        const cleanPhone = formData.phone
            .replace(/\s/g, "")
            .trim();


        if (!phoneRegex.test(cleanPhone)) {

            alert(
                "Please enter a valid Ghanaian phone number.\n\nExample: 0241234567 or +233241234567"
            );

            return;

        }


        /* ===============================
           GHANA CARD VALIDATION
        =============================== */

        const ghanaCardRegex =
            /^GHA-\d{9}-\d$/i;


        if (

            !ghanaCardRegex.test(
                formData.ghanaCard.trim()
            )

        ) {

            alert(
                "Invalid Ghana Card number.\n\nExample: GHA-123456789-1"
            );

            return;

        }


        /* ===============================
           PASSWORD MATCH
        =============================== */

        if (

            formData.password !==
            formData.confirmPassword

        ) {

            alert(
                "Passwords do not match."
            );

            return;

        }


        /* ===============================
           PASSWORD STRENGTH
        =============================== */

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;


        if (

            !passwordRegex.test(
                formData.password
            )

        ) {

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


        /* ===============================
           SEND REGISTRATION REQUEST
        =============================== */

        try {

            setLoading(true);


            const response = await api.post(

                "/auth/register",

                {

                    ...formData,

                    name: formData.name.trim(),

                    email: formData.email
                        .trim()
                        .toLowerCase(),

                    phone: cleanPhone,

                    ghanaCard: formData.ghanaCard
                        .trim()
                        .toUpperCase()

                }

            );


            alert(

                response.data?.message ||

                "Account created successfully."

            );


            navigate("/login");

        }

        catch (error) {

            console.error(

                "REGISTRATION ERROR:",

                error.response?.data ||
                error.message

            );


            alert(

                error.response?.data?.message ||

                "Registration failed. Please try again."

            );

        }

        finally {

            setLoading(false);

        }

    };


    return (

        <div className="register-page">

            <div className="register-card">


                <h1>

                    Create Account

                </h1>


                <p>

                    Create your KAD Marketplace account.

                </p>


                <form onSubmit={handleSubmit}>


                    {/* FULL NAME */}

                    <input

                        type="text"

                        name="name"

                        placeholder="Full Name (e.g. AYITEY PROSPER)"

                        value={formData.name}

                        onChange={handleChange}

                        required

                    />


                    {/* EMAIL */}

                    <input

                        type="email"

                        name="email"

                        placeholder="Email Address (e.g. KOFINKRABEA@gmail.com)"

                        value={formData.email}

                        onChange={handleChange}

                        required

                    />


                    {/* PHONE */}

                    <input

                        type="text"

                        name="phone"

                        placeholder="Phone Number (e.g. 0241....67)"

                        value={formData.phone}

                        onChange={handleChange}

                        required

                    />


                    {/* GHANA CARD */}

                    <input

                        type="text"

                        name="ghanaCard"

                        placeholder="Ghana Card (e.g. GHA-123456789-1)"

                        value={formData.ghanaCard}

                        onChange={handleChange}

                        required

                    />


                    {/* REGION */}

                    <select

                        name="region"

                        value={formData.region}

                        onChange={handleChange}

                        required

                    >

                        <option value="">
                            Select Region
                        </option>

                        <option value="Greater Accra">
                            Greater Accra
                        </option>

                        <option value="Ashanti">
                            Ashanti
                        </option>

                        <option value="Eastern">
                            Eastern
                        </option>

                        <option value="Central">
                            Central
                        </option>

                        <option value="Western">
                            Western
                        </option>

                        <option value="Western North">
                            Western North
                        </option>

                        <option value="Ahafo">
                            Ahafo
                        </option>

                        <option value="Bono">
                            Bono
                        </option>

                        <option value="Bono East">
                            Bono East
                        </option>

                        <option value="Volta">
                            Volta
                        </option>

                        <option value="Oti">
                            Oti
                        </option>

                        <option value="Northern">
                            Northern
                        </option>

                        <option value="North East">
                            North East
                        </option>

                        <option value="Savannah">
                            Savannah
                        </option>

                        <option value="Upper East">
                            Upper East
                        </option>

                        <option value="Upper West">
                            Upper West
                        </option>

                    </select>


                    {/* CITY */}

                    <input

                        type="text"

                        name="city"

                        placeholder="City / Town (e.g. Koforidua)"

                        value={formData.city}

                        onChange={handleChange}

                        required

                    />


                    {/* ADDRESS */}

                    <textarea

                        name="address"

                        rows="3"

                        placeholder="Residential Address"

                        value={formData.address}

                        onChange={handleChange}

                        required

                    />


                    {/* PASSWORD */}

                    <input

                        type="password"

                        name="password"

                        placeholder="Password (Minimum 8 characters)"

                        value={formData.password}

                        onChange={handleChange}

                        required

                    />


                    {/* CONFIRM PASSWORD */}

                    <input

                        type="password"

                        name="confirmPassword"

                        placeholder="Confirm Password"

                        value={formData.confirmPassword}

                        onChange={handleChange}

                        required

                    />


                    {/* SUBMIT */}

                    <button

                        type="submit"

                        disabled={loading}

                    >

                        {

                            loading

                                ? "Creating Account..."

                                : "Create Account"

                        }

                    </button>


                </form>


                <p className="login-link">

                    Already have an account?

                    {" "}

                    <Link to="/login">

                        Login

                    </Link>

                </p>


            </div>

        </div>

    );

}


export default Register;
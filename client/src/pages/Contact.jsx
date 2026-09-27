import { useEffect, useState } from "react";
import api from "../config/axios";

import {
    FaPhoneAlt,
    FaEnvelope,
    FaClock
} from "react-icons/fa";

import Layout from "../components/Layout";

import "./Contact.css";

function Contact() {

    const [contactSettings, setContactSettings] = useState({
        supportEmail: "",
        supportPhone: "",
        timezone: ""
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(true);


    /* =========================================================
       LOAD CONTACT SETTINGS
    ========================================================= */

    useEffect(() => {

        let cancelled = false;

        const loadContactSettings = async () => {

            try {

                console.log(
                    "[CONTACT] Loading contact settings..."
                );

                const response = await api.get(
                    "/settings/public"
                );

                console.log(
                    "[CONTACT] Public settings:",
                    response.data
                );

                const settings =
                    response.data?.settings || {};

                if (!cancelled) {

                    setContactSettings({
                        supportEmail:
                            settings.support_email || "",

                        supportPhone:
                            settings.support_phone || "",

                        timezone:
                            settings.timezone ||
                            "Africa/Accra"
                    });

                }

            } catch (error) {

                console.error(
                    "[CONTACT] SETTINGS ERROR:",
                    error.response?.data ||
                    error.message ||
                    error
                );

                if (!cancelled) {

                    setContactSettings({
                        supportEmail: "",
                        supportPhone: "",
                        timezone: "Africa/Accra"
                    });

                }

            } finally {

                if (!cancelled) {
                    setSettingsLoading(false);
                }

            }

        };

        loadContactSettings();

        return () => {
            cancelled = true;
        };

    }, []);


    /* =========================================================
       HANDLE FORM INPUT
    ========================================================= */

    const handleChange = (e) => {

        setFormData((previous) => ({
            ...previous,
            [e.target.name]: e.target.value
        }));

    };


    /* =========================================================
       SUBMIT CONTACT FORM
    ========================================================= */

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            const response = await api.post(
                "/contact",
                formData
            );

            alert(
                response.data.message ||
                "Message sent successfully."
            );

            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: ""
            });

        } catch (error) {

            console.error(
                "[CONTACT] SUBMIT ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <Layout>

            <section className="contact-hero">

                <div className="contact-overlay">

                    <h1>
                        Contact Us
                    </h1>

                    <p>
                        We'd love to hear from you.
                        Get in touch with our support team.
                    </p>

                </div>

            </section>


            <section className="contact-container">


                {/* =================================================
                    CONTACT INFORMATION
                ================================================= */}

                <div className="contact-info">

                    <h2>
                        Get In Touch
                    </h2>

                    <p>
                        Our team is ready to help you
                        with any questions or concerns.
                    </p>


                    {/* PHONE */}

                    <div className="info-box">

                        <FaPhoneAlt />

                        <div>

                            <small>
                                Phone
                            </small>

                            <span>

                                {settingsLoading
                                    ? "Loading..."
                                    : contactSettings.supportPhone ||
                                      "Phone number not available"
                                }

                            </span>

                        </div>

                    </div>


                    {/* EMAIL */}

                    <div className="info-box">

                        <FaEnvelope />

                        <div>

                            <small>
                                Email
                            </small>

                            <span>

                                {settingsLoading
                                    ? "Loading..."
                                    : contactSettings.supportEmail ||
                                      "Email address not available"
                                }

                            </span>

                        </div>

                    </div>


                    {/* TIMEZONE */}

                    <div className="info-box">

                        <FaClock />

                        <div>

                            <small>
                                Timezone
                            </small>

                            <span>

                                {settingsLoading
                                    ? "Loading..."
                                    : contactSettings.timezone ||
                                      "Africa/Accra"
                                }

                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    CONTACT FORM
                ================================================= */}

                <form
                    className="contact-form"
                    onSubmit={handleSubmit}
                >

                    <h2>
                        Send Us a Message
                    </h2>


                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        required
                    />


                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        required
                    />


                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                    />


                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Subject"
                        required
                    />


                    <textarea
                        rows="6"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Write your message..."
                        required
                    />


                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Sending..."
                            : "Send Message"
                        }

                    </button>

                </form>

            </section>

        </Layout>

    );

}

export default Contact;
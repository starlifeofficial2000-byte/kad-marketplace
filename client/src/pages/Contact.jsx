import { useEffect, useState } from "react";
import api from "../config/axios";

import {
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt
} from "react-icons/fa";

import Layout from "../components/Layout";

import "./Contact.css";

function Contact() {

    const [contactSettings, setContactSettings] = useState({
        contactEmail: "Loading...",
        contactPhone: "Loading...",
        contactAddress: "Loading..."
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);


    useEffect(() => {
        loadContactSettings();
    }, []);


    const loadContactSettings = async () => {

        try {

            const response = await api.get("/settings/public");

            if (response.data.success) {

                const settings = response.data.settings || {};

                setContactSettings({
                    contactEmail:
                        settings.contactEmail ||
                        settings.contact_email ||
                        "support@kadmarketplace.com",

                    contactPhone:
                        settings.contactPhone ||
                        settings.contact_phone ||
                        "Not available",

                    contactAddress:
                        settings.contactAddress ||
                        settings.contact_address ||
                        "Kumasi, Ashanti Region, Ghana"
                });

            }

        } catch (error) {

            console.error(
                "CONTACT SETTINGS ERROR:",
                error
            );

            setContactSettings({
                contactEmail: "support@kadmarketplace.com",
                contactPhone: "+233 XX XXX XXXX",
                contactAddress:
                    "Kumasi, Ashanti Region, Ghana"
            });

        }

    };


    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


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

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <Layout>

            <section className="contact-hero">

                <div className="contact-overlay">

                    <h1>Contact Us</h1>

                    <p>
                        We'd love to hear from you.
                        Get in touch with our support team.
                    </p>

                </div>

            </section>


            <section className="contact-container">


                <div className="contact-info">

                    <h2>Get In Touch</h2>

                    <p>
                        Our team is ready to help you
                        with any questions or concerns.
                    </p>


                    <div className="info-box">

                        <FaPhoneAlt />

                        <div>

                            <small>Phone</small>

                            <span>
                                {contactSettings.contactPhone}
                            </span>

                        </div>

                    </div>


                    <div className="info-box">

                        <FaEnvelope />

                        <div>

                            <small>Email</small>

                            <span>
                                {contactSettings.contactEmail}
                            </span>

                        </div>

                    </div>


                    <div className="info-box">

                        <FaMapMarkerAlt />

                        <div>

                            <small>Address</small>

                            <span>
                                {contactSettings.contactAddress}
                            </span>

                        </div>

                    </div>

                </div>


                <form
                    className="contact-form"
                    onSubmit={handleSubmit}
                >

                    <h2>Send Us a Message</h2>


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
                            : "Send Message"}

                    </button>

                </form>

            </section>

        </Layout>

    );

}

export default Contact;
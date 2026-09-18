import { useState } from "react";
import api from "../config/axios";
import "./Support.css";

function Support() {

    const [form, setForm] = useState({
        subject: "",
        category: "Technical",
        priority: "Medium",
        message: ""
    });

    const [loading, setLoading] = useState(false);


    /* ==========================================
       HANDLE INPUT CHANGE
    ========================================== */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });

    };


    /* ==========================================
       SUBMIT SUPPORT TICKET
    ========================================== */

    const submitTicket = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            const response = await api.post(
                "/support",
                form
            );

            alert(
                response.data?.message ||
                "Support ticket submitted successfully."
            );

            setForm({
                subject: "",
                category: "Technical",
                priority: "Medium",
                message: ""
            });

        }

        catch (error) {

            console.error(
                "SUPPORT TICKET ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Something went wrong while submitting your support ticket."
            );

        }

        finally {

            setLoading(false);

        }

    };


    return (

        <div className="support-container">

            <div className="support-card">

                <h1>Contact Support</h1>

                <p>
                    Submit your issue and our support team will respond as soon as possible.
                </p>


                <form onSubmit={submitTicket}>


                    <input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                    />


                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                    >

                        <option value="Technical">
                            Technical
                        </option>

                        <option value="Payment">
                            Payment
                        </option>

                        <option value="Product">
                            Product
                        </option>

                        <option value="Store">
                            Store
                        </option>

                        <option value="Account">
                            Account
                        </option>

                        <option value="Report">
                            Report
                        </option>

                        <option value="Suggestion">
                            Suggestion
                        </option>

                        <option value="Other">
                            Other
                        </option>

                    </select>


                    <select
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                    >

                        <option value="Low">
                            Low
                        </option>

                        <option value="Medium">
                            Medium
                        </option>

                        <option value="High">
                            High
                        </option>

                    </select>


                    <textarea
                        name="message"
                        placeholder="Describe your problem..."
                        value={form.message}
                        onChange={handleChange}
                        rows="8"
                        required
                    />


                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {
                            loading
                                ? "Submitting..."
                                : "Submit Ticket"
                        }

                    </button>


                </form>

            </div>

        </div>

    );

}

export default Support;
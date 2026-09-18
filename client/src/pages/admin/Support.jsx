import { useState } from "react";
import api from "../../config/axios";
import "./Support.css";

function Support() {

    const token = localStorage.getItem("token");

    const [form, setForm] = useState({

        subject: "",

        category: "Technical",

        priority: "Medium",

        message: ""

    });

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const submitTicket = async (e) => {

        e.preventDefault();

        try {

            const response = await api.get(
    "/settings"
);

            alert("Support ticket submitted successfully.");

            setForm({

                subject: "",

                category: "Technical",

                priority: "Medium",

                message: ""

            });

        }

        catch (error) {

            console.log(error);

            alert(error.response?.data?.message || "Failed to submit ticket.");

        }

    };

    return (

        <div className="support-container">

            <div className="support-card">

                <h1>Contact Support</h1>

                <p>Need help? Submit a support ticket below.</p>

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

                        <option>Technical</option>

                        <option>Payment</option>

                        <option>Product</option>

                        <option>Store</option>

                        <option>Account</option>

                        <option>Report</option>

                        <option>Suggestion</option>

                        <option>Other</option>

                    </select>

                    <select

                        name="priority"

                        value={form.priority}

                        onChange={handleChange}

                    >

                        <option>Low</option>

                        <option>Medium</option>

                        <option>High</option>

                    </select>

                    <textarea

                        name="message"

                        placeholder="Describe your issue..."

                        value={form.message}

                        onChange={handleChange}

                        required

                    />

                    <button type="submit">

                        Submit Ticket

                    </button>

                </form>

            </div>

        </div>

    );

}

export default Support;
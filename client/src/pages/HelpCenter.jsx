import { useState } from "react";
import api from "../config/axios";
import "./HelpCenter.css";

function HelpCenter() {

    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const sendSupport = async () => {

        if (!subject.trim() || !message.trim()) {

            alert("Please complete all fields.");

            return;

        }

        try {

            setLoading(true);

            const response = await api.post(
                "/support",
                {
                    subject: subject.trim(),
                    message: message.trim()
                }
            );

            console.log("SUPPORT RESPONSE:", response.data);

            alert(
                response.data.message ||
                "Support request sent successfully."
            );

            setSubject("");
            setMessage("");

        }

        catch (error) {

            console.error(
                "SUPPORT REQUEST ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to send support request."
            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="help-page">

            <h1>Help Center</h1>

            <p>
                Need assistance? Browse our help articles or contact support.
            </p>

            <div className="help-grid">

                <div className="faq-card">

                    <h2>Frequently Asked Questions</h2>

                    <details>
                        <summary>How do I sell a product?</summary>
                        <p>
                            Open the Seller Dashboard and click Sell Product.
                        </p>
                    </details>

                    <details>
                        <summary>How do I boost my product?</summary>
                        <p>
                            Go to Promotions and choose the promotion you want.
                        </p>
                    </details>

                    <details>
                        <summary>Why is my product pending?</summary>
                        <p>
                            All products are reviewed before appearing publicly.
                        </p>
                    </details>

                    <details>
                        <summary>How do I change my subscription?</summary>
                        <p>
                            Open the Subscription page from the Seller Dashboard.
                        </p>
                    </details>

                </div>


                <div className="guide-card">

                    <h2>Marketplace Rules</h2>

                    <ul>
                        <li>No fake products.</li>
                        <li>No illegal items.</li>
                        <li>No offensive content.</li>
                        <li>Use real product images.</li>
                        <li>Treat buyers respectfully.</li>
                    </ul>

                </div>


                <div className="guide-card">

                    <h2>Safety Tips</h2>

                    <ul>
                        <li>Meet buyers in public places.</li>
                        <li>Verify payments before delivery.</li>
                        <li>Do not share passwords.</li>
                        <li>Report suspicious users.</li>
                    </ul>

                </div>

            </div>


            <div className="support-form">

                <h2>Contact Support</h2>

                <input

                    type="text"

                    placeholder="Subject"

                    value={subject}

                    onChange={(e) => setSubject(e.target.value)}

                    disabled={loading}

                />


                <textarea

                    rows="6"

                    placeholder="Describe your problem..."

                    value={message}

                    onChange={(e) => setMessage(e.target.value)}

                    disabled={loading}

                />


                <button

                    onClick={sendSupport}

                    disabled={loading}

                >

                    {
                        loading
                            ? "Sending..."
                            : "Send Request"
                    }

                </button>

            </div>

        </div>

    );

}

export default HelpCenter;
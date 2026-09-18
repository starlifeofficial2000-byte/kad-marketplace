import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import "./Sell.css";

function Sell() {

    const navigate = useNavigate();

    useEffect(() => {

        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!token || !user) {

            alert("Please login first.");

            navigate("/login");

        }

    }, [navigate]);

    return (

        <div className="sell-page">

            <div className="sell-wrapper">

                <div className="sell-header">

                    <h1>Sell Your Product</h1>

                    <p>

                        Reach thousands of buyers by posting your item.
                        Every listing is reviewed by our administrators
                        before it appears on the marketplace.

                    </p>

                </div>

                <div className="sell-content">

                    <div className="sell-form-section">

                        <ProductForm />

                    </div>

                    <div className="sell-sidebar">

                        <div className="tips-card">

                            <h2>Posting Tips</h2>

                            <ul>

                                <li>📷 Upload clear photos.</li>

                                <li>📝 Write a detailed description.</li>

                                <li>💰 Enter the correct price.</li>

                                <li>📍 Choose the correct location.</li>

                                <li>✅ Honest listings are approved faster.</li>

                            </ul>

                        </div>

                        <div className="notice-card">

                            <h2>Approval Notice</h2>

                            <p>

                                Every item is reviewed before it becomes
                                visible to buyers.

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Sell;
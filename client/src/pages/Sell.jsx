import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { promptToCompleteSellerProfile } from "../utils/profileCompletion";
import "./Sell.css";

function Sell() {

    const navigate = useNavigate();
    const [canSell, setCanSell] = useState(false);

    useEffect(() => {

        const token = localStorage.getItem("token");
        let user = null;
        try {
            user = JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            user = null;
        }

        if (!token || !user) {
            alert("Please login first.");
            navigate("/login");
            return;
        }

        const profileReady = promptToCompleteSellerProfile(user, navigate, "sell a product");
        setCanSell(profileReady);

    }, [navigate]);

    if (!canSell) {
        return <div className="sell-page" aria-live="polite"><div className="sell-wrapper"><h1>Complete your profile to sell</h1><p>You'll be able to browse and chat while completing the seller details in your profile.</p></div></div>;
    }

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
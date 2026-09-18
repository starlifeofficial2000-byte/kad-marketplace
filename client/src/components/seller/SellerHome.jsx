import { useEffect, useState } from "react";
import api from "../../config/axios";

function SellerHome() {

    const [stats, setStats] = useState({});

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            const res = await api.get(
                "/seller/dashboard"
            );

            setStats(res.data);

        }

        catch (error) {

            console.error(
                "Seller dashboard error:",
                error
            );

        }

    };

    return (

        <div>

            <h1>
                Seller Dashboard
            </h1>

            <div className="seller-cards">

                <div className="seller-card">

                    <h3>Total Products</h3>

                    <h1>
                        {stats.totalProducts || 0}
                    </h1>

                </div>


                <div className="seller-card">

                    <h3>Approved</h3>

                    <h1>
                        {stats.approvedProducts || 0}
                    </h1>

                </div>


                <div className="seller-card">

                    <h3>Pending</h3>

                    <h1>
                        {stats.pendingProducts || 0}
                    </h1>

                </div>


                <div className="seller-card">

                    <h3>Subscription</h3>

                    <h1>

                        {

                            stats.subscription

                                ? stats.subscription.subscriptionPlan

                                : "Basic"

                        }

                    </h1>

                </div>

            </div>

        </div>

    );

}

export default SellerHome;
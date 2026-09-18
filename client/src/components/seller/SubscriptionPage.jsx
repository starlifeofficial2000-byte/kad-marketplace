import { useEffect, useState } from "react";
import { FaCheckCircle, FaCrown, FaBolt, FaStar } from "react-icons/fa";
import api from "../../services/api";
import "./SubscriptionPage.css";

function SubscriptionPage() {
    const [plans, setPlans] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        loadSubscriptionData();
    }, []);

    const loadSubscriptionData = async () => {
        try {
            setLoading(true);
            setError("");

            const [plansResponse, subscriptionResponse] =
                await Promise.all([
                    api.get("/subscription/plans"),
                    api.get("/subscription/my-subscription")
                ]);

            console.log("PLANS RESPONSE:", plansResponse.data);
            console.log(
                "SUBSCRIPTION RESPONSE:",
                subscriptionResponse.data
            );

            /*
             Handle different backend response formats
            */

            const plansData = Array.isArray(plansResponse.data)
                ? plansResponse.data
                : plansResponse.data?.plans || [];

            setPlans(plansData);

            const subscriptionData =
                subscriptionResponse.data?.subscription ||
                subscriptionResponse.data ||
                null;

            setSubscription(subscriptionData);

        } catch (error) {
            console.error(
                "SUBSCRIPTION LOAD ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load subscription information."
            );

        } finally {
            setLoading(false);
        }
    };


 const subscribeToPlan = async (plan) => {

    try {

        if (!plan || !plan.id) {

            alert("Invalid subscription plan.");

            console.error(
                "PLAN ERROR:",
                plan
            );

            return;

        }

        setPaymentLoading(plan.id);

        console.log(
            "STARTING PAYMENT FOR PLAN:",
            plan
        );

        console.log(
            "PLAN ID:",
            plan.id
        );

        const response = await api.post(

            "/payments/initialize",

            {

                planId: Number(plan.id)

            }

        );

        console.log(
            "PAYMENT RESPONSE:",
            response.data
        );


        if (!response.data?.success) {

            throw new Error(

                response.data?.message ||

                "Unable to initialize payment."

            );

        }


        const authorizationUrl =
            response.data.authorization_url;


        if (!authorizationUrl) {

            throw new Error(

                "Paystack authorization URL was not received."

            );

        }


        window.location.href =
            authorizationUrl;

    }

    catch (error) {

        console.error(
            "PAYMENT INITIALIZATION ERROR:",
            error.response?.data || error
        );

        alert(

            error.response?.data?.message ||

            error.message ||

            "Payment initialization failed. Please try again."

        );

    }

    finally {

        setPaymentLoading(null);

    }

};
    /* =====================================================
       PLAN ICON
    ===================================================== */

    const getPlanIcon = (index) => {
        if (index === 0) return <FaStar />;
        if (index === 1) return <FaBolt />;
        return <FaCrown />;
    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="subscription-page">
                <div className="subscription-loading">

                    <div className="spinner"></div>

                    <h2>
                        Loading subscription plans...
                    </h2>

                </div>
            </div>
        );
    }


    return (

        <div className="subscription-page">

            {/* ================= HEADER ================= */}

            <div className="subscription-header">

                <div className="subscription-title">

                    <h1>
                        Choose Your Plan
                    </h1>

                    <p>
                        Select the perfect subscription plan
                        to grow your marketplace business.
                    </p>

                </div>

            </div>


            {/* ================= ERROR ================= */}

            {error && (

                <div className="subscription-error">

                    {error}

                </div>

            )}


            {/* ================= CURRENT SUBSCRIPTION ================= */}

            {subscription?.subscriptionPlan && (

                <div className="current-subscription">

                    <div>

                        <span>
                            CURRENT PLAN
                        </span>

                        <h2>
                            {subscription.subscriptionPlan.name}
                        </h2>

                        <p>

                            Status:

                            <strong>
                                {" "}
                                {subscription.status || "Active"}
                            </strong>

                        </p>

                    </div>


                    {subscription.endDate && (

                        <div className="subscription-date">

                            <span>
                                Expires
                            </span>

                            <strong>

                                {new Date(
                                    subscription.endDate
                                ).toLocaleDateString()}

                            </strong>

                        </div>

                    )}

                </div>

            )}


            {/* ================= PLANS ================= */}

            <div className="subscription-plans-grid">

                {plans.length === 0 ? (

                    <div className="no-plans">

                        <FaCrown />

                        <h2>
                            No Subscription Plans Available
                        </h2>

                        <p>
                            Subscription plans have not been
                            created yet.
                        </p>

                    </div>

                ) : (

                    plans.map((plan, index) => {

                        const features = Array.isArray(
                            plan.features
                        )
                            ? plan.features
                            : [];

                        const isCurrentPlan =
                            subscription?.subscriptionPlanId ===
                            plan.id;

                        return (

                            <div
                                className={`subscription-card ${
                                    isCurrentPlan
                                        ? "current-plan-card"
                                        : ""
                                }`}
                                key={plan.id}
                            >

                                {/* PLAN ICON */}

                                <div className="plan-icon">

                                    {getPlanIcon(index)}

                                </div>


                                {/* PLAN NAME */}

                                <h2>

                                    {plan.name}

                                </h2>


                                {/* DESCRIPTION */}

                                {plan.description && (

                                    <p className="plan-description">

                                        {plan.description}

                                    </p>

                                )}


                                {/* PRICE */}

                                <div className="plan-price">

                                    <span className="currency">

                                        GH₵

                                    </span>

                                    <span className="price">

                                        {Number(
                                            plan.price || 0
                                        ).toFixed(2)}

                                    </span>

                                </div>


                                <div className="duration">

                                    Valid for{" "}

                                    <strong>

                                        {plan.duration}

                                    </strong>

                                    {" "} days

                                </div>


                                {/* FEATURES */}

                                <div className="plan-features">

                                    <div className="feature">

                                        <FaCheckCircle />

                                        <span>

                                            Up to{" "}

                                            <strong>

                                                {plan.maxProducts || 0}

                                            </strong>

                                            {" "} product listings

                                        </span>

                                    </div>


                                    {plan.boostCredits > 0 && (

                                        <div className="feature">

                                            <FaCheckCircle />

                                            <span>

                                                {plan.boostCredits}

                                                {" "} Boost Credits

                                            </span>

                                        </div>

                                    )}


                                    {plan.featuredCredits > 0 && (

                                        <div className="feature">

                                            <FaCheckCircle />

                                            <span>

                                                {plan.featuredCredits}

                                                {" "} Featured Credits

                                            </span>

                                        </div>

                                    )}


                                    {plan.expressCredits > 0 && (

                                        <div className="feature">

                                            <FaCheckCircle />

                                            <span>

                                                {plan.expressCredits}

                                                {" "} Express Credits

                                            </span>

                                        </div>

                                    )}


                                    {features.map(
                                        (feature, featureIndex) => (

                                            <div
                                                className="feature"
                                                key={featureIndex}
                                            >

                                                <FaCheckCircle />

                                                <span>

                                                    {feature}

                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>


                                {/* BUTTON */}

                                <button
                                    className={`subscribe-btn ${
                                        isCurrentPlan
                                            ? "current-btn"
                                            : ""
                                    }`}
                                    disabled={
                                        paymentLoading === plan.id ||
                                        isCurrentPlan
                                    }
                                    onClick={() =>
                                        subscribeToPlan(plan)
                                    }
                                >

                                    {isCurrentPlan
                                        ? "Current Plan"
                                        : paymentLoading === plan.id
                                            ? "Processing..."
                                            : "Subscribe Now"
                                    }

                                </button>

                            </div>

                        );

                    })

                )}

            </div>


            {/* ================= FOOTER ================= */}

            <div className="subscription-footer">

                <p>

                    Payments are securely processed
                    through Paystack.

                </p>

            </div>

        </div>

    );

}

export default SubscriptionPage;
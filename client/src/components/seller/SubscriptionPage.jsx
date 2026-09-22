import { useEffect, useState } from "react";
import {
    FaCheckCircle,
    FaCrown,
    FaBolt,
    FaStar,
    FaTimesCircle
} from "react-icons/fa";

import api from "../../config/axios";
import "./SubscriptionPage.css";


function SubscriptionPage() {

    const [plans, setPlans] = useState([]);

    const [subscription, setSubscription] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [paymentLoading, setPaymentLoading] =
        useState(null);

    const [verifyingPayment, setVerifyingPayment] =
        useState(false);

    const [paymentSuccess, setPaymentSuccess] =
        useState("");

    const [paymentError, setPaymentError] =
        useState("");

    const [error, setError] =
        useState("");


    /* =====================================================
       LOAD SUBSCRIPTION DATA
    ===================================================== */

    useEffect(() => {

        handlePaystackReturn();

        loadSubscriptionData();

    }, []);


    /* =====================================================
       LOAD SUBSCRIPTION DATA
    ===================================================== */

    const loadSubscriptionData = async () => {

        try {

            setLoading(true);

            setError("");

            const [
                plansResponse,
                subscriptionResponse
            ] = await Promise.all([

                api.get(
                    "/subscription/plans"
                ),

                api.get(
                    "/subscription/my-subscription"
                )

            ]);


            console.log(
                "PLANS RESPONSE:",
                plansResponse.data
            );


            console.log(
                "SUBSCRIPTION RESPONSE:",
                subscriptionResponse.data
            );


            const plansData =
                Array.isArray(
                    plansResponse.data
                )
                    ? plansResponse.data
                    : plansResponse.data?.plans ||
                      [];


            setPlans(plansData);


            const subscriptionData =
                subscriptionResponse.data?.subscription ||
                subscriptionResponse.data ||
                null;


            setSubscription(
                subscriptionData
            );

        }

        catch (error) {

            console.error(
                "SUBSCRIPTION LOAD ERROR:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to load subscription information."
            );

        }

        finally {

            setLoading(false);

        }

    };


    /* =====================================================
       HANDLE PAYSTACK RETURN
    ===================================================== */

    const handlePaystackReturn = async () => {

        try {

            /*
             * Paystack normally returns the reference
             * through the callback URL.
             *
             * Example:
             *
             * /subscription?reference=SUB-123
             *
             * Some integrations may use trxref.
             */

            const params =
                new URLSearchParams(
                    window.location.search
                );


            const reference =
                params.get("reference") ||
                params.get("trxref");


            /*
             * Nothing to verify.
             */

            if (!reference) {

                return;

            }


            console.log(
                "PAYSTACK RETURN REFERENCE:",
                reference
            );


            setVerifyingPayment(true);

            setPaymentSuccess("");

            setPaymentError("");

            setError("");


            /*
             * Verify payment with our backend.
             *
             * The backend then verifies directly with
             * Paystack.
             */

            const response =
                await api.get(
                    `/payments/verify/${encodeURIComponent(
                        reference
                    )}`
                );


            console.log(
                "PAYMENT VERIFICATION RESPONSE:",
                response.data
            );


            if (!response.data?.success) {

                throw new Error(

                    response.data?.message ||
                    "Payment verification failed."

                );

            }


            /*
             * Payment successfully verified.
             */

            setPaymentSuccess(
                response.data?.alreadyVerified
                    ? "Your payment has already been confirmed. Your subscription is active."
                    : "Payment successful! Your subscription is now active."
            );


            /*
             * Update subscription immediately
             * without requiring the user to refresh.
             */

            if (
                response.data?.subscription
            ) {

                setSubscription(
                    response.data.subscription
                );

            }


            /*
             * Remove Paystack query parameters
             * from the browser URL.
             */

            const cleanUrl =
                window.location.pathname;


            window.history.replaceState(
                {},
                document.title,
                cleanUrl
            );


            /*
             * Reload subscription information
             * from the server to ensure the UI has
             * the latest subscription.
             */

            await loadSubscriptionData();

        }

        catch (error) {

            console.error(
                "PAYMENT VERIFICATION ERROR:",
                error.response?.data ||
                error
            );


            setPaymentError(

                error.response?.data?.message ||
                error.message ||
                "We could not confirm your payment. Please contact support if your account was charged."

            );

        }

        finally {

            setVerifyingPayment(false);

        }

    };


    /* =====================================================
       SUBSCRIBE TO PLAN
    ===================================================== */

    const subscribeToPlan = async (plan) => {

        try {

            if (
                !plan ||
                !plan.id
            ) {

                alert(
                    "Invalid subscription plan."
                );

                console.error(
                    "PLAN ERROR:",
                    plan
                );

                return;

            }


            setPaymentLoading(
                plan.id
            );


            setPaymentSuccess("");

            setPaymentError("");

            setError("");


            console.log(
                "STARTING PAYMENT FOR PLAN:",
                plan
            );


            console.log(
                "PLAN ID:",
                plan.id
            );


            const response =
                await api.post(

                    "/payments/initialize",

                    {
                        planId:
                            Number(plan.id)
                    }

                );


            console.log(
                "PAYMENT RESPONSE:",
                response.data
            );


            if (
                !response.data?.success
            ) {

                throw new Error(

                    response.data?.message ||
                    "Unable to initialize payment."

                );

            }


            const authorizationUrl =
                response.data?.authorization_url;


            const reference =
                response.data?.reference;


            console.log(
                "PAYSTACK AUTHORIZATION URL:",
                authorizationUrl
            );


            console.log(
                "PAYMENT REFERENCE:",
                reference
            );


            if (!authorizationUrl) {

                throw new Error(
                    "Paystack authorization URL was not received."
                );

            }


            /*
             * Store the reference locally as an
             * additional safety measure.
             *
             * This is useful if the callback URL
             * doesn't contain the reference.
             */

            if (reference) {

                localStorage.setItem(
                    "pendingPaymentReference",
                    reference
                );

            }


            /*
             * Redirect customer to Paystack.
             */

            window.location.href =
                authorizationUrl;

        }

        catch (error) {

            console.error(
                "PAYMENT INITIALIZATION ERROR:",
                error.response?.data ||
                error
            );


            setPaymentError(

                error.response?.data?.message ||
                error.message ||
                "Payment initialization failed. Please try again."

            );

        }

        finally {

            setPaymentLoading(
                null
            );

        }

    };


    /* =====================================================
       PLAN ICON
    ===================================================== */

    const getPlanIcon = (index) => {

        if (index === 0) {
            return <FaStar />;
        }

        if (index === 1) {
            return <FaBolt />;
        }

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


    /* =====================================================
       PAGE
    ===================================================== */

    return (

        <div className="subscription-page">


            {/* =================================================
                HEADER
            ================================================= */}

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


            {/* =================================================
                PAYMENT VERIFICATION
            ================================================= */}

            {verifyingPayment && (

                <div className="subscription-success">

                    <FaCheckCircle />

                    <div>

                        <strong>
                            Confirming your payment...
                        </strong>

                        <p>
                            Please wait while we verify
                            your Paystack payment.
                        </p>

                    </div>

                </div>

            )}


            {/* =================================================
                PAYMENT SUCCESS
            ================================================= */}

            {paymentSuccess && !verifyingPayment && (

                <div className="subscription-success">

                    <FaCheckCircle />

                    <div>

                        <strong>
                            Payment Successful
                        </strong>

                        <p>
                            {paymentSuccess}
                        </p>

                    </div>

                </div>

            )}


            {/* =================================================
                PAYMENT ERROR
            ================================================= */}

            {paymentError && (

                <div className="subscription-error">

                    <FaTimesCircle />

                    <div>

                        <strong>
                            Payment Confirmation
                        </strong>

                        <p>
                            {paymentError}
                        </p>

                    </div>

                </div>

            )}


            {/* =================================================
                GENERAL ERROR
            ================================================= */}

            {error && (

                <div className="subscription-error">

                    {error}

                </div>

            )}


            {/* =================================================
                CURRENT SUBSCRIPTION
            ================================================= */}

            {subscription?.subscriptionPlan && (

                <div className="current-subscription">

                    <div>

                        <span>
                            CURRENT PLAN
                        </span>

                        <h2>
                            {
                                subscription
                                    .subscriptionPlan
                                    .name
                            }
                        </h2>

                        <p>

                            Status:

                            <strong>

                                {" "}

                                {
                                    subscription.status ||
                                    "Active"
                                }

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


            {/* =================================================
                PLANS
            ================================================= */}

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

                    plans.map(
                        (plan, index) => {

                            const features =
                                Array.isArray(
                                    plan.features
                                )
                                    ? plan.features
                                    : [];


                            const isCurrentPlan =
                                Number(
                                    subscription?.subscriptionPlanId
                                ) ===
                                Number(plan.id);


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

                                        {
                                            getPlanIcon(
                                                index
                                            )
                                        }

                                    </div>


                                    {/* PLAN NAME */}

                                    <h2>

                                        {plan.name}

                                    </h2>


                                    {/* DESCRIPTION */}

                                    {plan.description && (

                                        <p className="plan-description">

                                            {
                                                plan.description
                                            }

                                        </p>

                                    )}


                                    {/* PRICE */}

                                    <div className="plan-price">

                                        <span className="currency">

                                            GH₵

                                        </span>

                                        <span className="price">

                                            {Number(
                                                plan.price ||
                                                0
                                            ).toFixed(2)}

                                        </span>

                                    </div>


                                    {/* DURATION */}

                                    <div className="duration">

                                        Valid for{" "}

                                        <strong>

                                            {
                                                plan.duration
                                            }

                                        </strong>

                                        {" "}days

                                    </div>


                                    {/* FEATURES */}

                                    <div className="plan-features">


                                        <div className="feature">

                                            <FaCheckCircle />

                                            <span>

                                                Up to{" "}

                                                <strong>

                                                    {
                                                        plan.maxProducts ||
                                                        0
                                                    }

                                                </strong>

                                                {" "}product listings

                                            </span>

                                        </div>


                                        {plan.boostCredits > 0 && (

                                            <div className="feature">

                                                <FaCheckCircle />

                                                <span>

                                                    {
                                                        plan.boostCredits
                                                    }

                                                    {" "}Boost Credits

                                                </span>

                                            </div>

                                        )}


                                        {plan.featuredCredits > 0 && (

                                            <div className="feature">

                                                <FaCheckCircle />

                                                <span>

                                                    {
                                                        plan.featuredCredits
                                                    }

                                                    {" "}Featured Credits

                                                </span>

                                            </div>

                                        )}


                                        {plan.expressCredits > 0 && (

                                            <div className="feature">

                                                <FaCheckCircle />

                                                <span>

                                                    {
                                                        plan.expressCredits
                                                    }

                                                    {" "}Express Credits

                                                </span>

                                            </div>

                                        )}


                                        {features.map(
                                            (
                                                feature,
                                                featureIndex
                                            ) => (

                                                <div
                                                    className="feature"
                                                    key={
                                                        featureIndex
                                                    }
                                                >

                                                    <FaCheckCircle />

                                                    <span>

                                                        {
                                                            feature
                                                        }

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

                                            paymentLoading ===
                                                plan.id ||

                                            isCurrentPlan ||

                                            verifyingPayment

                                        }

                                        onClick={() =>
                                            subscribeToPlan(
                                                plan
                                            )
                                        }

                                    >

                                        {
                                            isCurrentPlan

                                                ? "Current Plan"

                                                : paymentLoading ===
                                                    plan.id

                                                    ? "Processing..."

                                                    : "Subscribe Now"
                                        }

                                    </button>

                                </div>

                            );

                        }
                    )

                )}

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

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
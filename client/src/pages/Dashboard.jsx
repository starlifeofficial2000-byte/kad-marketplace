import { useEffect, useState } from "react";
import api from "../config/axios";

import {
    FaCrown,
    FaBoxOpen,
    FaRocket,
    FaStar,
    FaBolt,
    FaCalendarAlt,
    FaStore,
    FaEye,
    FaComments
} from "react-icons/fa";

import "./Dashboard.css";

function Dashboard() {

    const [loading, setLoading] = useState(true);

    const [subscription, setSubscription] = useState(null);

    const [stats, setStats] = useState({
        products: 0,
        views: 0,
        messages: 0
    });


    /* ==========================================
       LOAD DASHBOARD DATA
    ========================================== */

    useEffect(() => {

        loadDashboard();

    }, []);


    const loadDashboard = async () => {

        try {

            setLoading(true);

            await Promise.all([
                loadSubscription(),
                loadStats()
            ]);

        } catch (error) {

            console.error(
                "DASHBOARD LOAD ERROR:",
                error.response?.data || error.message
            );

        } finally {

            setLoading(false);

        }

    };


    /* ==========================================
       LOAD SUBSCRIPTION
    ========================================== */

    const loadSubscription = async () => {

        try {

            const response = await api.get(
                "/subscription/status"
            );

            console.log(
                "SUBSCRIPTION RESPONSE:",
                response.data
            );


            if (
                response.data?.success &&
                response.data?.hasSubscription &&
                response.data?.subscription
            ) {

                setSubscription(
                    response.data.subscription
                );

            } else {

                setSubscription(null);

            }

        } catch (error) {

            console.error(
                "SUBSCRIPTION ERROR:",
                error.response?.data || error.message
            );

            setSubscription(null);

        }

    };


    /* ==========================================
       LOAD DASHBOARD STATISTICS
    ========================================== */

    const loadStats = async () => {

        try {

            const response = await api.get(
                "/seller/dashboard"
            );

            console.log(
                "DASHBOARD STATS:",
                response.data
            );


            const data =
                response.data?.data ||
                response.data?.stats ||
                response.data ||
                {};


            setStats({

                products:
                    Number(
                        data.products ||
                        data.totalProducts ||
                        0
                    ),

                views:
                    Number(
                        data.views ||
                        data.totalViews ||
                        0
                    ),

                messages:
                    Number(
                        data.messages ||
                        data.totalMessages ||
                        0
                    )

            });

        } catch (error) {

            console.error(
                "STATS ERROR:",
                error.response?.data || error.message
            );

        }

    };


    /* ==========================================
       LOADING SCREEN
    ========================================== */

    if (loading) {

        return (

            <div className="dashboard-loading">

                <div className="loading-spinner"></div>

                <p>Loading dashboard...</p>

            </div>

        );

    }


    /* ==========================================
       GET SUBSCRIPTION PLAN
    ========================================== */

    const plan =
        subscription?.subscriptionPlan ||
        subscription?.plan ||
        null;


    /* ==========================================
       SUBSCRIPTION VALUES
    ========================================== */

    const uploadsUsed =
        Number(subscription?.uploadsUsed ?? 0);

    const boostsUsed =
        Number(subscription?.boostsUsed ?? 0);

    const featuredUsed =
        Number(subscription?.featuredUsed ?? 0);

    const expressUsed =
        Number(subscription?.expressUsed ?? 0);


    /* ==========================================
       PLAN VALUES
    ========================================== */

    const maxProducts =
        Number(plan?.maxProducts ?? 0);

    const boostCredits =
        Number(plan?.boostCredits ?? 0);

    const featuredCredits =
        Number(plan?.featuredCredits ?? 0);

    const expressCredits =
        Number(plan?.expressCredits ?? 0);

    const duration =
        Number(plan?.duration ?? 0);

    const price =
        Number(plan?.price ?? 0);


    /* ==========================================
       REMAINING CREDITS
    ========================================== */

    const uploadsRemaining =
        Math.max(maxProducts - uploadsUsed, 0);

    const boostsRemaining =
        Math.max(boostCredits - boostsUsed, 0);

    const featuredRemaining =
        Math.max(featuredCredits - featuredUsed, 0);

    const expressRemaining =
        Math.max(expressCredits - expressUsed, 0);


    /* ==========================================
       PERCENTAGE CALCULATOR
    ========================================== */

    const getPercentage = (used, total) => {

        if (!total || Number(total) <= 0) {
            return 0;
        }

        return Math.min(
            (Number(used) / Number(total)) * 100,
            100
        );

    };


    /* ==========================================
       FORMAT DATE
    ========================================== */

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString(
            "en-GB",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    };


    /* ==========================================
       DAYS REMAINING
    ========================================== */

    const getDaysRemaining = () => {

        if (!subscription?.endDate) {
            return 0;
        }

        const today = new Date();

        const endDate = new Date(
            subscription.endDate
        );

        const difference =
            endDate.getTime() -
            today.getTime();

        const days =
            Math.ceil(
                difference /
                (1000 * 60 * 60 * 24)
            );

        return Math.max(days, 0);

    };


    const daysRemaining =
        getDaysRemaining();


    /* ==========================================
       NO SUBSCRIPTION
    ========================================== */

    if (!subscription || !plan) {

        return (

            <div className="dashboard-page">

                <div className="dashboard-header">

                    <div>

                        <h1>
                            Seller Dashboard
                        </h1>

                        <p>
                            Manage your marketplace business.
                        </p>

                    </div>

                </div>


                <div className="no-subscription-card">

                    <FaCrown />

                    <h2>
                        No Active Subscription
                    </h2>

                    <p>
                        Subscribe to a plan to unlock
                        product uploads and promotion features.
                    </p>

                    <button
                        onClick={() => {
                            window.location.href =
                                "/subscription-plans";
                        }}
                    >

                        View Subscription Plans

                    </button>

                </div>


                <section className="dashboard-stats">

                    <div className="stat-card">

                        <div className="stat-icon">
                            <FaBoxOpen />
                        </div>

                        <div>

                            <p>Products</p>

                            <h3>
                                {stats.products}
                            </h3>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            <FaEye />
                        </div>

                        <div>

                            <p>Total Views</p>

                            <h3>
                                {stats.views}
                            </h3>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            <FaComments />
                        </div>

                        <div>

                            <p>Messages</p>

                            <h3>
                                {stats.messages}
                            </h3>

                        </div>

                    </div>

                </section>

            </div>

        );

    }


    /* ==========================================
       MAIN DASHBOARD
    ========================================== */

    return (

        <div className="dashboard-page">


            <div className="dashboard-header">

                <div>

                    <h1>
                        Seller Dashboard
                    </h1>

                    <p>
                        Manage your marketplace business
                        from one place.
                    </p>

                </div>


                <div className="dashboard-date">

                    <FaCalendarAlt />

                    {new Date().toLocaleDateString(
                        "en-GB",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }
                    )}

                </div>

            </div>


            {/* SUBSCRIPTION */}

            <section className="subscription-card">

                <div className="subscription-header">


                    <div className="plan-information">

                        <span className="plan-badge">

                            <FaCrown />

                            ACTIVE PLAN

                        </span>


                        <h2>
                            {plan.name ||
                                "Subscription Plan"}
                        </h2>


                        <p className="plan-description">

                            {plan.description ||
                                "Premium marketplace subscription plan."}

                        </p>


                        <div className="plan-price">

                            GH₵ {price.toFixed(2)}

                        </div>

                    </div>


                    <div className="subscription-status">

                        <span className="active-status">

                            ● ACTIVE

                        </span>


                        <h3>
                            {daysRemaining} Days Left
                        </h3>


                        <small>
                            {duration} Day Subscription
                        </small>


                        <p>

                            Ends:{" "}

                            {formatDate(
                                subscription.endDate
                            )}

                        </p>

                    </div>

                </div>


                <div className="usage-section">


                    {/* PRODUCTS */}

                    <UsageItem
                        icon={<FaBoxOpen />}
                        title="Product Uploads"
                        used={uploadsUsed}
                        total={maxProducts}
                        remaining={`${uploadsRemaining} uploads remaining`}
                        percentage={
                            getPercentage(
                                uploadsUsed,
                                maxProducts
                            )
                        }
                        type="uploads"
                    />


                    {/* BOOST */}

                    <UsageItem
                        icon={<FaRocket />}
                        title="Boost Credits"
                        used={boostsUsed}
                        total={boostCredits}
                        remaining={`${boostsRemaining} boost credits remaining`}
                        percentage={
                            getPercentage(
                                boostsUsed,
                                boostCredits
                            )
                        }
                        type="boost"
                    />


                    {/* FEATURED */}

                    <UsageItem
                        icon={<FaStar />}
                        title="Featured Credits"
                        used={featuredUsed}
                        total={featuredCredits}
                        remaining={`${featuredRemaining} featured credits remaining`}
                        percentage={
                            getPercentage(
                                featuredUsed,
                                featuredCredits
                            )
                        }
                        type="featured"
                    />


                    {/* EXPRESS */}

                    <UsageItem
                        icon={<FaBolt />}
                        title="Express Credits"
                        used={expressUsed}
                        total={expressCredits}
                        remaining={`${expressRemaining} express credits remaining`}
                        percentage={
                            getPercentage(
                                expressUsed,
                                expressCredits
                            )
                        }
                        type="express"
                    />

                </div>

            </section>


            {/* QUICK STATS */}

            <section className="dashboard-stats">


                <StatCard
                    icon={<FaBoxOpen />}
                    title="Products"
                    value={stats.products}
                />


                <StatCard
                    icon={<FaEye />}
                    title="Total Views"
                    value={stats.views}
                />


                <StatCard
                    icon={<FaComments />}
                    title="Messages"
                    value={stats.messages}
                />


                <StatCard
                    icon={<FaStore />}
                    title="Store Status"
                    value="Active"
                />

            </section>

        </div>

    );

}


/* ==========================================
   REUSABLE USAGE ITEM
========================================== */

function UsageItem({
    icon,
    title,
    used,
    total,
    remaining,
    percentage,
    type
}) {

    return (

        <div className="usage-item">

            <div className="usage-row">

                <span>

                    {icon}

                    {title}

                </span>

                <strong>

                    {used} / {total}

                </strong>

            </div>


            <div className="progress-bar">

                <div
                    className={`progress-fill ${type}`}
                    style={{
                        width: `${percentage}%`
                    }}
                />

            </div>


            <small className="remaining-text">

                {remaining}

            </small>

        </div>

    );

}


/* ==========================================
   REUSABLE STAT CARD
========================================== */

function StatCard({ icon, title, value }) {

    return (

        <div className="stat-card">

            <div className="stat-icon">

                {icon}

            </div>

            <div>

                <p>{title}</p>

                <h3>{value}</h3>

            </div>

        </div>

    );

}


export default Dashboard;
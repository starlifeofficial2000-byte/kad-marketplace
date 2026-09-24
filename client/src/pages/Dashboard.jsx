import { useEffect, useMemo, useState } from "react";
import api from "../config/axios";

import {
    FaCrown,
    FaBoxOpen,
    FaRocket,
    FaStar,
    FaBolt,
    FaCalendarAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaArrowRight,
    FaSyncAlt
} from "react-icons/fa";

import "./Dashboard.css";

function SellerDashboard() {

    // =========================================================
    // STATE
    // =========================================================

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [subscription, setSubscription] = useState(null);

    const [stats, setStats] = useState({
        products: 0
    });

    const [error, setError] = useState("");


    // =========================================================
    // LOAD DASHBOARD
    // =========================================================

    useEffect(() => {
        loadDashboard();
    }, []);


    const loadDashboard = async () => {

        try {

            setError("");
            setLoading(true);

            await Promise.all([
                loadSubscription(),
                loadStats()
            ]);

        } catch (err) {

            console.error(
                "DASHBOARD LOAD ERROR:",
                err?.response?.data ||
                err?.message ||
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // REFRESH
    // =========================================================

    const refreshDashboard = async () => {

        try {

            setRefreshing(true);
            setError("");

            await Promise.all([
                loadSubscription(),
                loadStats()
            ]);

        } catch (err) {

            console.error(
                "DASHBOARD REFRESH ERROR:",
                err?.response?.data ||
                err?.message ||
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to refresh dashboard."
            );

        } finally {

            setRefreshing(false);

        }
    };


    // =========================================================
    // LOAD SUBSCRIPTION
    // =========================================================

    const loadSubscription = async () => {

        try {

            const response = await api.get(
                "/subscription/status"
            );

            console.log(
                "SUBSCRIPTION RESPONSE:",
                response.data
            );

            const data = response?.data || {};

            const subscriptionData =
                data.subscription ||
                data.data?.subscription ||
                null;

            if (
                data.success === true &&
                data.hasSubscription === true &&
                subscriptionData
            ) {

                setSubscription(
                    subscriptionData
                );

            } else {

                setSubscription(null);

            }

        } catch (err) {

            console.error(
                "SUBSCRIPTION ERROR:",
                err?.response?.data ||
                err?.message ||
                err
            );

            setSubscription(null);

        }
    };


    // =========================================================
    // LOAD SELLER PRODUCTS
    // =========================================================

    const loadStats = async () => {

        try {

            const response = await api.get(
                "/seller/dashboard"
            );

            console.log(
                "DASHBOARD STATS:",
                response.data
            );

            const responseData =
                response?.data || {};

            const data =
                responseData.data ||
                responseData.stats ||
                responseData;

            setStats({

                products: Number(
                    data?.products ??
                    data?.totalProducts ??
                    0
                )

            });

        } catch (err) {

            console.error(
                "STATS ERROR:",
                err?.response?.data ||
                err?.message ||
                err
            );

            setStats({
                products: 0
            });

        }
    };


    // =========================================================
    // PLAN
    // =========================================================

    const plan = useMemo(() => {

        return (
            subscription?.plan ||
            subscription?.subscriptionPlan ||
            null
        );

    }, [subscription]);


    // =========================================================
    // USAGE
    // =========================================================

    const usage = useMemo(() => {

        return subscription?.usage || {};

    }, [subscription]);


    const uploadsUsed = Number(
        usage?.uploadsUsed ??
        subscription?.uploadsUsed ??
        0
    );


    const boostsUsed = Number(
        usage?.boostsUsed ??
        subscription?.boostsUsed ??
        0
    );


    const featuredUsed = Number(
        usage?.featuredUsed ??
        subscription?.featuredUsed ??
        0
    );


    const expressUsed = Number(
        usage?.expressUsed ??
        subscription?.expressUsed ??
        0
    );


    // =========================================================
    // PLAN LIMITS
    // =========================================================

    const maxProducts = Number(
        plan?.maxProducts ?? 0
    );


    const boostCredits = Number(
        plan?.boostCredits ?? 0
    );


    const featuredCredits = Number(
        plan?.featuredCredits ?? 0
    );


    const expressCredits = Number(
        plan?.expressCredits ?? 0
    );


    const duration = Number(
        plan?.duration ?? 0
    );


    const price = Number(
        plan?.price ?? 0
    );


    // =========================================================
    // REMAINING
    // =========================================================

    const uploadsRemaining = Math.max(
        maxProducts - uploadsUsed,
        0
    );


    const boostsRemaining = Math.max(
        boostCredits - boostsUsed,
        0
    );


    const featuredRemaining = Math.max(
        featuredCredits - featuredUsed,
        0
    );


    const expressRemaining = Math.max(
        expressCredits - expressUsed,
        0
    );


    // =========================================================
    // SUBSCRIPTION STATUS
    // =========================================================

    const subscriptionStatus =
        String(
            subscription?.status || ""
        ).toLowerCase();


    const isActive =
        !!subscription &&
        (
            subscriptionStatus === "active" ||
            subscriptionStatus === ""
        );


    // =========================================================
    // DAYS REMAINING
    // =========================================================

    const daysRemaining = useMemo(() => {

        if (!subscription?.endDate) {

            return Number(
                subscription?.daysLeft ?? 0
            );

        }

        const endDate = new Date(
            subscription.endDate
        );

        if (
            Number.isNaN(
                endDate.getTime()
            )
        ) {

            return Number(
                subscription?.daysLeft ?? 0
            );

        }

        const now = new Date();

        const difference =
            endDate.getTime() -
            now.getTime();

        const days = Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );

        return Math.max(days, 0);

    }, [subscription]);


    // =========================================================
    // PERCENTAGE
    // =========================================================

    const getPercentage = (
        used,
        total
    ) => {

        const safeUsed =
            Number(used || 0);

        const safeTotal =
            Number(total || 0);

        if (safeTotal <= 0) {
            return 0;
        }

        return Math.min(
            Math.max(
                (safeUsed / safeTotal) * 100,
                0
            ),
            100
        );
    };


    // =========================================================
    // DATE FORMAT
    // =========================================================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "N/A";

        }

        return parsedDate.toLocaleDateString(
            "en-GB",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    };


    // =========================================================
    // NUMBER FORMAT
    // =========================================================

    const formatNumber = (value) => {

        return Number(
            value || 0
        ).toLocaleString();

    };


    // =========================================================
    // STATUS
    // =========================================================

    const uploadLimitReached =
        maxProducts > 0 &&
        uploadsUsed >= maxProducts;


    const hasBoostCredits =
        boostsRemaining > 0;


    const hasFeaturedCredits =
        featuredRemaining > 0;


    const hasExpressCredits =
        expressRemaining > 0;


    // =========================================================
    // SELL PRODUCT
    // =========================================================

    const goToSell = () => {

        window.location.href = "/sell";

    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="dashboard-page">

                <div className="dashboard-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading dashboard...
                    </p>

                </div>

            </div>

        );

    }


    // =========================================================
    // NO SUBSCRIPTION
    // =========================================================

    if (!subscription || !plan) {

        return (

            <div className="dashboard-page">

                <div className="dashboard-header">

                    <div>

                        <h1>
                            Seller Dashboard
                        </h1>

                        <p>
                            Manage your marketplace
                            business from one place.
                        </p>

                    </div>


                    <div className="dashboard-header-actions">

                        <button
                            type="button"
                            className="dashboard-refresh-btn"
                            onClick={refreshDashboard}
                            disabled={refreshing}
                        >

                            <FaSyncAlt
                                className={
                                    refreshing
                                        ? "refresh-spinning"
                                        : ""
                                }
                            />

                            {refreshing
                                ? "Refreshing..."
                                : "Refresh"
                            }

                        </button>

                    </div>

                </div>


                {error && (

                    <div className="dashboard-error">

                        <FaExclamationTriangle />

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                <div className="no-subscription-card">

                    <FaCrown
                        className="no-subscription-icon"
                    />

                    <h2>
                        No Active Subscription
                    </h2>

                    <p>
                        You currently do not have
                        an active subscription.
                    </p>

                    <p>
                        Please contact the marketplace
                        administrator to manage your
                        subscription.
                    </p>

                </div>


                <section className="dashboard-stats">

                    <StatCard
                        icon={<FaBoxOpen />}
                        title="Total Products"
                        value={formatNumber(
                            stats.products
                        )}
                    />

                </section>


                <section className="dashboard-quick-actions">

                    <div className="quick-action-card">

                        <div className="quick-action-icon">
                            <FaBoxOpen />
                        </div>

                        <div>

                            <h3>
                                Sell a Product
                            </h3>

                            <p>
                                Add a new product to
                                your marketplace.
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={goToSell}
                        >
                            Sell Now
                            <FaArrowRight />
                        </button>

                    </div>

                </section>

            </div>

        );

    }


    // =========================================================
    // MAIN DASHBOARD
    // =========================================================

    return (

        <div className="dashboard-page">


            {/* HEADER */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        Seller Dashboard
                    </h1>

                    <p>
                        Monitor your subscription,
                        listings and marketplace benefits.
                    </p>

                </div>


                <div className="dashboard-header-actions">

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


                    <button
                        type="button"
                        className="dashboard-refresh-btn"
                        onClick={refreshDashboard}
                        disabled={refreshing}
                    >

                        <FaSyncAlt
                            className={
                                refreshing
                                    ? "refresh-spinning"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"
                        }

                    </button>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="dashboard-error">

                    <FaExclamationTriangle />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* =================================================
                SUBSCRIPTION
            ================================================= */}

            <section className="subscription-card">

                <div className="subscription-header">


                    <div className="plan-information">

                        <span className="plan-badge">

                            <FaCrown />

                            {isActive
                                ? "ACTIVE PLAN"
                                : "INACTIVE PLAN"
                            }

                        </span>


                        <h2>
                            {plan?.name ||
                                "Subscription Plan"
                            }
                        </h2>


                        <p className="plan-description">

                            {plan?.description ||
                                "Premium marketplace subscription plan."
                            }

                        </p>


                        <div className="plan-price">

                            GH₵{" "}

                            {price.toFixed(2)}

                        </div>

                    </div>


                    <div className="subscription-status">

                        <span
                            className={
                                isActive
                                    ? "active-status"
                                    : "inactive-status"
                            }
                        >

                            {isActive
                                ? "● ACTIVE"
                                : "● INACTIVE"
                            }

                        </span>


                        <h3>

                            {daysRemaining}{" "}

                            {daysRemaining === 1
                                ? "Day"
                                : "Days"
                            }{" "}

                            Left

                        </h3>


                        {duration > 0 && (

                            <small>
                                {duration} Day Subscription
                            </small>

                        )}


                        <p>

                            Starts:{" "}

                            {formatDate(
                                subscription?.startDate
                            )}

                        </p>


                        <p>

                            Ends:{" "}

                            {formatDate(
                                subscription?.endDate
                            )}

                        </p>

                    </div>

                </div>


                {/* EXPIRING WARNING */}

                {daysRemaining <= 3 && (

                    <div className="subscription-warning">

                        <FaExclamationTriangle />

                        <div>

                            <strong>
                                Subscription Expiring Soon
                            </strong>

                            <p>

                                {daysRemaining === 0
                                    ? "Your subscription has expired or expires today."
                                    : `Your subscription has ${daysRemaining} day${
                                        daysRemaining === 1
                                            ? ""
                                            : "s"
                                    } remaining.`
                                }

                            </p>

                        </div>

                    </div>

                )}


                {/* =================================================
                    USAGE
                ================================================= */}

                <div className="usage-section">


                    <UsageItem
                        icon={<FaBoxOpen />}
                        title="Product Listings"
                        used={uploadsUsed}
                        total={maxProducts}
                        remaining={
                            maxProducts > 0
                                ? `${uploadsRemaining} ${
                                    uploadsRemaining === 1
                                        ? "listing"
                                        : "listings"
                                } remaining`
                                : "No listing limit configured"
                        }
                        percentage={
                            getPercentage(
                                uploadsUsed,
                                maxProducts
                            )
                        }
                        type="uploads"
                        limitReached={
                            uploadLimitReached
                        }
                    />


                    <UsageItem
                        icon={<FaRocket />}
                        title="Boost Credits"
                        used={boostsUsed}
                        total={boostCredits}
                        remaining={
                            boostCredits > 0
                                ? `${boostsRemaining} ${
                                    boostsRemaining === 1
                                        ? "credit"
                                        : "credits"
                                } remaining`
                                : "No boost credits"
                        }
                        percentage={
                            getPercentage(
                                boostsUsed,
                                boostCredits
                            )
                        }
                        type="boost"
                        limitReached={
                            boostCredits > 0 &&
                            !hasBoostCredits
                        }
                    />


                    <UsageItem
                        icon={<FaStar />}
                        title="Featured Credits"
                        used={featuredUsed}
                        total={featuredCredits}
                        remaining={
                            featuredCredits > 0
                                ? `${featuredRemaining} ${
                                    featuredRemaining === 1
                                        ? "credit"
                                        : "credits"
                                } remaining`
                                : "No featured credits"
                        }
                        percentage={
                            getPercentage(
                                featuredUsed,
                                featuredCredits
                            )
                        }
                        type="featured"
                        limitReached={
                            featuredCredits > 0 &&
                            !hasFeaturedCredits
                        }
                    />


                    <UsageItem
                        icon={<FaBolt />}
                        title="Express Credits"
                        used={expressUsed}
                        total={expressCredits}
                        remaining={
                            expressCredits > 0
                                ? `${expressRemaining} ${
                                    expressRemaining === 1
                                        ? "credit"
                                        : "credits"
                                } remaining`
                                : "No express credits"
                        }
                        percentage={
                            getPercentage(
                                expressUsed,
                                expressCredits
                            )
                        }
                        type="express"
                        limitReached={
                            expressCredits > 0 &&
                            !hasExpressCredits
                        }
                    />

                </div>

            </section>


            {/* =================================================
                PRODUCT SUMMARY
            ================================================= */}

            <section className="dashboard-product-summary">

                <div className="dashboard-section-title">

                    <div>

                        <h2>
                            Your Products
                        </h2>

                        <p>
                            Track your marketplace
                            listings and subscription allowance.
                        </p>

                    </div>

                </div>


                <div className="dashboard-stats">


                    <StatCard
                        icon={<FaBoxOpen />}
                        title="Total Products Uploaded"
                        value={formatNumber(
                            stats.products
                        )}
                    />


                    <StatCard
                        icon={<FaBoxOpen />}
                        title="Listings Used"
                        value={
                            maxProducts > 0
                                ? `${uploadsUsed} / ${maxProducts}`
                                : formatNumber(
                                    uploadsUsed
                                )
                        }
                    />


                    <StatCard
                        icon={<FaCheckCircle />}
                        title="Listings Remaining"
                        value={
                            maxProducts > 0
                                ? formatNumber(
                                    uploadsRemaining
                                )
                                : "Unlimited"
                        }
                    />

                </div>

            </section>


            {/* =================================================
                SELL PRODUCT
            ================================================= */}

            <section className="dashboard-quick-actions">

                <div className="quick-action-card">

                    <div className="quick-action-icon">

                        <FaBoxOpen />

                    </div>


                    <div>

                        <h3>
                            Sell a Product
                        </h3>

                        <p>
                            Add a new product to
                            your marketplace.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={goToSell}
                    >

                        Sell Now

                        <FaArrowRight />

                    </button>

                </div>

            </section>


            {/* =================================================
                PLAN BENEFITS
            ================================================= */}

            <section className="dashboard-benefits">

                <div className="dashboard-section-title">

                    <div>

                        <h2>
                            Your Plan Benefits
                        </h2>

                        <p>
                            Features and credits
                            included with your
                            current subscription.
                        </p>

                    </div>

                </div>


                <div className="benefits-grid">


                    <BenefitCard
                        icon={<FaBoxOpen />}
                        title="Product Listings"
                        value={
                            maxProducts > 0
                                ? `${maxProducts} Listings`
                                : "Not configured"
                        }
                        enabled={
                            maxProducts > 0
                        }
                    />


                    <BenefitCard
                        icon={<FaRocket />}
                        title="Boost Credits"
                        value={
                            `${boostCredits} ${
                                boostCredits === 1
                                    ? "Credit"
                                    : "Credits"
                            }`
                        }
                        enabled={
                            boostCredits > 0
                        }
                    />


                    <BenefitCard
                        icon={<FaStar />}
                        title="Featured Credits"
                        value={
                            `${featuredCredits} ${
                                featuredCredits === 1
                                    ? "Credit"
                                    : "Credits"
                            }`
                        }
                        enabled={
                            featuredCredits > 0
                        }
                    />


                    <BenefitCard
                        icon={<FaBolt />}
                        title="Express Credits"
                        value={
                            `${expressCredits} ${
                                expressCredits === 1
                                    ? "Credit"
                                    : "Credits"
                            }`
                        }
                        enabled={
                            expressCredits > 0
                        }
                    />

                </div>

            </section>


        </div>

    );
}


// =============================================================
// USAGE ITEM
// =============================================================

function UsageItem({
    icon,
    title,
    used,
    total,
    remaining,
    percentage,
    type,
    limitReached
}) {

    const safeUsed =
        Number(used || 0);

    const safeTotal =
        Number(total || 0);


    return (

        <div
            className={
                `usage-item ${
                    limitReached
                        ? "usage-limit-reached"
                        : ""
                }`
            }
        >

            <div className="usage-row">

                <span>

                    {icon}

                    {title}

                </span>


                <strong>

                    {safeUsed}

                    {" / "}

                    {safeTotal}

                </strong>

            </div>


            <div className="progress-bar">

                <div
                    className={
                        `progress-fill ${type}`
                    }
                    style={{
                        width:
                            `${Math.min(
                                Math.max(
                                    Number(
                                        percentage || 0
                                    ),
                                    0
                                ),
                                100
                            )}%`
                    }}
                />

            </div>


            <div className="usage-bottom-row">

                <small className="remaining-text">

                    {remaining}

                </small>


                {limitReached && (

                    <small className="limit-reached-text">

                        Limit reached

                    </small>

                )}

            </div>

        </div>

    );
}


// =============================================================
// STAT CARD
// =============================================================

function StatCard({
    icon,
    title,
    value
}) {

    return (

        <div className="stat-card">

            <div className="stat-icon">

                {icon}

            </div>


            <div>

                <p>
                    {title}
                </p>

                <h3>
                    {value}
                </h3>

            </div>

        </div>

    );

}


// =============================================================
// BENEFIT CARD
// =============================================================

function BenefitCard({
    icon,
    title,
    value,
    enabled
}) {

    return (

        <div
            className={
                `benefit-card ${
                    enabled
                        ? "benefit-enabled"
                        : "benefit-disabled"
                }`
            }
        >

            <div className="benefit-icon">

                {icon}

            </div>


            <div className="benefit-content">

                <h3>
                    {title}
                </h3>

                <p>
                    {value}
                </p>

            </div>


            <div className="benefit-status">

                {enabled
                    ? <FaCheckCircle />
                    : <span>—</span>
                }

            </div>

        </div>

    );

}


export default SellerDashboard;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";

import "./SubscriptionPlans.css";

function SubscriptionPlans() {
    const navigate = useNavigate();

    const [plans, setPlans] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* ==========================================
       LOAD SUBSCRIPTION PLANS
    ========================================== */

    const loadPlans = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/subscription-plans");

            console.log("SUBSCRIPTION PLANS RESPONSE:", response.data);

            let plansData = [];

            if (Array.isArray(response.data)) {
                plansData = response.data;
            } else if (Array.isArray(response.data?.plans)) {
                plansData = response.data.plans;
            } else if (Array.isArray(response.data?.data)) {
                plansData = response.data.data;
            } else if (Array.isArray(response.data?.subscriptionPlans)) {
                plansData = response.data.subscriptionPlans;
            }

            setPlans(plansData);

        } catch (error) {
            console.error("LOAD PLANS ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load subscription plans."
            );

            setPlans([]);

        } finally {
            setLoading(false);
        }
    };


    /* ==========================================
       LOAD ON PAGE START
    ========================================== */

    useEffect(() => {
        loadPlans();
    }, []);


    /* ==========================================
       ACTIVATE PLAN
    ========================================== */

    const activatePlan = async (id) => {
        try {
            const confirmed = window.confirm(
                "Activate this subscription plan?"
            );

            if (!confirmed) return;

            await api.put(
                `/admin/subscription-plans/${id}/activate`
            );

            alert("Subscription plan activated successfully.");

            loadPlans();

        } catch (error) {
            console.error("ACTIVATE PLAN ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Failed to activate subscription plan."
            );
        }
    };


    /* ==========================================
       SUSPEND PLAN
    ========================================== */

    const suspendPlan = async (id) => {
        try {
            const confirmed = window.confirm(
                "Suspend this subscription plan?"
            );

            if (!confirmed) return;

            await api.put(
                `/admin/subscription-plans/${id}/suspend`
            );

            alert("Subscription plan suspended successfully.");

            loadPlans();

        } catch (error) {
            console.error("SUSPEND PLAN ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Failed to suspend subscription plan."
            );
        }
    };


    /* ==========================================
       DELETE PLAN
    ========================================== */

    const deletePlan = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this subscription plan?"
        );

        if (!confirmed) return;

        try {
            await api.delete(
                `/admin/subscription-plans/${id}`
            );

            alert("Subscription plan deleted successfully.");

            loadPlans();

        } catch (error) {
            console.error("DELETE PLAN ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete subscription plan."
            );
        }
    };


    /* ==========================================
       FILTER PLANS
    ========================================== */

    const filteredPlans = plans.filter((plan) => {
        const keyword = search.toLowerCase();

        return (
            String(plan.name || "")
                .toLowerCase()
                .includes(keyword) ||

            String(plan.description || "")
                .toLowerCase()
                .includes(keyword)
        );
    });


    /* ==========================================
       STATISTICS
    ========================================== */

    const totalPlans = plans.length;

    const activePlans = plans.filter(
        (plan) =>
            plan.isActive === true ||
            String(plan.status || "").toLowerCase() === "active"
    ).length;

    const suspendedPlans = plans.filter(
        (plan) =>
            plan.isActive === false ||
            String(plan.status || "").toLowerCase() === "suspended"
    ).length;


    const averagePrice =
        totalPlans > 0
            ? (
                plans.reduce(
                    (total, plan) =>
                        total + Number(plan.price || 0),
                    0
                ) / totalPlans
            ).toFixed(2)
            : "0.00";


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {
        return (
            <div className="plans-loading">
                <h2>Loading Subscription Plans...</h2>
            </div>
        );
    }


    /* ==========================================
       PAGE
    ========================================== */

    return (
        <div className="plans-page">

            {/* ERROR MESSAGE */}

            {error && (
                <div className="plans-error">
                    {error}
                </div>
            )}


            {/* STATISTICS */}

            <div className="plan-stats">

                <div className="stat-card">
                    <h2>{totalPlans}</h2>
                    <p>Total Plans</p>
                </div>


                <div className="stat-card active-card">
                    <h2>{activePlans}</h2>
                    <p>Active Plans</p>
                </div>


                <div className="stat-card suspended-card">
                    <h2>{suspendedPlans}</h2>
                    <p>Suspended Plans</p>
                </div>


                <div className="stat-card">
                    <h2>GH₵ {averagePrice}</h2>
                    <p>Average Price</p>
                </div>

            </div>


            {/* HEADER */}

            <div className="plans-header">

                <div>
                    <h1>Subscription Plans</h1>

                    <p>
                        Create and manage marketplace subscription plans
                    </p>
                </div>


                <div className="plans-header-actions">

                    <input
                        type="text"
                        placeholder="Search plans..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />


                    <button
                        className="create-btn"
                        onClick={() =>
                            navigate("/admin/subscriptions/new")
                        }
                    >
                        + Create Plan
                    </button>

                </div>

            </div>


            {/* PLANS TABLE */}

            <div className="plans-table-container">

                <table className="plans-table">

                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Duration</th>
                            <th>Products</th>
                            <th>Boosts</th>
                            <th>Featured</th>
                            <th>Express</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>


                    <tbody>

                        {filteredPlans.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="9"
                                    className="no-plans"
                                >
                                    No subscription plans found.
                                </td>
                            </tr>

                        ) : (

                            filteredPlans.map((plan) => {

                                const isActive =
                                    plan.isActive === true ||
                                    String(plan.status || "")
                                        .toLowerCase() === "active";

                                return (

                                    <tr key={plan.id}>

                                        {/* NAME */}

                                        <td>

                                            <strong>
                                                {plan.name}
                                            </strong>

                                            {plan.description && (
                                                <small className="plan-description-small">
                                                    {plan.description}
                                                </small>
                                            )}

                                        </td>


                                        {/* PRICE */}

                                        <td>
                                            GH₵{" "}
                                            {Number(
                                                plan.price || 0
                                            ).toFixed(2)}
                                        </td>


                                        {/* DURATION */}

                                        <td>
                                            {plan.duration || 0} Days
                                        </td>


                                        {/* PRODUCTS */}

                                        <td>
                                            {plan.maxProducts || 0}
                                        </td>


                                        {/* BOOSTS */}

                                        <td>
                                            {plan.boostCredits || 0}
                                        </td>


                                        {/* FEATURED */}

                                        <td>
                                            {plan.featuredCredits || 0}
                                        </td>


                                        {/* EXPRESS */}

                                        <td>
                                            {plan.expressCredits || 0}
                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={
                                                    isActive
                                                        ? "status active-status"
                                                        : "status suspended-status"
                                                }
                                            >

                                                {isActive
                                                    ? "ACTIVE"
                                                    : "SUSPENDED"}

                                            </span>

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <div className="action-buttons">

                                                <button
                                                    className="view-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/subscriptions/${plan.id}/edit`
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>


                                                {isActive ? (

                                                    <button
                                                        className="reject-btn"
                                                        onClick={() =>
                                                            suspendPlan(plan.id)
                                                        }
                                                    >
                                                        Suspend
                                                    </button>

                                                ) : (

                                                    <button
                                                        className="approve-btn"
                                                        onClick={() =>
                                                            activatePlan(plan.id)
                                                        }
                                                    >
                                                        Activate
                                                    </button>

                                                )}


                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        deletePlan(plan.id)
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                );

                            })

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default SubscriptionPlans;
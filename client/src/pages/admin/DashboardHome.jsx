import { useEffect, useState, useRef } from "react";
import api from "../../config/axios";

import RevenueDashboard from "../../components/admin/RevenueDashboard";
import QuickActions from "../../components/admin/QuickActions";
import RecentActivity from "../../components/admin/RecentActivity";
import RevenueChart from "../../components/admin/RevenueChart";

import "./DashboardHome.css";

function getStoredUser() {
    try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            return {};
        }

        return JSON.parse(storedUser) || {};
    } catch (error) {
        console.error("Invalid user data:", error);
        return {};
    }
}

function DashboardHome() {
    const user = getStoredUser();

    const permissions = Array.isArray(user.permissions)
        ? user.permissions
        : [];

    const roles = Array.isArray(user.roles)
        ? user.roles
        : [];

    const [chart, setChart] = useState([]);

    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        stores: 0,
        pending: 0,
        reports: 0,
        salesToday: 0,
    });

    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(true);

    const [error, setError] = useState("");
    const [chartError, setChartError] = useState("");

    const hasLoaded = useRef(false);

    /*
    |--------------------------------------------------------------------------
    | Permissions
    |--------------------------------------------------------------------------
    */

    const hasPermission = (...requiredPermissions) => {
        const isSuperAdmin =
            user.role === "admin" ||
            roles.includes("Super Admin") ||
            roles.includes("Administrator");

        if (isSuperAdmin) {
            return true;
        }

        return requiredPermissions.every((permission) =>
            permissions.includes(permission)
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Load Dashboard
    |--------------------------------------------------------------------------
    */

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/stats");

            const dashboardData =
                response.data?.data ||
                response.data?.stats ||
                response.data ||
                {};

            setStats({
                users:
                    Number(
                        dashboardData.users ??
                        dashboardData.totalUsers
                    ) || 0,

                products:
                    Number(
                        dashboardData.products ??
                        dashboardData.totalProducts
                    ) || 0,

                stores:
                    Number(
                        dashboardData.stores ??
                        dashboardData.totalStores
                    ) || 0,

                pending:
                    Number(
                        dashboardData.pending ??
                        dashboardData.pendingProducts
                    ) || 0,

                reports:
                    Number(
                        dashboardData.reports ??
                        dashboardData.totalReports
                    ) || 0,

                salesToday:
                    Number(
                        dashboardData.salesToday ??
                        dashboardData.todaySales ??
                        dashboardData.revenueToday
                    ) || 0,
            });
        } catch (error) {
            console.error("Dashboard stats error:", error);

            setError(
                error?.response?.data?.message ||
                "Unable to load dashboard statistics."
            );

            setStats({
                users: 0,
                products: 0,
                stores: 0,
                pending: 0,
                reports: 0,
                salesToday: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Load Revenue Chart
    |--------------------------------------------------------------------------
    */

    const loadChart = async () => {
        try {
            setChartLoading(true);
            setChartError("");

            const response = await api.get("/admin/revenue/chart");

            const chartData =
                response.data?.data ||
                response.data?.chart ||
                response.data?.revenue ||
                [];

            setChart(
                Array.isArray(chartData)
                    ? chartData
                    : []
            );
        } catch (error) {
            console.error("Revenue chart error:", error);

            setChartError(
                error?.response?.data?.message ||
                "Unable to load revenue chart."
            );

            setChart([]);
        } finally {
            setChartLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Initial Load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (hasLoaded.current) {
            return;
        }

        hasLoaded.current = true;

        loadDashboard();
        loadChart();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Refresh
    |--------------------------------------------------------------------------
    */

    const handleRefresh = () => {
        loadDashboard();
        loadChart();
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="dashboard-home">

            {/* =========================================================
                HEADER
            ========================================================== */}

            <header className="dashboard-header">

                <div className="dashboard-title">

                    <span className="dashboard-eyebrow">
                        ADMINISTRATION
                    </span>

                    <h1>
                        Marketplace Dashboard
                    </h1>

                    <p>
                        Welcome back,{" "}
                        <strong>
                            {user.name || "Administrator"}
                        </strong>
                    </p>

                </div>

                <button
                    type="button"
                    className="dashboard-refresh-btn"
                    onClick={handleRefresh}
                    disabled={loading || chartLoading}
                >
                    {loading || chartLoading
                        ? "Refreshing..."
                        : "Refresh Dashboard"}
                </button>

            </header>

            {/* =========================================================
                ERROR
            ========================================================== */}

            {error && (
                <div className="dashboard-error">
                    <strong>Dashboard Error</strong>
                    <span>{error}</span>
                </div>
            )}

            {/* =========================================================
                REVENUE
            ========================================================== */}

            {hasPermission("manage_payments") && (
                <section className="dashboard-revenue">
                    <RevenueDashboard />
                </section>
            )}

            {/* =========================================================
                STATISTICS
            ========================================================== */}

            <section className="dashboard-grid">

                {hasPermission("manage_users") && (
                    <div className="dashboard-card">

                        <div className="dashboard-card-content">
                            <span className="dashboard-card-label">
                                Total Users
                            </span>

                            <h2>
                                {loading
                                    ? "..."
                                    : stats.users.toLocaleString()}
                            </h2>

                            <span className="dashboard-card-description">
                                Registered marketplace users
                            </span>
                        </div>

                        <div className="dashboard-card-icon">
                            👥
                        </div>

                    </div>
                )}

                {hasPermission("manage_products") && (
                    <div className="dashboard-card">

                        <div className="dashboard-card-content">
                            <span className="dashboard-card-label">
                                Products
                            </span>

                            <h2>
                                {loading
                                    ? "..."
                                    : stats.products.toLocaleString()}
                            </h2>

                            <span className="dashboard-card-description">
                                Products on the marketplace
                            </span>
                        </div>

                        <div className="dashboard-card-icon">
                            📦
                        </div>

                    </div>
                )}

                {hasPermission("manage_stores") && (
                    <div className="dashboard-card">

                        <div className="dashboard-card-content">
                            <span className="dashboard-card-label">
                                Stores
                            </span>

                            <h2>
                                {loading
                                    ? "..."
                                    : stats.stores.toLocaleString()}
                            </h2>

                            <span className="dashboard-card-description">
                                Marketplace stores
                            </span>
                        </div>

                        <div className="dashboard-card-icon">
                            🏪
                        </div>

                    </div>
                )}

                {hasPermission("manage_products") && (
                    <div className="dashboard-card">

                        <div className="dashboard-card-content">
                            <span className="dashboard-card-label">
                                Pending Products
                            </span>

                            <h2>
                                {loading
                                    ? "..."
                                    : stats.pending.toLocaleString()}
                            </h2>

                            <span className="dashboard-card-description">
                                Awaiting administrator review
                            </span>
                        </div>

                        <div className="dashboard-card-icon">
                            ⏳
                        </div>

                    </div>
                )}

                {hasPermission("manage_reports") && (
                    <div className="dashboard-card">

                        <div className="dashboard-card-content">
                            <span className="dashboard-card-label">
                                Reports
                            </span>

                            <h2>
                                {loading
                                    ? "..."
                                    : stats.reports.toLocaleString()}
                            </h2>

                            <span className="dashboard-card-description">
                                Marketplace reports
                            </span>
                        </div>

                        <div className="dashboard-card-icon">
                            ⚠️
                        </div>

                    </div>
                )}

                {hasPermission("manage_payments") && (
                    <div className="dashboard-card">

                        <div className="dashboard-card-content">
                            <span className="dashboard-card-label">
                                Today's Sales
                            </span>

                            <h2>
                                {loading
                                    ? "..."
                                    : `GH₵ ${stats.salesToday.toLocaleString(
                                          undefined,
                                          {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                          }
                                      )}`}
                            </h2>

                            <span className="dashboard-card-description">
                                Sales recorded today
                            </span>
                        </div>

                        <div className="dashboard-card-icon">
                            💰
                        </div>

                    </div>
                )}

            </section>

            {/* =========================================================
                DASHBOARD CONTENT
            ========================================================== */}

            <section className="dashboard-sections">

                <div className="dashboard-left">

                    <div className="dashboard-section-card">
                        <QuickActions />
                    </div>

                    <div className="dashboard-section-card">
                        <RecentActivity />
                    </div>

                </div>

                <div className="dashboard-right">

                    {hasPermission("manage_payments") && (
                        <div className="dashboard-section-card dashboard-chart-card">

                            <div className="dashboard-section-header">

                                <div>
                                    <span className="dashboard-eyebrow">
                                        FINANCIAL OVERVIEW
                                    </span>

                                    <h2>
                                        Revenue Overview
                                    </h2>
                                </div>

                            </div>

                            {chartError ? (
                                <div className="dashboard-chart-error">
                                    {chartError}
                                </div>
                            ) : chartLoading ? (
                                <div className="dashboard-chart-loading">
                                    Loading revenue chart...
                                </div>
                            ) : (
                                <div className="dashboard-chart-wrapper">
                                    <RevenueChart data={chart} />
                                </div>
                            )}

                        </div>
                    )}

                </div>

            </section>

        </div>
    );
}

export default DashboardHome;
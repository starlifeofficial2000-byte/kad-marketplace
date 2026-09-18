import { useEffect, useState, useRef } from "react";

import api from "../../config/axios";

import RevenueDashboard from "../../components/admin/RevenueDashboard";
import QuickActions from "../../components/admin/QuickActions";
import RecentActivity from "../../components/admin/RecentActivity";
import RevenueChart from "../../components/admin/RevenueChart";

import "./DashboardHome.css";


function DashboardHome() {

    /* =========================================
       USER DATA
    ========================================= */

    const user = JSON.parse(
        localStorage.getItem("user")
    ) || {};


    const permissions = Array.isArray(user.permissions)
        ? user.permissions
        : [];


    const roles = Array.isArray(user.roles)
        ? user.roles
        : [];


    /* =========================================
       STATES
    ========================================= */

    const [chart, setChart] = useState([]);

    const [stats, setStats] = useState({

        users: 0,

        products: 0,

        stores: 0,

        pending: 0,

        reports: 0,

        salesToday: 0

    });


    const [loading, setLoading] = useState(true);

    const [chartLoading, setChartLoading] = useState(true);

    const [error, setError] = useState("");

    const [chartError, setChartError] = useState("");


    /*
        Prevent duplicate API calls in
        React StrictMode development mode
    */

    const hasLoaded = useRef(false);


    /* =========================================
       PERMISSION CHECK
    ========================================= */

    const hasPermission = (...requiredPermissions) => {

        const isSuperAdmin =

            user.role === "admin" ||

            roles.includes("Super Admin") ||

            roles.includes("Administrator");


        if (isSuperAdmin) {

            return true;

        }


        return requiredPermissions.every(

            (permission) =>

                permissions.includes(permission)

        );

    };


    /* =========================================
       LOAD DATA
    ========================================= */

    useEffect(() => {

        if (hasLoaded.current) {

            return;

        }


        hasLoaded.current = true;


        loadDashboard();

        loadChart();

    }, []);


    /* =========================================
       LOAD DASHBOARD STATISTICS
    ========================================= */

    const loadDashboard = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(
                "/admin/stats"
            );


            console.log(
                "ADMIN STATS RESPONSE:",
                response.data
            );


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
                    ) || 0

            });

        }

        catch (error) {

            console.error(
                "LOAD DASHBOARD ERROR:",
                error.response?.data || error.message
            );


            if (error.response?.status === 404) {

                setError(
                    "Dashboard statistics endpoint was not found. Please check the backend admin routes."
                );

            }

            else if (error.response?.status === 401) {

                setError(
                    "Your session has expired. Please log in again."
                );

            }

            else if (error.response?.status === 403) {

                setError(
                    "You do not have permission to access dashboard statistics."
                );

            }

            else {

                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard statistics."
                );

            }


            setStats({

                users: 0,

                products: 0,

                stores: 0,

                pending: 0,

                reports: 0,

                salesToday: 0

            });

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================
       LOAD REVENUE CHART
    ========================================= */

    const loadChart = async () => {

        try {

            setChartLoading(true);

            setChartError("");


            const response = await api.get(
                "/admin/revenue/chart"
            );


            console.log(
                "ADMIN REVENUE CHART RESPONSE:",
                response.data
            );


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

        }

        catch (error) {

            console.error(
                "LOAD REVENUE CHART ERROR:",
                error.response?.data || error.message
            );


            if (error.response?.status === 404) {

                setChartError(
                    "Revenue chart endpoint is not available."
                );

            }

            else {

                setChartError(
                    error.response?.data?.message ||
                    "Unable to load revenue chart."
                );

            }


            setChart([]);

        }

        finally {

            setChartLoading(false);

        }

    };


    /* =========================================
       PAGE
    ========================================= */

    return (

        <div className="dashboard-home">


            <div className="dashboard-header">

                <div>

                    <h1>
                        Marketplace Dashboard
                    </h1>

                    <p>
                        Welcome back {user.name || "Administrator"}
                    </p>

                </div>


                <button

                    className="dashboard-refresh-btn"

                    onClick={() => {

                        loadDashboard();

                        loadChart();

                    }}

                >

                    Refresh

                </button>

            </div>


            {/* =====================================
               ERROR MESSAGE
            ===================================== */}

            {

                error && (

                    <div className="dashboard-error">

                        {error}

                    </div>

                )

            }


            {/* =====================================
               REVENUE DASHBOARD
            ===================================== */}

            {

                hasPermission("manage_payments") &&

                <RevenueDashboard />

            }


            {/* =====================================
               STATISTICS
            ===================================== */}

            <div className="dashboard-grid">


                {

                    hasPermission("manage_users") && (

                        <div className="dashboard-card">

                            <h3>
                                Users
                            </h3>

                            <h1>

                                {

                                    loading

                                        ? "..."

                                        : stats.users

                                }

                            </h1>

                        </div>

                    )

                }


                {

                    hasPermission("manage_products") && (

                        <div className="dashboard-card">

                            <h3>
                                Products
                            </h3>

                            <h1>

                                {

                                    loading

                                        ? "..."

                                        : stats.products

                                }

                            </h1>

                        </div>

                    )

                }


                {

                    hasPermission("manage_stores") && (

                        <div className="dashboard-card">

                            <h3>
                                Stores
                            </h3>

                            <h1>

                                {

                                    loading

                                        ? "..."

                                        : stats.stores

                                }

                            </h1>

                        </div>

                    )

                }


                {

                    hasPermission("manage_products") && (

                        <div className="dashboard-card">

                            <h3>
                                Pending Products
                            </h3>

                            <h1>

                                {

                                    loading

                                        ? "..."

                                        : stats.pending

                                }

                            </h1>

                        </div>

                    )

                }


                {

                    hasPermission("manage_reports") && (

                        <div className="dashboard-card">

                            <h3>
                                Reports
                            </h3>

                            <h1>

                                {

                                    loading

                                        ? "..."

                                        : stats.reports

                                }

                            </h1>

                        </div>

                    )

                }


                {

                    hasPermission("manage_payments") && (

                        <div className="dashboard-card">

                            <h3>
                                Today's Sales
                            </h3>

                            <h1>

                                GH₵ {

                                    loading

                                        ? "..."

                                        : stats.salesToday.toLocaleString()

                                }

                            </h1>

                        </div>

                    )

                }


            </div>


            {/* =====================================
               DASHBOARD SECTIONS
            ===================================== */}

            <div className="dashboard-sections">


                <div className="dashboard-left">

                    <QuickActions />

                    <RecentActivity />

                </div>


                <div className="dashboard-right">


                    {

                        hasPermission("manage_payments") && (

                            <div className="placeholder-card">


                                {

                                    chartError

                                        ? (

                                            <p className="dashboard-error">

                                                {chartError}

                                            </p>

                                        )

                                        : chartLoading

                                            ? (

                                                <p>

                                                    Loading revenue chart...

                                                </p>

                                            )

                                            : (

                                                <RevenueChart

                                                    data={chart}

                                                />

                                            )

                                }


                            </div>

                        )

                    }


                </div>


            </div>


        </div>

    );

}


export default DashboardHome;
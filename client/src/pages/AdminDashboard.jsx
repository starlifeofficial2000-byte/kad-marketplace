import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";

import "./AdminDashboard.css";

import Sidebar from "../components/admin/Sidebar";
import DashboardHome from "../components/admin/DashboardHome";
import ProductsPage from "../components/admin/ProductsPage";
import UsersPage from "../components/admin/UsersPage";
import ReviewsPage from "../components/admin/ReviewsPage";
import MessagesPage from "../components/admin/MessagesPage";
import ReportsPage from "../components/admin/ReportsPage";
import SettingsPage from "../components/admin/SettingsPage";

import AnalyticsPage from "../components/admin/AnalyticsPage";
import PaymentsPage from "../components/admin/PaymentsPage";
import StoresPage from "../components/admin/StoresPage";
import SubscriptionsPage from "../components/admin/SubscriptionsPage";
import AdvertisementsPage from "../components/admin/AdvertisementsPage";
import SecurityCenter from "../components/admin/SecurityCenter";
import RolesPage from "../components/admin/RolesPage";

function AdminDashboard() {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const user = JSON.parse(localStorage.getItem("user"));

    const [page, setPage] = useState("dashboard");

    const [products, setProducts] = useState([]);

    const [search, setSearch] = useState("");

    const [stats, setStats] = useState({

        totalProducts: 0,

        pending: 0,

        approved: 0,

        rejected: 0,

        totalUsers: 0,

        totalReviews: 0,

        totalMessages: 0

    });

    useEffect(() => {

        if (!token || !user) {

            navigate("/login");

            return;

        }

        if (user.role !== "admin") {

            alert("Access Denied");

            navigate("/");

            return;

        }

        fetchDashboard();

    }, []);

    const fetchDashboard = async () => {

        fetchStats();

        fetchPendingProducts();

    };

    const fetchStats = async () => {

        try {

         const response = await api.get(
    "/settings"
);
            setStats(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    const fetchPendingProducts = async () => {

        try {

            const response = await axios.get(

                "/api/admin/pending",

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            setProducts(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    const approveProduct = async (id) => {

        try {

            await axios.put(

                `/api/admin/approve/${id}`,

                {},

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            fetchDashboard();

        }

        catch (error) {

            console.log(error);

        }

    };

    const rejectProduct = async (id) => {

        const reason = prompt("Reason for rejection");

        if (!reason) return;

        try {

            await axios.put(

                `/api/admin/reject/${id}`,

                {

                    reason

                },

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            fetchDashboard();

        }

        catch (error) {

            console.log(error);

        }

    };

    const filteredProducts = products.filter(product =>

        product.title.toLowerCase().includes(search.toLowerCase())

    );
        return (

        <div className="admin-layout">

            <Sidebar

                page={page}

                setPage={setPage}

                navigate={navigate}

            />

            <main className="admin-main">

                {

                    page === "dashboard" &&

                    <DashboardHome

                        stats={stats}

                        search={search}

                        setSearch={setSearch}

                        filteredProducts={filteredProducts}

                        approveProduct={approveProduct}

                        rejectProduct={rejectProduct}

                    />

                }

                {

                    page === "products" &&

                    <ProductsPage />

                }

                {

                    page === "users" &&

                    <UsersPage />

                }

                {

                    page === "reviews" &&

                    <ReviewsPage />

                }

                {

                    page === "messages" &&

                    <MessagesPage />

                }

                {

                    page === "reports" &&

                    <ReportsPage />

                }
               {
                    page === "stores" &&
                     <StoresPage />
                  }
{
    page === "roles" &&

    <RolesPage />
}
{
    page === "subscriptions" &&
    <SubscriptionsPage />
}

{
    page === "payments" &&
    <PaymentsPage />
}

{
    page === "analytics" &&
    <AnalyticsPage />
}

{
    page === "advertisements" &&
    <AdvertisementsPage />
}

{
    page === "security" &&

    <SecurityCenter />

}
                {

                    page === "settings" &&

                    <SettingsPage />

                }

            </main>

        </div>

    );

}

export default AdminDashboard;
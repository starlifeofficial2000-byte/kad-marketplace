```jsx
import {
    useEffect,
    useMemo
} from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

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


function getStoredUser() {

    try {

        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {
            return null;
        }

        return JSON.parse(storedUser);

    } catch (error) {

        console.error(
            "Invalid admin user data:",
            error
        );

        localStorage.removeItem("user");

        return null;
    }
}


function AdminDashboard() {

    const navigate = useNavigate();

    const location = useLocation();

    const token =
        localStorage.getItem("token");

    const user =
        getStoredUser();


    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    useEffect(() => {

        if (!token || !user) {

            navigate(
                "/login",
                {
                    replace: true
                }
            );

            return;
        }


        const isAdmin =
            user.role === "admin" ||
            user.roles?.includes("Admin") ||
            user.roles?.includes("Super Admin") ||
            user.roles?.includes("Administrator");


        if (!isAdmin) {

            alert("Access Denied");

            navigate(
                "/",
                {
                    replace: true
                }
            );

        }

    }, [
        token,
        user,
        navigate
    ]);


    /* =====================================================
       DETERMINE CURRENT ADMIN PAGE
    ===================================================== */

    const page = useMemo(() => {

        const path =
            location.pathname
                .replace(/\/+$/, "");


        switch (path) {

            case "/admin":
            case "/admin/dashboard":

                return "dashboard";


            case "/admin/products":

                return "products";


            case "/admin/users":

                return "users";


            case "/admin/reviews":

                return "reviews";


            case "/admin/messages":
            case "/admin/contact-messages":

                return "messages";


            case "/admin/reports":

                return "reports";


            case "/admin/stores":

                return "stores";


            case "/admin/roles":

                return "roles";


            case "/admin/subscriptions":

                return "subscriptions";


            case "/admin/payments":

                return "payments";


            case "/admin/analytics":

                return "analytics";


            case "/admin/advertisements":

                return "advertisements";


            case "/admin/security":

                return "security";


            case "/admin/settings":

                return "settings";


            default:

                return "dashboard";

        }

    }, [
        location.pathname
    ]);


    /* =====================================================
       PAGE RENDER
    ===================================================== */

    const renderPage = () => {

        switch (page) {

            case "products":

                return <ProductsPage />;


            case "users":

                return <UsersPage />;


            case "reviews":

                return <ReviewsPage />;


            case "messages":

                return <MessagesPage />;


            case "reports":

                return <ReportsPage />;


            case "stores":

                return <StoresPage />;


            case "roles":

                return <RolesPage />;


            case "subscriptions":

                return (
                    <SubscriptionsPage />
                );


            case "payments":

                return <PaymentsPage />;


            case "analytics":

                return <AnalyticsPage />;


            case "advertisements":

                return (
                    <AdvertisementsPage />
                );


            case "security":

                return <SecurityCenter />;


            case "settings":

                return <SettingsPage />;


            case "dashboard":

            default:

                return (
                    <DashboardHome />
                );

        }

    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="admin-layout">

            <Sidebar />

            <main className="admin-main">

                <div className="admin-page-content">

                    {renderPage()}

                </div>

            </main>

        </div>

    );

}


export default AdminDashboard;
```

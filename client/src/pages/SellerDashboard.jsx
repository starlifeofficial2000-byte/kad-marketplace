import { useState } from "react";
import {
    FaHome,
    FaBoxOpen,
    FaPlusCircle,
    FaStore,
    FaCrown,
    FaChartLine,
    FaComments,
    FaBell,
    FaUser,
    FaCog,
    FaClipboardList,
    FaBullhorn,
    FaQuestionCircle,
    FaSignOutAlt
} from "react-icons/fa";

import Dashboard from "./Dashboard";
import MyProducts from "./MyProducts";
import Sell from "./Sell";
import Inbox from "./Inbox";
import Notifications from "./Notifications";
import Profile from "./Profile";
import MyStore from "./MyStore";
import Subscription from "./Subscription";

import Promotions from "./Promotions";

import HelpCenter from "./HelpCenter";
import Settings from "./Settings";
import SellerLeads from "./SellerLeads";

import SellerAnalytics from "./SellerAnalytics";
import "./SellerDashboard.css";

function SellerDashboard() {

    const [page, setPage] = useState("overview");

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";

    };

    return (

        <div className="seller-dashboard">

            <aside className="seller-sidebar">

                <h2>KAD Marketplace</h2>

                <button onClick={() => setPage("overview")}>

                    <FaHome />

                    Dashboard

                </button>

                <button onClick={() => setPage("products")}>

                    <FaBoxOpen />

                    My Products

                </button>

                <button onClick={() => setPage("sell")}>

                    <FaPlusCircle />

                    Sell Product

                </button>

                <button onClick={() => setPage("store")}>

                    <FaStore />

                    My Store

                </button>

                <button onClick={() => setPage("subscription")}>

                    <FaCrown />

                    Subscription

                </button>

                <button onClick={() => setPage("analytics")}>

                    <FaChartLine />

                    Analytics

                </button>

                <button onClick={() => setPage("messages")}>

                    <FaComments />

                    Messages

                </button>

                <button onClick={() => setPage("notifications")}>

                    <FaBell />

                    Notifications

                </button>

               <button onClick={() => setPage("leads")}>

    <FaClipboardList />

    Leads

</button>

                <button onClick={() => setPage("promotion")}>

                    <FaBullhorn />

                    Promotions

                </button>

            

                <button onClick={() => setPage("profile")}>

                    <FaUser />

                    Profile

                </button>

                <button onClick={() => setPage("support")}>

                    <FaQuestionCircle />

                    Help Center

                </button>

                <button onClick={() => setPage("settings")}>

                    <FaCog />

                    Settings

                </button>

                <button

                    className="logout"

                    onClick={logout}

                >

                    <FaSignOutAlt />

                    Logout

                </button>

            </aside>

            <main className="seller-content">

             {page === "overview" && <Dashboard />}

{page === "products" && <MyProducts />}

{page === "sell" && <Sell />}

{page === "store" && <MyStore />}

{page === "subscription" && <Subscription />}

{page === "analytics" && <SellerAnalytics />}

{page === "messages" && <Inbox />}

{page === "notifications" && <Notifications />}

{page === "profile" && <Profile />}

{page === "leads" && <SellerLeads />}

{page === "promotion" && <Promotions />}

{page === "support" && <HelpCenter />}

{page === "settings" && <Settings />}
            </main>

        </div>

    );

}

export default SellerDashboard;
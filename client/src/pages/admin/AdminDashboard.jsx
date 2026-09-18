import { useEffect, useState } from "react";
import api from "../../config/axios";
import {
    FaUsers,
    FaBoxOpen,
    FaStore,
    FaMoneyBillWave,
    FaCrown,
    FaBullhorn,
    FaChartLine,
    FaClipboardList
} from "react-icons/fa";

import "./AdminDashboard.css";

function AdminDashboard() {

    const token = localStorage.getItem("token");

    const [stats, setStats] = useState({

        users: 0,

        products: 0,

        stores: 0,

        subscriptions: 0,

        advertisements: 0,

        revenue: 0,

        pendingProducts: 0,

        pendingStores: 0

    });

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            const response = await api.get(
    "/settings"
);
            setStats(res.data);

        }

        catch(error){

            console.log(error);

        }

    };

    return (

        <div className="admin-dashboard">

            <h1>Marketplace Dashboard</h1>

            <div className="dashboard-grid">

                <div className="card">

                    <FaUsers/>

                    <h2>{stats.users}</h2>

                    <p>Total Users</p>

                </div>

                <div className="card">

                    <FaBoxOpen/>

                    <h2>{stats.products}</h2>

                    <p>Total Products</p>

                </div>

                <div className="card">

                    <FaStore/>

                    <h2>{stats.stores}</h2>

                    <p>Stores</p>

                </div>

                <div className="card">

                    <FaMoneyBillWave/>

                    <h2>GH₵ {stats.revenue}</h2>

                    <p>Revenue</p>

                </div>

                <div className="card">

                    <FaCrown/>

                    <h2>{stats.subscriptions}</h2>

                    <p>Subscriptions</p>

                </div>

                <div className="card">

                    <FaBullhorn/>

                    <h2>{stats.advertisements}</h2>

                    <p>Advertisements</p>

                </div>

                <div className="card warning">

                    <FaClipboardList/>

                    <h2>{stats.pendingProducts}</h2>

                    <p>Pending Products</p>

                </div>

                <div className="card warning">

                    <FaChartLine/>

                    <h2>{stats.pendingStores}</h2>

                    <p>Pending Stores</p>

                </div>

            </div>

        </div>

    );

}

export default AdminDashboard;
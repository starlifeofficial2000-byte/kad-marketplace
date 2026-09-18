import { Navigate, Outlet } from "react-router-dom";

import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";

import "./AdminLayout.css";

function AdminLayout() {

    const token = localStorage.getItem("token");

    let user = null;

    try {

        user = JSON.parse(

            localStorage.getItem("user")

        );

    }

    catch (error) {

        console.error(

            "Invalid user data:",

            error

        );

    }

    /* ==========================================
       CHECK LOGIN
    ========================================== */

    if (!token || !user) {

        return (

            <Navigate

                to="/login"

                replace

            />

        );

    }

    /* ==========================================
       USER PERMISSIONS
    ========================================== */

    const permissions = Array.isArray(user.permissions)

        ? user.permissions

        : [];

    /* ==========================================
       ADMIN PANEL ACCESS
    ========================================== */

    const canAccessAdmin =

        permissions.length > 0;

    if (!canAccessAdmin) {

        return (

            <Navigate

                to="/"

                replace

            />

        );

    }

    /* ==========================================
       ADMIN LAYOUT
    ========================================== */

    return (

        <div className="admin-layout">

            <Sidebar />

            <div className="admin-main">

                <Header />

                <div className="admin-content">

                    <Outlet />

                </div>

            </div>

        </div>

    );

}

export default AdminLayout;
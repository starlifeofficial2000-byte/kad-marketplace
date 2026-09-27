import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

import {
    FaChartPie,
    FaUsers,
    FaBoxOpen,
    FaStore,
    FaCrown,
    FaBullhorn,
    FaMoneyBillWave,
    FaLifeRing,
    FaCog,
    FaHome,
    FaEnvelope,
    FaShieldAlt,
    FaUserShield,
    FaKey,
    FaClipboardList,
    FaHistory,
    FaTimes
} from "react-icons/fa";

import "./Sidebar.css";

function Sidebar({
    isOpen = true,
    onClose
}) {

    const navigate = useNavigate();

    const sidebarRef = useRef(null);

    const user =
        JSON.parse(
            localStorage.getItem("user") || "{}"
        );

    const permissions =
        user.permissions || [];

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = (...required) => {

        if (
            user.roles?.includes("Super Admin")
        ) {
            return true;
        }

        return required.every(
            permission =>
                permissions.includes(permission)
        );
    };


    /* =====================================================
       CLOSE SIDEBAR WHEN CLICKING OUTSIDE
    ===================================================== */

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                window.innerWidth <= 768 &&
                sidebarRef.current &&
                !sidebarRef.current.contains(
                    event.target
                )
            ) {

                if (onClose) {
                    onClose();
                }

            }

        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, [onClose]);


    /* =====================================================
       CLOSE SIDEBAR WITH ESC
    ===================================================== */

    useEffect(() => {

        const handleEscape = (event) => {

            if (
                event.key === "Escape" &&
                window.innerWidth <= 768
            ) {

                if (onClose) {
                    onClose();
                }

            }

        };

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, [onClose]);


    /* =====================================================
       MENU ITEMS
    ===================================================== */

    const menus = [

        {
            title: "Dashboard",
            icon: <FaChartPie />,
            link: "/admin/dashboard",
            show: true
        },

        {
            title: "Users",
            icon: <FaUsers />,
            link: "/admin/users",
            show: hasPermission(
                "manage_users"
            )
        },

        {
            title: "Roles",
            icon: <FaUserShield />,
            link: "/admin/roles",
            show: hasPermission(
                "manage_roles"
            )
        },

        {
            title: "Permissions",
            icon: <FaKey />,
            link: "/admin/permissions",
            show: hasPermission(
                "manage_permissions"
            )
        },

        {
            title: "Products",
            icon: <FaBoxOpen />,
            link: "/admin/products",
            show: hasPermission(
                "manage_products"
            )
        },

        {
            title: "Stores",
            icon: <FaStore />,
            link: "/admin/stores",
            show: hasPermission(
                "manage_stores"
            )
        },

        {
            title: "Subscriptions",
            icon: <FaCrown />,
            link: "/admin/subscriptions",
            show: hasPermission(
                "manage_subscriptions"
            )
        },

        {
            title: "Homepage",
            icon: <FaHome />,
            link: "/admin/homepage",
            show: hasPermission(
                "manage_homepage"
            )
        },

        {
            title: "Advertisements",
            icon: <FaBullhorn />,
            link: "/admin/advertisements",
            show: hasPermission(
                "manage_advertisements"
            )
        },

        {
            title: "Payments",
            icon: <FaMoneyBillWave />,
            link: "/admin/payments",
            show: hasPermission(
                "manage_payments"
            )
        },

        {
            title: "Messages",
            icon: <FaEnvelope />,
            link: "/admin/contact-messages",
            show: hasPermission(
                "manage_messages"
            )
        },

        {
            title: "Audit Logs",
            icon: <FaClipboardList />,
            link: "/admin/audit-logs",
            show: hasPermission(
                "view_audit_logs"
            )
        },

        {
            title: "Login History",
            icon: <FaHistory />,
            link: "/admin/login-history",
            show: hasPermission(
                "view_login_history"
            )
        },

        {
            title: "Security",
            icon: <FaShieldAlt />,
            link: "/admin/security",
            show: hasPermission(
                "manage_security"
            )
        },

        {
            title: "Support",
            icon: <FaLifeRing />,
            link: "/admin/support",
            show: true
        },

        {
            title: "Settings",
            icon: <FaCog />,
            link: "/admin/settings",
            show: hasPermission(
                "manage_settings"
            )
        }

    ];


    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

    };


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const handleNavigation = () => {

        if (
            window.innerWidth <= 768 &&
            onClose
        ) {

            onClose();

        }

    };


    return (

        <>

            {/* MOBILE OVERLAY */}

            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}


            {/* SIDEBAR */}

            <aside
                ref={sidebarRef}
                className={
                    isOpen
                        ? "sidebar"
                        : "sidebar hidden"
                }
            >

                {/* =================================================
                    MOBILE CLOSE BUTTON
                ================================================= */}

                <div className="sidebar-top">

                    <div className="sidebar-logo">
                        KAD ADMIN
                    </div>

                    <button
                        type="button"
                        className="sidebar-close-button"
                        onClick={onClose}
                        aria-label="Close admin menu"
                    >
                        <FaTimes />
                    </button>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <nav className="sidebar-menu">

                    {menus
                        .filter(menu => menu.show)
                        .map(menu => (

                            <NavLink
                                key={menu.link}
                                to={menu.link}
                                onClick={
                                    handleNavigation
                                }
                                className={({ isActive }) =>
                                    isActive
                                        ? "sidebar-link active"
                                        : "sidebar-link"
                                }
                            >

                                <span className="sidebar-link-icon">
                                    {menu.icon}
                                </span>

                                <span className="sidebar-link-text">
                                    {menu.title}
                                </span>

                            </NavLink>

                        ))}

                </nav>


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <div className="sidebar-footer">

                    <button
                        type="button"
                        className="logout-btn"
                        onClick={handleLogout}
                    >

                        <FaSignOutAlt />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>

        </>

    );

}

export default Sidebar;
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

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
    FaSignOutAlt,
    FaBars,
    FaUserShield,
    FaKey,
    FaClipboardList,
    FaHistory
} from "react-icons/fa";

import "./Sidebar.css";

function Sidebar() {

    const navigate = useNavigate();

    const location = useLocation();

    const sidebarRef = useRef(null);

    const [hidden, setHidden] = useState(false);

    const user = JSON.parse(

        localStorage.getItem("user")

    ) || {};

    const permissions = user.permissions || [];

    const hasPermission = (...required) => {

        if (

            user.roles?.includes("Super Admin")

        ) {

            return true;

        }

        return required.every(permission =>

            permissions.includes(permission)

        );

    };

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (

                sidebarRef.current &&

                !sidebarRef.current.contains(event.target)

            ) {

                setHidden(true);

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

    }, []);

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

            show: hasPermission("manage_users")

        },

        {

            title: "Roles",

            icon: <FaUserShield />,

            link: "/admin/roles",

            show: hasPermission("manage_roles")

        },

        {

            title: "Permissions",

            icon: <FaKey />,

            link: "/admin/permissions",

            show: hasPermission("manage_permissions")

        },

        {

            title: "Products",

            icon: <FaBoxOpen />,

            link: "/admin/products",

            show: hasPermission("manage_products")

        },

        {

            title: "Stores",

            icon: <FaStore />,

            link: "/admin/stores",

            show: hasPermission("manage_stores")

        },

        {

            title: "Subscriptions",

            icon: <FaCrown />,

            link: "/admin/subscriptions",

            show: hasPermission("manage_subscriptions")

        },

        {

            title: "Homepage",

            icon: <FaHome />,

            link: "/admin/homepage",

            show: hasPermission("manage_homepage")

        },

        {

            title: "Advertisements",

            icon: <FaBullhorn />,

            link: "/admin/advertisements",

            show: hasPermission("manage_advertisements")

        },

        {

            title: "Payments",

            icon: <FaMoneyBillWave />,

            link: "/admin/payments",

            show: hasPermission("manage_payments")

        },

        {

            title: "Messages",

            icon: <FaEnvelope />,

            link: "/admin/contact-messages",

            show: hasPermission("manage_messages")

        },

        {

            title: "Audit Logs",

            icon: <FaClipboardList />,

            link: "/admin/audit-logs",

            show: hasPermission("view_audit_logs")

        },

        {

            title: "Login History",

            icon: <FaHistory />,

            link: "/admin/login-history",

            show: hasPermission("view_login_history")

        },

        {

            title: "Security",

            icon: <FaShieldAlt />,

            link: "/admin/security",

            show: hasPermission("manage_security")

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

            show: hasPermission("manage_settings")

        }

    ];

    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/login");

    };

    return (

        <>

            {

                location.pathname.startsWith("/admin") &&

                <button

                    className="menu-btn"

                    onClick={() => setHidden(false)}

                >

                    <FaBars />

                </button>

            }

            <aside

                ref={sidebarRef}

                className={

                    hidden

                    ?

                    "sidebar hidden"

                    :

                    "sidebar"

                }

            >

                <div className="sidebar-logo">

                    KAD ADMIN

                </div>

                <div className="sidebar-menu">

                    {

                        menus

                        .filter(menu => menu.show)

                        .map(menu => (

                            <NavLink

                                key={menu.link}

                                to={menu.link}

                                className={({ isActive }) =>

                                    isActive

                                    ?

                                    "sidebar-link active"

                                    :

                                    "sidebar-link"

                                }

                            >

                                {menu.icon}

                                <span>

                                    {menu.title}

                                </span>

                            </NavLink>

                        ))

                    }

                </div>

                <button

                    className="logout-btn"

                    onClick={handleLogout}

                >

                    <FaSignOutAlt />

                    <span>

                        Logout

                    </span>

                </button>

            </aside>

        </>

    );

}

export default Sidebar;
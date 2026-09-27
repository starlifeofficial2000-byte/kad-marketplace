import {
    NavLink,
    useNavigate,
    useLocation
} from "react-router-dom";

import {
    useState,
    useEffect
} from "react";

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
    FaTimes,
    FaUserShield,
    FaKey,
    FaClipboardList,
    FaHistory
} from "react-icons/fa";

import "./Sidebar.css";


function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    const [isMobile, setIsMobile] = useState(
        window.innerWidth <= 768
    );

    const [isOpen, setIsOpen] = useState(
        window.innerWidth > 768
    );


    /* =====================================================
       USER
    ===================================================== */

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const permissions =
        user.permissions || [];


    /* =====================================================
       PERMISSIONS
    ===================================================== */

    const hasPermission = (...required) => {

        if (
            user.roles?.includes("Super Admin") ||
            user.role === "super_admin" ||
            user.role === "Super Admin"
        ) {
            return true;
        }

        return required.every(
            permission =>
                permissions.includes(permission)
        );
    };


    /* =====================================================
       RESPONSIVE SCREEN CHECK
    ===================================================== */

    useEffect(() => {

        const handleResize = () => {

            const mobile =
                window.innerWidth <= 768;

            setIsMobile(mobile);

            if (!mobile) {

                setIsOpen(true);

            } else {

                setIsOpen(false);

            }

        };


        window.addEventListener(
            "resize",
            handleResize
        );


        return () => {

            window.removeEventListener(
                "resize",
                handleResize
            );

        };

    }, []);


    /* =====================================================
       CLOSE MOBILE MENU
    ===================================================== */

    const closeMobileMenu = () => {

        if (isMobile) {

            setIsOpen(false);

        }

    };


    /* =====================================================
       BODY SCROLL LOCK
    ===================================================== */

    useEffect(() => {

        if (
            isMobile &&
            isOpen
        ) {

            document.body.style.overflow =
                "hidden";

        } else {

            document.body.style.overflow =
                "";

        }


        return () => {

            document.body.style.overflow =
                "";

        };

    }, [
        isMobile,
        isOpen
    ]);


    /* =====================================================
       MENU
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


    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

    };


    /* =====================================================
       OPEN / CLOSE BUTTON
    ===================================================== */

    const toggleSidebar = () => {

        setIsOpen(
            previous => !previous
        );

    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <>

            {/* MOBILE MENU BUTTON */}

            {isMobile && !isOpen && (

                <button
                    type="button"
                    className="menu-btn"
                    onClick={toggleSidebar}
                    aria-label="Open admin menu"
                    aria-expanded={false}
                >
                    <FaBars />
                </button>

            )}


            {/* MOBILE BACKDROP */}

            {isMobile && isOpen && (

                <div
                    className="sidebar-overlay"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />

            )}


            {/* SIDEBAR */}

            <aside
                className={`sidebar ${
                    isOpen
                        ? "open"
                        : "hidden"
                }`}
            >

                {/* SIDEBAR HEADER */}

                <div className="sidebar-top">

                    <div className="sidebar-logo">

                        KAD ADMIN

                    </div>


                    {isMobile && (

                        <button
                            type="button"
                            className="sidebar-close-button"
                            onClick={
                                closeMobileMenu
                            }
                            aria-label="Close admin menu"
                        >

                            <FaTimes />

                        </button>

                    )}

                </div>


                {/* MENU */}

                <nav className="sidebar-menu">

                    {menus
                        .filter(
                            menu => menu.show
                        )
                        .map(menu => (

                            <NavLink
                                key={menu.link}
                                to={menu.link}
                                onClick={
                                    closeMobileMenu
                                }
                                className={({
                                    isActive
                                }) =>
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


                {/* FOOTER */}

                <div className="sidebar-footer">

                    <button
                        type="button"
                        className="logout-btn"
                        onClick={handleLogout}
                    >

                        <span className="sidebar-link-icon">

                            <FaSignOutAlt />

                        </span>

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
import {
    Link,
    NavLink,
    useNavigate,
    useLocation
} from "react-router-dom";

import {
    useState,
    useEffect,
    useRef,
    useMemo
} from "react";

import {
    FaBars,
    FaTimes,
    FaBell,
    FaPlusCircle,
    FaUser,
    FaChevronDown,
    FaTachometerAlt,
    FaHeadset,
    FaTicketAlt,
    FaSignOutAlt,
    FaUserCircle
} from "react-icons/fa";

import "./Navbar.css";

import logo from "../assets/KADMARKETPLACE.png";

import getImageUrl from "../utils/imageUrl";


function Navbar() {

    const navigate = useNavigate();

    const location = useLocation();

    const dropdownRef = useRef(null);

    const [menuOpen, setMenuOpen] =
        useState(false);

    const [showProfileMenu, setShowProfileMenu] =
        useState(false);

    const [user, setUser] =
        useState(null);


    /*
     * =========================================================
     * LOAD USER SAFELY
     * =========================================================
     */

    useEffect(() => {

        const loadUser = () => {

            try {

                const storedUser =
                    localStorage.getItem("user");

                if (!storedUser) {

                    setUser(null);

                    return;
                }

                const parsedUser =
                    JSON.parse(storedUser);

                setUser(parsedUser);

            } catch (error) {

                console.error(
                    "NAVBAR USER PARSE ERROR:",
                    error
                );

                setUser(null);

            }

        };

        loadUser();

        /*
         * Listen for login/logout changes.
         */

        window.addEventListener(
            "storage",
            loadUser
        );

        window.addEventListener(
            "userUpdated",
            loadUser
        );

        return () => {

            window.removeEventListener(
                "storage",
                loadUser
            );

            window.removeEventListener(
                "userUpdated",
                loadUser
            );

        };

    }, []);


    /*
     * =========================================================
     * PROFILE IMAGE
     * =========================================================
     */

    const profileImage = useMemo(() => {

        if (!user) {
            return null;
        }

        /*
         * Support the different possible backend
         * profile image fields.
         */

        const image =
            user.profileImage ||
            user.profileImageUrl ||
            user.avatar ||
            user.photo ||
            null;

        if (image) {

            return getImageUrl(image);

        }

        /*
         * UI Avatars fallback.
         */

        const name =
            user.name ||
            user.username ||
            "KAD User";

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
        )}&background=111827&color=ffffff&bold=true`;
        
    }, [user]);


    /*
     * =========================================================
     * PROFILE IMAGE ERROR
     * =========================================================
     */

    const handleProfileImageError = (
        event
    ) => {

        const image =
            event.currentTarget;

        if (
            image.dataset.fallbackApplied ===
            "true"
        ) {

            return;

        }

        image.dataset.fallbackApplied =
            "true";

        const name =
            user?.name ||
            user?.username ||
            "KAD User";

        image.src =
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                name
            )}&background=111827&color=ffffff&bold=true`;

    };


    /*
     * =========================================================
     * LOGOUT
     * =========================================================
     */

    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setUser(null);

        setMenuOpen(false);

        setShowProfileMenu(false);

        window.dispatchEvent(
            new Event("userUpdated")
        );

        navigate("/login");

    };


    /*
     * =========================================================
     * CLOSE DROPDOWN WHEN CLICKING OUTSIDE
     * =========================================================
     */

    useEffect(() => {

        const handleClickOutside = (
            event
        ) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target
                )
            ) {

                setShowProfileMenu(false);

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


    /*
     * =========================================================
     * CLOSE MENUS WHEN ROUTE CHANGES
     * =========================================================
     */

    useEffect(() => {

        setMenuOpen(false);

        setShowProfileMenu(false);

    }, [location.pathname]);


    /*
     * =========================================================
     * CLOSE MOBILE MENU
     * =========================================================
     */

    const closeMobileMenu = () => {

        setMenuOpen(false);

    };


    /*
     * =========================================================
     * ACTIVE NAV CLASS
     * =========================================================
     */

    const navClass = ({ isActive }) =>
        isActive
            ? "nav-link active"
            : "nav-link";


    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (

        <header className="navbar">

            <div className="navbar-inner">

                {/* =================================================
                    LOGO
                ================================================= */}

                <div className="navbar-brand">

                    <Link
                        to="/"
                        className="brand-link"
                        onClick={
                            closeMobileMenu
                        }
                    >

                        <img
                            src={logo}
                            alt="KAD Marketplace"
                            className="navbar-logo"
                        />

                        <div className="brand-text">

                            <span className="brand-name">
                                KAD Marketplace
                            </span>

                            <span className="brand-tagline">
                                Buy • Sell • Connect
                            </span>

                        </div>

                    </Link>

                </div>


                {/* =================================================
                    DESKTOP / MOBILE NAVIGATION
                ================================================= */}

                <div
                    className={
                        menuOpen
                            ? "nav-links active"
                            : "nav-links"
                    }
                >

                    <div className="mobile-menu-header">

                        <span>
                            Menu
                        </span>

                        <button
                            type="button"
                            onClick={
                                closeMobileMenu
                            }
                            aria-label="Close menu"
                        >
                            <FaTimes />
                        </button>

                    </div>


                    {/* SELL */}

                    <NavLink
                        to="/sell"
                        className="sell-btn"
                        onClick={
                            closeMobileMenu
                        }
                    >

                        <FaPlusCircle />

                        <span>
                            Sell Item
                        </span>

                    </NavLink>


                    {/* DASHBOARD */}

                    <NavLink
                        to="/dashboard"
                        className={
                            navClass
                        }
                        onClick={
                            closeMobileMenu
                        }
                    >

                        <FaTachometerAlt />

                        <span>
                            Dashboard
                        </span>

                    </NavLink>


                    {/* SUPPORT */}

                    {user && (

                        <NavLink
                            to="/support"
                            className={
                                navClass
                            }
                            onClick={
                                closeMobileMenu
                            }
                        >

                            <FaHeadset />

                            <span>
                                Support
                            </span>

                        </NavLink>

                    )}


                    {/* MY TICKETS */}

                    {user && (

                        <NavLink
                            to="/my-tickets"
                            className={
                                navClass
                            }
                            onClick={
                                closeMobileMenu
                            }
                        >

                            <FaTicketAlt />

                            <span>
                                My Tickets
                            </span>

                        </NavLink>

                    )}


                    {/* GUEST LOGIN */}

                    {!user && (

                        <NavLink
                            to="/login"
                            className={
                                navClass
                            }
                            onClick={
                                closeMobileMenu
                            }
                        >

                            <FaUser />

                            <span>
                                Login
                            </span>

                        </NavLink>

                    )}


                    {/* ADMIN */}

                    {user?.role === "admin" && (

                        <NavLink
                            to="/admin"
                            className={
                                navClass
                            }
                            onClick={
                                closeMobileMenu
                            }
                        >

                            <span>
                                Admin
                            </span>

                        </NavLink>

                    )}

                </div>


                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <div className="navbar-actions">

                    {user ? (

                        <>

                            {/* NOTIFICATIONS */}

                            <Link
                                to="/notifications"
                                className="notification-btn"
                                aria-label="Notifications"
                                title="Notifications"
                            >

                                <FaBell />

                                <span className="notification-dot" />

                            </Link>


                            {/* PROFILE */}

                            <div
                                className="profile-dropdown"
                                ref={
                                    dropdownRef
                                }
                            >

                                <button
                                    type="button"
                                    className={
                                        showProfileMenu
                                            ? "profile-trigger open"
                                            : "profile-trigger"
                                    }
                                    onClick={() =>
                                        setShowProfileMenu(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-expanded={
                                        showProfileMenu
                                    }
                                    aria-label="Open profile menu"
                                >

                                    <span className="profile-avatar-wrapper">

                                        <img
                                            src={
                                                profileImage
                                            }
                                            alt={
                                                user.name ||
                                                "Profile"
                                            }
                                            className="profile-avatar"
                                            onError={
                                                handleProfileImageError
                                            }
                                        />

                                        <span className="online-indicator" />

                                    </span>


                                    <span className="profile-name">

                                        {
                                            user.name ||
                                            user.username ||
                                            "User"
                                        }

                                    </span>


                                    <FaChevronDown
                                        className="profile-chevron"
                                    />

                                </button>


                                {/* PROFILE DROPDOWN */}

                                {showProfileMenu && (

                                    <div className="profile-menu">

                                        {/* HEADER */}

                                        <div className="profile-menu-header">

                                            <div className="profile-menu-avatar">

                                                <img
                                                    src={
                                                        profileImage
                                                    }
                                                    alt=""
                                                    onError={
                                                        handleProfileImageError
                                                    }
                                                />

                                            </div>

                                            <div className="profile-menu-user">

                                                <strong>
                                                    {
                                                        user.name ||
                                                        user.username ||
                                                        "KAD User"
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        user.email ||
                                                        "Marketplace User"
                                                    }
                                                </span>

                                                {user.role && (

                                                    <small>
                                                        {user.role ===
                                                        "admin"
                                                            ? "Administrator"
                                                            : "Marketplace Member"}
                                                    </small>

                                                )}

                                            </div>

                                        </div>


                                        {/* LINKS */}

                                        <div className="profile-menu-links">

                                            <Link
                                                to="/profile"
                                                onClick={
                                                    () =>
                                                        setShowProfileMenu(
                                                            false
                                                        )
                                                }
                                            >

                                                <FaUserCircle />

                                                <span>
                                                    My Profile
                                                </span>

                                            </Link>


                                            <Link
                                                to="/dashboard"
                                                onClick={
                                                    () =>
                                                        setShowProfileMenu(
                                                            false
                                                        )
                                                }
                                            >

                                                <FaTachometerAlt />

                                                <span>
                                                    Dashboard
                                                </span>

                                            </Link>


                                            <Link
                                                to="/support"
                                                onClick={
                                                    () =>
                                                        setShowProfileMenu(
                                                            false
                                                        )
                                                }
                                            >

                                                <FaHeadset />

                                                <span>
                                                    Contact Support
                                                </span>

                                            </Link>


                                            <Link
                                                to="/my-tickets"
                                                onClick={
                                                    () =>
                                                        setShowProfileMenu(
                                                            false
                                                        )
                                                }
                                            >

                                                <FaTicketAlt />

                                                <span>
                                                    My Tickets
                                                </span>

                                            </Link>


                                            <Link
                                                to="/notifications"
                                                onClick={
                                                    () =>
                                                        setShowProfileMenu(
                                                            false
                                                        )
                                                }
                                            >

                                                <FaBell />

                                                <span>
                                                    Notifications
                                                </span>

                                            </Link>

                                        </div>


                                        {/* LOGOUT */}

                                        <div className="profile-menu-footer">

                                            <button
                                                type="button"
                                                onClick={
                                                    logout
                                                }
                                            >

                                                <FaSignOutAlt />

                                                <span>
                                                    Logout
                                                </span>

                                            </button>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </>

                    ) : (

                        /* =================================================
                           GUEST ACTIONS
                        ================================================= */

                        <div className="guest-actions">

                            <Link
                                to="/login"
                                className="login-link"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="register-btn"
                            >
                                Register
                            </Link>

                        </div>

                    )}

                </div>


                {/* =================================================
                    MOBILE MENU BUTTON
                ================================================= */}

                <button
                    type="button"
                    className="menu-btn1"
                    onClick={() =>
                        setMenuOpen(
                            (previous) =>
                                !previous
                        )
                    }
                    aria-label={
                        menuOpen
                            ? "Close navigation menu"
                            : "Open navigation menu"
                    }
                    aria-expanded={
                        menuOpen
                    }
                >

                    {menuOpen ? (
                        <FaTimes />
                    ) : (
                        <FaBars />
                    )}

                </button>

            </div>

        </header>

    );

}

export default Navbar;
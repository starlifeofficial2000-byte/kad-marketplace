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
    FaUserCircle,
    FaSearch,
    FaThLarge
} from "react-icons/fa";

import "./Navbar.css";

import api from "../config/axios";

import getImageUrl from "../utils/imageUrl";

import localLogo from "../assets/KADMARKETPLACE.png";

import categories from "../data/categories";



function Navbar() {

    const navigate = useNavigate();
    const location = useLocation();

    const dropdownRef = useRef(null);
    const categoryRef = useRef(null);



    /* =========================================================
       STATE
    ========================================================= */

    const [menuOpen, setMenuOpen] = useState(false);

    const [showProfileMenu, setShowProfileMenu] =
        useState(false);

    const [showCategories, setShowCategories] =
        useState(false);

    const [user, setUser] = useState(null);

    const [marketplaceName, setMarketplaceName] =
        useState("KAD Marketplace");

    const [marketplaceLogo, setMarketplaceLogo] =
        useState("");

    const [searchKeyword, setSearchKeyword] =
        useState("");



    /* =========================================================
       LOAD MARKETPLACE BRANDING
    ========================================================= */

    useEffect(() => {

        let cancelled = false;

        const loadMarketplaceBranding = async () => {

            try {

                const response = await api.get(
                    "/settings/public"
                );

                const settings =
                    response.data?.settings || {};

                if (!cancelled) {

                    setMarketplaceName(
                        settings.marketplace_name ||
                        "KAD Marketplace"
                    );

                    setMarketplaceLogo(
                        settings.logo || ""
                    );

                }

            } catch (error) {

                console.error(
                    "[NAVBAR] BRANDING LOAD ERROR:",
                    error.response?.data ||
                    error.message ||
                    error
                );

            }

        };

        loadMarketplaceBranding();

        return () => {
            cancelled = true;
        };

    }, []);



    /* =========================================================
       LOAD USER
    ========================================================= */

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
                    "[NAVBAR] USER PARSE ERROR:",
                    error
                );

                setUser(null);

            }

        };

        loadUser();

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



    /* =========================================================
       LOGO FALLBACK
    ========================================================= */

    const handleLogoError = (event) => {

        const image = event.currentTarget;

        if (
            image.dataset.fallbackApplied === "true"
        ) {
            return;
        }

        image.dataset.fallbackApplied = "true";

        image.src = localLogo;

    };



    /* =========================================================
       PROFILE IMAGE
    ========================================================= */

    const profileImage = useMemo(() => {

        if (!user) {
            return null;
        }

        const image =
            user.profileImage ||
            user.profileImageUrl ||
            user.avatar ||
            user.photo ||
            null;

        if (image) {

            return getImageUrl(image);

        }

        const name =
            user.name ||
            user.username ||
            "KAD User";

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
        )}&background=111827&color=ffffff&bold=true`;

    }, [user]);



    /* =========================================================
       PROFILE IMAGE FALLBACK
    ========================================================= */

    const handleProfileImageError = (event) => {

        const image = event.currentTarget;

        if (
            image.dataset.fallbackApplied === "true"
        ) {
            return;
        }

        image.dataset.fallbackApplied = "true";

        const name =
            user?.name ||
            user?.username ||
            "KAD User";

        image.src =
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                name
            )}&background=111827&color=ffffff&bold=true`;

    };



    /* =========================================================
       SEARCH
    ========================================================= */

    const handleSearch = (event) => {

        event.preventDefault();

        const keyword =
            searchKeyword.trim();

        if (keyword) {

            navigate(
                `/search?keyword=${encodeURIComponent(
                    keyword
                )}`
            );

        } else {

            navigate("/search");

        }

        setSearchKeyword("");

        closeAllMenus();

    };



    /* =========================================================
       CATEGORY SEARCH
    ========================================================= */

    const handleCategorySearch = (category) => {

        navigate(
            `/search?category=${encodeURIComponent(
                category
            )}`
        );

        closeAllMenus();

    };



    /* =========================================================
       LOGOUT
    ========================================================= */

    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setUser(null);

        closeAllMenus();

        window.dispatchEvent(
            new Event("userUpdated")
        );

        navigate("/login");

    };



    /* =========================================================
       CLOSE MENUS
    ========================================================= */

    const closeAllMenus = () => {

        setMenuOpen(false);

        setShowProfileMenu(false);

        setShowCategories(false);

    };



    /* =========================================================
       CLOSE OUTSIDE DROPDOWNS
    ========================================================= */

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target
                )
            ) {

                setShowProfileMenu(false);

            }

            if (
                categoryRef.current &&
                !categoryRef.current.contains(
                    event.target
                )
            ) {

                setShowCategories(false);

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



    /* =========================================================
       CLOSE MENUS WHEN ROUTE CHANGES
    ========================================================= */

    useEffect(() => {

        setMenuOpen(false);

        setShowProfileMenu(false);

        setShowCategories(false);

    }, [location.pathname, location.search]);



    /* =========================================================
       ACTIVE NAV CLASS
    ========================================================= */

    const navClass = ({ isActive }) =>
        isActive
            ? "nav-link active"
            : "nav-link";



    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <header className="navbar">

            <div className="navbar-inner">


                {/* =================================================
                    BRAND
                ================================================= */}

                <div className="navbar-brand">

                    <Link
                        to="/"
                        className="brand-link"
                        onClick={closeAllMenus}
                    >

                        <img
                            src={
                                marketplaceLogo ||
                                localLogo
                            }
                            alt={marketplaceName}
                            className="navbar-logo"
                            onError={handleLogoError}
                        />

                        <div className="brand-text">

                            <span className="brand-name">
                                {marketplaceName}
                            </span>

                            <span className="brand-tagline">
                                Buy • Sell • Connect
                            </span>

                        </div>

                    </Link>

                </div>



                {/* =================================================
                    DESKTOP SEARCH
                ================================================= */}

                <form
                    className="navbar-search"
                    onSubmit={handleSearch}
                >

                    <FaSearch className="navbar-search-icon" />

                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(event) =>
                            setSearchKeyword(
                                event.target.value
                            )
                        }
                        placeholder="Search products..."
                        aria-label="Search marketplace"
                    />

                    <button
                        type="submit"
                        aria-label="Search"
                    >
                        Search
                    </button>

                </form>



                {/* =================================================
                    NAVIGATION
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
                            Marketplace Menu
                        </span>

                        <button
                            type="button"
                            onClick={closeAllMenus}
                            aria-label="Close menu"
                        >
                            <FaTimes />
                        </button>

                    </div>



                    {/* MOBILE SEARCH */}

                    <form
                        className="mobile-search"
                        onSubmit={handleSearch}
                    >

                        <div className="mobile-search-input">

                            <FaSearch />

                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(event) =>
                                    setSearchKeyword(
                                        event.target.value
                                    )
                                }
                                placeholder="Search products..."
                            />

                        </div>

                        <button type="submit">
                            Search
                        </button>

                    </form>



                    {/* SEARCH PAGE */}

                    <NavLink
                        to="/search"
                        className={navClass}
                        onClick={closeAllMenus}
                    >

                        <FaSearch />

                        <span>
                            Search
                        </span>

                    </NavLink>



                    {/* =================================================
                        CATEGORIES
                    ================================================= */}

                    <div
                        className="categories-dropdown"
                        ref={categoryRef}
                    >

                        <button
                            type="button"
                            className={
                                showCategories
                                    ? "categories-trigger open"
                                    : "categories-trigger"
                            }
                            onClick={() =>
                                setShowCategories(
                                    previous =>
                                        !previous
                                )
                            }
                        >

                            <FaThLarge />

                            <span>
                                Categories
                            </span>

                            <FaChevronDown
                                className="categories-chevron"
                            />

                        </button>



                        {showCategories && (

                            <div className="categories-menu">

                                <div className="categories-menu-title">

                                    <strong>
                                        Browse Categories
                                    </strong>

                                    <span>
                                        Find what you need
                                    </span>

                                </div>



                                <div className="categories-list">

                                    {categories.map(
                                        (category) => (

                                            <button
                                                key={
                                                    category.name
                                                }
                                                type="button"
                                                className="category-item"
                                                onClick={() =>
                                                    handleCategorySearch(
                                                        category.name
                                                    )
                                                }
                                            >

                                                <span className="category-icon">

                                                    {
                                                        category.icon
                                                    }

                                                </span>

                                                <span className="category-name">

                                                    {
                                                        category.name
                                                    }

                                                </span>

                                                <span className="category-count">

                                                    {
                                                        category
                                                            .subcategories
                                                            ?.length ||
                                                        0
                                                    }

                                                </span>

                                            </button>

                                        )
                                    )}

                                </div>

                            </div>

                        )}

                    </div>



                    {/* SELL */}

                    <NavLink
                        to="/sell"
                        className="sell-btn"
                        onClick={closeAllMenus}
                    >

                        <FaPlusCircle />

                        <span>
                            Sell Item
                        </span>

                    </NavLink>



                    {/* DASHBOARD */}

                    <NavLink
                        to="/dashboard"
                        className={navClass}
                        onClick={closeAllMenus}
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
                            className={navClass}
                            onClick={closeAllMenus}
                        >

                            <FaHeadset />

                            <span>
                                Support
                            </span>

                        </NavLink>

                    )}



                    {/* TICKETS */}

                    {user && (

                        <NavLink
                            to="/my-tickets"
                            className={navClass}
                            onClick={closeAllMenus}
                        >

                            <FaTicketAlt />

                            <span>
                                My Tickets
                            </span>

                        </NavLink>

                    )}



                    {/* LOGIN */}

                    {!user && (

                        <NavLink
                            to="/login"
                            className={navClass}
                            onClick={closeAllMenus}
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
                            className={navClass}
                            onClick={closeAllMenus}
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
                                ref={dropdownRef}
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
                                            previous =>
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
                                            src={profileImage}
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



                                {showProfileMenu && (

                                    <div className="profile-menu">

                                        <div className="profile-menu-header">

                                            <div className="profile-menu-avatar">

                                                <img
                                                    src={profileImage}
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

                                                        {
                                                            user.role ===
                                                            "admin"
                                                                ? "Administrator"
                                                                : "Marketplace Member"
                                                        }

                                                    </small>

                                                )}

                                            </div>

                                        </div>



                                        <div className="profile-menu-links">

                                            <Link
                                                to="/profile"
                                                onClick={() =>
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
                                                onClick={() =>
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
                                                onClick={() =>
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
                                                onClick={() =>
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
                                                onClick={() =>
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



                                        <div className="profile-menu-footer">

                                            <button
                                                type="button"
                                                onClick={logout}
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
                            previous =>
                                !previous
                        )
                    }
                    aria-label={
                        menuOpen
                            ? "Close navigation menu"
                            : "Open navigation menu"
                    }
                    aria-expanded={menuOpen}
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
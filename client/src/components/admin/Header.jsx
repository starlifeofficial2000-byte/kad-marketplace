import { useState } from "react";
import {
    FaBars,
    FaTimes,
    FaUserCircle,
    FaCog,
    FaSignOutAlt,
    FaChevronDown
} from "react-icons/fa";

import logo from "../../assets/KADMARKETPLACE.png";
import "./Header.css";

function Header({
    onMenuToggle,
    onProfile,
    onSettings,
    onLogout
}) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const profileImage = user.profileImage
        ? user.profileImage.startsWith("http")
            ? user.profileImage
            : `/uploads/${user.profileImage}`
        : "/default-avatar.png";

    const handleLogout = () => {
        setShowProfileMenu(false);

        if (onLogout) {
            onLogout();
            return;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    return (
        <header className="admin-header">

            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="admin-header-left">

                {/* MOBILE MENU BUTTON */}

                <button
                    type="button"
                    className="admin-menu-button"
                    aria-label="Open admin menu"
                    onClick={onMenuToggle}
                >
                    <FaBars />
                </button>


                {/* ADMIN LOGO ONLY */}

                <div className="admin-header-logo">
                    <img
                        src={logo}
                        alt="KAD Marketplace"
                    />
                </div>

            </div>


            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="admin-header-right">

                {/* ADMIN PROFILE */}

                <div className="admin-profile-wrapper">

                    <button
                        type="button"
                        className="admin-profile-button"
                        onClick={() =>
                            setShowProfileMenu(
                                (previous) => !previous
                            )
                        }
                        aria-expanded={showProfileMenu}
                    >

                        <img
                            src={profileImage}
                            alt={
                                user.name ||
                                "Administrator"
                            }
                            className="admin-profile-image"
                        />

                        <div className="admin-profile-details">

                            <strong>
                                {user.name ||
                                    "Administrator"}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                        <FaChevronDown
                            className={
                                `admin-profile-arrow ${
                                    showProfileMenu
                                        ? "open"
                                        : ""
                                }`
                            }
                        />

                    </button>


                    {/* PROFILE DROPDOWN */}

                    {showProfileMenu && (

                        <div
                            className="admin-profile-menu"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <button
                                type="button"
                                onClick={() => {
                                    setShowProfileMenu(false);

                                    if (onProfile) {
                                        onProfile();
                                    }
                                }}
                            >
                                <FaUserCircle />

                                <span>
                                    Profile
                                </span>
                            </button>


                            <button
                                type="button"
                                onClick={() => {
                                    setShowProfileMenu(false);

                                    if (onSettings) {
                                        onSettings();
                                    }
                                }}
                            >
                                <FaCog />

                                <span>
                                    Settings
                                </span>
                            </button>


                            <div className="admin-profile-divider" />


                            <button
                                type="button"
                                className="logout-button"
                                onClick={handleLogout}
                            >
                                <FaSignOutAlt />

                                <span>
                                    Logout
                                </span>
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>
    );
}

export default Header;
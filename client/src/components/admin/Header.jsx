import { useState } from "react";
import {
    FaSearch,
    FaUserCircle,
    FaCog,
    FaSignOutAlt
} from "react-icons/fa";

import logo from "../assets/KADMARKETPLACE.png";
import "./Header.css";

function Header() {

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const [showMenu, setShowMenu] = useState(false);

    const profileImage = user.profileImage
        ? `/uploads/${user.profileImage}`
        : "/default-avatar.png";

    return (
        <header className="admin-header">

            <div className="header-left">

                <div className="header-brand">
                    <img
                        src={logo}
                        alt="KAD Marketplace"
                        className="header-logo"
                    />
                </div>

                <div className="search-box">

                    <FaSearch className="search-icon" />

                    <input
                        type="text"
                        placeholder="Search users, products, stores..."
                        aria-label="Search"
                    />

                </div>

            </div>

            <div className="header-right">

                <div
                    className="profile"
                    onClick={() =>
                        setShowMenu((prev) => !prev)
                    }
                >

                    <img
                        src={profileImage}
                        alt={user.name || "Administrator"}
                        className="profile-image"
                    />

                    <div className="profile-info">

                        <h4>
                            {user.name || "Administrator"}
                        </h4>

                        <small>
                            Administrator
                        </small>

                    </div>

                    {showMenu && (

                        <div
                            className="profile-menu"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <button type="button">
                                <FaUserCircle />
                                <span>Profile</span>
                            </button>

                            <button type="button">
                                <FaCog />
                                <span>Settings</span>
                            </button>

                            <button type="button">
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>
    );
}

export default Header;
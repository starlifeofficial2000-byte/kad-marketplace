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

    return (

        <header className="admin-header">

            <div className="header-left">

                <div className="search-box">

                    <img
                        src={logo}
                        alt="KAD Marketplace"
                        className="header-logo"
                    />

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search users, products, stores..."
                    />

                </div>

            </div>

            <div className="header-right">

                <div
                    className="profile"
                    onClick={() =>
                        setShowMenu(!showMenu)
                    }
                >

                    <img
                        src={
                            user.profileImage
                                ? `/uploads/${user.profileImage}`
                                : "/default-avatar.png"
                        }
                        alt={user.name || "Administrator"}
                    />

                    <div>

                        <h4>
                            {user.name || "Administrator"}
                        </h4>

                        <small>
                            Administrator
                        </small>

                    </div>

                    {showMenu && (

                        <div className="profile-menu">

                            <button>
                                <FaUserCircle />
                                Profile
                            </button>

                            <button>
                                <FaCog />
                                Settings
                            </button>

                            <button>
                                <FaSignOutAlt />
                                Logout
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>
    );
}

export default Header;
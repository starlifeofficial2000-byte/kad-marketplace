import { useState } from "react";
import {
    FaBell,
    FaEnvelope,
    FaMoon,
    FaSearch,
    FaUserCircle,
    FaCog,
    FaSignOutAlt
} from "react-icons/fa";

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

                    <FaSearch />

                    <input

                        type="text"

                        placeholder="Search users, products, stores..."

                    />

                </div>

            </div>

            <div className="header-right">

                <button className="icon-btn">

                    <FaMoon />

                </button>

                <button className="icon-btn">

                    <FaEnvelope />

                    <span className="badge">

                        3

                    </span>

                </button>

                <button className="icon-btn">

                    <FaBell />

                    <span className="badge">

                        12

                    </span>

                </button>

                <div

                    className="profile"

                    onClick={() =>

                        setShowMenu(!showMenu)

                    }

                >

                    <img

                        src={`/uploads/${user.profileImage}`}

                        alt=""

                    />

                    <div>

                        <h4>

                            {user.name}

                        </h4>

                        <small>

                            Administrator

                        </small>

                    </div>

                    {

                        showMenu &&

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

                    }

                </div>

            </div>

        </header>

    );

}

export default Header;
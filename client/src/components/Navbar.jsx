import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
    FaBars,
    FaTimes,
    FaBell,
    FaPlusCircle
} from "react-icons/fa";

import "./Navbar.css";
import logo from "../assets/KADMARKETPLACE.png";

function Navbar() {

    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const dropdownRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("user"));

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

    };

    useEffect(() => {

        function handleClickOutside(event) {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {

                setShowProfileMenu(false);

            }

        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);

    return (

        <nav className="navbar">

            {/* Logo */}

            <div className="logo">

                <Link to="/">

                    <img
                        src={logo}
                        alt="KAD Marketplace"
                        className="navbar-logo"
                    />

                    <span>KAD Marketplace</span>

                </Link>

            </div>

            {/* Navigation */}

            <div className={menuOpen ? "nav-links active" : "nav-links"}>

                <NavLink to="/sell" className="sell-btn">

                    <FaPlusCircle />

                    <span>Sell Item</span>

                </NavLink>

                <NavLink to="/dashboard">

                    Dashboard

                </NavLink>

                {

                    user &&

                    <NavLink to="/support">

                        Support

                    </NavLink>

                }

                {

                    user &&

                    <NavLink to="/my-tickets">

                        My Tickets

                    </NavLink>

                }

                {

                    !user &&

                    <NavLink to="/register">

                        Register / Login

                    </NavLink>

                }

                {

                    user?.role === "admin" &&

                    <NavLink to="/admin">

                        Admin

                    </NavLink>

                }

            </div>

            {/* Right Side */}

            <div className="user-area">

                {

                    user ?

                    <>

                        <Link
                            to="/notifications"
                            className="notification-btn bell"
                        >

                            <FaBell />

                        </Link>

                        <div
                            className="dropdown"
                            ref={dropdownRef}
                        >

                            <button
                                className="profile-btn"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >

                                <img

                                    src={

                                        user.profileImage

                                            ?

                                            `/uploads/${user.profileImage}`

                                            :

                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`

                                    }

                                    alt="Profile"

                                    className="profile-image"

                                />

                            </button>

                            {

                                showProfileMenu &&

                                <div className="dropdown-content">

                                    <div className="dropdown-header">

                                        <img

                                            src={

                                                user.profileImage

                                                    ?

                                                    `/uploads/${user.profileImage}`

                                                    :

                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`

                                            }

                                            alt=""

                                            className="dropdown-avatar"

                                        />

                                        <h3>{user.name}</h3>

                                        <p>{user.email}</p>

                                    </div>

                                    <Link to="/profile">

                                        My Profile

                                    </Link>

                                    <Link to="/support">

                                        Contact Support

                                    </Link>

                                    <Link to="/my-tickets">

                                        My Tickets

                                    </Link>

                                    <Link to="/notifications">

                                        Notifications

                                    </Link>

                                    <button onClick={logout}>

                                        Logout

                                    </button>

                                </div>

                            }

                        </div>

                    </>

                    :

                    <div className="guest-links">

                        <Link to="/login">

                            Login

                        </Link>

                        <Link
                            to="/register"
                            className="register-btn"
                        >

                            Register

                        </Link>

                    </div>

                }

            </div>

            {/* Mobile Button */}

            <button

                className="menu-btn1"

                onClick={() => setMenuOpen(!menuOpen)}

            >

                {

                    menuOpen

                        ?

                        <FaTimes />

                        :

                        <FaBars />

                }

            </button>

        </nav>

    );

}

export default Navbar;
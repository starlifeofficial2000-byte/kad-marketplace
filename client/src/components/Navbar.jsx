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
    useMemo,
    useCallback
} from "react";

import { io } from "socket.io-client";

import {
    FaBars,
    FaTimes,
    FaBell,
    FaComments,
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

import api from "../config/axios";

import getImageUrl from "../utils/imageUrl";

import localLogo from "../assets/KADMARKETPLACE.png";


/* =========================================================
   CONFIGURATION
========================================================= */

const IS_PRODUCTION = import.meta.env.PROD;

const normalizeUrl = (value) => {

    if (!value) {
        return "";
    }

    return String(value)
        .trim()
        .replace(/\/+$/, "");
};


const API_SERVER = normalizeUrl(
    import.meta.env.VITE_API_SERVER ||
    import.meta.env.VITE_SERVER_URL ||
    (
        IS_PRODUCTION
            ? window.location.origin
            : "http://localhost:5000"
    )
);


const SOCKET_URL = normalizeUrl(
    import.meta.env.VITE_SOCKET_URL ||
    API_SERVER
);


const SOCKET_PATH = "/socket.io";


/* =========================================================
   COMPONENT
========================================================= */

function Navbar() {

    const navigate = useNavigate();

    const location = useLocation();

    const dropdownRef = useRef(null);

    const notificationSocketRef =
        useRef(null);


    /* =====================================================
       STATE
    ===================================================== */

    const [menuOpen, setMenuOpen] =
        useState(false);

    const [showProfileMenu, setShowProfileMenu] =
        useState(false);

    const [user, setUser] =
        useState(null);

    const [marketplaceName, setMarketplaceName] =
        useState("KAD Marketplace");

    const [marketplaceLogo, setMarketplaceLogo] =
        useState("");

    const [unreadMessages, setUnreadMessages] =
        useState(0);

    const [messagesLoading, setMessagesLoading] =
        useState(false);


    /* =====================================================
       LOAD MARKETPLACE NAME + LOGO
    ===================================================== */

    useEffect(() => {

        let cancelled = false;

        const loadMarketplaceBranding =
            async () => {

                try {

                    const response =
                        await api.get(
                            "/settings/public"
                        );

                    const settings =
                        response.data?.settings || {};

                    if (!cancelled) {

                        setMarketplaceName(
                            settings.marketplace_name ||
                            settings.marketplaceName ||
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


    /* =====================================================
       LOGO ERROR FALLBACK
    ===================================================== */

    const handleLogoError = (
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

        image.src = localLogo;

        console.warn(
            "[NAVBAR] Dynamic logo failed. Using local fallback."
        );
    };


    /* =====================================================
       LOAD USER
    ===================================================== */

    useEffect(() => {

        const loadUser = () => {

            try {

                const storedUser =
                    localStorage.getItem(
                        "user"
                    );

                if (!storedUser) {

                    setUser(null);

                    return;
                }

                const parsedUser =
                    JSON.parse(
                        storedUser
                    );

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


    /* =====================================================
       LOAD UNREAD CHAT COUNT

       Backend endpoint:
       GET /api/messages/unread/count
    ===================================================== */

    const loadUnreadMessages =
        useCallback(
            async () => {

                if (!user?.id) {

                    setUnreadMessages(0);

                    return;
                }


                try {

                    setMessagesLoading(true);


                    const response =
                        await api.get(
                            "/messages/unread/count"
                        );


                    const data =
                        response.data || {};


                    /*
                     * Supported backend response shapes:
                     *
                     * {
                     *   success: true,
                     *   unreadCount: 5
                     * }
                     *
                     * or
                     *
                     * {
                     *   data: {
                     *      unreadCount: 5
                     *   }
                     * }
                     */

                    const count =
                        Number(
                            data.unreadCount ??
                            data.data?.unreadCount ??
                            data.count ??
                            0
                        );


                    setUnreadMessages(
                        Number.isFinite(count) &&
                        count > 0
                            ? count
                            : 0
                    );

                } catch (error) {

                    /*
                     * A temporary request failure should
                     * not erase an existing unread count.
                     */

                    console.error(
                        "[NAVBAR] UNREAD MESSAGE COUNT ERROR:",
                        error.response?.data ||
                        error.message ||
                        error
                    );

                } finally {

                    setMessagesLoading(false);
                }
            },
            [user?.id]
        );


    /* =====================================================
       INITIAL MESSAGE COUNT
    ===================================================== */

    useEffect(() => {

        if (!user?.id) {

            setUnreadMessages(0);

            return;
        }


        loadUnreadMessages();

    }, [
        user?.id,
        loadUnreadMessages
    ]);


    /* =====================================================
       REAL-TIME CHAT NOTIFICATIONS

       Server events:
       - new_message_notification
       - messages_read
    ===================================================== */

    useEffect(() => {

        const token =
            localStorage.getItem(
                "token"
            );


        if (!user?.id || !token) {

            if (
                notificationSocketRef.current
            ) {

                notificationSocketRef.current.disconnect();

                notificationSocketRef.current =
                    null;
            }

            setUnreadMessages(0);

            return;
        }


        /*
         * Clean up an old socket before creating
         * a new authenticated connection.
         */
        if (
            notificationSocketRef.current
        ) {

            notificationSocketRef.current.disconnect();

            notificationSocketRef.current =
                null;
        }


        const notificationSocket =
            io(
                SOCKET_URL,
                {
                    path: SOCKET_PATH,

                    transports: [
                        "websocket",
                        "polling"
                    ],

                    withCredentials: true,

                    autoConnect: false,

                    reconnection: true,

                    reconnectionAttempts:
                        Infinity,

                    reconnectionDelay:
                        1000,

                    reconnectionDelayMax:
                        5000,

                    timeout: 20000,

                    auth: {
                        token
                    }
                }
            );


        notificationSocketRef.current =
            notificationSocket;


        const handleConnect = () => {

            console.log(
                "[NAVBAR SOCKET] CONNECTED:",
                notificationSocket.id
            );
        };


        const handleConnectError = (
            error
        ) => {

            console.error(
                "[NAVBAR SOCKET] CONNECTION ERROR:",
                error?.message ||
                error
            );
        };


        const handleDisconnect = (
            reason
        ) => {

            console.warn(
                "[NAVBAR SOCKET] DISCONNECTED:",
                reason
            );
        };


        /*
         * New message received.
         *
         * The backend sends this to:
         * user:<recipientId>
         */
        const handleNewMessageNotification = (
            notification
        ) => {

            console.log(
                "[NAVBAR SOCKET] NEW MESSAGE:",
                notification
            );


            /*
             * Prefer the unreadCount calculated by
             * the backend if supplied.
             */
            if (
                notification &&
                notification.unreadCount != null
            ) {

                const backendCount =
                    Number(
                        notification.unreadCount
                    );


                if (
                    Number.isFinite(
                        backendCount
                    )
                ) {

                    setUnreadMessages(
                        Math.max(
                            0,
                            backendCount
                        )
                    );

                    return;
                }
            }


            /*
             * Otherwise increment locally.
             */
            setUnreadMessages(
                previous =>
                    previous + 1
            );
        };


        /*
         * Chat page marks messages as read.
         */
        const handleMessagesRead = (
            data
        ) => {

            console.log(
                "[NAVBAR SOCKET] MESSAGES READ:",
                data
            );


            if (
                data &&
                data.unreadCount != null
            ) {

                const backendCount =
                    Number(
                        data.unreadCount
                    );


                if (
                    Number.isFinite(
                        backendCount
                    )
                ) {

                    setUnreadMessages(
                        Math.max(
                            0,
                            backendCount
                        )
                    );

                    return;
                }
            }


            /*
             * If the backend does not send a count,
             * refresh it from the database.
             */
            loadUnreadMessages();
        };


        notificationSocket.on(
            "connect",
            handleConnect
        );

        notificationSocket.on(
            "connect_error",
            handleConnectError
        );

        notificationSocket.on(
            "disconnect",
            handleDisconnect
        );

        notificationSocket.on(
            "new_message_notification",
            handleNewMessageNotification
        );

        notificationSocket.on(
            "messages_read",
            handleMessagesRead
        );


        /*
         * Authenticate and connect.
         */
        notificationSocket.auth = {
            token
        };

        notificationSocket.connect();


        return () => {

            notificationSocket.off(
                "connect",
                handleConnect
            );

            notificationSocket.off(
                "connect_error",
                handleConnectError
            );

            notificationSocket.off(
                "disconnect",
                handleDisconnect
            );

            notificationSocket.off(
                "new_message_notification",
                handleNewMessageNotification
            );

            notificationSocket.off(
                "messages_read",
                handleMessagesRead
            );

            notificationSocket.disconnect();


            if (
                notificationSocketRef.current ===
                notificationSocket
            ) {

                notificationSocketRef.current =
                    null;
            }
        };

    }, [
        user?.id,
        loadUnreadMessages
    ]);


    /* =====================================================
       PERIODIC FALLBACK REFRESH

       Real-time Socket.IO is primary.
       This is only a safety net.
    ===================================================== */

    useEffect(() => {

        if (!user?.id) {
            return;
        }


        const interval =
            window.setInterval(
                () => {

                    loadUnreadMessages();

                },
                30000
            );


        return () => {

            window.clearInterval(
                interval
            );
        };

    }, [
        user?.id,
        loadUnreadMessages
    ]);


    /* =====================================================
       REFRESH WHEN USER RETURNS TO TAB
    ===================================================== */

    useEffect(() => {

        const handleVisibilityChange =
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    loadUnreadMessages();
                }
            };


        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );


        return () => {

            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };

    }, [
        loadUnreadMessages
    ]);


    /* =====================================================
       REFRESH WHEN WINDOW GETS FOCUS
    ===================================================== */

    useEffect(() => {

        const handleFocus = () => {

            loadUnreadMessages();

        };


        window.addEventListener(
            "focus",
            handleFocus
        );


        return () => {

            window.removeEventListener(
                "focus",
                handleFocus
            );
        };

    }, [
        loadUnreadMessages
    ]);


    /* =====================================================
       REFRESH AFTER CHAT PAGE
    ===================================================== */

    useEffect(() => {

        if (
            location.pathname.startsWith(
                "/chat"
            )
        ) {

            const timer =
                window.setTimeout(
                    () => {

                        loadUnreadMessages();

                    },
                    700
                );


            return () => {

                window.clearTimeout(
                    timer
                );
            };
        }

    }, [
        location.pathname,
        loadUnreadMessages
    ]);


    /* =====================================================
       OPTIONAL CUSTOM MESSAGE UPDATE EVENT
    ===================================================== */

    useEffect(() => {

        const handleMessagesUpdated =
            () => {

                loadUnreadMessages();

            };


        window.addEventListener(
            "messagesUpdated",
            handleMessagesUpdated
        );


        return () => {

            window.removeEventListener(
                "messagesUpdated",
                handleMessagesUpdated
            );
        };

    }, [
        loadUnreadMessages
    ]);


    /* =====================================================
       PROFILE IMAGE
    ===================================================== */

    const profileImage =
        useMemo(() => {

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

                return getImageUrl(
                    image
                );
            }


            const name =
                user.name ||
                user.username ||
                "KAD User";


            return (
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    name
                )}&background=111827&color=ffffff&bold=true`
            );

        }, [user]);


    /* =====================================================
       PROFILE IMAGE ERROR
    ===================================================== */

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


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logout = () => {

        if (
            notificationSocketRef.current
        ) {

            notificationSocketRef.current.disconnect();

            notificationSocketRef.current =
                null;
        }


        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );


        setUser(null);

        setUnreadMessages(0);

        setMenuOpen(false);

        setShowProfileMenu(false);


        window.dispatchEvent(
            new Event(
                "userUpdated"
            )
        );


        navigate("/login");
    };


    /* =====================================================
       CLOSE DROPDOWN
    ===================================================== */

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

                setShowProfileMenu(
                    false
                );
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


    /* =====================================================
       CLOSE MENUS WHEN ROUTE CHANGES
    ===================================================== */

    useEffect(() => {

        setMenuOpen(false);

        setShowProfileMenu(false);

    }, [
        location.pathname
    ]);


    /* =====================================================
       CLOSE MOBILE MENU
    ===================================================== */

    const closeMobileMenu = () => {

        setMenuOpen(false);

    };


    /* =====================================================
       OPEN MESSAGES

       Your Chat screen uses /inbox as its parent route.
       Keep /messages here if that is your existing inbox route.
    ===================================================== */

    const openMessages = () => {

        closeMobileMenu();

        navigate("/messages");

    };


    /* =====================================================
       ACTIVE NAV CLASS
    ===================================================== */

    const navClass = ({
        isActive
    }) => {

        return isActive
            ? "nav-link active"
            : "nav-link";
    };


    /* =====================================================
       MESSAGE BADGE
    ===================================================== */

    const messageBadge =
        unreadMessages > 99
            ? "99+"
            : unreadMessages;


    /* =====================================================
       RENDER
    ===================================================== */

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
                            src={
                                marketplaceLogo ||
                                localLogo
                            }
                            alt={
                                marketplaceName
                            }
                            className="navbar-logo"
                            onError={
                                handleLogoError
                            }
                        />


                        <div className="brand-text">

                            <span className="brand-name">

                                {
                                    marketplaceName
                                }

                            </span>


                            <span className="brand-tagline">

                                Buy • Sell • Connect

                            </span>

                        </div>

                    </Link>

                </div>


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


                    <NavLink
                        to="/dashboard"
                        className={navClass}
                        onClick={
                            closeMobileMenu
                        }
                    >

                        <FaTachometerAlt />

                        <span>
                            Dashboard
                        </span>

                    </NavLink>


                    {user && (

                        <NavLink
                            to="/support"
                            className={navClass}
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


                    {user && (

                        <NavLink
                            to="/my-tickets"
                            className={navClass}
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


                    {!user && (

                        <NavLink
                            to="/login"
                            className={navClass}
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


                    {user?.role === "admin" && (

                        <NavLink
                            to="/admin"
                            className={navClass}
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


                            {/* =================================================
                                MESSAGES
                            ================================================= */}

                            <button
                                type="button"
                                className={
                                    "message-btn" +
                                    (
                                        location.pathname.startsWith(
                                            "/messages"
                                        )
                                            ? " active"
                                            : ""
                                    )
                                }
                                onClick={
                                    openMessages
                                }
                                aria-label={
                                    unreadMessages > 0
                                        ? `${unreadMessages} unread messages`
                                        : "Messages"
                                }
                                title={
                                    unreadMessages > 0
                                        ? `${unreadMessages} unread messages`
                                        : "Messages"
                                }
                            >

                                <span className="message-icon-wrapper">

                                    <FaComments />

                                    {unreadMessages > 0 && (

                                        <span className="message-badge">

                                            {
                                                messageBadge
                                            }

                                        </span>

                                    )}

                                </span>

                            </button>


                            {/* =================================================
                                NOTIFICATIONS
                            ================================================= */}

                            <Link
                                to="/notifications"
                                className="notification-btn"
                                aria-label="Notifications"
                                title="Notifications"
                                onClick={
                                    closeMobileMenu
                                }
                            >

                                <FaBell />

                            </Link>


                            {/* =================================================
                                PROFILE
                            ================================================= */}

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


                                {showProfileMenu && (

                                    <div className="profile-menu">

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
                                                to="/messages"
                                                onClick={() =>
                                                    setShowProfileMenu(
                                                        false
                                                    )
                                                }
                                            >

                                                <span className="profile-link-icon-with-badge">

                                                    <FaComments />

                                                    {unreadMessages > 0 && (

                                                        <span className="profile-message-badge">

                                                            {
                                                                messageBadge
                                                            }

                                                        </span>

                                                    )}

                                                </span>


                                                <span>
                                                    Messages
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

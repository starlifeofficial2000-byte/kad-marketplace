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

    /*
     * This is the SINGLE unread count displayed
     * on the notification bell.
     *
     * It includes unread chat messages from:
     *
     * GET /api/messages/unread/count
     */
    const [unreadNotifications, setUnreadNotifications] =
        useState(0);

    const [notificationsLoading, setNotificationsLoading] =
        useState(false);


    /* =========================================================
       LOAD MARKETPLACE NAME + LOGO
    ========================================================= */

    useEffect(() => {

        let cancelled = false;


        const loadMarketplaceBranding = async () => {

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


    /* =========================================================
       LOGO ERROR FALLBACK
    ========================================================= */

    const handleLogoError = (event) => {

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


    /* =========================================================
       LOAD USER
    ========================================================= */

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


    /* =========================================================
       LOAD UNREAD NOTIFICATION COUNT

       Chat messages are treated as notifications.

       Backend:
       GET /api/messages/unread/count

       Expected response:

       {
           success: true,
           unreadCount: 5
       }
    ========================================================= */

    const loadUnreadNotifications =
        useCallback(
            async () => {

                if (!user?.id) {

                    setUnreadNotifications(0);

                    return;
                }


                try {

                    setNotificationsLoading(true);


                    const response =
                        await api.get(
                            "/messages/unread/count"
                        );


                    const data =
                        response.data || {};


                    const count =
                        Number(
                            data.unreadCount ??
                            data.data?.unreadCount ??
                            data.count ??
                            0
                        );


                    if (
                        Number.isFinite(count)
                    ) {

                        setUnreadNotifications(
                            Math.max(
                                0,
                                count
                            )
                        );

                    }

                } catch (error) {

                    /*
                     * Do NOT erase the existing count
                     * when a temporary request fails.
                     */

                    console.error(
                        "[NAVBAR] UNREAD NOTIFICATION COUNT ERROR:",
                        error.response?.data ||
                        error.message ||
                        error
                    );

                } finally {

                    setNotificationsLoading(false);
                }
            },
            [user?.id]
        );


    /* =========================================================
       INITIAL UNREAD COUNT
    ========================================================= */

    useEffect(() => {

        if (!user?.id) {

            setUnreadNotifications(0);

            return;
        }


        loadUnreadNotifications();

    }, [
        user?.id,
        loadUnreadNotifications
    ]);


    /* =========================================================
       REAL-TIME NOTIFICATION SOCKET

       Events:

       new_message_notification
       messages_read
    ========================================================= */

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


            setUnreadNotifications(0);

            return;
        }


        /*
         * Remove previous socket before
         * creating another authenticated socket.
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


        /* =====================================================
           CONNECT
        ===================================================== */

        const handleConnect = () => {

            console.log(
                "[NAVBAR SOCKET] CONNECTED:",
                notificationSocket.id
            );


            /*
             * Refresh from the database after
             * reconnecting to make sure the bell
             * count is accurate.
             */

            loadUnreadNotifications();
        };


        /* =====================================================
           CONNECTION ERROR
        ===================================================== */

        const handleConnectError = (
            error
        ) => {

            console.error(
                "[NAVBAR SOCKET] CONNECTION ERROR:",
                error?.message ||
                error
            );
        };


        /* =====================================================
           DISCONNECT
        ===================================================== */

        const handleDisconnect = (
            reason
        ) => {

            console.warn(
                "[NAVBAR SOCKET] DISCONNECTED:",
                reason
            );
        };


        /* =====================================================
           NEW MESSAGE

           Backend sends:

           {
               conversationId,
               message,
               sender,
               unreadCount
           }
        ===================================================== */

        const handleNewMessageNotification = (
            notification
        ) => {

            console.log(
                "[NAVBAR SOCKET] NEW MESSAGE NOTIFICATION:",
                notification
            );


            /*
             * The backend should send the authoritative
             * unread count.
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

                    setUnreadNotifications(
                        Math.max(
                            0,
                            backendCount
                        )
                    );


                    return;
                }
            }


            /*
             * Fallback if the backend does not
             * provide unreadCount.
             */

            setUnreadNotifications(
                previous =>
                    previous + 1
            );
        };


        /* =====================================================
           MESSAGES READ

           When Chat marks messages as read,
           backend sends:

           {
               conversationId,
               unreadCount
           }
        ===================================================== */

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

                    setUnreadNotifications(
                        Math.max(
                            0,
                            backendCount
                        )
                    );


                    return;
                }
            }


            /*
             * Fallback to database.
             */

            loadUnreadNotifications();
        };


        /* =====================================================
           SOCKET EVENTS
        ===================================================== */

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
         * Explicit authentication.
         */

        notificationSocket.auth = {
            token
        };


        notificationSocket.connect();


        /* =====================================================
           CLEANUP
        ===================================================== */

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
        loadUnreadNotifications
    ]);


    /* =========================================================
       PERIODIC FALLBACK

       Socket.IO is primary.

       This makes sure the notification bell
       stays synchronized even if a socket event
       is missed.
    ========================================================= */

    useEffect(() => {

        if (!user?.id) {
            return;
        }


        const interval =
            window.setInterval(
                () => {

                    loadUnreadNotifications();

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
        loadUnreadNotifications
    ]);


    /* =========================================================
       REFRESH WHEN TAB BECOMES VISIBLE
    ========================================================= */

    useEffect(() => {

        const handleVisibilityChange = () => {

            if (
                document.visibilityState ===
                "visible"
            ) {

                loadUnreadNotifications();
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
        loadUnreadNotifications
    ]);


    /* =========================================================
       REFRESH WHEN WINDOW GETS FOCUS
    ========================================================= */

    useEffect(() => {

        const handleFocus = () => {

            loadUnreadNotifications();
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
        loadUnreadNotifications
    ]);


    /* =========================================================
       REFRESH AFTER OPENING CHAT

       Chat is:

       /chat/:conversationId
    ========================================================= */

    useEffect(() => {

        if (
            location.pathname.startsWith(
                "/chat/"
            )
        ) {

            const timer =
                window.setTimeout(
                    () => {

                        loadUnreadNotifications();

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
        loadUnreadNotifications
    ]);


    /* =========================================================
       CUSTOM MESSAGE UPDATE EVENT
    ========================================================= */

    useEffect(() => {

        const handleMessagesUpdated = () => {

            loadUnreadNotifications();
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
        loadUnreadNotifications
    ]);


    /* =========================================================
       PROFILE IMAGE
    ========================================================= */

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


    /* =========================================================
       PROFILE IMAGE ERROR
    ========================================================= */

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


    /* =========================================================
       LOGOUT
    ========================================================= */

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


        setUnreadNotifications(0);


        setMenuOpen(false);


        setShowProfileMenu(false);


        window.dispatchEvent(
            new Event(
                "userUpdated"
            )
        );


        navigate("/login");
    };


    /* =========================================================
       CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    ========================================================= */

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


    /* =========================================================
       CLOSE MENUS WHEN ROUTE CHANGES
    ========================================================= */

    useEffect(() => {

        setMenuOpen(false);

        setShowProfileMenu(false);

    }, [
        location.pathname
    ]);


    /* =========================================================
       CLOSE MOBILE MENU
    ========================================================= */

    const closeMobileMenu = () => {

        setMenuOpen(false);
    };


    /* =========================================================
       OPEN NOTIFICATIONS

       The notification bell is now the central
       location for unread messages.

       Chat notifications are displayed inside
       /notifications.
    ========================================================= */

    const openNotifications = () => {

        closeMobileMenu();

        setShowProfileMenu(false);

        navigate("/notifications");
    };


    /* =========================================================
       OPEN MESSAGES FROM PROFILE MENU

       Messages themselves remain accessible from
       the profile dropdown, but there is NO
       separate unread message badge.
    ========================================================= */

    const openMessages = () => {

        setShowProfileMenu(false);

        closeMobileMenu();

        navigate("/inbox");
    };


    /* =========================================================
       ACTIVE NAV CLASS
    ========================================================= */

    const navClass = ({
        isActive
    }) => {

        return isActive
            ? "nav-link active"
            : "nav-link";
    };


    /* =========================================================
       NOTIFICATION BADGE
    ========================================================= */

    const notificationBadge =
        unreadNotifications > 99
            ? "99+"
            : unreadNotifications;


    /* =========================================================
       BELL ARIA LABEL
    ========================================================= */

    const notificationLabel =
        unreadNotifications > 0
            ? `${unreadNotifications} unread notifications`
            : "Notifications";


    /* =========================================================
       RENDER
    ========================================================= */

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
                                NOTIFICATION BELL

                                THIS IS NOW THE ONLY UNREAD BADGE.

                                Chat messages + notifications appear here.
                            ================================================= */}

                            <button
                                type="button"
                                className={
                                    "notification-btn" +
                                    (
                                        location.pathname.startsWith(
                                            "/notifications"
                                        )
                                            ? " active"
                                            : ""
                                    )
                                }
                                onClick={
                                    openNotifications
                                }
                                aria-label={
                                    notificationLabel
                                }
                                title={
                                    notificationLabel
                                }
                            >

                                <span className="notification-icon-wrapper">

                                    <FaBell />

                                    {unreadNotifications > 0 && (

                                        <span
                                            className="notification-badge"
                                            aria-hidden="true"
                                        >

                                            {
                                                notificationBadge
                                            }

                                        </span>

                                    )}

                                </span>

                            </button>


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

                                        {/* =================================================
                                            PROFILE HEADER
                                        ================================================= */}

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


                                        {/* =================================================
                                            PROFILE LINKS
                                        ================================================= */}

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


                                            {/* ================================
                                                MESSAGES

                                                NO BADGE HERE.
                                                Unread count is only on bell.
                                            ================================= */}

                                            <button
                                                type="button"
                                                className="profile-menu-link-button"
                                                onClick={
                                                    openMessages
                                                }
                                            >

                                                <span className="profile-link-icon">

                                                    <span
                                                        aria-hidden="true"
                                                        className="profile-message-icon"
                                                    >
                                                        💬
                                                    </span>

                                                </span>


                                                <span>
                                                    Messages
                                                </span>

                                            </button>


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


                                            {/* ================================
                                                NOTIFICATIONS
                                            ================================= */}

                                            <button
                                                type="button"
                                                className="profile-menu-link-button"
                                                onClick={
                                                    openNotifications
                                                }
                                            >

                                                <FaBell />

                                                <span>
                                                    Notifications
                                                </span>

                                                {unreadNotifications > 0 && (

                                                    <span className="profile-notification-count">

                                                        {
                                                            notificationBadge
                                                        }

                                                    </span>

                                                )}

                                            </button>

                                        </div>


                                        {/* =================================================
                                            LOGOUT
                                        ================================================= */}

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
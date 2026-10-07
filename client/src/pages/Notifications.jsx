import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    io
} from "socket.io-client";

import api from "../config/axios";

import Layout from "../components/Layout";

import {
    FaBell,
    FaCheckCircle,
    FaTrash,
    FaSearch,
    FaComments,
    FaBoxOpen,
    FaUser,
    FaTimes
} from "react-icons/fa";

import "./Notifications.css";


/* =========================================================
   CONFIGURATION
========================================================= */

const IS_PRODUCTION =
    import.meta.env.PROD;


const normalizeUrl = (
    value
) => {

    if (!value) {
        return "";
    }

    return String(value)
        .trim()
        .replace(/\/+$/, "");
};


const API_SERVER =
    normalizeUrl(
        import.meta.env.VITE_API_SERVER ||
        import.meta.env.VITE_SERVER_URL ||
        (
            IS_PRODUCTION
                ? window.location.origin
                : "http://localhost:5000"
        )
    );


const SOCKET_URL =
    normalizeUrl(
        import.meta.env.VITE_SOCKET_URL ||
        API_SERVER
    );


const SOCKET_PATH =
    "/socket.io";


/* =========================================================
   USER HELPER
========================================================= */

const getStoredUser = () => {

    try {

        const storedUser =
            localStorage.getItem(
                "user"
            );

        if (!storedUser) {
            return null;
        }

        return JSON.parse(
            storedUser
        );

    } catch (error) {

        console.error(
            "[NOTIFICATIONS] USER PARSE ERROR:",
            error
        );

        return null;
    }
};


/* =========================================================
   NOTIFICATION TYPE HELPER
========================================================= */

const getNotificationType = (
    notification
) => {

    if (
        notification?.notificationType ===
        "Chat"
    ) {
        return "Chat";
    }

    if (
        notification?.type ===
        "Message"
    ) {
        return "Message";
    }

    return (
        notification?.notificationType ||
        notification?.type ||
        "System"
    );
};


/* =========================================================
   COMPONENT
========================================================= */

function Notifications() {

    const navigate =
        useNavigate();


    const socketRef =
        useRef(null);


    /* =====================================================
       USER
    ===================================================== */

    const [
        user,
        setUser
    ] = useState(
        () => getStoredUser()
    );


    /* =====================================================
       STATE
    ===================================================== */

    const [
        notifications,
        setNotifications
    ] = useState([]);


    const [
        chatNotifications,
        setChatNotifications
    ] = useState([]);


    const [
        search,
        setSearch
    ] = useState("");


    const [
        filter,
        setFilter
    ] = useState("All");


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        refreshing,
        setRefreshing
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    /* =====================================================
       REFRESH USER
    ===================================================== */

    useEffect(() => {

        const loadUser = () => {

            setUser(
                getStoredUser()
            );
        };


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
       LOAD SYSTEM NOTIFICATIONS
    ===================================================== */

    const loadSystemNotifications =
        useCallback(
            async () => {

                try {

                    const response =
                        await api.get(
                            "/notifications"
                        );


                    const data =
                        response.data?.notifications ||
                        response.data ||
                        [];


                    setNotifications(
                        Array.isArray(data)
                            ? data
                            : []
                    );

                } catch (error) {

                    console.error(
                        "[NOTIFICATIONS] SYSTEM LOAD ERROR:",
                        error.response?.data ||
                        error.message ||
                        error
                    );

                    /*
                     * Do not destroy existing data
                     * if this is only a temporary error.
                     */
                }
            },
            []
        );


    /* =====================================================
       LOAD CHAT NOTIFICATIONS
       
       Uses:
       GET /messages/conversations
    ===================================================== */

    const loadChatNotifications =
        useCallback(
            async () => {

                if (!user?.id) {

                    setChatNotifications(
                        []
                    );

                    return;
                }


                try {

                    const response =
                        await api.get(
                            "/messages/conversations"
                        );


                    const data =
                        response.data || {};


                    const conversations =
                        data.conversations ||
                        data.data ||
                        (
                            Array.isArray(data)
                                ? data
                                : []
                        );


                    if (
                        !Array.isArray(
                            conversations
                        )
                    ) {

                        setChatNotifications(
                            []
                        );

                        return;
                    }


                    const chats =
                        conversations
                            .filter(
                                conversation =>
                                    conversation &&
                                    (
                                        conversation.lastMessage ||
                                        conversation.last_message
                                    )
                            )
                            .map(
                                conversation => {

                                    const lastMessage =
                                        conversation.lastMessage ||
                                        conversation.last_message ||
                                        {};


                                    /*
                                     * Different versions of the
                                     * backend may call the other
                                     * participant "user", "seller",
                                     * "buyer", or "otherUser".
                                     */
                                    const otherUser =
                                        conversation.otherUser ||
                                        conversation.user ||
                                        conversation.otherParticipant ||
                                        (
                                            Number(
                                                conversation.buyerId
                                            ) ===
                                            Number(
                                                user.id
                                            )
                                                ? conversation.seller
                                                : conversation.buyer
                                        ) ||
                                        {};


                                    const product =
                                        conversation.product ||
                                        null;


                                    const unreadCount =
                                        Number(
                                            conversation.unreadCount ||
                                            0
                                        );


                                    const conversationId =
                                        conversation.id ||
                                        conversation.conversationId;


                                    const lastMessageText =
                                        lastMessage.message ||
                                        (
                                            lastMessage.type ===
                                            "image"
                                                ? "📷 Image"
                                                : lastMessage.type ===
                                                  "audio"
                                                    ? "🎤 Voice message"
                                                    : "You received a new message."
                                        );


                                    return {

                                        id:
                                            `chat-${conversationId}`,

                                        notificationType:
                                            "Chat",

                                        type:
                                            "Message",

                                        conversationId,

                                        title:
                                            otherUser.name ||
                                            otherUser.username ||
                                            "Marketplace User",

                                        message:
                                            lastMessageText,

                                        createdAt:
                                            lastMessage.createdAt ||
                                            lastMessage.created_at ||
                                            conversation.updatedAt ||
                                            conversation.updated_at,

                                        isRead:
                                            unreadCount ===
                                            0,

                                        unreadCount,

                                        sender:
                                            otherUser,

                                        product,

                                        originalConversation:
                                            conversation
                                    };
                                }
                            )
                            .filter(
                                item =>
                                    item.conversationId
                            );


                    setChatNotifications(
                        chats
                    );

                } catch (error) {

                    console.error(
                        "[NOTIFICATIONS] CHAT LOAD ERROR:",
                        error.response?.data ||
                        error.message ||
                        error
                    );

                    /*
                     * Keep current chat notifications
                     * during temporary failures.
                     */
                }
            },
            [user?.id]
        );


    /* =====================================================
       LOAD EVERYTHING
    ===================================================== */

    const loadAllNotifications =
        useCallback(
            async (
                showLoading = true
            ) => {

                if (!user?.id) {

                    setNotifications([]);
                    setChatNotifications([]);
                    setLoading(false);

                    return;
                }


                try {

                    if (showLoading) {
                        setLoading(true);
                    } else {
                        setRefreshing(true);
                    }


                    setError("");


                    await Promise.all([
                        loadSystemNotifications(),
                        loadChatNotifications()
                    ]);

                } catch (error) {

                    console.error(
                        "[NOTIFICATIONS] LOAD ERROR:",
                        error
                    );

                    setError(
                        "Unable to load notifications."
                    );

                } finally {

                    setLoading(false);
                    setRefreshing(false);
                }
            },
            [
                user?.id,
                loadSystemNotifications,
                loadChatNotifications
            ]
        );


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        loadAllNotifications(
            true
        );

    }, [
        loadAllNotifications
    ]);


    /* =====================================================
       REAL-TIME SOCKET
       
       Events:
       - new_message_notification
       - messages_read
    ===================================================== */

    useEffect(() => {

        const token =
            localStorage.getItem(
                "token"
            );


        if (
            !user?.id ||
            !token
        ) {

            if (
                socketRef.current
            ) {

                socketRef.current.disconnect();

                socketRef.current =
                    null;
            }

            return;
        }


        /*
         * Clean old socket first.
         */
        if (
            socketRef.current
        ) {

            socketRef.current.disconnect();

            socketRef.current =
                null;
        }


        const socket =
            io(
                SOCKET_URL,
                {
                    path:
                        SOCKET_PATH,

                    transports: [
                        "websocket",
                        "polling"
                    ],

                    withCredentials:
                        true,

                    autoConnect:
                        false,

                    reconnection:
                        true,

                    reconnectionAttempts:
                        Infinity,

                    reconnectionDelay:
                        1000,

                    reconnectionDelayMax:
                        5000,

                    timeout:
                        20000,

                    auth: {
                        token
                    }
                }
            );


        socketRef.current =
            socket;


        const handleConnect =
            () => {

                console.log(
                    "[NOTIFICATIONS SOCKET] CONNECTED:",
                    socket.id
                );
            };


        const handleConnectError =
            error => {

                console.error(
                    "[NOTIFICATIONS SOCKET] CONNECTION ERROR:",
                    error?.message ||
                    error
                );
            };


        const handleDisconnect =
            reason => {

                console.warn(
                    "[NOTIFICATIONS SOCKET] DISCONNECTED:",
                    reason
                );
            };


        /*
         * A new message has arrived.
         *
         * Reload conversations so that the page gets
         * the correct sender, message, product and
         * unread count from the backend.
         */
        const handleNewMessage =
            notification => {

                console.log(
                    "[NOTIFICATIONS SOCKET] NEW MESSAGE:",
                    notification
                );


                /*
                 * If the event already tells us the
                 * conversation, we can refresh immediately.
                 */
                loadChatNotifications();


                /*
                 * Also notify the Navbar if it is
                 * listening for this browser event.
                 */
                window.dispatchEvent(
                    new Event(
                        "messagesUpdated"
                    )
                );
            };


        /*
         * Someone opened the conversation and messages
         * became read.
         */
        const handleMessagesRead =
            data => {

                console.log(
                    "[NOTIFICATIONS SOCKET] MESSAGES READ:",
                    data
                );


                loadChatNotifications();


                window.dispatchEvent(
                    new Event(
                        "messagesUpdated"
                    )
                );
            };


        socket.on(
            "connect",
            handleConnect
        );


        socket.on(
            "connect_error",
            handleConnectError
        );


        socket.on(
            "disconnect",
            handleDisconnect
        );


        socket.on(
            "new_message_notification",
            handleNewMessage
        );


        socket.on(
            "messages_read",
            handleMessagesRead
        );


        socket.auth = {
            token
        };


        socket.connect();


        return () => {

            socket.off(
                "connect",
                handleConnect
            );


            socket.off(
                "connect_error",
                handleConnectError
            );


            socket.off(
                "disconnect",
                handleDisconnect
            );


            socket.off(
                "new_message_notification",
                handleNewMessage
            );


            socket.off(
                "messages_read",
                handleMessagesRead
            );


            socket.disconnect();


            if (
                socketRef.current ===
                socket
            ) {

                socketRef.current =
                    null;
            }
        };

    }, [
        user?.id,
        loadChatNotifications
    ]);


    /* =====================================================
       PERIODIC FALLBACK
    ===================================================== */

    useEffect(() => {

        if (!user?.id) {
            return;
        }


        const interval =
            window.setInterval(
                () => {

                    loadAllNotifications(
                        false
                    );

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
        loadAllNotifications
    ]);


    /* =====================================================
       REFRESH WHEN TAB BECOMES VISIBLE
    ===================================================== */

    useEffect(() => {

        const handleVisibility =
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    loadAllNotifications(
                        false
                    );
                }
            };


        document.addEventListener(
            "visibilitychange",
            handleVisibility
        );


        return () => {

            document.removeEventListener(
                "visibilitychange",
                handleVisibility
            );
        };

    }, [
        loadAllNotifications
    ]);


    /* =====================================================
       MARK SYSTEM NOTIFICATION READ
    ===================================================== */

    const markAsRead =
        async (
            id
        ) => {

            if (!id) {
                return;
            }


            try {

                await api.put(
                    `/notifications/read/${id}`
                );


                setNotifications(
                    previous =>
                        previous.map(
                            item =>
                                item.id === id
                                    ? {
                                        ...item,
                                        isRead:
                                            true
                                    }
                                    : item
                        )
                );


                window.dispatchEvent(
                    new Event(
                        "notificationsUpdated"
                    )
                );

            } catch (error) {

                console.error(
                    "[NOTIFICATIONS] MARK READ ERROR:",
                    error.response?.data ||
                    error.message ||
                    error
                );
            }
        };


    /* =====================================================
       DELETE SYSTEM NOTIFICATION
    ===================================================== */

    const deleteNotification =
        async (
            id
        ) => {

            if (!id) {
                return;
            }


            const confirmed =
                window.confirm(
                    "Delete notification?"
                );


            if (!confirmed) {
                return;
            }


            try {

                await api.delete(
                    `/notifications/${id}`
                );


                setNotifications(
                    previous =>
                        previous.filter(
                            item =>
                                item.id !== id
                        )
                );


            } catch (error) {

                console.error(
                    "[NOTIFICATIONS] DELETE ERROR:",
                    error.response?.data ||
                    error.message ||
                    error
                );
            }
        };


    /* =====================================================
       MARK ALL SYSTEM NOTIFICATIONS READ
       
       Chat messages are intentionally NOT blindly marked
       read here because the user should read the actual
       conversation. Opening the conversation handles that.
    ===================================================== */

    const markAllRead =
        async () => {

            try {

                await api.put(
                    "/notifications/read-all"
                );


                setNotifications(
                    previous =>
                        previous.map(
                            item => ({
                                ...item,
                                isRead:
                                    true
                            })
                        )
                );


                window.dispatchEvent(
                    new Event(
                        "notificationsUpdated"
                    )
                );


            } catch (error) {

                console.error(
                    "[NOTIFICATIONS] MARK ALL READ ERROR:",
                    error.response?.data ||
                    error.message ||
                    error
                );
            }
        };


    /* =====================================================
       OPEN CHAT
    ===================================================== */

    const openChat =
        conversationId => {

            if (!conversationId) {
                return;
            }


            navigate(
                `/chat/${conversationId}`
            );
        };


    /* =====================================================
       COMBINE NOTIFICATIONS
    ===================================================== */

    const combinedNotifications =
        useMemo(
            () => {

                const adminItems =
                    notifications.map(
                        item => ({
                            ...item,
                            notificationType:
                                getNotificationType(
                                    item
                                )
                        })
                    );


                return [
                    ...adminItems,
                    ...chatNotifications
                ].sort(
                    (
                        a,
                        b
                    ) => {

                        const dateA =
                            new Date(
                                a.createdAt ||
                                a.created_at ||
                                0
                            ).getTime();


                        const dateB =
                            new Date(
                                b.createdAt ||
                                b.created_at ||
                                0
                            ).getTime();


                        return dateB - dateA;
                    }
                );

            },
            [
                notifications,
                chatNotifications
            ]
        );


    /* =====================================================
       FILTER
    ===================================================== */

    const filtered =
        useMemo(
            () => {

                const searchValue =
                    search
                        .trim()
                        .toLowerCase();


                return combinedNotifications.filter(
                    item => {

                        const title =
                            String(
                                item.title ||
                                ""
                            ).toLowerCase();


                        const message =
                            String(
                                item.message ||
                                ""
                            ).toLowerCase();


                        const matchesSearch =
                            !searchValue ||
                            title.includes(
                                searchValue
                            ) ||
                            message.includes(
                                searchValue
                            );


                        let matchesFilter =
                            true;


                        if (
                            filter ===
                            "Message"
                        ) {

                            matchesFilter =
                                item.notificationType ===
                                "Chat" ||
                                item.type ===
                                "Message";

                        } else if (
                            filter !==
                            "All"
                        ) {

                            matchesFilter =
                                item.type ===
                                filter ||
                                item.notificationType ===
                                filter;
                        }


                        return (
                            matchesSearch &&
                            matchesFilter
                        );
                    }
                );

            },
            [
                combinedNotifications,
                search,
                filter
            ]
        );


    /* =====================================================
       UNREAD COUNTS
    ===================================================== */

    const unreadAdmin =
        notifications.filter(
            item =>
                !item.isRead
        ).length;


    const unreadMessages =
        chatNotifications.reduce(
            (
                total,
                chat
            ) =>
                total +
                Number(
                    chat.unreadCount ||
                    0
                ),
            0
        );


    const totalUnread =
        unreadAdmin +
        unreadMessages;


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate =
        date => {

            if (!date) {
                return "";
            }


            try {

                const parsed =
                    new Date(
                        date
                    );


                if (
                    Number.isNaN(
                        parsed.getTime()
                    )
                ) {

                    return "";
                }


                return parsed.toLocaleString(
                    undefined,
                    {
                        dateStyle:
                            "medium",
                        timeStyle:
                            "short"
                    }
                );

            } catch {

                return String(
                    date
                );
            }
        };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <Layout>

            <div className="notifications-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="notifications-header">

                    <div>

                        <h1>

                            <FaBell />

                            Notifications

                        </h1>


                        <p>

                            {totalUnread} unread notification
                            {totalUnread !== 1
                                ? "s"
                                : ""}

                        </p>

                    </div>


                    <div className="notifications-header-actions">

                        <button
                            type="button"
                            className="read-all-btn"
                            onClick={
                                markAllRead
                            }
                            disabled={
                                unreadAdmin === 0
                            }
                        >

                            <FaCheckCircle />

                            Mark All Read

                        </button>

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="notification-error">

                        <span>
                            {error}
                        </span>


                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            aria-label="Close"
                        >

                            <FaTimes />

                        </button>

                    </div>

                )}


                {/* =================================================
                    TOOLS
                ================================================= */}

                <div className="notification-tools">

                    <div className="search-box">

                        <FaSearch />

                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={search}
                            onChange={
                                event =>
                                    setSearch(
                                        event.target.value
                                    )
                            }
                        />

                        {search && (

                            <button
                                type="button"
                                className="clear-search"
                                onClick={() =>
                                    setSearch("")
                                }
                                aria-label="Clear search"
                            >

                                <FaTimes />

                            </button>

                        )}

                    </div>


                    <select
                        value={filter}
                        onChange={
                            event =>
                                setFilter(
                                    event.target.value
                                )
                        }
                    >

                        <option value="All">
                            All
                        </option>

                        <option value="Message">
                            Messages
                        </option>

                        <option value="Product">
                            Products
                        </option>

                        <option value="Store">
                            Store
                        </option>

                        <option value="Subscription">
                            Subscription
                        </option>

                        <option value="Admin">
                            Admin
                        </option>

                    </select>

                </div>


                {/* =================================================
                    REFRESHING INDICATOR
                ================================================= */}

                {refreshing && !loading && (

                    <div className="notification-refreshing">

                        Updating notifications...

                    </div>

                )}


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div className="empty">

                        <FaBell />

                        <h2>
                            Loading notifications...
                        </h2>

                    </div>

                )}


                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    filtered.length === 0 && (

                        <div className="empty">

                            <FaBell />

                            <h2>
                                No Notifications
                            </h2>

                            <p>
                                You're all caught up.
                            </p>

                        </div>
                    )}


                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                {!loading &&
                    filtered.length > 0 && (

                        <div className="notifications-list">

                            {filtered.map(
                                notification => {

                                    const isChat =
                                        notification.notificationType ===
                                        "Chat";


                                    const notificationId =
                                        notification.id;


                                    return (

                                        <div
                                            key={
                                                notificationId
                                            }
                                            className={[
                                                "notification-card",
                                                notification.isRead
                                                    ? ""
                                                    : "unread",
                                                isChat
                                                    ? "chat-notification"
                                                    : ""
                                            ]
                                                .filter(Boolean)
                                                .join(" ")}
                                            onClick={() => {

                                                if (
                                                    isChat
                                                ) {

                                                    openChat(
                                                        notification.conversationId
                                                    );
                                                }
                                            }}
                                            role={
                                                isChat
                                                    ? "button"
                                                    : undefined
                                            }
                                            tabIndex={
                                                isChat
                                                    ? 0
                                                    : undefined
                                            }
                                            onKeyDown={
                                                isChat
                                                    ? event => {

                                                        if (
                                                            event.key ===
                                                            "Enter" ||
                                                            event.key ===
                                                            " "
                                                        ) {

                                                            event.preventDefault();

                                                            openChat(
                                                                notification.conversationId
                                                            );
                                                        }
                                                    }
                                                    : undefined
                                            }
                                        >


                                            {/* ICON */}

                                            <div className="notification-icon">

                                                {isChat ? (

                                                    <FaComments />

                                                ) : (

                                                    <FaBell />

                                                )}

                                            </div>


                                            {/* CONTENT */}

                                            <div className="notification-content">

                                                <div className="notification-title-row">

                                                    <h3>

                                                        {isChat && (

                                                            <FaComments
                                                                className="chat-title-icon"
                                                            />

                                                        )}

                                                        {
                                                            notification.title ||
                                                            "Notification"
                                                        }

                                                    </h3>


                                                    {isChat &&
                                                        notification.unreadCount >
                                                        0 && (

                                                            <span className="message-count-badge">

                                                                {
                                                                    notification.unreadCount
                                                                }

                                                            </span>

                                                        )}

                                                </div>


                                                {isChat &&
                                                    notification.sender &&
                                                    !notification.product && (

                                                        <div className="notification-sender">

                                                            <FaUser />

                                                            <span>
                                                                Message from{" "}
                                                                {
                                                                    notification
                                                                        .sender
                                                                        .name ||
                                                                    notification
                                                                        .sender
                                                                        .username ||
                                                                    "Marketplace User"
                                                                }
                                                            </span>

                                                        </div>

                                                    )}


                                                {notification.product && (

                                                    <div className="notification-product">

                                                        <FaBoxOpen />

                                                        <span>

                                                            {
                                                                notification
                                                                    .product
                                                                    .title ||
                                                                notification
                                                                    .product
                                                                    .name ||
                                                                "Marketplace item"
                                                            }

                                                        </span>

                                                    </div>

                                                )}


                                                <p>

                                                    {
                                                        notification.message ||
                                                        "You received a notification."
                                                    }

                                                </p>


                                                <small>

                                                    {
                                                        formatDate(
                                                            notification.createdAt ||
                                                            notification.created_at
                                                        )
                                                    }

                                                </small>


                                                {isChat && (

                                                    <span className="open-chat-text">

                                                        Click to open conversation →

                                                    </span>

                                                )}

                                            </div>


                                            {/* ACTIONS */}

                                            <div
                                                className="notification-actions"
                                                onClick={
                                                    event =>
                                                        event.stopPropagation()
                                                }
                                            >

                                                {!isChat &&
                                                    !notification.isRead && (

                                                        <button
                                                            type="button"
                                                            title="Mark as read"
                                                            onClick={() =>
                                                                markAsRead(
                                                                    notification.id
                                                                )
                                                            }
                                                        >

                                                            <FaCheckCircle />

                                                        </button>

                                                    )}


                                                {!isChat && (

                                                    <button
                                                        type="button"
                                                        title="Delete"
                                                        onClick={() =>
                                                            deleteNotification(
                                                                notification.id
                                                            )
                                                        }
                                                    >

                                                        <FaTrash />

                                                    </button>

                                                )}

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

            </div>

        </Layout>
    );
}


export default Notifications;
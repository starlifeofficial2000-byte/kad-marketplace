import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import api from "../config/axios";

import {
    FaSearch,
    FaComments
} from "react-icons/fa";

import "./Inbox.css";

/* =========================================================
   SERVER CONFIGURATION
========================================================= */

const API_SERVER = (
    import.meta.env.VITE_API_URL ||
    "https://api.kadmarket.com"
).replace(/\/+$/, "");

const SOCKET_URL = API_SERVER;

const SOCKET_PATH = "/socket.io";

/* =========================================================
   IMAGE CONFIGURATION
========================================================= */

const CDN_URL = (
    import.meta.env.VITE_R2_PUBLIC_URL ||
    "https://cdn.kadmarket.com"
).replace(/\/+$/, "");

const FALLBACK_IMAGE = "/images/product-placeholder.png";

/* =========================================================
   SAFE USER
========================================================= */

function getStoredUser() {
    try {
        const stored = localStorage.getItem("user");

        if (!stored) {
            return null;
        }

        const parsed = JSON.parse(stored);

        return parsed && typeof parsed === "object"
            ? parsed
            : null;
    } catch (error) {
        console.error(
            "INBOX USER PARSE ERROR:",
            error
        );

        return null;
    }
}

/* =========================================================
   INBOX
========================================================= */

function Inbox() {
    const navigate = useNavigate();

    const socketRef = useRef(null);
    const mountedRef = useRef(true);

    const [conversations, setConversations] =
        useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [socketConnected, setSocketConnected] =
        useState(false);

    /* =====================================================
       RESOLVE PRODUCT IMAGE URL
    ===================================================== */

    const getImageUrl = useCallback(
        (imagePath) => {
            if (
                !imagePath ||
                typeof imagePath !== "string"
            ) {
                return FALLBACK_IMAGE;
            }

            let cleanPath = imagePath.trim();

            if (!cleanPath) {
                return FALLBACK_IMAGE;
            }

            /*
             * Remove escaped slashes and quotes.
             */

            cleanPath = cleanPath
                .replace(/\\/g, "/")
                .replace(/^["']|["']$/g, "")
                .trim();

            if (!cleanPath) {
                return FALLBACK_IMAGE;
            }

            /*
             * Already a complete URL.
             */

            if (/^https?:\/\//i.test(cleanPath)) {
                return cleanPath;
            }

            /*
             * Remove leading slash.
             */

            const normalizedPath =
                cleanPath.replace(/^\/+/, "");

            /*
             * R2 key already contains uploads/.
             */

            if (
                normalizedPath
                    .toLowerCase()
                    .startsWith("uploads/")
            ) {
                return `${CDN_URL}/${normalizedPath}`;
            }

            /*
             * Preserve existing folders.
             */

            if (
                normalizedPath.includes("/") &&
                !normalizedPath.startsWith(".")
            ) {
                return `${CDN_URL}/${normalizedPath}`;
            }

            /*
             * Plain filename.
             */

            return `${CDN_URL}/uploads/${normalizedPath}`;
        },
        []
    );

    /* =====================================================
       PARSE PRODUCT IMAGES
    ===================================================== */

    const parseProductImages = useCallback(
        (productImages) => {
            if (!productImages) {
                return [];
            }

            /*
             * Already an array.
             */

            if (Array.isArray(productImages)) {
                return productImages
                    .filter(
                        (image) =>
                            typeof image === "string" &&
                            image.trim()
                    )
                    .map((image) =>
                        image.trim()
                    );
            }

            /*
             * String value.
             */

            if (typeof productImages === "string") {
                const cleanValue =
                    productImages.trim();

                if (!cleanValue) {
                    return [];
                }

                /*
                 * Try JSON first.
                 */

                try {
                    const parsed =
                        JSON.parse(cleanValue);

                    if (Array.isArray(parsed)) {
                        return parsed
                            .filter(
                                (image) =>
                                    typeof image ===
                                        "string" &&
                                    image.trim()
                            )
                            .map((image) =>
                                image.trim()
                            );
                    }

                    /*
                     * JSON string containing
                     * one image.
                     */

                    if (
                        typeof parsed ===
                            "string" &&
                        parsed.trim()
                    ) {
                        return [
                            parsed.trim()
                        ];
                    }
                } catch {
                    /*
                     * Not JSON.
                     */
                }

                /*
                 * Support comma-separated
                 * legacy values.
                 */

                if (
                    cleanValue.includes(",") &&
                    !cleanValue.includes("http")
                ) {
                    const commaImages =
                        cleanValue
                            .split(",")
                            .map((image) =>
                                image.trim()
                            )
                            .filter(Boolean);

                    if (
                        commaImages.length > 0
                    ) {
                        return commaImages;
                    }
                }

                return [cleanValue];
            }

            return [];
        },
        []
    );

    /* =====================================================
       GET PRODUCT IMAGE
    ===================================================== */

    const getProductImage = useCallback(
        (conversation) => {
            const product =
                conversation?.product;

            if (!product) {
                return FALLBACK_IMAGE;
            }

            let productImages =
                product.images;

            if (!productImages) {
                productImages =
                    product.imageUrl;
            }

            if (!productImages) {
                productImages =
                    product.image;
            }

            const images =
                parseProductImages(
                    productImages
                );

            if (
                !Array.isArray(images) ||
                images.length === 0
            ) {
                return FALLBACK_IMAGE;
            }

            const firstImage =
                images.find(
                    (image) =>
                        typeof image ===
                            "string" &&
                        image.trim()
                );

            if (!firstImage) {
                return FALLBACK_IMAGE;
            }

            return getImageUrl(firstImage);
        },
        [
            getImageUrl,
            parseProductImages
        ]
    );

    /* =====================================================
       LOAD CONVERSATIONS
    ===================================================== */

    const loadConversations =
        useCallback(
            async ({
                silent = false
            } = {}) => {
                try {
                    if (!silent) {
                        setLoading(true);
                    }

                    setError("");

                    const response =
                        await api.get(
                            "/messages/conversations"
                        );

                    const data =
                        response.data
                            ?.conversations ??
                        response.data
                            ?.messages ??
                        response.data
                            ?.data ??
                        [];

                    const conversationArray =
                        Array.isArray(data)
                            ? data
                            : [];

                    if (!mountedRef.current) {
                        return;
                    }

                    setConversations(
                        conversationArray
                    );

                    setError("");
                } catch (requestError) {
                    console.error(
                        "LOAD CONVERSATIONS ERROR:",
                        requestError.response
                            ?.data ||
                            requestError.message
                    );

                    if (!mountedRef.current) {
                        return;
                    }

                    /*
                     * Do not replace working
                     * conversations with an error
                     * during a silent refresh.
                     */

                    if (!silent) {
                        setError(
                            requestError.response
                                ?.data
                                ?.message ||
                                "Unable to load conversations."
                        );
                    }
                } finally {
                    if (
                        mountedRef.current &&
                        !silent
                    ) {
                        setLoading(false);
                    }
                }
            },
            []
        );

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        mountedRef.current = true;

        const storedUser =
            getStoredUser();

        if (!storedUser) {
            navigate("/login");
            return;
        }

        loadConversations();

        return () => {
            mountedRef.current = false;
        };
    }, [
        navigate,
        loadConversations
    ]);

    /* =====================================================
       SOCKET.IO REAL-TIME CONNECTION
    ===================================================== */

    useEffect(() => {
        const storedUser =
            getStoredUser();

        const token =
            localStorage.getItem("token");

        if (!storedUser || !token) {
            return undefined;
        }

        /*
         * Create authenticated socket.
         */

        const socket = io(
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

                reconnectionDelay: 1000,

                reconnectionDelayMax:
                    10000,

                timeout: 45000,

                auth: {
                    token
                }
            }
        );

        socketRef.current = socket;

        /* =================================================
           CONNECT
        ================================================= */

        const handleConnect = () => {
            console.log(
                "INBOX SOCKET CONNECTED:",
                socket.id
            );

            if (mountedRef.current) {
                setSocketConnected(true);
            }

            /*
             * Refresh immediately after
             * connecting to ensure we have
             * the latest conversation state.
             */

            loadConversations({
                silent: true
            });
        };

        /* =================================================
           DISCONNECT
        ================================================= */

        const handleDisconnect = (
            reason
        ) => {
            console.log(
                "INBOX SOCKET DISCONNECTED:",
                reason
            );

            if (mountedRef.current) {
                setSocketConnected(false);
            }
        };

        /* =================================================
           SOCKET ERROR
        ================================================= */

        const handleConnectError = (
            socketError
        ) => {
            console.error(
                "INBOX SOCKET ERROR:",
                socketError?.message ||
                    socketError
            );

            if (mountedRef.current) {
                setSocketConnected(false);
            }
        };

        /* =================================================
           NEW MESSAGE
        ================================================= */

        const handleNewMessage = (
            notification
        ) => {
            console.log(
                "INBOX NEW MESSAGE:",
                notification
            );

            /*
             * Reload conversations immediately.
             *
             * This updates:
             * - last message
             * - updatedAt
             * - unreadCount
             * - product information
             * - conversation ordering
             */

            loadConversations({
                silent: true
            });

            /*
             * Notify Navbar / Notifications.
             */

            window.dispatchEvent(
                new CustomEvent(
                    "messagesUpdated",
                    {
                        detail:
                            notification
                    }
                )
            );
        };

        /* =================================================
           MESSAGES READ
        ================================================= */

        const handleMessagesRead = (
            payload
        ) => {
            console.log(
                "INBOX MESSAGES READ:",
                payload
            );

            /*
             * Refresh because backend has
             * recalculated unreadCount.
             */

            loadConversations({
                silent: true
            });

            window.dispatchEvent(
                new CustomEvent(
                    "messagesUpdated",
                    {
                        detail: payload
                    }
                )
            );
        };

        /* =================================================
           LISTENERS
        ================================================= */

        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "disconnect",
            handleDisconnect
        );

        socket.on(
            "connect_error",
            handleConnectError
        );

        socket.on(
            "new_message_notification",
            handleNewMessage
        );

        socket.on(
            "messages_read",
            handleMessagesRead
        );

        /*
         * Connect.
         */

        socket.connect();

        /* =================================================
           CLEANUP
        ================================================= */

        return () => {
            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "disconnect",
                handleDisconnect
            );

            socket.off(
                "connect_error",
                handleConnectError
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
                socketRef.current = null;
            }
        };
    }, [
        loadConversations
    ]);

    /* =====================================================
       FALLBACK AUTO REFRESH
    ===================================================== */

    useEffect(() => {
        const interval =
            setInterval(() => {
                loadConversations({
                    silent: true
                });
            }, 30000);

        return () => {
            clearInterval(interval);
        };
    }, [
        loadConversations
    ]);

    /* =====================================================
       REFRESH WHEN PAGE BECOMES VISIBLE
    ===================================================== */

    useEffect(() => {
        const handleVisibility =
            () => {
                if (
                    document.visibilityState ===
                    "visible"
                ) {
                    loadConversations({
                        silent: true
                    });
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
        loadConversations
    ]);

    /* =====================================================
       REFRESH WHEN WINDOW GETS FOCUS
    ===================================================== */

    useEffect(() => {
        const handleFocus = () => {
            loadConversations({
                silent: true
            });
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
        loadConversations
    ]);

    /* =====================================================
       SEARCH
    ===================================================== */

    const filtered =
        useMemo(() => {
            const searchText =
                search
                    .trim()
                    .toLowerCase();

            if (!searchText) {
                return conversations;
            }

            return conversations.filter(
                (item) => {
                    const productTitle =
                        item?.product?.title
                            ?.toLowerCase() ||
                        item?.product?.name
                            ?.toLowerCase() ||
                        "";

                    const lastMessage =
                        item?.lastMessage
                            ?.toLowerCase() ||
                        "";

                    const messageText =
                        item?.message
                            ?.toLowerCase() ||
                        "";

                    const otherUserName =
                        item?.otherUser?.name
                            ?.toLowerCase() ||
                        item?.user?.name
                            ?.toLowerCase() ||
                        "";

                    return (
                        productTitle.includes(
                            searchText
                        ) ||
                        lastMessage.includes(
                            searchText
                        ) ||
                        messageText.includes(
                            searchText
                        ) ||
                        otherUserName.includes(
                            searchText
                        )
                    );
                }
            );
        }, [
            conversations,
            search
        ]);

    /* =====================================================
       OPEN CHAT
    ===================================================== */

    const openConversation = (
        conversation
    ) => {
        const conversationId =
            conversation?.id ||
            conversation?._id;

        if (!conversationId) {
            console.error(
                "CONVERSATION HAS NO ID:",
                conversation
            );

            return;
        }

        navigate(
            `/chat/${conversationId}`
        );
    };

    /* =====================================================
       IMAGE ERROR HANDLER
    ===================================================== */

    const handleImageError = (
        event,
        conversation
    ) => {
        const image =
            event.currentTarget;

        console.error(
            "INBOX PRODUCT IMAGE FAILED:",
            {
                productId:
                    conversation?.product
                        ?.id,

                attemptedUrl:
                    image?.src
            }
        );

        /*
         * Prevent infinite fallback loop.
         */

        if (
            image.dataset.fallback ===
            "true"
        ) {
            return;
        }

        image.dataset.fallback =
            "true";

        image.src =
            FALLBACK_IMAGE;
    };

    /* =====================================================
       KEYBOARD ACCESS
    ===================================================== */

    const handleConversationKeyDown = (
        event,
        conversation
    ) => {
        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();

            openConversation(
                conversation
            );
        }
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="inbox-page">
                <div className="empty-chat">
                    <p>
                        Loading conversations...
                    </p>
                </div>
            </div>
        );
    }

    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="inbox-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="inbox-header">

                <h1>
                    <FaComments />
                    Messages
                </h1>

                {/*
                 * Socket status is intentionally
                 * subtle so it does not disturb
                 * the existing design.
                 */}

                <span
                    className={
                        socketConnected
                            ? "socket-status connected"
                            : "socket-status disconnected"
                    }
                    title={
                        socketConnected
                            ? "Real-time messaging connected"
                            : "Real-time connection unavailable"
                    }
                >
                    {socketConnected
                        ? "Live"
                        : "Offline"}
                </span>

            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="search-bar">

                <FaSearch />

                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                />

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="empty-chat">

                    <FaComments />

                    <h2>
                        Unable to Load Messages
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true);

                            loadConversations();
                        }}
                    >
                        Try Again
                    </button>

                </div>
            )}

            {/* =================================================
                EMPTY
            ================================================= */}

            {!error &&
                filtered.length === 0 && (
                    <div className="empty-chat">

                        <FaComments />

                        <h2>
                            No Conversations
                        </h2>

                        <p>
                            Conversations will
                            appear here.
                        </p>

                    </div>
                )}

            {/* =================================================
                CONVERSATIONS
            ================================================= */}

            {!error &&
                filtered.length > 0 &&
                filtered.map(
                    (conversation) => {
                        const conversationId =
                            conversation?.id ||
                            conversation?._id;

                        const product =
                            conversation?.product;

                        const productTitle =
                            product?.title ||
                            product?.name ||
                            "Product Conversation";

                        const lastMessage =
                            conversation?.lastMessage ||
                            conversation?.message ||
                            "Start chatting...";

                        const productPrice =
                            product?.price;

                        const productImage =
                            getProductImage(
                                conversation
                            );

                        const unreadCount =
                            Number(
                                conversation
                                    ?.unreadCount ||
                                0
                            );

                        return (
                            <div
                                key={
                                    conversationId
                                }

                                className={
                                    unreadCount > 0
                                        ? "conversation unread"
                                        : "conversation"
                                }

                                onClick={() =>
                                    openConversation(
                                        conversation
                                    )
                                }

                                onKeyDown={(
                                    event
                                ) =>
                                    handleConversationKeyDown(
                                        event,
                                        conversation
                                    )
                                }

                                role="button"

                                tabIndex={0}

                            >

                                {/* =================================
                                    PRODUCT IMAGE
                                ================================= */}

                                <div className="conversation-image-wrapper">

                                    <img
                                        src={
                                            productImage
                                        }

                                        alt={
                                            productTitle
                                        }

                                        loading="lazy"

                                        onError={(
                                            event
                                        ) =>
                                            handleImageError(
                                                event,
                                                conversation
                                            )
                                        }
                                    />

                                </div>

                                {/* =================================
                                    CONVERSATION INFO
                                ================================= */}

                                <div className="conversation-info">

                                    <h2>
                                        {
                                            productTitle
                                        }
                                    </h2>

                                    <p>
                                        {
                                            lastMessage
                                        }
                                    </p>

                                    <small>
                                        GH₵{" "}
                                        {
                                            productPrice ??
                                            "0"
                                        }
                                    </small>

                                </div>

                                {/* =================================
                                    RIGHT SIDE
                                ================================= */}

                                <div className="conversation-right">

                                    <span>
                                        {
                                            conversation
                                                ?.updatedAt
                                                ? new Date(
                                                    conversation.updatedAt
                                                ).toLocaleDateString()
                                                : ""
                                        }
                                    </span>

                                    {unreadCount >
                                        0 && (
                                        <div className="badge">
                                            {
                                                unreadCount >
                                                99
                                                    ? "99+"
                                                    : unreadCount
                                            }
                                        </div>
                                    )}

                                </div>

                            </div>
                        );
                    }
                )}

        </div>
    );
}

export default Inbox;
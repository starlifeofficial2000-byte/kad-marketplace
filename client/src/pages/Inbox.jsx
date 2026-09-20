import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../config/axios";

import {
    FaSearch,
    FaComments
} from "react-icons/fa";

import "./Inbox.css";


const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "https://kad-marketplace-production.up.railway.app";


function Inbox() {

    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* =====================================================
       GET IMAGE URL
    ===================================================== */

    const getImageUrl = useCallback((imagePath) => {

        if (
            !imagePath ||
            typeof imagePath !== "string"
        ) {
            return "/images/product-placeholder.png";
        }


        const cleanPath =
            imagePath.trim();


        if (!cleanPath) {
            return "/images/product-placeholder.png";
        }


        // Already a complete URL
        if (
            cleanPath.startsWith("http://") ||
            cleanPath.startsWith("https://")
        ) {
            return cleanPath;
        }


        // /uploads/image.jpg
        if (
            cleanPath.startsWith("/uploads/")
        ) {
            return `${SERVER_URL}${cleanPath}`;
        }


        // uploads/image.jpg
        if (
            cleanPath.startsWith("uploads/")
        ) {
            return `${SERVER_URL}/${cleanPath}`;
        }


        // Any other absolute path
        if (
            cleanPath.startsWith("/")
        ) {
            return `${SERVER_URL}${cleanPath}`;
        }


        // Plain filename
        return `${SERVER_URL}/uploads/${cleanPath}`;

    }, []);


    /* =====================================================
       GET PRODUCT IMAGE
    ===================================================== */

    const getProductImage = useCallback(
        (conversation) => {

            const productImages =
                conversation?.product?.images;


            if (!productImages) {

                return "/images/product-placeholder.png";

            }


            let images = [];


            try {

                if (
                    Array.isArray(productImages)
                ) {

                    images = productImages;

                } else if (
                    typeof productImages === "string"
                ) {

                    images =
                        JSON.parse(productImages);

                }

            } catch (parseError) {

                console.error(
                    "PRODUCT IMAGE PARSE ERROR:",
                    parseError
                );

                images = [];

            }


            if (
                !Array.isArray(images) ||
                images.length === 0
            ) {

                return "/images/product-placeholder.png";

            }


            return getImageUrl(images[0]);

        },
        [getImageUrl]
    );


    /* =====================================================
       LOAD CONVERSATIONS
    ===================================================== */

    const loadConversations = useCallback(
        async () => {

            try {

                const response =
                    await api.get(
                        "/messages/conversations"
                    );


                console.log(
                    "CONVERSATIONS RESPONSE:",
                    response.data
                );


                /*
                 * Backend may return:
                 *
                 * {
                 *   success: true,
                 *   conversations: [...]
                 * }
                 *
                 * OR
                 *
                 * {
                 *   success: true,
                 *   messages: [...]
                 * }
                 *
                 * OR
                 *
                 * {
                 *   success: true,
                 *   data: [...]
                 * }
                 */


                const data =
                    response.data?.conversations ??
                    response.data?.messages ??
                    response.data?.data ??
                    [];


                const conversationArray =
                    Array.isArray(data)
                        ? data
                        : [];


                console.log(
                    "CONVERSATIONS ARRAY:",
                    conversationArray
                );


                setConversations(
                    conversationArray
                );


                setError("");

            } catch (requestError) {

                console.error(
                    "LOAD CONVERSATIONS ERROR:",
                    requestError.response?.data ||
                    requestError.message
                );


                setError(
                    requestError.response?.data?.message ||
                    "Unable to load conversations."
                );

            } finally {

                setLoading(false);

            }

        },
        []
    );


    /* =====================================================
       AUTH + INITIAL LOAD + REFRESH
    ===================================================== */

    useEffect(() => {

        const storedUser =
            localStorage.getItem("user");


        if (!storedUser) {

            navigate("/login");

            return;

        }


        loadConversations();


        /*
         * Refresh every 30 seconds.
         *
         * We use 30 seconds instead of 10 seconds
         * to reduce unnecessary API requests.
         */

        const interval =
            setInterval(() => {

                loadConversations();

            }, 30000);


        return () => {

            clearInterval(interval);

        };

    }, [
        navigate,
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
                            ?.toLowerCase() || "";


                    const lastMessage =
                        item?.lastMessage
                            ?.toLowerCase() || "";


                    const messageText =
                        item?.message
                            ?.toLowerCase() || "";


                    return (
                        productTitle.includes(
                            searchText
                        ) ||
                        lastMessage.includes(
                            searchText
                        ) ||
                        messageText.includes(
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

            {/* HEADER */}

            <div className="inbox-header">

                <h1>

                    <FaComments />

                    Messages

                </h1>

            </div>


            {/* SEARCH */}

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


            {/* ERROR */}

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


            {/* EMPTY */}

            {!error &&
                filtered.length === 0 && (

                    <div className="empty-chat">

                        <FaComments />

                        <h2>
                            No Conversations
                        </h2>

                        <p>
                            Conversations will appear here.
                        </p>

                    </div>

                )}


            {/* CONVERSATIONS */}

            {!error &&
                filtered.length > 0 &&
                filtered.map(
                    (conversation) => {

                        const conversationId =
                            conversation?.id ||
                            conversation?._id;


                        const productTitle =
                            conversation?.product?.title ||
                            "Product Conversation";


                        const lastMessage =
                            conversation?.lastMessage ||
                            conversation?.message ||
                            "Start chatting...";


                        const productPrice =
                            conversation?.product?.price;


                        const productImage =
                            getProductImage(
                                conversation
                            );


                        return (

                            <div
                                key={
                                    conversationId
                                }
                                className="conversation"
                                onClick={() =>
                                    openConversation(
                                        conversation
                                    )
                                }
                            >

                                {/* PRODUCT IMAGE */}

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
                                    ) => {

                                        console.error(
                                            "INBOX PRODUCT IMAGE FAILED:",
                                            event
                                                .currentTarget
                                                .src
                                        );


                                        if (
                                            event
                                                .currentTarget
                                                .dataset
                                                .fallback
                                        ) {

                                            return;

                                        }


                                        event
                                            .currentTarget
                                            .dataset
                                            .fallback =
                                            "true";


                                        event
                                            .currentTarget
                                            .src =
                                            "/images/product-placeholder.png";

                                    }}
                                />


                                {/* CONVERSATION INFO */}

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


                                {/* RIGHT SIDE */}

                                <div className="conversation-right">

                                    <span>

                                        {
                                            conversation?.updatedAt
                                                ? new Date(
                                                    conversation.updatedAt
                                                ).toLocaleDateString()
                                                : ""
                                        }

                                    </span>


                                    {
                                        Number(
                                            conversation?.unreadCount ||
                                            0
                                        ) > 0 && (

                                            <div className="badge">

                                                {
                                                    conversation.unreadCount
                                                }

                                            </div>

                                        )
                                    }

                                </div>

                            </div>

                        );

                    }
                )}

        </div>

    );

}


export default Inbox;
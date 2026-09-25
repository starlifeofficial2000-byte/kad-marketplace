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

/* =========================================================
   IMAGE CONFIGURATION
========================================================= */

const CDN_URL = (
    import.meta.env.VITE_R2_PUBLIC_URL ||
    "https://cdn.kadmarket.com"
).replace(/\/+$/, "");

const FALLBACK_IMAGE = "/images/product-placeholder.png";

/* =========================================================
   INBOX
========================================================= */

function Inbox() {
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* =====================================================
       RESOLVE PRODUCT IMAGE URL
    ===================================================== */

    const getImageUrl = useCallback((imagePath) => {
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
         * Some database values may contain escaped
         * backslashes or quotes.
         */
        cleanPath = cleanPath
            .replace(/\\/g, "/")
            .replace(/^["']|["']$/g, "")
            .trim();

        if (!cleanPath) {
            return FALLBACK_IMAGE;
        }

        /*
         * Already a complete public URL.
         *
         * Example:
         * https://cdn.kadmarket.com/uploads/image.jpg
         */
        if (/^https?:\/\//i.test(cleanPath)) {
            return cleanPath;
        }

        /*
         * Remove leading slash.
         *
         * /uploads/image.jpg
         * becomes:
         * uploads/image.jpg
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
         * Handle values such as:
         *
         * product/image.jpg
         * products/image.jpg
         * images/image.jpg
         *
         * If the database already contains a folder,
         * preserve it rather than adding another folder.
         */
        if (
            normalizedPath.includes("/") &&
            !normalizedPath.startsWith(".")
        ) {
            return `${CDN_URL}/${normalizedPath}`;
        }

        /*
         * Plain filename.
         *
         * image.jpg
         *
         * becomes:
         *
         * https://cdn.kadmarket.com/uploads/image.jpg
         */
        return `${CDN_URL}/uploads/${normalizedPath}`;
    }, []);

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
                    .map((image) => image.trim());
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
                 *
                 * Example:
                 * ["image1.jpg","image2.jpg"]
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
                     *
                     * Treat it as a normal
                     * filename/key.
                     */
                }

                /*
                 * Support comma-separated legacy
                 * values as well.
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

                    if (commaImages.length > 0) {
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
            /*
             * Product can come from:
             *
             * conversation.product
             */
            const product =
                conversation?.product;

            if (!product) {
                return FALLBACK_IMAGE;
            }

            /*
             * Normal product image field.
             */
            let productImages =
                product.images;

            /*
             * Some backend responses may expose
             * a single image through imageUrl.
             */
            if (!productImages) {
                productImages =
                    product.imageUrl;
            }

            /*
             * Some older records may use `image`.
             */
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

            /*
             * Find the first valid image.
             */
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

            const resolvedUrl =
                getImageUrl(firstImage);

            console.log(
                "INBOX PRODUCT IMAGE:",
                {
                    productId:
                        product?.id,
                    rawImages:
                        productImages,
                    parsedImages:
                        images,
                    firstImage,
                    resolvedUrl
                }
            );

            return resolvedUrl;
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
        useCallback(async () => {
            try {
                setError("");

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
                 * OR:
                 *
                 * {
                 *   success: true,
                 *   messages: [...]
                 * }
                 *
                 * OR:
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
                    requestError.response?.data
                        ?.message ||
                        "Unable to load conversations."
                );
            } finally {
                setLoading(false);
            }
        }, []);

    /* =====================================================
       AUTH + INITIAL LOAD + AUTO REFRESH
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
         * Refresh conversations every 30 seconds.
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
                    conversation?.product?.id,
                attemptedUrl:
                    image?.src
            }
        );

        /*
         * Prevent an infinite fallback loop.
         */
        if (
            image.dataset.fallback ===
            "true"
        ) {
            return;
        }

        image.dataset.fallback =
            "true";

        image.src = FALLBACK_IMAGE;
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

                        /*
                         * IMPORTANT:
                         * Product image now comes
                         * from R2/CDN.
                         */
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
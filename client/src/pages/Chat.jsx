import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import { io } from "socket.io-client";

import api from "../config/axios";

import {
    FaPaperPlane,
    FaImage,
    FaMicrophone,
    FaStop,
    FaTimes
} from "react-icons/fa";

import "./Chat.css";


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


/*
 * IMPORTANT:
 *
 * Your production R2 public URL is:
 *
 * https://cdn.kadmarket.com
 *
 * We keep the environment variable first,
 * but also provide the production fallback.
 */
const R2_PUBLIC_URL = normalizeUrl(
    import.meta.env.VITE_R2_PUBLIC_URL ||
    "https://cdn.kadmarket.com"
);


const SOCKET_PATH = "/socket.io";


const FALLBACK_PRODUCT_IMAGE =
    "/images/product-placeholder.png";


const FALLBACK_PROFILE_IMAGE =
    "/images/default-avatar.png";


/* =========================================================
   SOCKET
========================================================= */

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
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
    }
);


/* =========================================================
   MEDIA URL HELPERS
========================================================= */

const resolveMediaUrl = (
    value,
    legacyFolder = ""
) => {

    if (!value) {
        return "";
    }


    /*
     * Backend may return an object.
     */
    if (
        typeof value === "object" &&
        !Array.isArray(value)
    ) {
        value =
            value.url ||
            value.location ||
            value.src ||
            value.path ||
            value.key ||
            value.r2Key ||
            value.filename ||
            "";
    }


    if (!value) {
        return "";
    }


    const raw =
        String(value).trim();


    if (!raw) {
        return "";
    }


    /*
     * Already a URL.
     */
    if (
        raw.startsWith("http://") ||
        raw.startsWith("https://") ||
        raw.startsWith("data:") ||
        raw.startsWith("blob:")
    ) {
        return raw;
    }


    /*
     * Frontend static assets.
     */
    if (
        raw.startsWith("/images/") ||
        raw.startsWith("/assets/") ||
        raw.startsWith("/src/")
    ) {
        return raw;
    }


    const normalized =
        raw
            .replace(/\\/g, "/")
            .replace(/^\/+/, "");


    /*
     * R2 object keys.
     *
     * Current upload middleware creates keys such as:
     *
     * uploads/123456-image.jpg
     *
     * Therefore uploads/ must go through R2.
     */
    if (
        R2_PUBLIC_URL &&
        (
            normalized.startsWith("uploads/") ||
            normalized.startsWith("products/") ||
            normalized.startsWith("profiles/") ||
            normalized.startsWith("stores/") ||
            normalized.startsWith("chat/")
        )
    ) {
        return `${R2_PUBLIC_URL}/${normalized}`;
    }


    /*
     * Legacy /uploads/... path.
     */
    if (
        raw.startsWith("/uploads/")
    ) {
        return `${API_SERVER}${raw}`;
    }


    /*
     * Legacy uploads/... path when R2 is unavailable.
     */
    if (
        normalized.startsWith("uploads/")
    ) {
        return `${API_SERVER}/${normalized}`;
    }


    /*
     * Very old database records may contain
     * only a filename.
     */
    if (
        legacyFolder &&
        !normalized.includes("/")
    ) {
        return (
            `${API_SERVER}/uploads/` +
            `${legacyFolder}/${normalized}`
        );
    }


    return raw;
};


/* =========================================================
   PRODUCT IMAGE
========================================================= */

const getProductImageUrl = (
    image
) => {

    const url =
        resolveMediaUrl(image);

    return (
        url ||
        FALLBACK_PRODUCT_IMAGE
    );
};


/* =========================================================
   PROFILE IMAGE
========================================================= */

const getProfileImageUrl = (
    image
) => {

    if (!image) {
        return FALLBACK_PROFILE_IMAGE;
    }


    /*
     * Some APIs may return:
     *
     * {
     *   url: "...",
     *   key: "uploads/..."
     * }
     */
    if (
        typeof image === "object"
    ) {

        image =
            image.url ||
            image.location ||
            image.src ||
            image.path ||
            image.key ||
            image.r2Key ||
            image.filename ||
            "";
    }


    if (!image) {
        return FALLBACK_PROFILE_IMAGE;
    }


    const raw =
        String(image).trim();


    if (!raw) {
        return FALLBACK_PROFILE_IMAGE;
    }


    /*
     * Full URL.
     */
    if (
        raw.startsWith("http://") ||
        raw.startsWith("https://") ||
        raw.startsWith("data:") ||
        raw.startsWith("blob:")
    ) {
        return raw;
    }


    /*
     * Static frontend image.
     */
    if (
        raw.startsWith("/images/") ||
        raw.startsWith("/assets/")
    ) {
        return raw;
    }


    const normalized =
        raw
            .replace(/\\/g, "/")
            .replace(/^\/+/, "");


    /*
     * Current R2 profile images.
     *
     * Your profile upload middleware stores
     * new images under uploads/...
     */
    if (
        R2_PUBLIC_URL &&
        normalized.startsWith("uploads/")
    ) {
        return (
            `${R2_PUBLIC_URL}/` +
            normalized
        );
    }


    /*
     * Also support uploads/profiles/...
     */
    if (
        R2_PUBLIC_URL &&
        normalized.startsWith(
            "profiles/"
        )
    ) {
        return (
            `${R2_PUBLIC_URL}/` +
            normalized
        );
    }


    /*
     * Legacy Railway profile image.
     */
    if (
        raw.startsWith("/uploads/")
    ) {
        return (
            `${API_SERVER}${raw}`
        );
    }


    /*
     * Old database record containing
     * only the filename.
     */
    if (
        !normalized.includes("/")
    ) {
        return (
            `${API_SERVER}/uploads/` +
            normalized
        );
    }


    return raw;
};


/* =========================================================
   CHAT IMAGE
========================================================= */

const getChatImageUrl = (
    image
) => {

    const url =
        resolveMediaUrl(
            image,
            "chat/images"
        );

    return (
        url ||
        FALLBACK_PRODUCT_IMAGE
    );
};


/* =========================================================
   CHAT AUDIO
========================================================= */

const getChatAudioUrl = (
    audio
) => {

    return resolveMediaUrl(
        audio,
        "chat/audio"
    );
};


/* =========================================================
   PARSE PRODUCT IMAGES
========================================================= */

const parseImages = (
    images
) => {

    if (!images) {
        return [];
    }


    if (
        Array.isArray(images)
    ) {
        return images.filter(Boolean);
    }


    if (
        typeof images === "string"
    ) {

        const value =
            images.trim();


        if (!value) {
            return [];
        }


        /*
         * JSON array.
         */
        try {

            const parsed =
                JSON.parse(value);


            if (
                Array.isArray(parsed)
            ) {
                return parsed.filter(
                    Boolean
                );
            }


            if (parsed) {
                return [parsed];
            }

        } catch {
            /*
             * Continue below.
             */
        }


        /*
         * Comma-separated fallback.
         */
        if (
            value.includes(",")
        ) {

            return value
                .split(",")
                .map(
                    item => item.trim()
                )
                .filter(Boolean);
        }


        return [value];
    }


    return [];
};


/* =========================================================
   STORED USER
========================================================= */

const getStoredUser = () => {

    try {

        const stored =
            localStorage.getItem(
                "user"
            );


        if (!stored) {
            return null;
        }


        return JSON.parse(
            stored
        );

    } catch {
        return null;
    }
};


/* =========================================================
   SAFE RESPONSE
========================================================= */

const parseFetchResponse = async (
    response
) => {

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    if (
        contentType.includes(
            "application/json"
        )
    ) {
        return response.json();
    }


    const text =
        await response.text();


    return {
        success: response.ok,
        message: text
    };
};


/* =========================================================
   COMPONENT
========================================================= */

function Chat() {

    const {
        conversationId
    } = useParams();


    const navigate =
        useNavigate();


    /* =====================================================
       AUTH
    ===================================================== */

    const token =
        localStorage.getItem(
            "token"
        );


    const storedUser =
        useMemo(
            () => getStoredUser(),
            []
        );


    const userId =
        storedUser?.id != null
            ? String(storedUser.id)
            : null;


    /* =====================================================
       STATE
    ===================================================== */

    const [
        messages,
        setMessages
    ] = useState([]);


    const [
        message,
        setMessage
    ] = useState("");


    const [
        product,
        setProduct
    ] = useState(null);


    /*
     * Seller AND buyer are now stored.
     */
    const [
        seller,
        setSeller
    ] = useState(null);


    const [
        buyer,
        setBuyer
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        sending,
        setSending
    ] = useState(false);


    const [
        uploadingImage,
        setUploadingImage
    ] = useState(false);


    const [
        recording,
        setRecording
    ] = useState(false);


    const [
        audioBlob,
        setAudioBlob
    ] = useState(null);


    const [
        audioPreviewUrl,
        setAudioPreviewUrl
    ] = useState("");


    const [
        error,
        setError
    ] = useState("");


    const [
        mediaRecorder,
        setMediaRecorder
    ] = useState(null);


    const [
        socketConnected,
        setSocketConnected
    ] = useState(
        socket.connected
    );


    /* =====================================================
       REFS
    ===================================================== */

    const messagesEndRef =
        useRef(null);


    const imageInputRef =
        useRef(null);


    const streamRef =
        useRef(null);


    const chunksRef =
        useRef([]);


    const loadedConversationRef =
        useRef(null);


    const currentConversationRef =
        useRef(null);


    /* =====================================================
       AUTH GUARD
    ===================================================== */

    useEffect(() => {

        if (!token) {

            navigate(
                "/login",
                {
                    replace: true
                }
            );
        }

    }, [
        token,
        navigate
    ]);


    /* =====================================================
       LOAD CONVERSATION
    ===================================================== */

    const loadConversation =
        useCallback(
            async () => {

                if (
                    !conversationId ||
                    !token
                ) {
                    return;
                }


                try {

                    const response =
                        await api.get(
                            `/messages/conversation/${conversationId}`
                        );


                    const data =
                        response.data || {};


                    if (
                        data.success === false
                    ) {
                        throw new Error(
                            data.message ||
                            "Unable to load conversation."
                        );
                    }


                    /*
                     * Product
                     */
                    setProduct(
                        data.product ||
                        null
                    );


                    /*
                     * Seller
                     */
                    setSeller(
                        data.seller ||
                        null
                    );


                    /*
                     * BUYER
                     *
                     * This was missing from
                     * the old Chat.jsx.
                     */
                    setBuyer(
                        data.buyer ||
                        null
                    );


                    console.log(
                        "CHAT PARTICIPANTS:",
                        {
                            currentUserId:
                                userId,
                            seller:
                                data.seller,
                            buyer:
                                data.buyer
                        }
                    );

                } catch (err) {

                    console.error(
                        "LOAD CONVERSATION ERROR:",
                        err.response?.data ||
                        err.message
                    );


                    if (
                        err.response?.status ===
                        401
                    ) {

                        setError(
                            "Your session has expired. Please log in again."
                        );

                        return;
                    }


                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Unable to load conversation."
                    );
                }

            },
            [
                conversationId,
                token,
                userId
            ]
        );


    /* =====================================================
       LOAD MESSAGES
    ===================================================== */

    const loadMessages =
        useCallback(
            async () => {

                if (
                    !conversationId ||
                    !token
                ) {
                    return;
                }


                try {

                    const response =
                        await api.get(
                            `/messages/${conversationId}`
                        );


                    const data =
                        response.data || {};


                    const loadedMessages =
                        Array.isArray(
                            data.messages
                        )
                            ? data.messages
                            : Array.isArray(
                                data.data
                            )
                                ? data.data
                                : Array.isArray(
                                    data
                                )
                                    ? data
                                    : [];


                    setMessages(
                        loadedMessages
                    );


                    /*
                     * Delivered.
                     */
                    try {

                        await api.put(
                            `/messages/${conversationId}/delivered`
                        );

                    } catch (
                        deliveryError
                    ) {

                        console.warn(
                            "MARK DELIVERED ERROR:",
                            deliveryError.response?.data ||
                            deliveryError.message
                        );
                    }


                    /*
                     * Read.
                     */
                    try {

                        await api.put(
                            `/messages/${conversationId}/read`
                        );

                    } catch (
                        readError
                    ) {

                        console.warn(
                            "MARK READ ERROR:",
                            readError.response?.data ||
                            readError.message
                        );
                    }

                } catch (err) {

                    console.error(
                        "LOAD MESSAGES ERROR:",
                        err.response?.data ||
                        err.message
                    );


                    if (
                        err.response?.status ===
                        401
                    ) {

                        setError(
                            "Your session has expired. Please log in again."
                        );

                        return;
                    }


                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Unable to load messages."
                    );

                } finally {

                    setLoading(false);
                }

            },
            [
                conversationId,
                token
            ]
        );


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        if (
            !conversationId ||
            !token
        ) {
            return;
        }


        const id =
            String(conversationId);


        if (
            loadedConversationRef.current ===
            id
        ) {
            return;
        }


        loadedConversationRef.current =
            id;


        setLoading(true);
        setError("");
        setMessages([]);
        setSeller(null);
        setBuyer(null);
        setProduct(null);


        const loadChat =
            async () => {

                await loadConversation();

                await loadMessages();
            };


        loadChat();

    }, [
        conversationId,
        token,
        loadConversation,
        loadMessages
    ]);


    /* =====================================================
       SOCKET CONNECTION
    ===================================================== */

    useEffect(() => {

        if (
            !conversationId ||
            !token
        ) {
            return;
        }


        const id =
            String(conversationId);


        currentConversationRef.current =
            id;


        const joinConversation =
            () => {

                if (
                    currentConversationRef.current !==
                    id
                ) {
                    return;
                }


                setSocketConnected(
                    true
                );


                socket.emit(
                    "join_conversation",
                    id
                );
            };


        const handleConnectError =
            (socketError) => {

                console.error(
                    "SOCKET CONNECTION ERROR:",
                    socketError?.message ||
                    socketError
                );


                setSocketConnected(
                    false
                );
            };


        const handleDisconnect =
            (reason) => {

                console.warn(
                    "SOCKET DISCONNECTED:",
                    reason
                );


                setSocketConnected(
                    false
                );
            };


        const handleReceiveMessage =
            (incomingMessage) => {

                if (
                    !incomingMessage
                ) {
                    return;
                }


                const incomingConversationId =
                    incomingMessage.conversationId ??
                    incomingMessage.conversation_id;


                if (
                    incomingConversationId &&
                    String(
                        incomingConversationId
                    ) !== id
                ) {
                    return;
                }


                setMessages(
                    previousMessages => {

                        if (
                            incomingMessage.id &&
                            previousMessages.some(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        incomingMessage.id
                                    )
                            )
                        ) {
                            return previousMessages;
                        }


                        return [
                            ...previousMessages,
                            incomingMessage
                        ];
                    }
                );
            };


        socket.on(
            "connect",
            joinConversation
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
            "receive_message",
            handleReceiveMessage
        );


        if (
            !socket.connected
        ) {

            socket.connect();

        } else {

            joinConversation();
        }


        return () => {

            socket.off(
                "connect",
                joinConversation
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
                "receive_message",
                handleReceiveMessage
            );


            socket.emit(
                "leave_conversation",
                id
            );


            currentConversationRef.current =
                null;
        };

    }, [
        conversationId,
        token
    ]);


    /* =====================================================
       AUTO SCROLL
    ===================================================== */

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView(
            {
                behavior: "smooth"
            }
        );

    }, [
        messages
    ]);


    /* =====================================================
       ADD MESSAGE
    ===================================================== */

    const addMessage =
        useCallback(
            (newMessage) => {

                if (!newMessage) {
                    return;
                }


                setMessages(
                    previousMessages => {

                        if (
                            newMessage.id &&
                            previousMessages.some(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        newMessage.id
                                    )
                            )
                        ) {
                            return previousMessages;
                        }


                        return [
                            ...previousMessages,
                            newMessage
                        ];
                    }
                );
            },
            []
        );


    /* =====================================================
       SEND TEXT MESSAGE
    ===================================================== */

    const sendMessage =
        async () => {

            const text =
                message.trim();


            if (
                !text ||
                sending ||
                !conversationId
            ) {
                return;
            }


            try {

                setSending(true);
                setError("");


                const response =
                    await api.post(
                        `/messages/${conversationId}`,
                        {
                            message: text
                        }
                    );


                const newMessage =
                    response.data?.newMessage ||
                    response.data?.message;


                if (newMessage) {

                    addMessage(
                        newMessage
                    );
                }


                setMessage("");

            } catch (err) {

                console.error(
                    "SEND MESSAGE ERROR:",
                    err.response?.data ||
                    err.message
                );


                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to send message."
                );

            } finally {

                setSending(false);
            }
        };


    /* =====================================================
       IMAGE UPLOAD
    ===================================================== */

    const uploadImage =
        async (event) => {

            const file =
                event.target.files?.[0];


            event.target.value = "";


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                setError(
                    "Please select a valid image."
                );

                return;
            }


            if (
                file.size >
                10 * 1024 * 1024
            ) {

                setError(
                    "Image must be smaller than 10MB."
                );

                return;
            }


            if (!conversationId) {

                setError(
                    "Conversation not found."
                );

                return;
            }


            const formData =
                new FormData();


            formData.append(
                "image",
                file,
                file.name
            );


            try {

                setUploadingImage(
                    true
                );

                setError("");


                const response =
                    await fetch(
                        `${API_SERVER}/api/messages/${conversationId}/image`,
                        {
                            method: "POST",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            },

                            body: formData
                        }
                    );


                const data =
                    await parseFetchResponse(
                        response
                    );


                if (
                    !response.ok
                ) {

                    if (
                        response.status ===
                        401
                    ) {

                        setError(
                            "Your session has expired. Please log in again."
                        );

                        return;
                    }


                    throw new Error(
                        data?.message ||
                        `Image upload failed (${response.status}).`
                    );
                }


                const newMessage =
                    data?.newMessage ||
                    data?.message;


                if (newMessage) {

                    addMessage(
                        newMessage
                    );
                }

            } catch (err) {

                console.error(
                    "IMAGE UPLOAD ERROR:",
                    err
                );


                setError(
                    err.message ||
                    "Failed to send image."
                );

            } finally {

                setUploadingImage(
                    false
                );
            }
        };


    /* =====================================================
       AUDIO MIME TYPE
    ===================================================== */

    const getAudioMimeType =
        () => {

            if (
                typeof MediaRecorder ===
                "undefined"
            ) {
                return "";
            }


            const types = [
                "audio/webm;codecs=opus",
                "audio/webm",
                "audio/ogg;codecs=opus",
                "audio/ogg",
                "audio/mp4"
            ];


            for (
                const type of types
            ) {

                if (
                    MediaRecorder.isTypeSupported(
                        type
                    )
                ) {
                    return type;
                }
            }


            return "";
        };


    /* =====================================================
       START RECORDING
    ===================================================== */

    const startRecording =
        async () => {

            if (recording) {
                return;
            }


            try {

                setError("");


                if (
                    !navigator.mediaDevices ||
                    !navigator.mediaDevices
                        .getUserMedia
                ) {

                    throw new Error(
                        "Your browser does not support microphone recording."
                    );
                }


                if (
                    typeof MediaRecorder ===
                    "undefined"
                ) {

                    throw new Error(
                        "Your browser does not support voice recording."
                    );
                }


                const stream =
                    await navigator
                        .mediaDevices
                        .getUserMedia(
                            {
                                audio: true
                            }
                        );


                streamRef.current =
                    stream;


                chunksRef.current =
                    [];


                const mimeType =
                    getAudioMimeType();


                const recorder =
                    mimeType
                        ? new MediaRecorder(
                            stream,
                            {
                                mimeType
                            }
                        )
                        : new MediaRecorder(
                            stream
                        );


                recorder.ondataavailable =
                    event => {

                        if (
                            event.data &&
                            event.data.size > 0
                        ) {

                            chunksRef.current.push(
                                event.data
                            );
                        }
                    };


                recorder.onstop =
                    () => {

                        const actualType =
                            recorder.mimeType ||
                            mimeType ||
                            "audio/webm";


                        const blob =
                            new Blob(
                                chunksRef.current,
                                {
                                    type:
                                        actualType
                                }
                            );


                        if (
                            blob.size > 0
                        ) {

                            setAudioBlob(
                                blob
                            );


                            const previewUrl =
                                URL.createObjectURL(
                                    blob
                                );


                            setAudioPreviewUrl(
                                previewUrl
                            );
                        }


                        if (
                            streamRef.current
                        ) {

                            streamRef.current
                                .getTracks()
                                .forEach(
                                    track =>
                                        track.stop()
                                );


                            streamRef.current =
                                null;
                        }
                    };


                recorder.onerror =
                    event => {

                        console.error(
                            "RECORDER ERROR:",
                            event
                        );


                        setError(
                            "Voice recording failed."
                        );
                    };


                recorder.start(250);


                setMediaRecorder(
                    recorder
                );


                setRecording(
                    true
                );

            } catch (err) {

                console.error(
                    "START RECORDING ERROR:",
                    err
                );


                setRecording(false);

                setMediaRecorder(
                    null
                );


                setError(
                    err.message ||
                    "Unable to access microphone."
                );
            }
        };


    /* =====================================================
       STOP RECORDING
    ===================================================== */

    const stopRecording =
        () => {

            if (
                !mediaRecorder
            ) {
                return;
            }


            if (
                mediaRecorder.state ===
                "recording"
            ) {

                mediaRecorder.stop();
            }


            setRecording(false);

            setMediaRecorder(
                null
            );
        };


    /* =====================================================
       CANCEL AUDIO
    ===================================================== */

    const cancelAudio =
        () => {

            if (
                mediaRecorder &&
                mediaRecorder.state ===
                "recording"
            ) {

                mediaRecorder.stop();
            }


            if (
                streamRef.current
            ) {

                streamRef.current
                    .getTracks()
                    .forEach(
                        track =>
                            track.stop()
                    );


                streamRef.current =
                    null;
            }


            if (
                audioPreviewUrl
            ) {

                URL.revokeObjectURL(
                    audioPreviewUrl
                );
            }


            chunksRef.current =
                [];


            setRecording(false);

            setMediaRecorder(
                null
            );

            setAudioBlob(
                null
            );

            setAudioPreviewUrl(
                ""
            );
        };


    /* =====================================================
       SEND AUDIO
    ===================================================== */

    const sendAudio =
        async () => {

            if (
                !audioBlob ||
                !conversationId
            ) {
                return;
            }


            const formData =
                new FormData();


            let extension =
                "webm";


            if (
                audioBlob.type.includes(
                    "ogg"
                )
            ) {

                extension =
                    "ogg";

            } else if (
                audioBlob.type.includes(
                    "mp4"
                )
            ) {

                extension =
                    "mp4";

            } else if (
                audioBlob.type.includes(
                    "mpeg"
                )
            ) {

                extension =
                    "mp3";
            }


            formData.append(
                "audio",
                audioBlob,
                `voice-${Date.now()}.${extension}`
            );


            try {

                setError("");


                const response =
                    await fetch(
                        `${API_SERVER}/api/messages/${conversationId}/audio`,
                        {
                            method: "POST",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            },

                            body: formData
                        }
                    );


                const data =
                    await parseFetchResponse(
                        response
                    );


                if (
                    !response.ok
                ) {

                    if (
                        response.status ===
                        401
                    ) {

                        setError(
                            "Your session has expired. Please log in again."
                        );

                        return;
                    }


                    throw new Error(
                        data?.message ||
                        `Audio upload failed (${response.status}).`
                    );
                }


                const newMessage =
                    data?.newMessage ||
                    data?.message;


                if (newMessage) {

                    addMessage(
                        newMessage
                    );
                }


                if (
                    audioPreviewUrl
                ) {

                    URL.revokeObjectURL(
                        audioPreviewUrl
                    );
                }


                chunksRef.current =
                    [];


                setAudioBlob(
                    null
                );


                setAudioPreviewUrl(
                    ""
                );

            } catch (err) {

                console.error(
                    "AUDIO UPLOAD ERROR:",
                    err
                );


                setError(
                    err.message ||
                    "Failed to send voice message."
                );
            }
        };


    /* =====================================================
       CLEANUP MEDIA
    ===================================================== */

    useEffect(() => {

        return () => {

            if (
                streamRef.current
            ) {

                streamRef.current
                    .getTracks()
                    .forEach(
                        track =>
                            track.stop()
                    );


                streamRef.current =
                    null;
            }


            if (
                audioPreviewUrl
            ) {

                URL.revokeObjectURL(
                    audioPreviewUrl
                );
            }
        };

    }, [
        audioPreviewUrl
    ]);


    /* =====================================================
       SOCKET CLEANUP
    ===================================================== */

    useEffect(() => {

        return () => {
            socket.disconnect();
        };

    }, []);


    /* =====================================================
       FORMAT TIME
    ===================================================== */

    const formatMessageTime =
        (value) => {

            if (!value) {
                return "";
            }


            const date =
                new Date(value);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return "";
            }


            return date.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
        };


    /* =====================================================
       MESSAGE TYPE
    ===================================================== */

    const getMessageType =
        (msg) => {

            if (
                msg?.type
            ) {
                return msg.type;
            }


            if (
                msg?.image
            ) {
                return "image";
            }


            if (
                msg?.audio
            ) {
                return "audio";
            }


            return "text";
        };


    /* =====================================================
       MY MESSAGE
    ===================================================== */

    const isMyMessage =
        (msg) => {

            if (!userId) {
                return false;
            }


            return (
                String(
                    msg?.senderId ??
                    msg?.sender_id
                ) ===
                userId
            );
        };


    /* =====================================================
       DETERMINE OTHER PARTICIPANT
    ===================================================== */

    const currentUserId =
        userId
            ? Number(userId)
            : null;


    const sellerId =
        seller?.id != null
            ? Number(seller.id)
            : null;


    const buyerId =
        buyer?.id != null
            ? Number(buyer.id)
            : null;


    /*
     * THIS IS THE CORE FIX.
     *
     * If logged-in user is seller:
     *     show buyer.
     *
     * Otherwise:
     *     show seller.
     */
    const otherUser =
        currentUserId != null &&
        sellerId != null &&
        currentUserId === sellerId
            ? buyer
            : seller;


    const otherUserName =
        otherUser?.name ||
        otherUser?.username ||
        "Marketplace User";


    const otherUserImage =
        getProfileImageUrl(
            otherUser?.profileImage ||
            otherUser?.profileImageUrl ||
            otherUser?.avatar ||
            otherUser?.image
        );


    /* =====================================================
       PRODUCT IMAGE
    ===================================================== */

    const productImages =
        parseImages(
            product?.images
        );


    const productImage =
        productImages.length > 0
            ? getProductImageUrl(
                productImages[0]
            )
            : FALLBACK_PRODUCT_IMAGE;


    /* =====================================================
       PROFILE DEBUG
    ===================================================== */

    useEffect(() => {

        if (
            seller ||
            buyer
        ) {

            console.log(
                "CHAT PROFILE DEBUG:",
                {
                    currentUserId,
                    sellerId,
                    buyerId,
                    seller,
                    buyer,
                    otherUser,
                    otherUserName,
                    otherUserImage
                }
            );
        }

    }, [
        currentUserId,
        sellerId,
        buyerId,
        seller,
        buyer,
        otherUser,
        otherUserName,
        otherUserImage
    ]);


    /* =====================================================
       AUTH RENDER GUARD
    ===================================================== */

    if (!token) {
        return null;
    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="chat-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="chat-header">


                {/* BACK */}
                <button
                    type="button"
                    className="chat-back-btn"
                    onClick={() =>
                        navigate(
                            "/inbox"
                        )
                    }
                    aria-label="Back to inbox"
                >
                    ←
                </button>


                {/* PARTICIPANT */}
                <div className="chat-user">


                    <img
                        src={
                            otherUserImage
                        }
                        alt={
                            otherUserName
                        }
                        className="chat-profile-image"
                        onError={
                            event => {

                                if (
                                    event.currentTarget
                                        .dataset
                                        .fallback
                                ) {
                                    return;
                                }


                                event.currentTarget
                                    .dataset
                                    .fallback =
                                    "true";


                                event.currentTarget
                                    .src =
                                    FALLBACK_PROFILE_IMAGE;
                            }
                        }
                    />


                    <div className="chat-user-details">

                        <h2>
                            {
                                otherUserName
                            }
                        </h2>


                        <p>
                            {
                                product?.title ||
                                "Marketplace Conversation"
                            }
                        </p>

                    </div>

                </div>


                {/* CONNECTION STATUS */}
                <div
                    className={
                        socketConnected
                            ? "chat-online-status connected"
                            : "chat-online-status disconnected"
                    }
                    title={
                        socketConnected
                            ? "Chat connected"
                            : "Reconnecting..."
                    }
                >

                    <span />


                    {
                        socketConnected
                            ? "Online"
                            : "Connecting..."
                    }

                </div>

            </div>


            {/* =================================================
                PRODUCT BAR
            ================================================= */}

            {product && (

                <div className="chat-product-bar">

                    <img
                        src={
                            productImage
                        }
                        alt={
                            product.title ||
                            "Product"
                        }
                        onError={
                            event => {

                                if (
                                    event.currentTarget
                                        .dataset
                                        .fallback
                                ) {
                                    return;
                                }


                                event.currentTarget
                                    .dataset
                                    .fallback =
                                    "true";


                                event.currentTarget
                                    .src =
                                    FALLBACK_PRODUCT_IMAGE;
                            }
                        }
                    />


                    <div className="chat-product-info">

                        <strong>
                            {
                                product.title ||
                                "Product"
                            }
                        </strong>


                        {product.price != null && (

                            <span>
                                ₵
                                {
                                    Number(
                                        product.price
                                    ).toLocaleString()
                                }
                            </span>

                        )}

                    </div>

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div
                    className="chat-error"
                    role="alert"
                >

                    <span>
                        {error}
                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        aria-label="Close error"
                    >
                        <FaTimes />
                    </button>

                </div>

            )}


            {/* =================================================
                MESSAGES
            ================================================= */}

            <div className="chat-messages">


                {loading ? (

                    <div className="chat-loading">
                        Loading messages...
                    </div>

                ) : messages.length === 0 ? (

                    <div className="empty-chat">

                        <div className="empty-chat-icon">
                            💬
                        </div>


                        <h3>
                            Start a conversation
                        </h3>


                        <p>
                            Send a message to begin chatting.
                        </p>

                    </div>

                ) : (

                    messages.map(
                        (
                            msg,
                            index
                        ) => {

                            const type =
                                getMessageType(
                                    msg
                                );


                            const mine =
                                isMyMessage(
                                    msg
                                );


                            const messageId =
                                msg.id ||
                                `${msg.createdAt || msg.created_at || "message"}-${index}`;


                            return (

                                <div
                                    key={
                                        messageId
                                    }
                                    className={
                                        mine
                                            ? "message me"
                                            : "message other"
                                    }
                                >

                                    <div className="bubble">


                                        {/* TEXT */}

                                        {type ===
                                            "text" && (

                                            <p className="text-message">

                                                {
                                                    msg.message ||
                                                    ""
                                                }

                                            </p>

                                        )}


                                        {/* IMAGE */}

                                        {type ===
                                            "image" && (

                                            <img
                                                src={
                                                    getChatImageUrl(
                                                        msg.image
                                                    )
                                                }
                                                alt="Sent image"
                                                className="chat-image"
                                                loading="lazy"
                                                onError={
                                                    event => {

                                                        if (
                                                            event.currentTarget
                                                                .dataset
                                                                .fallback
                                                        ) {
                                                            return;
                                                        }


                                                        event.currentTarget
                                                            .dataset
                                                            .fallback =
                                                            "true";


                                                        event.currentTarget
                                                            .src =
                                                            FALLBACK_PRODUCT_IMAGE;
                                                    }
                                                }
                                            />

                                        )}


                                        {/* AUDIO */}

                                        {type ===
                                            "audio" && (

                                            <div className="chat-audio">

                                                <audio
                                                    controls
                                                    preload="metadata"
                                                >

                                                    <source
                                                        src={
                                                            getChatAudioUrl(
                                                                msg.audio
                                                            )
                                                        }
                                                    />

                                                    Your browser does not support audio playback.

                                                </audio>

                                            </div>

                                        )}


                                        {/* FOOTER */}

                                        <div className="message-footer">

                                            <small>
                                                {
                                                    formatMessageTime(
                                                        msg.createdAt ||
                                                        msg.created_at
                                                    )
                                                }
                                            </small>


                                            {mine && (

                                                <span className="message-status">

                                                    {
                                                        msg.status ===
                                                        "read"
                                                            ? "✓✓"
                                                            : msg.status ===
                                                                "delivered"
                                                                ? "✓✓"
                                                                : "✓"
                                                    }

                                                </span>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            );
                        }
                    )

                )}


                <div
                    ref={
                        messagesEndRef
                    }
                />

            </div>


            {/* =================================================
                AUDIO PREVIEW
            ================================================= */}

            {audioBlob && (

                <div className="audio-preview">

                    <div className="audio-preview-content">

                        <FaMicrophone />


                        <span>
                            Voice message ready
                        </span>


                        <audio
                            controls
                            src={
                                audioPreviewUrl
                            }
                        />

                    </div>


                    <div className="audio-preview-actions">

                        <button
                            type="button"
                            className="cancel-voice"
                            onClick={
                                cancelAudio
                            }
                        >
                            Cancel
                        </button>


                        <button
                            type="button"
                            className="send-voice"
                            onClick={
                                sendAudio
                            }
                        >
                            Send Voice
                        </button>

                    </div>

                </div>

            )}


            {/* =================================================
                CHAT FOOTER
            ================================================= */}

            <div className="chat-footer">


                {/* IMAGE INPUT */}

                <input
                    ref={
                        imageInputRef
                    }
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={
                        uploadImage
                    }
                />


                {/* IMAGE BUTTON */}

                <button
                    type="button"
                    className="image-upload"
                    onClick={() =>
                        imageInputRef
                            .current
                            ?.click()
                    }
                    disabled={
                        uploadingImage
                    }
                    title="Send image"
                    aria-label="Send image"
                >

                    {
                        uploadingImage
                            ? "..."
                            : <FaImage />
                    }

                </button>


                {/* AUDIO BUTTON */}

                {recording ? (

                    <button
                        type="button"
                        className="record-btn recording"
                        onClick={
                            stopRecording
                        }
                        title="Stop recording"
                        aria-label="Stop recording"
                    >
                        <FaStop />
                    </button>

                ) : (

                    <button
                        type="button"
                        className="record-btn"
                        onClick={
                            startRecording
                        }
                        disabled={
                            !!audioBlob
                        }
                        title="Record voice"
                        aria-label="Record voice"
                    >
                        <FaMicrophone />
                    </button>

                )}


                {/* TEXT INPUT */}

                <input
                    type="text"
                    className="chat-input"
                    value={
                        message
                    }
                    placeholder={
                        recording
                            ? "Recording voice..."
                            : "Type a message..."
                    }
                    onChange={
                        event =>
                            setMessage(
                                event.target.value
                            )
                    }
                    onKeyDown={
                        event => {

                            if (
                                event.key ===
                                    "Enter" &&
                                !event.shiftKey
                            ) {

                                event.preventDefault();

                                sendMessage();
                            }
                        }
                    }
                    disabled={
                        recording
                    }
                />


                {/* SEND */}

                <button
                    type="button"
                    className="send-btn"
                    onClick={
                        sendMessage
                    }
                    disabled={
                        !message.trim() ||
                        sending ||
                        recording
                    }
                    title="Send message"
                    aria-label="Send message"
                >

                    {
                        sending
                            ? "..."
                            : <FaPaperPlane />
                    }

                </button>

            </div>

        </div>
    );
}


export default Chat;
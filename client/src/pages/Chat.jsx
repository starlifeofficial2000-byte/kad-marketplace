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

import {
    io
} from "socket.io-client";

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
   SERVER CONFIGURATION
========================================================= */

const IS_PRODUCTION =
    import.meta.env.PROD;

const normalizeServerUrl = (url) => {
    if (!url) {
        return "";
    }

    return url
        .trim()
        .replace(/\/+$/, "");
};

/*
 * Production MUST use the same domain as the website.
 *
 * https://kadmarket.com
 *
 * Local development:
 *
 * http://localhost:5000
 */

const API_SERVER = normalizeServerUrl(
    import.meta.env.VITE_API_SERVER ||
    import.meta.env.VITE_SERVER_URL ||
    (
        IS_PRODUCTION
            ? window.location.origin
            : "http://localhost:5000"
    )
);

const SOCKET_URL = normalizeServerUrl(
    import.meta.env.VITE_SOCKET_URL ||
    (
        IS_PRODUCTION
            ? window.location.origin
            : "http://localhost:5000"
    )
);

const SOCKET_PATH = "/socket.io";

const FALLBACK_IMAGE =
    "/images/product-placeholder.png";

/* =========================================================
   SOCKET.IO
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

        timeout: 20000,

        forceNew: false
    }
);

/* =========================================================
   HELPERS
========================================================= */

function getImageUrl(image) {
    if (
        !image ||
        typeof image !== "string"
    ) {
        return FALLBACK_IMAGE;
    }

    const value = image.trim();

    if (!value) {
        return FALLBACK_IMAGE;
    }

    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("data:") ||
        value.startsWith("blob:")
    ) {
        return value;
    }

    if (
        value.startsWith("/uploads/")
    ) {
        return `${API_SERVER}${value}`;
    }

    if (
        value.startsWith("uploads/")
    ) {
        return `${API_SERVER}/${value}`;
    }

    return `${API_SERVER}/uploads/${value}`;
}

/* =========================================================
   CHAT IMAGE URL
========================================================= */

function getChatImageUrl(image) {
    if (
        !image ||
        typeof image !== "string"
    ) {
        return FALLBACK_IMAGE;
    }

    const value = image.trim();

    if (!value) {
        return FALLBACK_IMAGE;
    }

    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("data:") ||
        value.startsWith("blob:")
    ) {
        return value;
    }

    if (
        value.startsWith("/uploads/")
    ) {
        return `${API_SERVER}${value}`;
    }

    if (
        value.startsWith("uploads/")
    ) {
        return `${API_SERVER}/${value}`;
    }

    return `${API_SERVER}/uploads/chat/images/${value}`;
}

/* =========================================================
   CHAT AUDIO URL
========================================================= */

function getChatAudioUrl(audio) {
    if (
        !audio ||
        typeof audio !== "string"
    ) {
        return "";
    }

    const value = audio.trim();

    if (!value) {
        return "";
    }

    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("blob:")
    ) {
        return value;
    }

    if (
        value.startsWith("/uploads/")
    ) {
        return `${API_SERVER}${value}`;
    }

    if (
        value.startsWith("uploads/")
    ) {
        return `${API_SERVER}/${value}`;
    }

    return `${API_SERVER}/uploads/chat/audio/${value}`;
}

/* =========================================================
   PARSE IMAGES
========================================================= */

function parseImages(images) {
    if (!images) {
        return [];
    }

    if (Array.isArray(images)) {
        return images;
    }

    if (
        typeof images === "string"
    ) {
        try {
            const parsed =
                JSON.parse(images);

            if (
                Array.isArray(parsed)
            ) {
                return parsed;
            }

            return parsed
                ? [parsed]
                : [];
        } catch {
            return [images];
        }
    }

    return [];
}

/* =========================================================
   STORED USER
========================================================= */

function getStoredUser() {
    const storedUser =
        localStorage.getItem("user");

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(
            storedUser
        );
    } catch {
        return null;
    }
}

/* =========================================================
   SAFE FETCH RESPONSE
========================================================= */

async function parseFetchResponse(
    response
) {
    const contentType =
        response.headers.get(
            "content-type"
        ) || "";

    if (
        contentType.includes(
            "application/json"
        )
    ) {
        return await response.json();
    }

    const text =
        await response.text();

    return {
        success: response.ok,
        message: text
    };
}

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
        storedUser?.id
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

    const [
        seller,
        setSeller
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

                    setProduct(
                        data.product ||
                        null
                    );

                    setSeller(
                        data.seller ||
                        null
                    );
                } catch (error) {
                    console.error(
                        "LOAD CONVERSATION ERROR:",
                        error.response?.data ||
                        error.message
                    );

                    if (
                        error.response?.status ===
                        401
                    ) {
                        setError(
                            "Your session may have expired. Please refresh and try again."
                        );

                        return;
                    }

                    setError(
                        error.response?.data?.message ||
                        error.message ||
                        "Unable to load conversation."
                    );
                }
            },
            [
                conversationId,
                token
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
                                : [];

                    setMessages(
                        loadedMessages
                    );

                    /* MARK DELIVERED */

                    try {
                        await api.put(
                            `/messages/${conversationId}/delivered`
                        );
                    } catch (error) {
                        console.warn(
                            "MARK DELIVERED ERROR:",
                            error.response?.data ||
                            error.message
                        );
                    }

                    /* MARK READ */

                    try {
                        await api.put(
                            `/messages/${conversationId}/read`
                        );
                    } catch (error) {
                        console.warn(
                            "MARK READ ERROR:",
                            error.response?.data ||
                            error.message
                        );
                    }
                } catch (error) {
                    console.error(
                        "LOAD MESSAGES ERROR:",
                        error.response?.data ||
                        error.message
                    );

                    if (
                        error.response?.status ===
                        401
                    ) {
                        setError(
                            "Your session may have expired. Please refresh and try again."
                        );

                        return;
                    }

                    setError(
                        error.response?.data?.message ||
                        error.message ||
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
       INITIAL CHAT LOAD
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

        /* =================================================
           JOIN CONVERSATION
        ================================================= */

        const joinConversation =
            () => {
                if (
                    currentConversationRef.current !==
                    id
                ) {
                    return;
                }

                console.log(
                    "🟢 Socket connected:",
                    socket.id
                );

                console.log(
                    "📩 Joining conversation:",
                    id
                );

                setSocketConnected(
                    true
                );

                socket.emit(
                    "join_conversation",
                    id
                );
            };

        /* =================================================
           CONNECT ERROR
        ================================================= */

        const handleConnectError =
            (socketError) => {
                console.error(
                    "❌ Socket.IO connection error:",
                    socketError?.message ||
                    socketError
                );

                setSocketConnected(
                    false
                );
            };

        /* =================================================
           DISCONNECT
        ================================================= */

        const handleDisconnect =
            (reason) => {
                console.warn(
                    "🔴 Socket disconnected:",
                    reason
                );

                setSocketConnected(
                    false
                );
            };

        /* =================================================
           RECEIVE MESSAGE
        ================================================= */

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
                        /*
                         * Prevent duplicate messages.
                         */

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

        /* =================================================
           SOCKET EVENTS
        ================================================= */

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

        /*
         * Start socket if it is not connected.
         */

        if (
            !socket.connected
        ) {
            socket.connect();
        } else {
            joinConversation();
        }

        /* =================================================
           CLEANUP
        ================================================= */

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
                }

                setMessage("");
            } catch (error) {
                console.error(
                    "SEND MESSAGE ERROR:",
                    error.response?.data ||
                    error.message
                );

                if (
                    error.response?.status ===
                    401
                ) {
                    setError(
                        "Your session may have expired. Please refresh and try again."
                    );

                    return;
                }

                setError(
                    error.response?.data?.message ||
                    error.message ||
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
                            "Your session may have expired. Please refresh and try again."
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
                }
            } catch (error) {
                console.error(
                    "IMAGE UPLOAD ERROR:",
                    error
                );

                setError(
                    error.message ||
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

                            const url =
                                URL.createObjectURL(
                                    blob
                                );

                            setAudioPreviewUrl(
                                url
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
            } catch (error) {
                console.error(
                    "START RECORDING ERROR:",
                    error
                );

                setRecording(
                    false
                );

                setMediaRecorder(
                    null
                );

                setError(
                    error.message ||
                    "Unable to access microphone."
                );
            }
        };

    /* =====================================================
       STOP RECORDING
    ===================================================== */

    const stopRecording =
        () => {
            if (!mediaRecorder) {
                return;
            }

            if (
                mediaRecorder.state ===
                "recording"
            ) {
                mediaRecorder.stop();
            }

            setRecording(
                false
            );

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

            setRecording(
                false
            );

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
                            "Your session may have expired. Please refresh and try again."
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
                }

                if (
                    audioPreviewUrl
                ) {
                    URL.revokeObjectURL(
                        audioPreviewUrl
                    );
                }

                setAudioBlob(
                    null
                );

                setAudioPreviewUrl(
                    ""
                );
            } catch (error) {
                console.error(
                    "AUDIO UPLOAD ERROR:",
                    error
                );

                setError(
                    error.message ||
                    "Failed to send voice message."
                );
            }
        };

    /* =====================================================
       CLEANUP
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
       GLOBAL SOCKET CLEANUP
    ===================================================== */

    useEffect(() => {
        return () => {
            /*
             * We intentionally disconnect when
             * Chat is completely unmounted.
             */

            socket.disconnect();
        };
    }, []);

    /* =====================================================
       TIME FORMAT
    ===================================================== */

    const formatMessageTime =
        value => {
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
        msg => {
            if (msg.type) {
                return msg.type;
            }

            if (msg.image) {
                return "image";
            }

            if (msg.audio) {
                return "audio";
            }

            return "text";
        };

    /* =====================================================
       MY MESSAGE
    ===================================================== */

    const isMyMessage =
        msg => {
            if (!userId) {
                return false;
            }

            return (
                String(
                    msg.senderId ??
                    msg.sender_id
                ) === userId
            );
        };

    /* =====================================================
       PRODUCT IMAGE
    ===================================================== */

    const productImages =
        parseImages(
            product?.images
        );

    const productImage =
        productImages.length > 0
            ? getImageUrl(
                productImages[0]
            )
            : FALLBACK_IMAGE;

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

                <div className="chat-user">

                    <img
                        src={productImage}
                        alt={
                            product?.title ||
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
                                    FALLBACK_IMAGE;
                            }
                        }
                    />

                    <div>

                        <h2>
                            {
                                product?.title ||
                                "Conversation"
                            }
                        </h2>

                        <p>
                            {
                                seller?.name ||
                                seller?.username ||
                                "Marketplace User"
                            }
                        </p>

                    </div>

                </div>

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
                                `${msg.createdAt || msg.created_at}-${index}`;

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
                                                            FALLBACK_IMAGE;
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
                FOOTER
            ================================================= */}

            <div className="chat-footer">

                {/* IMAGE INPUT */}

                <input
                    ref={
                        imageInputRef
                    }
                    type="file"
                    hidden
                    accept="
                        image/jpeg,
                        image/png,
                        image/webp,
                        image/gif
                    "
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

                {/* AUDIO */}

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
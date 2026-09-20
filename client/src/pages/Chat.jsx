import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../config/axios";
import { io } from "socket.io-client";

import {
    FaPaperPlane,
    FaImage,
    FaPhone,
    FaVideo,
    FaEllipsisV,
    FaMicrophone,
    FaStop
} from "react-icons/fa";

import "./Chat.css";

/* =========================================================
   API / SOCKET CONFIG
========================================================= */

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://kad-marketplace-production.up.railway.app/api";

const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    SERVER_BASE_URL;

/* =========================================================
   HELPERS
========================================================= */

const getUserFromStorage = () => {
    try {
        return JSON.parse(
            localStorage.getItem("user") || "null"
        );
    } catch {
        return null;
    }
};

const getImageUrl = (image, fallback = "/images/product-placeholder.png") => {
    if (!image || typeof image !== "string") {
        return fallback;
    }

    const value = image.trim();

    if (!value) {
        return fallback;
    }

    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    if (value.startsWith("blob:")) {
        return value;
    }

    if (value.startsWith("/uploads/")) {
        return `${SERVER_BASE_URL}${value}`;
    }

    if (value.startsWith("uploads/")) {
        return `${SERVER_BASE_URL}/${value}`;
    }

    if (value.startsWith("/")) {
        return `${SERVER_BASE_URL}${value}`;
    }

    return `${SERVER_BASE_URL}/uploads/${value}`;
};

const getChatImageUrl = (filename) => {
    if (!filename) {
        return "/images/product-placeholder.png";
    }

    if (
        filename.startsWith("http://") ||
        filename.startsWith("https://")
    ) {
        return filename;
    }

    return `${SERVER_BASE_URL}/uploads/chat/images/${filename}`;
};

const getChatAudioUrl = (filename) => {
    if (!filename) {
        return "";
    }

    if (
        filename.startsWith("http://") ||
        filename.startsWith("https://")
    ) {
        return filename;
    }

    return `${SERVER_BASE_URL}/uploads/chat/audio/${filename}`;
};

/* =========================================================
   COMPONENT
========================================================= */

function Chat() {
    const { conversationId } = useParams();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const user = getUserFromStorage();

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);

    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);

    const [uploadingImage, setUploadingImage] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [sendingAudio, setSendingAudio] = useState(false);

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    /* =====================================================
       AUTH CHECK
    ===================================================== */

    useEffect(() => {
        if (!user || !token) {
            navigate("/login");
        }
    }, [user, token, navigate]);

    /* =====================================================
       LOAD CONVERSATION
    ===================================================== */

    const loadConversation = useCallback(async () => {
        if (!conversationId || !token) return;

        try {
            const response = await api.get(
                `/messages/conversation/${conversationId}`
            );

            if (response.data?.success === false) {
                console.error(
                    "Conversation error:",
                    response.data?.message
                );
                return;
            }

            setProduct(
                response.data?.product || null
            );

            setSeller(
                response.data?.seller || null
            );

        } catch (error) {
            console.error(
                "LOAD CONVERSATION ERROR:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        }
    }, [conversationId, token, navigate]);

    /* =====================================================
       LOAD MESSAGES
    ===================================================== */

    const loadMessages = useCallback(async () => {
        if (!conversationId || !token) return;

        try {
            const response = await api.get(
                `/messages/${conversationId}`
            );

            const loadedMessages =
                response.data?.messages || [];

            setMessages(
                Array.isArray(loadedMessages)
                    ? loadedMessages
                    : []
            );

            /* ---------------------------------------------
               MARK DELIVERED
            --------------------------------------------- */

            try {
                await api.put(
                    `/messages/${conversationId}/delivered`
                );
            } catch (error) {
                console.warn(
                    "Unable to mark messages delivered:",
                    error
                );
            }

            /* ---------------------------------------------
               MARK READ
            --------------------------------------------- */

            try {
                await api.put(
                    `/messages/${conversationId}/read`
                );
            } catch (error) {
                console.warn(
                    "Unable to mark messages read:",
                    error
                );
            }

        } catch (error) {
            console.error(
                "LOAD MESSAGES ERROR:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        }
    }, [conversationId, token, navigate]);

    /* =====================================================
       SOCKET MESSAGE HANDLER
    ===================================================== */

    const receiveMessage = useCallback((incomingMessage) => {
        if (!incomingMessage) return;

        setMessages((previousMessages) => {

            const alreadyExists = previousMessages.some(
                (existingMessage) =>
                    existingMessage.id === incomingMessage.id
            );

            if (alreadyExists) {
                return previousMessages;
            }

            return [
                ...previousMessages,
                incomingMessage
            ];
        });
    }, []);

    /* =====================================================
       INITIAL LOAD + SOCKET
    ===================================================== */

    useEffect(() => {
        if (!user || !token || !conversationId) {
            return;
        }

        loadConversation();
        loadMessages();

        /* ---------------------------------------------
           CREATE SOCKET CONNECTION
        --------------------------------------------- */

        const socket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            auth: {
                token
            }
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log(
                "CHAT SOCKET CONNECTED:",
                socket.id
            );

            socket.emit(
                "join_conversation",
                conversationId
            );
        });

        socket.on(
            "receive_message",
            receiveMessage
        );

        socket.on(
            "connect_error",
            (error) => {
                console.warn(
                    "CHAT SOCKET ERROR:",
                    error.message
                );
            }
        );

        return () => {
            socket.emit(
                "leave_conversation",
                conversationId
            );

            socket.off(
                "receive_message",
                receiveMessage
            );

            socket.disconnect();

            socketRef.current = null;
        };

    }, [
        conversationId,
        token,
        user,
        loadConversation,
        loadMessages,
        receiveMessage
    ]);

    /* =====================================================
       AUTO SCROLL
    ===================================================== */

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

    /* =====================================================
       SEND TEXT MESSAGE
    ===================================================== */

    const sendMessage = async () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
            return;
        }

        if (!conversationId) {
            console.error(
                "Conversation ID is missing."
            );
            return;
        }

        if (sendingMessage) {
            return;
        }

        try {
            setSendingMessage(true);

            const response = await api.post(
                `/messages/${conversationId}`,
                {
                    message: trimmedMessage
                }
            );

            if (
                response.data?.success === false
            ) {
                throw new Error(
                    response.data?.message ||
                    "Unable to send message."
                );
            }

            const newMessage =
                response.data?.newMessage;

            if (newMessage) {
                setMessages((previousMessages) => {

                    const alreadyExists =
                        previousMessages.some(
                            (existingMessage) =>
                                existingMessage.id ===
                                newMessage.id
                        );

                    if (alreadyExists) {
                        return previousMessages;
                    }

                    return [
                        ...previousMessages,
                        newMessage
                    ];
                });
            }

            setMessage("");

        } catch (error) {
            console.error(
                "SEND MESSAGE ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Unable to send message."
            );

        } finally {
            setSendingMessage(false);
        }
    };

    /* =====================================================
       IMAGE UPLOAD
    ===================================================== */

    const uploadImage = async (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert(
                "Please select a valid image."
            );

            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert(
                "Image must be smaller than 5MB."
            );

            event.target.value = "";
            return;
        }

        const formData = new FormData();

        formData.append(
            "image",
            file,
            file.name
        );

        try {
            setUploadingImage(true);

            const response = await api.post(
                `/messages/${conversationId}/image`,
                formData
            );

            if (
                response.data?.success === false
            ) {
                throw new Error(
                    response.data?.message ||
                    "Unable to upload image."
                );
            }

            const newMessage =
                response.data?.newMessage;

            if (newMessage) {
                setMessages((previousMessages) => {

                    const exists =
                        previousMessages.some(
                            (existingMessage) =>
                                existingMessage.id ===
                                newMessage.id
                        );

                    if (exists) {
                        return previousMessages;
                    }

                    return [
                        ...previousMessages,
                        newMessage
                    ];
                });
            }

        } catch (error) {
            console.error(
                "IMAGE UPLOAD ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Unable to send image."
            );

        } finally {
            setUploadingImage(false);

            event.target.value = "";
        }
    };

    /* =====================================================
       START RECORDING
    ===================================================== */

    const startRecording = async () => {
        try {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                alert(
                    "Audio recording is not supported by this browser."
                );
                return;
            }

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

            const recorder =
                new MediaRecorder(stream);

            const chunks = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(
                    chunks,
                    {
                        type:
                            recorder.mimeType ||
                            "audio/webm"
                    }
                );

                setAudioBlob(blob);

                stream
                    .getTracks()
                    .forEach((track) => {
                        track.stop();
                    });
            };

            recorder.start();

            setMediaRecorder(recorder);
            setRecording(true);

        } catch (error) {
            console.error(
                "START RECORDING ERROR:",
                error
            );

            alert(
                "Unable to access microphone."
            );
        }
    };

    /* =====================================================
       STOP RECORDING
    ===================================================== */

    const stopRecording = () => {
        if (!mediaRecorder) {
            return;
        }

        if (
            mediaRecorder.state !==
            "inactive"
        ) {
            mediaRecorder.stop();
        }

        setRecording(false);
        setMediaRecorder(null);
    };

    /* =====================================================
       SEND AUDIO
    ===================================================== */

    const sendAudio = async () => {
        if (!audioBlob) {
            return;
        }

        if (sendingAudio) {
            return;
        }

        const formData = new FormData();

        formData.append(
            "audio",
            audioBlob,
            "voice.webm"
        );

        try {
            setSendingAudio(true);

            const response = await api.post(
                `/messages/${conversationId}/audio`,
                formData
            );

            if (
                response.data?.success === false
            ) {
                throw new Error(
                    response.data?.message ||
                    "Unable to send audio."
                );
            }

            const newMessage =
                response.data?.newMessage;

            if (newMessage) {
                setMessages((previousMessages) => {

                    const exists =
                        previousMessages.some(
                            (existingMessage) =>
                                existingMessage.id ===
                                newMessage.id
                        );

                    if (exists) {
                        return previousMessages;
                    }

                    return [
                        ...previousMessages,
                        newMessage
                    ];
                });
            }

            setAudioBlob(null);

        } catch (error) {
            console.error(
                "SEND AUDIO ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Unable to send audio."
            );

        } finally {
            setSendingAudio(false);
        }
    };

    /* =====================================================
       ENTER KEY
    ===================================================== */

    const handleKeyDown = (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            sendMessage();
        }
    };

    /* =====================================================
       PRODUCT IMAGE
    ===================================================== */

    const productImage = (() => {
        if (!product?.images) {
            return "/images/product-placeholder.png";
        }

        let images = product.images;

        if (typeof images === "string") {
            try {
                images = JSON.parse(images);
            } catch {
                images = [images];
            }
        }

        if (!Array.isArray(images)) {
            return "/images/product-placeholder.png";
        }

        return getImageUrl(
            images[0],
            "/images/product-placeholder.png"
        );
    })();

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="chat-page">

            {/* =========================================
                CHAT HEADER
            ========================================= */}

            <div className="chat-header">

                <div className="chat-user">

                    <img
                        src={productImage}
                        alt={
                            product?.title ||
                            "Product"
                        }
                        onError={(event) => {
                            if (
                                event.currentTarget
                                    .dataset
                                    .fallback
                            ) {
                                return;
                            }

                            event.currentTarget.dataset.fallback =
                                "true";

                            event.currentTarget.src =
                                "/images/product-placeholder.png";
                        }}
                    />

                    <div>
                        <h2>
                            {product?.title ||
                                "Conversation"}
                        </h2>

                        <p>
                            {seller?.name ||
                                "User"}
                        </p>
                    </div>

                </div>

                <div className="chat-actions">

                    <button
                        type="button"
                        title="Call"
                    >
                        <FaPhone />
                    </button>

                    <button
                        type="button"
                        title="Video call"
                    >
                        <FaVideo />
                    </button>

                    <button
                        type="button"
                        title="More options"
                    >
                        <FaEllipsisV />
                    </button>

                </div>

            </div>

            {/* =========================================
                MESSAGES
            ========================================= */}

            <div className="chat-messages">

                {messages.length === 0 ? (

                    <div className="empty-chat">

                        <p>
                            No messages yet.
                        </p>

                        <span>
                            Start the conversation.
                        </span>

                    </div>

                ) : (

                    messages.map((msg) => {

                        const isMine =
                            Number(msg.senderId) ===
                            Number(user?.id);

                        return (
                            <div
                                key={
                                    msg.id ||
                                    `${msg.createdAt}-${msg.senderId}`
                                }
                                className={
                                    isMine
                                        ? "message me"
                                        : "message other"
                                }
                            >

                                <div className="bubble">

                                    {/* TEXT */}

                                    {(
                                        msg.type ===
                                            "text" ||
                                        !msg.type
                                    ) && (
                                        <p>
                                            {msg.message}
                                        </p>
                                    )}

                                    {/* IMAGE */}

                                    {msg.type ===
                                        "image" && (

                                        <img
                                            src={getChatImageUrl(
                                                msg.image
                                            )}
                                            alt="Sent image"
                                            className="chat-image"
                                            onError={(event) => {
                                                event.currentTarget.src =
                                                    "/images/product-placeholder.png";
                                            }}
                                        />

                                    )}

                                    {/* AUDIO */}

                                    {msg.type ===
                                        "audio" && (

                                        <audio
                                            controls
                                        >
                                            <source
                                                src={getChatAudioUrl(
                                                    msg.audio
                                                )}
                                                type="audio/webm"
                                            />

                                            Your browser does
                                            not support audio.
                                        </audio>

                                    )}

                                    {/* MESSAGE FOOTER */}

                                    <div className="message-footer">

                                        <small>
                                            {msg.createdAt
                                                ? new Date(
                                                      msg.createdAt
                                                  ).toLocaleTimeString(
                                                      [],
                                                      {
                                                          hour:
                                                              "2-digit",
                                                          minute:
                                                              "2-digit"
                                                      }
                                                  )
                                                : ""}
                                        </small>

                                        {isMine && (

                                            <span className="message-status">

                                                {msg.status ===
                                                    "sent" && (
                                                    "✓"
                                                )}

                                                {msg.status ===
                                                    "delivered" && (
                                                    "✓✓"
                                                )}

                                                {msg.status ===
                                                    "read" && (

                                                    <span className="read-status">
                                                        ✓✓
                                                    </span>

                                                )}

                                            </span>

                                        )}

                                    </div>

                                </div>

                            </div>
                        );
                    })

                )}

                <div
                    ref={messagesEndRef}
                />

            </div>

            {/* =========================================
                CHAT FOOTER
            ========================================= */}

            <div className="chat-footer">

                {/* IMAGE INPUT */}

                <input
                    type="file"
                    id="chatImage"
                    hidden
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={uploadImage}
                />

                <label
                    htmlFor="chatImage"
                    className="image-upload"
                    title="Send image"
                >
                    <FaImage />
                </label>

                {/* RECORD / STOP */}

                {recording ? (

                    <button
                        type="button"
                        className="record-btn"
                        onClick={
                            stopRecording
                        }
                        title="Stop recording"
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
                        title="Record voice"
                    >
                        <FaMicrophone />
                    </button>

                )}

                {/* MESSAGE INPUT */}

                <input
                    type="text"
                    placeholder={
                        uploadingImage
                            ? "Uploading image..."
                            : recording
                            ? "Recording..."
                            : "Type a message..."
                    }
                    value={message}
                    disabled={
                        sendingMessage ||
                        uploadingImage
                    }
                    onChange={(event) =>
                        setMessage(
                            event.target.value
                        )
                    }
                    onKeyDown={handleKeyDown}
                />

                {/* AUDIO SEND */}

                {audioBlob && (

                    <button
                        type="button"
                        className="voice-send"
                        onClick={sendAudio}
                        disabled={sendingAudio}
                    >
                        {sendingAudio
                            ? "Sending..."
                            : "Send Voice"}
                    </button>

                )}

                {/* SEND */}

                <button
                    type="button"
                    className="send-btn"
                    onClick={sendMessage}
                    disabled={
                        sendingMessage ||
                        !message.trim()
                    }
                    title="Send message"
                >
                    <FaPaperPlane />
                </button>

            </div>

        </div>
    );
}

export default Chat;
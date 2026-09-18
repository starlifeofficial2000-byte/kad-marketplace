import { useEffect, useRef, useState } from "react";
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

const socket = io();

function Chat() {

    const { conversationId } = useParams();

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const user = JSON.parse(localStorage.getItem("user") || "null");

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);

    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);

    const [uploadingImage, setUploadingImage] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {

        if (!user) {

            navigate("/login");

            return;

        }

        loadConversation();

        loadMessages();

        socket.emit("join_conversation", conversationId);

        socket.on("receive_message", receiveMessage);

        return () => {

            socket.off("receive_message", receiveMessage);

        };

    }, [conversationId]);

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({

            behavior: "smooth"

        });

    }, [messages]);

    const receiveMessage = (msg) => {

        setMessages(prev => {

            const exists = prev.find(m => m.id === msg.id);

            if (exists) return prev;

            return [...prev, msg];

        });

    };

    const loadConversation = async () => {

        try {

            const res = await axios.get(

                `/api/messages/conversation/${conversationId}`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            setProduct(res.data.product);

            setSeller(res.data.seller);

        }

        catch (error) {

            console.log(error);

        }

    };

    const loadMessages = async () => {

        try {

            const res = await axios.get(

                `/api/messages/${conversationId}`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            setMessages(res.data.messages || []);

            await axios.put(

                `/api/messages/${conversationId}/delivered`,

                {},

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            await axios.put(

                `/api/messages/${conversationId}/read`,

                {},

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

        }

        catch (error) {

            console.log(error);

        }

    };

    const sendMessage = async () => {

        if (!message.trim()) return;

        try {

            const res = await axios.post(

                `/api/messages/${conversationId}`,

                {

                    message

                },

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            setMessages(prev => [

                ...prev,

                res.data.newMessage

            ]);

            setMessage("");

        }

        catch (error) {

            console.log(error);

        }

    };    /* ==========================================
       IMAGE UPLOAD
    ========================================== */

    const uploadImage = async (e) => {

        const file = e.target.files[0];

        if (!file) return;

        const formData = new FormData();

        formData.append("image", file);

        setUploadingImage(true);

        try {

            const res = await axios.post(

                `/api/messages/${conversationId}/image`,

                formData,

                {

                    headers: {

                        Authorization: `Bearer ${token}`,

                        "Content-Type": "multipart/form-data"

                    }

                }

            );

            setMessages(prev => [

                ...prev,

                res.data.newMessage

            ]);

        }

        catch (error) {

            console.log(error);

        }

        finally {

            setUploadingImage(false);

        }

    };

    /* ==========================================
       START RECORDING
    ========================================== */

    const startRecording = async () => {

        try {

            const stream = await navigator.mediaDevices.getUserMedia({

                audio: true

            });

            const recorder = new MediaRecorder(stream);

            const chunks = [];

            recorder.ondataavailable = (e) => {

                chunks.push(e.data);

            };

            recorder.onstop = () => {

                const blob = new Blob(

                    chunks,

                    {

                        type: "audio/webm"

                    }

                );

                setAudioBlob(blob);

            };

            recorder.start();

            setMediaRecorder(recorder);

            setRecording(true);

        }

        catch (error) {

            console.log(error);

            alert("Unable to access microphone.");

        }

    };

    /* ==========================================
       STOP RECORDING
    ========================================== */

    const stopRecording = () => {

        if (!mediaRecorder) return;

        mediaRecorder.stop();

        setRecording(false);

    };

    /* ==========================================
       SEND AUDIO
    ========================================== */

    const sendAudio = async () => {

        if (!audioBlob) return;

        const formData = new FormData();

        formData.append(

            "audio",

            audioBlob,

            "voice.webm"

        );

        try {

            const res = await axios.post(

                `/api/messages/${conversationId}/audio`,

                formData,

                {

                    headers: {

                        Authorization: `Bearer ${token}`,

                        "Content-Type": "multipart/form-data"

                    }

                }

            );

            setMessages(prev => [

                ...prev,

                res.data.newMessage

            ]);

            setAudioBlob(null);

        }

        catch (error) {

            console.log(error);

        }

    };

    return (

        <div className="chat-page">

            <div className="chat-header">

                <div className="chat-user">

                    <img

                        src={

                            product?.images?.length

                                ?

                                `/uploads/${product.images[0]}`

                                :

                                "https://via.placeholder.com/80"

                        }

                        alt=""

                    />

                    <div>

                        <h2>{product?.title}</h2>

                        <p>{seller?.name}</p>

                    </div>

                </div>

                <div className="chat-actions">

                    <button><FaPhone /></button>

                    <button><FaVideo /></button>

                    <button><FaEllipsisV /></button>

                </div>

            </div>

            <div className="chat-messages">

                {

                    messages.map(msg => (

                        <div

                            key={msg.id}

                            className={

                                msg.senderId === user.id

                                    ?

                                    "message me"

                                    :

                                    "message other"

                            }

                        >

                            <div className="bubble">

                                {

                                    msg.type === "text" &&

                                    <p>{msg.message}</p>

                                }

                                {

                                    msg.type === "image" &&

                                    <img

                                        src={`/uploads/chat/images/${msg.image}`}

                                        alt=""

                                        className="chat-image"

                                    />

                                }

                                {

                                    msg.type === "audio" &&

                                    <audio controls>

                                        <source

                                            src={`/uploads/chat/audio/${msg.audio}`}

                                            type="audio/webm"

                                        />

                                    </audio>

                                }

                                <div className="message-footer">

                                    <small>

                                        {

                                            new Date(msg.createdAt).toLocaleTimeString(

                                                [],

                                                {

                                                    hour: "2-digit",

                                                    minute: "2-digit"

                                                }

                                            )

                                        }

                                    </small>

                                    {

                                        msg.senderId === user.id &&

                                        <span className="message-status">

                                            {

                                                msg.status === "sent"

                                                    ?

                                                    "✓"

                                                    :

                                                    msg.status === "delivered"

                                                        ?

                                                        "✓✓"

                                                        :

                                                        <span className="read-status">

                                                            ✓✓

                                                        </span>

                                            }

                                        </span>

                                    }

                                </div>

                            </div>

                        </div>

                    ))

                }

                <div ref={messagesEndRef}></div>

            </div>

            <div className="chat-footer">

                <input

                    type="file"

                    id="chatImage"

                    hidden

                    accept="image/*"

                    onChange={uploadImage}

                />

                <label

                    htmlFor="chatImage"

                    className="image-upload"

                >

                    <FaImage />

                </label>

                {

                    recording

                        ?

                        <button

                            className="record-btn"

                            onClick={stopRecording}

                        >

                            <FaStop />

                        </button>

                        :

                        <button

                            className="record-btn"

                            onClick={startRecording}

                        >

                            <FaMicrophone />

                        </button>

                }

                <input

                    type="text"

                    placeholder="Type a message..."

                    value={message}

                    onChange={(e) => setMessage(e.target.value)}

                    onKeyDown={(e) => {

                        if (e.key === "Enter") {

                            sendMessage();

                        }

                    }}

                />

                {

                    audioBlob &&

                    <button

                        className="voice-send"

                        onClick={sendAudio}

                    >

                        Send Voice

                    </button>

                }

                <button

                    className="send-btn"

                    onClick={sendMessage}

                >

                    <FaPaperPlane />

                </button>

            </div>

        </div>

    );

}

export default Chat;
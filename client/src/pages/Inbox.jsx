import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";

import {
    FaSearch,
    FaComments
} from "react-icons/fa";

import "./Inbox.css";

function Inbox() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const [conversations, setConversations] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        if (!user) {

            navigate("/login");
            return;

        }

        loadConversations();

        // Refresh conversations every 10 seconds
        const interval = setInterval(() => {

            loadConversations();

        }, 10000);

        return () => clearInterval(interval);

    }, [navigate]);


    const loadConversations = async () => {

        try {

            const response = await api.get(
                "/messages/conversations"
            );

            console.log(
                "CONVERSATIONS:",
                response.data
            );

            const data =
                response.data.conversations ||
                response.data.data ||
                response.data ||
                [];

            setConversations(
                Array.isArray(data) ? data : []
            );

            setError("");

        }

        catch (error) {

            console.error(
                "LOAD CONVERSATIONS ERROR:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to load conversations."
            );

        }

        finally {

            setLoading(false);

        }

    };


    const filtered = conversations.filter((item) => {

        const searchText = search.toLowerCase();

        const productTitle =
            item.product?.title?.toLowerCase() || "";

        const lastMessage =
            item.lastMessage?.toLowerCase() || "";

        return (
            productTitle.includes(searchText) ||
            lastMessage.includes(searchText)
        );

    });


    const getProductImage = (conversation) => {

        let images = [];

        const productImages =
            conversation.product?.images;

        if (!productImages) {

            return "https://via.placeholder.com/100";

        }

        try {

            images = Array.isArray(productImages)
                ? productImages
                : JSON.parse(productImages);

        }

        catch {

            images = [];

        }

        if (!images.length) {

            return "https://via.placeholder.com/100";

        }

        const firstImage = images[0];

        // If backend already sends full URL
        if (
            firstImage.startsWith("http")
        ) {

            return firstImage;

        }

        return `/uploads/${firstImage}`;

    };


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

                    onChange={(e) =>
                        setSearch(e.target.value)
                    }

                />

            </div>


            {/* LOADING */}

            {loading && (

                <div className="empty-chat">

                    <p>
                        Loading conversations...
                    </p>

                </div>

            )}


            {/* ERROR */}

            {!loading && error && (

                <div className="empty-chat">

                    <FaComments />

                    <h2>
                        Unable to Load Messages
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={loadConversations}
                    >

                        Try Again

                    </button>

                </div>

            )}


            {/* EMPTY */}

            {!loading &&
                !error &&
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

            {!loading &&
                !error &&
                filtered.map((conversation) => (

                    <div

                        key={
                            conversation.id ||
                            conversation._id
                        }

                        className="conversation"

                        onClick={() =>

                            navigate(
                                `/chat/${conversation.id || conversation._id}`
                            )

                        }

                    >

                        {/* PRODUCT IMAGE */}

                        <img

                            src={
                                getProductImage(conversation)
                            }

                            alt={
                                conversation.product?.title ||
                                "Product"
                            }

                            onError={(e) => {

                                e.currentTarget.src =
                                    "https://via.placeholder.com/100";

                            }}

                        />


                        {/* CONVERSATION INFO */}

                        <div className="conversation-info">

                            <h2>

                                {
                                    conversation.product?.title ||
                                    "Product Conversation"
                                }

                            </h2>

                            <p>

                                {
                                    conversation.lastMessage ||
                                    "Start chatting..."
                                }

                            </p>

                            <small>

                                GH₵ {

                                    conversation.product?.price ??
                                    "0"

                                }

                            </small>

                        </div>


                        {/* RIGHT SIDE */}

                        <div className="conversation-right">

                            <span>

                                {

                                    conversation.updatedAt

                                        ?

                                        new Date(
                                            conversation.updatedAt
                                        ).toLocaleDateString()

                                        :

                                        ""

                                }

                            </span>


                            {

                                conversation.unreadCount > 0 && (

                                    <div className="badge">

                                        {
                                            conversation.unreadCount
                                        }

                                    </div>

                                )

                            }

                        </div>

                    </div>

                ))

            }

        </div>

    );

}

export default Inbox;
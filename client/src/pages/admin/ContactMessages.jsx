import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./ContactMessages.css";

function ContactMessages() {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);


    /* ==========================================
       LOAD CONTACT MESSAGES
    ========================================== */

    useEffect(() => {

        loadMessages();

    }, []);


    const loadMessages = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/contact"
            );


            setMessages(

                response.data.messages ||

                response.data ||

                []

            );

        }

        catch (error) {

            console.error(
                "LOAD CONTACT MESSAGES ERROR:",
                error.response?.data || error.message
            );

            setMessages([]);

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       VIEW MESSAGE
    ========================================== */

    const viewMessage = async (message) => {

        try {

            if (
                message.status?.toLowerCase() === "unread"
            ) {

                await api.patch(

                    `/contact/${message.id}/read`

                );

            }


            setSelectedMessage({

                ...message,

                status: "Read"

            });


            setShowModal(true);


            loadMessages();

        }

        catch (error) {

            console.error(
                "VIEW MESSAGE ERROR:",
                error.response?.data || error.message
            );

        }

    };


    /* ==========================================
       DELETE MESSAGE
    ========================================== */

    const deleteMessage = async (id) => {

        if (!window.confirm("Delete this message?")) {

            return;

        }


        try {

            await api.delete(

                `/contact/${id}`

            );


            setMessages((previousMessages) =>

                previousMessages.filter(

                    (message) => message.id !== id

                )

            );


            if (
                selectedMessage?.id === id
            ) {

                setShowModal(false);

                setSelectedMessage(null);

            }

        }

        catch (error) {

            console.error(
                "DELETE MESSAGE ERROR:",
                error.response?.data || error.message
            );

            alert(

                error.response?.data?.message ||

                "Unable to delete message."

            );

        }

    };


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="contact-messages">

                <h2>Loading messages...</h2>

            </div>

        );

    }


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="contact-messages">

            <h2>📩 Contact Messages</h2>


            <table>

                <thead>

                    <tr>

                        <th>Name</th>

                        <th>Email</th>

                        <th>Subject</th>

                        <th>Status</th>

                        <th>Date</th>

                        <th>Actions</th>

                    </tr>

                </thead>


                <tbody>

                    {

                        messages.length === 0

                            ?

                            (

                                <tr>

                                    <td
                                        colSpan="6"
                                        style={{
                                            textAlign: "center",
                                            padding: "30px"
                                        }}
                                    >

                                        No contact messages found.

                                    </td>

                                </tr>

                            )

                            :

                            (

                                messages.map((message) => (

                                    <tr
                                        key={message.id}
                                    >

                                        <td>

                                            {message.name || "-"}

                                        </td>


                                        <td>

                                            {message.email || "-"}

                                        </td>


                                        <td>

                                            {message.subject || "-"}

                                        </td>


                                        <td>

                                            <span

                                                className={

                                                    message.status?.toLowerCase() === "unread"

                                                        ?

                                                        "status-unread"

                                                        :

                                                        "status-read"

                                                }

                                            >

                                                {message.status || "Unread"}

                                            </span>

                                        </td>


                                        <td>

                                            {

                                                message.createdAt

                                                    ?

                                                    new Date(
                                                        message.createdAt
                                                    ).toLocaleString()

                                                    :

                                                    "-"

                                            }

                                        </td>


                                        <td>

                                            <button

                                                className="read-btn"

                                                onClick={() =>

                                                    viewMessage(message)

                                                }

                                            >

                                                View

                                            </button>


                                            <button

                                                className="delete-btn"

                                                onClick={() =>

                                                    deleteMessage(message.id)

                                                }

                                            >

                                                Delete

                                            </button>

                                        </td>

                                    </tr>

                                ))

                            )

                    }

                </tbody>

            </table>


            {/* =====================================
                MESSAGE MODAL
            ====================================== */}

            {

                showModal && selectedMessage && (

                    <div className="message-modal">

                        <div className="message-content">

                            <h2>

                                {selectedMessage.subject}

                            </h2>


                            <p>

                                <strong>Name:</strong>

                                {" "}

                                {selectedMessage.name}

                            </p>


                            <p>

                                <strong>Email:</strong>

                                {" "}

                                {selectedMessage.email}

                            </p>


                            <p>

                                <strong>Phone:</strong>

                                {" "}

                                {

                                    selectedMessage.phone ||

                                    "N/A"

                                }

                            </p>


                            <p>

                                <strong>Date:</strong>

                                {" "}

                                {

                                    selectedMessage.createdAt

                                        ?

                                        new Date(

                                            selectedMessage.createdAt

                                        ).toLocaleString()

                                        :

                                        "N/A"

                                }

                            </p>


                            <hr />


                            <p className="message-body">

                                {

                                    selectedMessage.message ||

                                    "No message content."

                                }

                            </p>


                            <button

                                onClick={() => {

                                    setShowModal(false);

                                    setSelectedMessage(null);

                                }}

                            >

                                Close

                            </button>

                        </div>

                    </div>

                )

            }

        </div>

    );

}


export default ContactMessages;
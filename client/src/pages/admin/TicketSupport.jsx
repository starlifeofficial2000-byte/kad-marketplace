import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../config/axios";

import "./TicketSupport.css";

function TicketSupport() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);

    const [reply, setReply] = useState("");

    const [status, setStatus] = useState("Open");

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        loadTicket();

    }, [id]);


    /* ==========================================
       LOAD SINGLE TICKET
    ========================================== */

    const loadTicket = async () => {

        try {

            const response = await api.get(
                `/admin/support/${id}`
            );

            console.log(
                "SINGLE TICKET:",
                response.data
            );

            setTicket(response.data);

            setReply(
                response.data.adminReply || ""
            );

            setStatus(
                response.data.status || "Open"
            );

        }

        catch (error) {

            console.error(
                "LOAD TICKET ERROR:",
                error.response?.data || error.message
            );

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       SEND ADMIN REPLY
    ========================================== */

    const sendReply = async () => {

        if (!reply.trim()) {

            alert("Please write a reply.");

            return;

        }

        try {

            await api.put(

                `/admin/support/${id}/reply`,

                {
                    reply
                }

            );

            alert(
                "Reply sent successfully."
            );

            loadTicket();

        }

        catch (error) {

            console.error(
                "SEND REPLY ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to send reply."
            );

        }

    };


    /* ==========================================
       UPDATE STATUS
    ========================================== */

    const updateStatus = async () => {

        try {

            await api.put(

                `/admin/support/${id}/status`,

                {
                    status
                }

            );

            alert(
                "Status updated successfully."
            );

            loadTicket();

        }

        catch (error) {

            console.error(
                "STATUS UPDATE ERROR:",
                error.response?.data || error.message
            );

            alert(
                "Failed to update status."
            );

        }

    };


    /* ==========================================
       DELETE TICKET
    ========================================== */

    const deleteTicket = async () => {

        const confirmDelete = window.confirm(
            "Delete this support ticket?"
        );

        if (!confirmDelete) {

            return;

        }

        try {

            await api.delete(

                `/admin/support/${id}`

            );

            alert(
                "Ticket deleted successfully."
            );

            navigate(
                "/admin/support"
            );

        }

        catch (error) {

            console.error(
                "DELETE TICKET ERROR:",
                error.response?.data || error.message
            );

            alert(
                "Failed to delete ticket."
            );

        }

    };


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return <h2>Loading support ticket...</h2>;

    }


    if (!ticket) {

        return (

            <div className="ticket-support">

                <h2>
                    Support ticket not found.
                </h2>

                <button
                    onClick={() =>
                        navigate("/admin/support")
                    }
                >

                    Back

                </button>

            </div>

        );

    }


    return (

        <div className="ticket-support">

            <div className="ticket-card">


                <h1>

                    Support Ticket #{ticket.id}

                </h1>


                {/* USER INFORMATION */}

                <div className="user-card">

                    <img

                        src={

                            ticket.user?.profileImage

                                ?

                                `/uploads/${ticket.user.profileImage}`

                                :

                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    ticket.user?.name || "User"
                                )}`

                        }

                        alt="User"

                    />


                    <div>

                        <h2>

                            {ticket.user?.name || "Unknown User"}

                        </h2>

                        <p>

                            {ticket.user?.email || "-"}

                        </p>

                        <p>

                            {ticket.user?.phone || "-"}

                        </p>

                    </div>

                </div>


                {/* TICKET INFORMATION */}

                <div className="ticket-grid">

                    <div>

                        <strong>Subject</strong>

                        <p>

                            {ticket.subject}

                        </p>

                    </div>


                    <div>

                        <strong>Category</strong>

                        <p>

                            {ticket.category}

                        </p>

                    </div>


                    <div>

                        <strong>Priority</strong>

                        <p>

                            {ticket.priority}

                        </p>

                    </div>


                    <div>

                        <strong>Status</strong>

                        <p>

                            {ticket.status}

                        </p>

                    </div>

                </div>


                {/* CUSTOMER MESSAGE */}

                <div className="message-box">

                    <h2>

                        Customer Message

                    </h2>

                    <p>

                        {ticket.message}

                    </p>

                </div>


                {/* ADMIN REPLY */}

                <div className="reply-box">

                    <h2>

                        Reply

                    </h2>


                    <textarea

                        value={reply}

                        onChange={(e) =>
                            setReply(e.target.value)
                        }

                        placeholder="Write your reply..."

                    />


                    <button

                        className="reply-btn"

                        onClick={sendReply}

                    >

                        Send Reply

                    </button>

                </div>


                {/* CHANGE STATUS */}

                <div className="status-box">

                    <h2>

                        Change Status

                    </h2>


                    <select

                        value={status}

                        onChange={(e) =>
                            setStatus(e.target.value)
                        }

                    >

                        <option value="Open">

                            Open

                        </option>

                        <option value="Pending">

                            Pending

                        </option>

                        <option value="Answered">

                            Answered

                        </option>

                        <option value="Closed">

                            Closed

                        </option>

                    </select>


                    <button

                        className="status-btn"

                        onClick={updateStatus}

                    >

                        Save Status

                    </button>

                </div>


                {/* BUTTONS */}

                <div className="bottom-buttons">

                    <button

                        className="back-btn"

                        onClick={() =>
                            navigate("/admin/support")
                        }

                    >

                        Back

                    </button>


                    <button

                        className="delete-btn"

                        onClick={deleteTicket}

                    >

                        Delete Ticket

                    </button>

                </div>

            </div>

        </div>

    );

}

export default TicketSupport;
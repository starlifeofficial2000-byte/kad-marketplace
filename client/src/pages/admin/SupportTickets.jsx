import { useEffect, useState } from "react";
import api from "../../config/axios";
import { useNavigate } from "react-router-dom";

import "./SupportTickets.css";

function SupportTickets() {
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/support");

            console.log("SUPPORT TICKETS:", response.data);

            // Extract the tickets array from the API response.
            const data = response.data;

            const ticketList = Array.isArray(data)
                ? data
                : Array.isArray(data?.tickets)
                    ? data.tickets
                    : [];

            setTickets(ticketList);

        } catch (error) {
            console.error(
                "LOAD TICKETS ERROR:",
                error.response?.data || error.message
            );

            setTickets([]);

            setError(
                error.response?.data?.message ||
                "Unable to load support tickets. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="support-page">
                <h2>Loading support tickets...</h2>
            </div>
        );
    }

    return (
        <div className="support-page">

            <div className="support-header">
                <div>
                    <h1>Support Tickets</h1>
                    <p>Manage customer support requests.</p>
                </div>

                <button
                    type="button"
                    className="view-btn"
                    onClick={loadTickets}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="support-error">
                    {error}
                </div>
            )}

            <div className="support-summary">
                <h3>
                    Total Tickets: {tickets.length}
                </h3>
            </div>

            <div className="support-table-container">

                <table className="support-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Subject</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        {tickets.length === 0 ? (
                            <tr>
                                <td colSpan="8">
                                    No support tickets found.
                                </td>
                            </tr>
                        ) : (
                            tickets.map((ticket, index) => (

                                <tr key={ticket.id || index}>

                                    <td>
                                        #{ticket.id || "N/A"}
                                    </td>

                                    <td>
                                        {ticket.user?.name ||
                                            ticket.user?.username ||
                                            ticket.user?.email ||
                                            "Unknown User"}
                                    </td>

                                    <td>
                                        {ticket.subject || "No subject"}
                                    </td>

                                    <td>
                                        {ticket.category || "Other"}
                                    </td>

                                    <td>
                                        <span
                                            className={`priority ${
                                                (ticket.priority || "medium").toLowerCase()
                                            }`}
                                        >
                                            {ticket.priority || "Medium"}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`status ${
                                                (ticket.status || "open").toLowerCase()
                                            }`}
                                        >
                                            {ticket.status || "Open"}
                                        </span>
                                    </td>

                                    <td>
                                        {formatDate(ticket.createdAt)}
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="view-btn"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/support/${ticket.id}`
                                                )
                                            }
                                        >
                                            View
                                        </button>
                                    </td>

                                </tr>

                            ))
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default SupportTickets;
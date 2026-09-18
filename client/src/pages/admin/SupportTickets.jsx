import { useEffect, useState } from "react";
import api from "../../config/axios";
import { useNavigate } from "react-router-dom";

import "./SupportTickets.css";

function SupportTickets() {

    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadTickets();

    }, []);

    const loadTickets = async () => {

        try {

            const response = await api.get(
                "/admin/support"
            );

            console.log(
                "SUPPORT TICKETS:",
                response.data
            );

            setTickets(response.data);

        }

        catch (error) {

            console.error(
                "LOAD TICKETS ERROR:",
                error.response?.data || error.message
            );

        }

        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return <h2>Loading support tickets...</h2>;

    }

    return (

        <div className="support-page">

            <h1>Support Tickets</h1>

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

                    {

                        tickets.length === 0 ?

                        (

                            <tr>

                                <td colSpan="8">

                                    No support tickets found.

                                </td>

                            </tr>

                        )

                        :

                        (

                            tickets.map(ticket => (

                                <tr key={ticket.id}>

                                    <td>#{ticket.id}</td>

                                    <td>

                                        {ticket.user?.name || "Unknown User"}

                                    </td>

                                    <td>{ticket.subject}</td>

                                    <td>{ticket.category}</td>

                                    <td>

                                        <span
                                            className={`priority ${
                                                (ticket.priority || "")
                                                    .toLowerCase()
                                            }`}
                                        >

                                            {ticket.priority}

                                        </span>

                                    </td>

                                    <td>

                                        <span
                                            className={`status ${
                                                (ticket.status || "")
                                                    .toLowerCase()
                                            }`}
                                        >

                                            {ticket.status}

                                        </span>

                                    </td>

                                    <td>

                                        {new Date(
                                            ticket.createdAt
                                        ).toLocaleDateString()}

                                    </td>

                                    <td>

                                        <button

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

                        )

                    }

                </tbody>

            </table>

        </div>

    );

}

export default SupportTickets;
import { useEffect, useState } from "react";
import api from "../config/axios";
import { useNavigate } from "react-router-dom";
import "./MyTickets.css";

function MyTickets() {

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

            const response = await api.get(
                "/support/my-tickets"
            );

            console.log(
                "MY TICKETS RESPONSE:",
                response.data
            );

            setTickets(
                response.data.tickets ||
                response.data ||
                []
            );

        }

        catch (error) {

            console.error(
                "LOAD TICKETS ERROR:",
                error.response?.data || error.message
            );

            setError(

                error.response?.data?.message ||

                "Unable to load support tickets."

            );

        }

        finally {

            setLoading(false);

        }

    };


    if (loading) {

        return (

            <div className="tickets-page">

                <div className="tickets-loading">

                    Loading support tickets...

                </div>

            </div>

        );

    }


    return (

        <div className="tickets-page">

            <div className="tickets-header">

                <div>

                    <h1>
                        My Support Tickets
                    </h1>

                    <p>
                        Track and manage your support requests.
                    </p>

                </div>

                <button
                    className="refresh-btn"
                    onClick={loadTickets}
                >
                    ↻ Refresh
                </button>

            </div>


            {error && (

                <div className="tickets-error">

                    {error}

                </div>

            )}


            {tickets.length === 0 ? (

                <div className="empty-tickets">

                    <h2>
                        No Support Tickets Yet
                    </h2>

                    <p>
                        You haven't submitted any support requests.
                    </p>

                </div>

            ) : (

                <div className="table-wrapper">

                    <table className="tickets-table">

                        <thead>

                            <tr>

                                <th>ID</th>
                                <th>Subject</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>

                            </tr>

                        </thead>


                        <tbody>

                            {tickets.map((ticket) => (

                                <tr key={ticket.id}>

                                    <td>

                                        #{ticket.id}

                                    </td>


                                    <td className="ticket-subject">

                                        {ticket.subject}

                                    </td>


                                    <td>

                                        {ticket.category}

                                    </td>


                                    <td>

                                        <span
                                            className={`priority ${ticket.priority?.toLowerCase()}`}
                                        >

                                            {ticket.priority}

                                        </span>

                                    </td>


                                    <td>

                                        <span
                                            className={`status ${ticket.status?.toLowerCase()}`}
                                        >

                                            {ticket.status}

                                        </span>

                                    </td>


                                    <td>

                                        {ticket.createdAt

                                            ? new Date(
                                                ticket.createdAt
                                            ).toLocaleDateString()

                                            : "N/A"

                                        }

                                    </td>


                                    <td>

                                        <button

                                            className="view-btn"

                                            onClick={() =>

                                                navigate(

                                                    `/my-tickets/${ticket.id}`

                                                )

                                            }

                                        >

                                            View

                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}

export default MyTickets;
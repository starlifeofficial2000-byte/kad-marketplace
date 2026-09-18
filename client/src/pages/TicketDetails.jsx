import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../config/axios";

import "./TicketDetails.css";


function TicketDetails() {

    const { id } = useParams();

    const [ticket, setTicket] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* ==========================================
       LOAD TICKET
    ========================================== */

    useEffect(() => {

        loadTicket();

    }, [id]);


    const loadTicket = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(
                `/support/${id}`
            );


            console.log(
                "TICKET RESPONSE:",
                response.data
            );


            /*
                Supports different backend response formats
            */

            const ticketData =

                response.data?.ticket ||

                response.data?.data ||

                response.data;


            setTicket(ticketData);

        }

        catch (error) {

            console.error(

                "LOAD TICKET ERROR:",

                error.response?.data || error.message

            );


            setError(

                error.response?.data?.message ||

                "Failed to load support ticket."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="ticket-details">

                <h2>

                    Loading Ticket...

                </h2>

            </div>

        );

    }


    /* ==========================================
       ERROR
    ========================================== */

    if (error) {

        return (

            <div className="ticket-details">

                <div className="ticket-card">

                    <h2>

                        {error}

                    </h2>

                </div>

            </div>

        );

    }


    /* ==========================================
       NOT FOUND
    ========================================== */

    if (!ticket) {

        return (

            <div className="ticket-details">

                <h2>

                    Ticket not found.

                </h2>

            </div>

        );

    }


    return (

        <div className="ticket-details">

            <div className="ticket-card">


                <h1>

                    {ticket.subject || "Support Ticket"}

                </h1>


                {/* TICKET INFORMATION */}

                <div className="ticket-info">


                    <p>

                        <strong>Category:</strong>

                        {ticket.category || "-"}

                    </p>


                    <p>

                        <strong>Priority:</strong>

                        {ticket.priority || "-"}

                    </p>


                    <p>

                        <strong>Status:</strong>

                        <span
                            className={`status ${
                                ticket.status
                                    ? ticket.status.toLowerCase()
                                    : ""
                            }`}
                        >

                            {ticket.status || "Unknown"}

                        </span>

                    </p>


                    <p>

                        <strong>Created:</strong>

                        {

                            ticket.createdAt

                                ?

                                new Date(
                                    ticket.createdAt
                                ).toLocaleString()

                                :

                                "-"

                        }

                    </p>


                </div>


                {/* USER MESSAGE */}

                <div className="message-box">

                    <h2>

                        Your Message

                    </h2>

                    <p>

                        {ticket.message || "-"}

                    </p>

                </div>


                {/* ADMIN REPLY */}

                <div className="reply-box">

                    <h2>

                        Admin Reply

                    </h2>


                    {

                        ticket.adminReply

                            ?

                            <p>

                                {ticket.adminReply}

                            </p>

                            :

                            <p className="waiting">

                                No reply yet.

                            </p>

                    }

                </div>


            </div>

        </div>

    );

}


export default TicketDetails;
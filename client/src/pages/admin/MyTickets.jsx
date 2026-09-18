import { useEffect, useState } from "react";
import api from "../../config/axios";
import { useNavigate } from "react-router-dom";
import "./MyTickets.css";

function MyTickets() {

    const token = localStorage.getItem("token");

    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);

    useEffect(() => {

        loadTickets();

    }, []);

    const loadTickets = async () => {

        try {

           const response = await api.get(
    "/settings"
);

            setTickets(res.data);

        }

        catch(error){

            console.log(error);

        }

    };

    return(

        <div className="tickets-page">

            <h1>

                My Support Tickets

            </h1>

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

                {

                    tickets.map(ticket=>(

                        <tr key={ticket.id}>

                            <td>

                                #{ticket.id}

                            </td>

                            <td>

                                {ticket.subject}

                            </td>

                            <td>

                                {ticket.category}

                            </td>

                            <td>

                                <span className={`priority ${ticket.priority.toLowerCase()}`}>

                                    {ticket.priority}

                                </span>

                            </td>

                            <td>

                                <span className={`status ${ticket.status.toLowerCase()}`}>

                                    {ticket.status}

                                </span>

                            </td>

                            <td>

                                {new Date(ticket.createdAt).toLocaleDateString()}

                            </td>

                            <td>

                                <button

                                    className="view-btn"

                                    onClick={()=>navigate(`/my-tickets/${ticket.id}`)}

                                >

                                    View

                                </button>

                            </td>

                        </tr>

                    ))

                }

                </tbody>

            </table>

        </div>

    );

}

export default MyTickets;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import "./SellerLeads.css";

function SellerLeads() {

    const navigate = useNavigate();

    const [leads, setLeads] = useState([]);

    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState("");

    const [typeFilter, setTypeFilter] = useState("");


    /* ==========================================
       LOAD LEADS
    ========================================== */

    const loadLeads = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/leads/seller",
                {
                    params: {
                        status: statusFilter || undefined,
                        type: typeFilter || undefined
                    }
                }
            );

            console.log(
                "LEADS RESPONSE:",
                response.data
            );


            const leadsData =
                response.data?.leads ||
                response.data?.data ||
                (
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );


            setLeads(leadsData);

        }

        catch (error) {

            console.error(
                "LOAD LEADS ERROR:",
                error.response?.data || error.message
            );

            setLeads([]);

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       LOAD WHEN FILTERS CHANGE
    ========================================== */

    useEffect(() => {

        loadLeads();

    }, [
        statusFilter,
        typeFilter
    ]);


    /* ==========================================
       UPDATE LEAD STATUS
    ========================================== */

    const updateStatus = async (
        id,
        status
    ) => {

        try {

            await api.put(

                `/leads/${id}`,

                {
                    status
                }

            );


            setLeads((currentLeads) =>

                currentLeads.map((lead) =>

                    lead.id === id

                        ? {
                            ...lead,
                            status
                        }

                        : lead

                )

            );

        }

        catch (error) {

            console.error(

                "UPDATE LEAD ERROR:",

                error.response?.data || error.message

            );


            alert(

                error.response?.data?.message ||

                "Failed to update lead status."

            );

        }

    };


    /* ==========================================
       MESSAGE BUYER
    ========================================== */

    const messageBuyer = async (lead) => {

        try {

            const response = await api.post(

                "/messages/open",

                {

                    buyerId: lead.buyerId,

                    sellerId: lead.sellerId,

                    productId: lead.productId

                }

            );


            console.log(

                "MESSAGE RESPONSE:",

                response.data

            );


            const conversationId =

                response.data?.conversationId ||

                response.data?.data?.conversationId;


            if (conversationId) {

                navigate(

                    `/chat/${conversationId}`

                );

            }

            else {

                alert(

                    "Conversation could not be opened."

                );

            }

        }

        catch (error) {

            console.error(

                "MESSAGE BUYER ERROR:",

                error.response?.data || error.message

            );


            alert(

                error.response?.data?.message ||

                "Unable to open conversation."

            );

        }

    };


    /* ==========================================
       VIEW BUYER PROFILE
    ========================================== */

    const viewProfile = (buyerId) => {

        if (!buyerId) {

            alert("Buyer profile is unavailable.");

            return;

        }


        navigate(

            `/profile/${buyerId}`

        );

    };


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="seller-leads">

                <h2>

                    Loading Leads...

                </h2>

            </div>

        );

    }


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="seller-leads">

            <div className="seller-leads-header">

                <div>

                    <h1>

                        Seller Leads

                    </h1>

                    <p>

                        Manage buyers interested in your products.

                    </p>

                </div>


                <button
                    className="refresh-btn"
                    onClick={loadLeads}
                >

                    ↻ Refresh

                </button>

            </div>


            {/* FILTERS */}

            <div className="filters">

                <select

                    value={statusFilter}

                    onChange={(e) =>

                        setStatusFilter(

                            e.target.value

                        )

                    }

                >

                    <option value="">

                        All Status

                    </option>

                    <option value="New">

                        New

                    </option>

                    <option value="Contacted">

                        Contacted

                    </option>

                    <option value="Negotiating">

                        Negotiating

                    </option>

                    <option value="Converted">

                        Converted

                    </option>

                    <option value="Closed">

                        Closed

                    </option>

                </select>


                <select

                    value={typeFilter}

                    onChange={(e) =>

                        setTypeFilter(

                            e.target.value

                        )

                    }

                >

                    <option value="">

                        All Types

                    </option>

                    <option value="Interested">

                        Interested

                    </option>

                    <option value="Offer">

                        Offer

                    </option>

                    <option value="Chat">

                        Chat

                    </option>

                    <option value="Phone Request">

                        Phone Request

                    </option>

                    <option value="Location Request">

                        Location Request

                    </option>

                    <option value="Wishlist">

                        Wishlist

                    </option>

                    <option value="Share">

                        Share

                    </option>

                </select>

            </div>


            {/* TABLE */}

            <div className="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>

                                Buyer

                            </th>

                            <th>

                                Product

                            </th>

                            <th>

                                Lead Type

                            </th>

                            <th>

                                Offer

                            </th>

                            <th>

                                Status

                            </th>

                            <th>

                                Date

                            </th>

                            <th>

                                Actions

                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {

                            leads.length === 0

                                ?

                                (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            style={{
                                                textAlign: "center",
                                                padding: "30px"
                                            }}
                                        >

                                            No Leads Found

                                        </td>

                                    </tr>

                                )

                                :

                                (

                                    leads.map((lead) => (

                                        <tr key={lead.id}>

                                            {/* BUYER */}

                                            <td>

                                                <strong>

                                                    {

                                                        lead.buyer?.name ||

                                                        "Unknown Buyer"

                                                    }

                                                </strong>

                                            </td>


                                            {/* PRODUCT */}

                                            <td>

                                                {

                                                    lead.product?.title ||

                                                    "Product Unavailable"

                                                }

                                            </td>


                                            {/* LEAD TYPE */}

                                            <td>

                                                {lead.type || "-"}

                                            </td>


                                            {/* OFFER */}

                                            <td>

                                                {

                                                    lead.offerPrice

                                                        ?

                                                        `GH₵ ${Number(
                                                            lead.offerPrice
                                                        ).toLocaleString()}`

                                                        :

                                                        "-"

                                                }

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`lead-status ${String(
                                                        lead.status || ""
                                                    ).toLowerCase()}`}
                                                >

                                                    {lead.status || "New"}

                                                </span>

                                            </td>


                                            {/* DATE */}

                                            <td>

                                                {

                                                    lead.createdAt

                                                        ?

                                                        new Date(
                                                            lead.createdAt
                                                        ).toLocaleDateString()

                                                        :

                                                        "-"

                                                }

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="lead-actions">


                                                    <select

                                                        value={
                                                            lead.status ||
                                                            "New"
                                                        }

                                                        onChange={(e) =>

                                                            updateStatus(

                                                                lead.id,

                                                                e.target.value

                                                            )

                                                        }

                                                    >

                                                        <option value="New">

                                                            New

                                                        </option>

                                                        <option value="Contacted">

                                                            Contacted

                                                        </option>

                                                        <option value="Negotiating">

                                                            Negotiating

                                                        </option>

                                                        <option value="Converted">

                                                            Converted

                                                        </option>

                                                        <option value="Closed">

                                                            Closed

                                                        </option>

                                                    </select>


                                                    <button

                                                        className="message-btn"

                                                        onClick={() =>

                                                            messageBuyer(lead)

                                                        }

                                                    >

                                                        💬 Message

                                                    </button>


                                                    <button

                                                        className="profile-btn"

                                                        onClick={() =>

                                                            viewProfile(

                                                                lead.buyerId

                                                            )

                                                        }

                                                    >

                                                        👤 Profile

                                                    </button>


                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                )

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default SellerLeads;
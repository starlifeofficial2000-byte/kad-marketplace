import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../config/axios";

import "./PaymentDetails.css";

function PaymentDetails() {

    const { id } = useParams();

    const token = localStorage.getItem("token");

    const [payment, setPayment] = useState(null);

    useEffect(() => {

        loadPayment();

    }, []);

    const loadPayment = async () => {

        try {
const response = await api.get(
    "/settings"
);
            setPayment(res.data);

        }

        catch(error){

            console.log(error);

        }

    };

    if(!payment){

        return <h2>Loading...</h2>;

    }

    return(

<div className="payment-details">

<h1>Payment Details</h1>

<div className="details-card">

<p><strong>Customer:</strong> {payment.user?.name}</p>

<p><strong>Email:</strong> {payment.user?.email}</p>

<p><strong>Reference:</strong> {payment.reference}</p>

<p><strong>Amount:</strong> GH₵ {payment.amount}</p>

<p><strong>Type:</strong> {payment.type}</p>

<p><strong>Method:</strong> {payment.paymentMethod}</p>

<p><strong>Status:</strong> {payment.status}</p>

<p><strong>Gateway:</strong> {payment.gatewayResponse}</p>

<p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleString()}</p>

</div>

</div>

);

}

export default PaymentDetails;
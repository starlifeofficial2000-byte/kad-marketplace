import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./SubscriptionsPage.css";


function SubscriptionsPage() {

    const token = localStorage.getItem("token");

    const [subscriptions, setSubscriptions] = useState([]);
    const [showModal, setShowModal] = useState(false);

const [selectedSubscription, setSelectedSubscription] = useState(null);

const [plan, setPlan] = useState("");

const [amount, setAmount] = useState(0);

const [status, setStatus] = useState("Active");

    useEffect(() => {

        loadSubscriptions();

    }, []);

    const loadSubscriptions = async () => {

        try {
const response = await api.get(
    "/settings"
);

            setSubscriptions(response.data);

        }

        catch(error){

            console.log(error);

        }

    };
    const openModal = (subscription) => {

    setSelectedSubscription(subscription);

    setPlan(subscription.plan);

    setAmount(subscription.amount);

    setStatus(subscription.status);

    setShowModal(true);

};

const updateSubscription = async () => {

    try {

        await axios.put(

            `/api/admin/subscriptions/${selectedSubscription.id}`,

            {

                plan,

                amount,

                status

            },

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        alert("Subscription Updated Successfully");

        setShowModal(false);

        loadSubscriptions();

    }

    catch(error){

        console.log(error);

    }

};

    return(

        <div className="page-container">

            <h1>💳 Subscription Management</h1>

            <table className="admin-table">

                <thead>

                    <tr>

                        <th>User</th>

                        <th>Email</th>

                        <th>Plan</th>

                        <th>Amount</th>

                        <th>Status</th>

                        <th>Start Date</th>
                        <th>Action</th>

                    </tr>

                </thead>
<tbody>

{

    subscriptions.map(sub => (

        <tr key={sub.id}>

            <td>{sub.user?.name}</td>

            <td>{sub.user?.email}</td>

            <td>{sub.plan}</td>

            <td>GH₵ {sub.amount}</td>

            <td>{sub.status}</td>

            <td>

                {new Date(sub.startDate).toLocaleDateString()}

            </td>

            <td>

                <button

                    className="approve-btn"

                   onClick={() => openModal(sub)}

                >

                    Change Plan

                </button>

            </td>

        </tr>

    ))

}

</tbody>

            </table>

{

showModal && (

<div className="modal-overlay">

<div className="modal">

<h2>Edit Subscription</h2>

<label>Plan</label>

<select

value={plan}

onChange={(e)=>{

setPlan(e.target.value);

switch(e.target.value){

case "Basic":

setAmount(0);

break;

case "Premium":

setAmount(50);

break;

case "Express":

setAmount(100);

break;

case "Bossman":

setAmount(180);

break;

}

}}

>

<option>Basic</option>

<option>Premium</option>

<option>Express</option>

<option>Bossman</option>

</select>

<label>Amount</label>

<input

type="number"

value={amount}

onChange={(e)=>setAmount(e.target.value)}

/>

<label>Status</label>

<select

value={status}

onChange={(e)=>setStatus(e.target.value)}

>

<option>Active</option>

<option>Expired</option>

<option>Suspended</option>

</select>

<div className="modal-buttons">

<button

className="approve-btn"

onClick={updateSubscription}

>

Save

</button>

<button

className="reject-btn"

onClick={()=>setShowModal(false)}

>

Cancel

</button>

</div>

</div>

</div>

)
}
        </div>

    );

}

export default SubscriptionsPage;
import { useEffect, useState } from "react";
import api from "../../config/axios";

function ReviewsPage() {

    const token = localStorage.getItem("token");

    const [reviews, setReviews] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {

        loadReviews();

    }, []);

    const loadReviews = async () => {

        try {

         const response = await api.get(
    "/settings"
);
            setReviews(response.data);

        }

        catch(error){

            console.log(error);

        }

    };

    const deleteReview = async(id)=>{

        if(!window.confirm("Delete this review?")) return;

        try{

            await axios.delete(

                `/api/admin/reviews/${id}`,

                {

                    headers:{

                        Authorization:`Bearer ${token}`

                    }

                }

            );

            loadReviews();

        }

        catch(error){

            console.log(error);

        }

    };

    const filteredReviews = reviews.filter(review=>{

        return (

            review.review.toLowerCase().includes(search.toLowerCase())

        );

    });

    return(

        <div className="page-container">

            <div className="page-header">

                <h1>⭐ Review Management</h1>

                <input

                    type="text"

                    placeholder="Search reviews..."

                    value={search}

                    onChange={(e)=>setSearch(e.target.value)}

                />

            </div>

            <table className="admin-table">

                <thead>

                    <tr>

                        <th>Buyer</th>

                        <th>Seller</th>

                        <th>Product</th>

                        <th>Rating</th>

                        <th>Review</th>

                        <th>Date</th>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        filteredReviews.map(review=>(

                            <tr key={review.id}>

                                <td>

                                    {review.buyerName}

                                </td>

                                <td>

                                    {review.sellerName}

                                </td>

                                <td>

                                    {review.productTitle}

                                </td>

                                <td>

                                    ⭐ {review.rating}/5

                                </td>

                                <td>

                                    {review.review}

                                </td>

                                <td>

                                    {

                                        new Date(

                                            review.createdAt

                                        ).toLocaleDateString()

                                    }

                                </td>

                                <td>

                                    <button

                                        className="reject"

                                        onClick={()=>deleteReview(review.id)}

                                    >

                                        Delete

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

export default ReviewsPage;
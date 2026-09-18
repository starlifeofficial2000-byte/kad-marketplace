import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../config/axios";

import "./AdminStoreDetails.css";

function AdminStoreDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const [store, setStore] = useState(null);

    const [loading, setLoading] = useState(true);


    /* ==========================================
       LOAD STORE
    ========================================== */

    useEffect(() => {

        loadStore();

    }, [id]);


    const loadStore = async () => {

        try {

            setLoading(true);

            const response = await api.get(

                `/admin/stores/${id}`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );


            setStore(

                response.data.store ||
                response.data

            );

        }

        catch (error) {

            console.log(

                "LOAD STORE ERROR:",

                error.response?.data ||
                error.message

            );

            alert(

                error.response?.data?.message ||
                error.message ||
                "Unable to load store."

            );

            setStore(null);

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       VERIFY STORE
    ========================================== */

    const verifyStore = async () => {

        try {

            await api.put(

                `/admin/stores/${id}/verify`,

                {},

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            alert("Store verified successfully.");

            loadStore();

        }

        catch (error) {

            console.log(error);

            alert(

                error.response?.data?.message ||
                "Unable to verify store."

            );

        }

    };


    /* ==========================================
       SUSPEND STORE
    ========================================== */

    const suspendStore = async () => {

        try {

            await api.put(

                `/admin/stores/${id}/suspend`,

                {},

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            alert("Store suspended successfully.");

            loadStore();

        }

        catch (error) {

            console.log(error);

            alert(

                error.response?.data?.message ||
                "Unable to suspend store."

            );

        }

    };


    /* ==========================================
       ACTIVATE STORE
    ========================================== */

    const activateStore = async () => {

        try {

            await api.put(

                `/admin/stores/${id}/activate`,

                {},

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            alert("Store activated successfully.");

            loadStore();

        }

        catch (error) {

            console.log(error);

            alert(

                error.response?.data?.message ||
                "Unable to activate store."

            );

        }

    };


    /* ==========================================
       DELETE STORE
    ========================================== */

    const deleteStore = async () => {

        const confirmed = window.confirm(

            "Are you sure you want to delete this store?"

        );

        if (!confirmed) return;


        try {

            await api.delete(

                `/admin/stores/${id}`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            alert("Store deleted successfully.");

            navigate("/admin/stores");

        }

        catch (error) {

            console.log(error);

            alert(

                error.response?.data?.message ||
                "Unable to delete store."

            );

        }

    };


    /* ==========================================
       GET PRODUCT IMAGE
    ========================================== */

    const getProductImage = (images) => {

        if (!images) {

            return "https://via.placeholder.com/250";

        }


        try {

            const parsedImages = Array.isArray(images)

                ? images

                : JSON.parse(images);


            if (

                parsedImages &&
                parsedImages.length > 0

            ) {

                return `/uploads/${parsedImages[0]}`;

            }

        }

        catch (error) {

            console.log(

                "IMAGE PARSE ERROR:",

                error

            );

        }


        return "https://via.placeholder.com/250";

    };


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return <h2>Loading store...</h2>;

    }


    /* ==========================================
       STORE NOT FOUND
    ========================================== */

    if (!store) {

        return <h2>Store not found.</h2>;

    }


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="store-details">


            {/* STORE BANNER */}

            <div className="store-banner">

                <img

                    src={

                        store.banner

                            ?

                            `/uploads/${store.banner}`

                            :

                            "https://via.placeholder.com/1200x250"

                    }

                    alt={store.storeName || "Store Banner"}

                />

            </div>


            {/* STORE PROFILE */}

            <div className="store-profile">

                <img

                    className="store-logo-large"

                    src={

                        store.logo

                            ?

                            `/uploads/${store.logo}`

                            :

                            "https://via.placeholder.com/150"

                    }

                    alt={store.storeName || "Store Logo"}

                />


                <div>

                    <h1>

                        {store.storeName || "Unnamed Store"}

                    </h1>


                    <p>

                        {store.description ||
                            "No store description available."}

                    </p>


                    <h3>

                        ⭐ {store.rating || 0}

                    </h3>

                </div>

            </div>


            {/* STORE INFORMATION */}

            <div className="store-info-grid">


                <div className="info-card">

                    <h2>Owner</h2>

                    <p>

                        <strong>Name:</strong>{" "}

                        {store.owner?.name || "N/A"}

                    </p>

                    <p>

                        <strong>Email:</strong>{" "}

                        {store.owner?.email || "N/A"}

                    </p>

                    <p>

                        <strong>Phone:</strong>{" "}

                        {store.owner?.phone || "N/A"}

                    </p>

                </div>


                <div className="info-card">

                    <h2>Store Details</h2>

                    <p>

                        <strong>Category:</strong>{" "}

                        {store.businessCategory || "N/A"}

                    </p>

                    <p>

                        <strong>Region:</strong>{" "}

                        {store.region || "N/A"}

                    </p>

                    <p>

                        <strong>City:</strong>{" "}

                        {store.city || "N/A"}

                    </p>

                    <p>

                        <strong>Address:</strong>{" "}

                        {store.address || "N/A"}

                    </p>

                </div>


                <div className="info-card">

                    <h2>Statistics</h2>

                    <p>

                        Total Products:{" "}

                        {store.totalProducts || 0}

                    </p>

                    <p>

                        Total Sales:{" "}

                        {store.totalSales || 0}

                    </p>

                    <p>

                        Total Views:{" "}

                        {store.totalViews || 0}

                    </p>

                    <p>

                        Followers:{" "}

                        {store.followers || 0}

                    </p>

                </div>


                <div className="info-card">

                    <h2>Status</h2>

                    <p>

                        Verified:

                        {store.verified

                            ? " Yes"

                            : " No"

                        }

                    </p>

                    <p>

                        Status:

                        {" "}

                        {store.status || "Unknown"}

                    </p>

                </div>

            </div>


            {/* STORE PRODUCTS */}

            <div className="products-section">

                <h2>

                    Store Products

                </h2>


                <div className="products-grid">


                    {

                        store.products?.length > 0

                            ?

                            store.products.map(product => (

                                <div

                                    className="product-card"

                                    key={product.id}

                                >

                                    <img

                                        src={

                                            getProductImage(

                                                product.images

                                            )

                                        }

                                        alt={

                                            product.title

                                        }

                                    />


                                    <h3>

                                        {product.title}

                                    </h3>


                                    <p>

                                        GH₵ {product.price}

                                    </p>

                                </div>

                            ))

                            :

                            <p>

                                No products found for this store.

                            </p>

                    }

                </div>

            </div>


            {/* ADMIN ACTIONS */}

            <div className="store-actions">


                {

                    !store.verified && (

                        <button

                            className="verify-btn"

                            onClick={verifyStore}

                        >

                            Verify Store

                        </button>

                    )

                }


                {

                    store.status === "Active"

                        ?

                        (

                            <button

                                className="suspend-btn"

                                onClick={suspendStore}

                            >

                                Suspend Store

                            </button>

                        )

                        :

                        (

                            <button

                                className="activate-btn"

                                onClick={activateStore}

                            >

                                Activate Store

                            </button>

                        )

                }


                <button

                    className="delete-btn"

                    onClick={deleteStore}

                >

                    Delete Store

                </button>


            </div>


        </div>

    );

}

export default AdminStoreDetails;
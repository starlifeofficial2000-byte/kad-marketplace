import { useEffect, useState } from "react";
import api from "../../config/axios";
import AdminTable from "../../components/admin/AdminTable";
import "./Advertisements.css";

function Advertisements() {

    const token = localStorage.getItem("token");

    const [ads, setAds] = useState([]);

    const [loading, setLoading] = useState(true);


    /* ==========================================
       AUTH CONFIG
    ========================================== */

    const authConfig = {

        headers: {

            Authorization: `Bearer ${token}`

        }

    };


    /* ==========================================
       LOAD ADVERTISEMENTS
    ========================================== */

    useEffect(() => {

        loadAdvertisements();

    }, []);


    const loadAdvertisements = async () => {

        try {

            setLoading(true);


            const response = await api.get(

                "/admin/advertisements",

                authConfig

            );


            const advertisements =

                response.data.advertisements ||
                response.data.ads ||
                response.data ||
                [];


            setAds(

                Array.isArray(advertisements)

                    ?

                    advertisements.map(ad => ({

                        ...ad,

                        advertiser:

                            ad.advertiser?.name ||

                            ad.user?.name ||

                            ad.advertiserName ||

                            "Unknown",


                        budget:

                            ad.dailyBudget ||

                            ad.budget ||

                            0

                    }))

                    :

                    []

            );

        }

        catch (error) {

            console.log(

                "LOAD ADVERTISEMENTS ERROR:",

                error.response?.data ||

                error.message

            );


            setAds([]);

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       APPROVE ADVERTISEMENT
    ========================================== */

    const approveAdvertisement = async (id) => {

        try {

            await api.put(

                `/admin/advertisements/${id}/approve`,

                {},

                authConfig

            );


            alert("Advertisement approved successfully.");

            loadAdvertisements();

        }

        catch (error) {

            console.log(error);

            alert(

                error.response?.data?.message ||

                "Unable to approve advertisement."

            );

        }

    };


    /* ==========================================
       REJECT ADVERTISEMENT
    ========================================== */

    const rejectAdvertisement = async (id) => {

        try {

            await api.put(

                `/admin/advertisements/${id}/reject`,

                {},

                authConfig

            );


            alert("Advertisement rejected.");

            loadAdvertisements();

        }

        catch (error) {

            console.log(error);

            alert(

                error.response?.data?.message ||

                "Unable to reject advertisement."

            );

        }

    };


    /* ==========================================
       PAUSE ADVERTISEMENT
    ========================================== */

    const pauseAdvertisement = async (id) => {

        try {

            await api.put(

                `/admin/advertisements/${id}/pause`,

                {},

                authConfig

            );


            alert("Advertisement paused.");

            loadAdvertisements();

        }

        catch (error) {

            console.log(error);

            alert(

                error.response?.data?.message ||

                "Unable to pause advertisement."

            );

        }

    };


    /* ==========================================
       RESUME ADVERTISEMENT
    ========================================== */

    const resumeAdvertisement = async (id) => {

        try {

            await api.put(

                `/admin/advertisements/${id}/resume`,

                {},

                authConfig

            );


            alert("Advertisement resumed.");

            loadAdvertisements();

        }

        catch (error) {

            console.log(error);

            alert(

                error.response?.data?.message ||

                "Unable to resume advertisement."

            );

        }

    };


    /* ==========================================
       DELETE ADVERTISEMENT
    ========================================== */

    const deleteAdvertisement = async (id) => {

        if (

            !window.confirm(

                "Are you sure you want to delete this advertisement?"

            )

        ) {

            return;

        }


        try {

            await api.delete(

                `/admin/advertisements/${id}`,

                authConfig

            );


            alert("Advertisement deleted successfully.");

            loadAdvertisements();

        }

        catch (error) {

            console.log(error);

            alert(

                error.response?.data?.message ||

                "Unable to delete advertisement."

            );

        }

    };


    /* ==========================================
       TABLE COLUMNS
    ========================================== */

    const columns = [

        {

            key: "title",

            label: "Title"

        },

        {

            key: "advertiser",

            label: "Advertiser"

        },

        {

            key: "placement",

            label: "Placement"

        },

        {

            key: "budget",

            label: "Budget"

        },

        {

            key: "status",

            label: "Status"

        }

    ];


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="advertisements-page">

                <h2>Loading advertisements...</h2>

            </div>

        );

    }


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="advertisements-page">

            <h1>Advertisement Management</h1>


            <AdminTable

                columns={columns}

                data={ads}


                renderActions={(ad) => (

                    <div className="action-buttons">


                        {

                            ad.status !== "Approved" &&

                            ad.status !== "Running" &&

                            (

                                <button

                                    className="approve-btn"

                                    onClick={() =>
                                        approveAdvertisement(ad.id)
                                    }

                                >

                                    Approve

                                </button>

                            )

                        }


                        {

                            ad.status !== "Rejected" &&

                            (

                                <button

                                    className="reject-btn"

                                    onClick={() =>
                                        rejectAdvertisement(ad.id)
                                    }

                                >

                                    Reject

                                </button>

                            )

                        }


                        {

                            ad.status === "Running"

                                ?

                                (

                                    <button

                                        className="pause-btn"

                                        onClick={() =>
                                            pauseAdvertisement(ad.id)
                                        }

                                    >

                                        Pause

                                    </button>

                                )

                                :

                                (

                                    ad.status === "Paused" &&

                                    (

                                        <button

                                            className="resume-btn"

                                            onClick={() =>
                                                resumeAdvertisement(ad.id)
                                            }

                                        >

                                            Resume

                                        </button>

                                    )

                                )

                        }


                        <button

                            className="delete-btn"

                            onClick={() =>
                                deleteAdvertisement(ad.id)
                            }

                        >

                            Delete

                        </button>


                    </div>

                )}

            />

        </div>

    );

}

export default Advertisements;
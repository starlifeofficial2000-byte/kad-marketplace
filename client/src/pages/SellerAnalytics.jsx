import { useEffect, useState } from "react";
import api from "../config/axios";
import "./SellerAnalytics.css";

function SellerAnalytics() {

    const [stats, setStats] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* ==========================================
       LOAD ANALYTICS
    ========================================== */

    useEffect(() => {

        loadAnalytics();

    }, []);


    const loadAnalytics = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(

                "/leads/seller/analytics"

            );


            console.log(

                "ANALYTICS RESPONSE:",

                response.data

            );


            const analytics =

                response.data?.analytics ||

                response.data?.data ||

                response.data;


            setStats(

                analytics || {}

            );

        }

        catch (error) {

            console.error(

                "SELLER ANALYTICS ERROR:",

                error.response?.data || error.message

            );


            setError(

                error.response?.data?.message ||

                "Failed to load seller analytics."

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

            <div className="analytics-page">

                <h2>

                    Loading analytics...

                </h2>

            </div>

        );

    }


    /* ==========================================
       ERROR
    ========================================== */

    if (error) {

        return (

            <div className="analytics-page">

                <h2>

                    {error}

                </h2>

                <button

                    onClick={loadAnalytics}

                >

                    Try Again

                </button>

            </div>

        );

    }


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="analytics-page">


            <div className="analytics-header">

                <div>

                    <h1>

                        Seller Analytics

                    </h1>

                    <p>

                        Monitor your marketplace performance and customer activity.

                    </p>

                </div>


                <button

                    className="refresh-btn"

                    onClick={loadAnalytics}

                >

                    ↻ Refresh

                </button>

            </div>


            <div className="cards">


                <div className="card">

                    <h2>

                        {stats.totalLeads || 0}

                    </h2>

                    <p>

                        Total Leads

                    </p>

                </div>


                <div className="card">

                    <h2>

                        {stats.newLeads || 0}

                    </h2>

                    <p>

                        New Leads

                    </p>

                </div>


                <div className="card">

                    <h2>

                        {stats.chats || 0}

                    </h2>

                    <p>

                        Lead Chats

                    </p>

                </div>


                <div className="card">

                    <h2>

                        {stats.offers || 0}

                    </h2>

                    <p>

                        Offers

                    </p>

                </div>


                <div className="card">

                    <h2>

                        {stats.interested || 0}

                    </h2>

                    <p>

                        Interested Buyers

                    </p>

                </div>


                <div className="card">

                    <h2>

                        {stats.phoneRequests || 0}

                    </h2>

                    <p>

                        Phone Requests

                    </p>

                </div>


                <div className="card">

                    <h2>

                        {stats.locationRequests || 0}

                    </h2>

                    <p>

                        Location Requests

                    </p>

                </div>


                <div className="card">

                    <h2>

                        {stats.totalViews || 0}

                    </h2>

                    <p>

                        Total Product Views

                    </p>

                </div>


                <div className="card">

                    <h2>

                        {stats.totalProducts || 0}

                    </h2>

                    <p>

                        Active Products

                    </p>

                </div>


                <div className="card">

                    <h2>

                        {stats.totalChats || 0}

                    </h2>

                    <p>

                        Total Chats

                    </p>

                </div>


                <div className="card">

                    <h2>

                        {stats.converted || 0}

                    </h2>

                    <p>

                        Converted Sales

                    </p>

                </div>


            </div>

        </div>

    );

}

export default SellerAnalytics;
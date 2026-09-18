import { useEffect, useState } from "react";

import api from "../../config/axios";

import "./SecurityAlerts.css";


function SecurityAlerts() {


    /* =========================================
       STATE
    ========================================= */

    const [alerts, setAlerts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);


    /* =========================================
       LOAD SECURITY ALERTS
    ========================================= */

    const loadAlerts = async () => {

        try {

            setError(null);


            const response = await api.get(

                "/security/alerts"

            );


            console.log(

                "SECURITY ALERTS RESPONSE:",

                response.data

            );


            /* =====================================
               HANDLE DIFFERENT RESPONSE FORMATS
            ===================================== */

            const alertsData =

                response.data?.alerts ||

                response.data?.data ||

                response.data ||

                [];


            setAlerts(

                Array.isArray(alertsData)

                    ? alertsData

                    : []

            );

        }

        catch (error) {

            console.error(

                "LOAD SECURITY ALERTS ERROR:",

                error.response?.data ||
                error.message

            );


            setError(

                error.response?.data?.message ||

                "Unable to load security alerts."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================
       LOAD + AUTO REFRESH
    ========================================= */

    useEffect(() => {

        loadAlerts();


        const interval = setInterval(

            loadAlerts,

            15000

        );


        return () => {

            clearInterval(interval);

        };

    }, []);


    /* =========================================
       FORMAT RISK LEVEL
    ========================================= */

    const getRiskClass = (

        riskLevel

    ) => {

        if (!riskLevel) {

            return "low";

        }


        return String(

            riskLevel

        )

            .toLowerCase()

            .replace(/\s+/g, "-");

    };


    /* =========================================
       FORMAT DATE SAFELY
    ========================================= */

    const formatDate = (

        date

    ) => {

        if (!date) {

            return "Unknown date";

        }


        const parsedDate = new Date(date);


        if (

            Number.isNaN(

                parsedDate.getTime()

            )

        ) {

            return "Unknown date";

        }


        return parsedDate.toLocaleString();

    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="security-alerts">

                <h3>

                    Loading Security Alerts...

                </h3>

            </div>

        );

    }


    /* =========================================
       MAIN COMPONENT
    ========================================= */

    return (

        <div className="security-alerts">


            {/* =================================
               HEADER
            ================================= */}

            <div className="security-alerts-header">

                <h2>

                    🚨 Live Security Alerts

                </h2>

                <span>

                    Auto-refreshing every 15 seconds

                </span>

            </div>


            {/* =================================
               ERROR MESSAGE
            ================================= */}

            {

                error && (

                    <div className="security-alert-error">

                        {error}

                    </div>

                )

            }


            {/* =================================
               NO ALERTS
            ================================= */}

            {

                !error &&

                alerts.length === 0 ? (

                    <div className="no-alerts">

                        ✅ No security alerts.

                    </div>

                ) : (

                    alerts.map(

                        (alert) => (

                            <div

                                key={

                                    alert.id ||

                                    `${alert.title}-${alert.createdAt}`

                                }

                                className={

                                    `alert-card ${

                                        getRiskClass(

                                            alert.riskLevel

                                        )

                                    }`

                                }

                            >


                                <div className="alert-info">


                                    <h3>

                                        {

                                            alert.title ||

                                            "Security Alert"

                                        }

                                    </h3>


                                    <p>

                                        {

                                            alert.description ||

                                            "No description available."

                                        }

                                    </p>


                                    <p>

                                        <strong>

                                            User:

                                        </strong>{" "}

                                        {

                                            alert.user?.name ||

                                            alert.userName ||

                                            "Unknown"

                                        }

                                    </p>


                                    <p>

                                        <strong>

                                            Risk:

                                        </strong>{" "}

                                        {

                                            alert.riskLevel ||

                                            "Unknown"

                                        }

                                    </p>


                                    <p>

                                        <strong>

                                            Status:

                                        </strong>{" "}

                                        {

                                            alert.status ||

                                            "Unknown"

                                        }

                                    </p>


                                    <small>

                                        {

                                            formatDate(

                                                alert.createdAt

                                            )

                                        }

                                    </small>


                                </div>


                            </div>

                        )

                    )

                )

            }


        </div>

    );

}


export default SecurityAlerts;
import { useEffect, useState } from "react";
import api from "../../config/axios";

import "./RevenueDashboard.css";


function RevenueDashboard() {

    const [stats, setStats] = useState({

        totalRevenue: 0,

        todayRevenue: 0,

        monthRevenue: 0,

        totalTransactions: 0

    });


    const [loading, setLoading] = useState(true);


    useEffect(() => {

        loadRevenue();

    }, []);


    const loadRevenue = async () => {

        try {

            const response = await api.get(

                "/admin/revenue"

            );


            /*
               Support different backend
               response structures safely.
            */

            const revenueData =

                response.data?.data ||

                response.data?.revenue ||

                response.data ||

                {};


            setStats({

                totalRevenue:

                    Number(
                        revenueData.totalRevenue
                    ) || 0,

                todayRevenue:

                    Number(
                        revenueData.todayRevenue
                    ) || 0,

                monthRevenue:

                    Number(
                        revenueData.monthRevenue
                    ) || 0,

                totalTransactions:

                    Number(
                        revenueData.totalTransactions
                    ) || 0

            });

        }

        catch (error) {

            console.error(

                "LOAD REVENUE ERROR:",

                error

            );

        }

        finally {

            setLoading(false);

        }

    };


    const formatCurrency = (amount) => {

        return new Intl.NumberFormat(

            "en-GH",

            {

                style: "currency",

                currency: "GHS",

                minimumFractionDigits: 2

            }

        ).format(amount || 0);

    };


    return (

        <div className="revenue-grid">

            <div className="revenue-card">

                <h4>Total Revenue</h4>

                <h2>

                    {loading

                        ? "Loading..."

                        : formatCurrency(
                            stats.totalRevenue
                        )

                    }

                </h2>

            </div>


            <div className="revenue-card">

                <h4>Today's Revenue</h4>

                <h2>

                    {loading

                        ? "Loading..."

                        : formatCurrency(
                            stats.todayRevenue
                        )

                    }

                </h2>

            </div>


            <div className="revenue-card">

                <h4>This Month</h4>

                <h2>

                    {loading

                        ? "Loading..."

                        : formatCurrency(
                            stats.monthRevenue
                        )

                    }

                </h2>

            </div>


            <div className="revenue-card">

                <h4>Transactions</h4>

                <h2>

                    {loading

                        ? "Loading..."

                        : stats.totalTransactions

                    }

                </h2>

            </div>

        </div>

    );

}


export default RevenueDashboard;
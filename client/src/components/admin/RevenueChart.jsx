import {

    Chart as ChartJS,

    CategoryScale,

    LinearScale,

    PointElement,

    LineElement,

    Title,

    Tooltip,

    Legend,

    Filler

} from "chart.js";

import { Line } from "react-chartjs-2";

import "./RevenueChart.css";
ChartJS.register(

    CategoryScale,

    LinearScale,

    PointElement,

    LineElement,

    Title,

    Tooltip,

    Legend,

    Filler

);
function RevenueChart({ data }) {

    const chartData = {

        labels: [

            "Jan",

            "Feb",

            "Mar",

            "Apr",

            "May",

            "Jun",

            "Jul",

            "Aug",

            "Sep",

            "Oct",

            "Nov",

            "Dec"

        ],

        datasets: [

            {

                label: "Revenue",

                data,

                borderColor: "#2563eb",

                backgroundColor: "rgba(37,99,235,.15)",

                tension: .4,

                fill: true

            }

        ]

    };

    const options = {

        responsive: true,

        plugins: {

            legend: {

                display: true

            }

        }

    };

    return (

        <div className="revenue-chart">

            <Line

                data={chartData}

                options={options}

            />

        </div>

    );

}

export default RevenueChart;
import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./ReportsPage.css";

function ReportsPage() {

    const token = localStorage.getItem("token");

    const [reports, setReports] = useState([]);

    useEffect(() => {

        loadReports();

    }, []);

    const loadReports = async () => {

        try {

            const response = await api.get(
    "/settings"
);
            setReports(response.data);

        }

        catch(error){

            console.log(error);

        }

    };

    const resolveReport = async(id)=>{

        try{

            await axios.put(

                `/api/admin/reports/${id}`,

                {},

                {

                    headers:{

                        Authorization:`Bearer ${token}`

                    }

                }

            );

            loadReports();

        }

        catch(error){

            console.log(error);

        }

    };

    const deleteReport = async(id)=>{

        if(!window.confirm("Delete this report?")) return;

        try{

            await axios.delete(

                `/api/admin/reports/${id}`,

                {

                    headers:{

                        Authorization:`Bearer ${token}`

                    }

                }

            );

            loadReports();

        }

        catch(error){

            console.log(error);

        }

    };

    return(

        <div className="reports-page">

            <h1>🚩 Marketplace Reports</h1>

            <div className="reports-grid">

                {

                    reports.map(report=>(

<div className="report-card" key={report.id}>

    <img

        className="report-image"

        src={

            report.Product.images.length

            ?

            `/uploads/${report.Product.images[0]}`

            :

            "https://via.placeholder.com/300"

        }

        alt={report.Product.title}

    />

    <div className="report-info">

        <h2>{report.Product.title}</h2>

        <h3>

            GH₵ {report.Product.price}

        </h3>

        <p>

            <strong>Reported By:</strong>

            {report.User.name}

        </p>

        <p>

            <strong>Phone:</strong>

            {report.User.phone}

        </p>

        <p>

            <strong>Reason:</strong>

            {report.reason}

        </p>

        <p>

            <strong>Description:</strong>

            {report.description}

        </p>

        <p>

            <strong>Location:</strong>

            {report.Product.location}

        </p>

        <span

            className={

                report.status==="Resolved"

                ?

                "resolved"

                :

                "pending"

            }

        >

            {report.status}

        </span>

        <div className="report-actions">

            <button

                className="resolve-btn"

                onClick={()=>

                    resolveReport(report.id)

                }

            >

                ✔ Resolve

            </button>

            <button

                className="delete-btn"

                onClick={()=>

                    deleteReport(report.id)

                }

            >

                🗑 Delete

            </button>

        </div>

    </div>

</div>


                    ))

                }

            </div>

        </div>

    );

}

export default ReportsPage;
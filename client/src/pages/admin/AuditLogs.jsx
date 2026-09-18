import { useEffect, useState } from "react";
import api from "../../config/axios";

import "./AuditLogs.css";

function AuditLogs() {

    const [logs, setLogs] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");


    /* ==========================================
       LOAD AUDIT LOGS
    ========================================== */

    useEffect(() => {

        loadLogs();

    }, []);


    const loadLogs = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(
                "/admin/audit-logs"
            );


            const data = response.data;


            if (data.success) {

                setLogs(data.logs || []);

            } else if (Array.isArray(data)) {

                setLogs(data);

            } else {

                setLogs([]);

            }

        }

        catch (error) {

            console.error(
                "AUDIT LOG ERROR:",
                error.response?.data || error.message
            );


            setError(

                error.response?.data?.message ||

                "Failed to load audit logs."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       SEARCH / FILTER
    ========================================== */

    const filteredLogs = logs.filter((log) => {

        const keyword = search.toLowerCase();


        return (

            log.action
                ?.toLowerCase()
                .includes(keyword)

            ||

            log.entity
                ?.toLowerCase()
                .includes(keyword)

            ||

            log.admin?.name
                ?.toLowerCase()
                .includes(keyword)

            ||

            log.admin?.email
                ?.toLowerCase()
                .includes(keyword)

            ||

            log.ipAddress
                ?.toLowerCase()
                .includes(keyword)

            ||

            log.description
                ?.toLowerCase()
                .includes(keyword)

        );

    });


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="audit-page">

                <div className="audit-loading">

                    Loading Audit Logs...

                </div>

            </div>

        );

    }


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="audit-page">


            {/* HEADER */}

            <div className="audit-header">

                <div>

                    <h1>

                        Audit Logs

                    </h1>

                    <p>

                        Monitor administrator activities across the marketplace.

                    </p>

                </div>


                <input

                    type="text"

                    placeholder="Search audit logs..."

                    value={search}

                    onChange={(e) =>
                        setSearch(e.target.value)
                    }

                />

            </div>


            {/* ACTIONS */}

            <div className="audit-actions">

                <button

                    className="refresh-btn"

                    onClick={loadLogs}

                >

                    ↻ Refresh

                </button>


                <button

                    className="export-btn"

                    disabled

                >

                    Export Excel

                </button>


                <button

                    className="export-btn"

                    disabled

                >

                    Export PDF

                </button>

            </div>


            {/* ERROR */}

            {

                error && (

                    <div className="audit-error">

                        {error}

                    </div>

                )

            }


            {/* TABLE */}

            <div className="audit-table-wrapper">

                <table className="audit-table">

                    <thead>

                        <tr>

                            <th>

                                Administrator

                            </th>

                            <th>

                                Action

                            </th>

                            <th>

                                Entity

                            </th>

                            <th>

                                IP Address

                            </th>

                            <th>

                                Description

                            </th>

                            <th>

                                Date

                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {

                            filteredLogs.length === 0

                                ?

                                (

                                    <tr>

                                        <td

                                            colSpan="6"

                                            style={{

                                                textAlign: "center",

                                                padding: "40px"

                                            }}

                                        >

                                            No audit logs found.

                                        </td>

                                    </tr>

                                )

                                :

                                (

                                    filteredLogs.map((log) => (

                                        <tr

                                            key={log.id}

                                        >

                                            <td>

                                                {

                                                    log.admin?.name ||

                                                    log.admin?.email ||

                                                    "System"

                                                }

                                            </td>


                                            <td>

                                                <span

                                                    className="action-badge"

                                                >

                                                    {

                                                        log.action || "-"

                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                {

                                                    log.entity || "-"

                                                }

                                            </td>


                                            <td>

                                                {

                                                    log.ipAddress || "-"

                                                }

                                            </td>


                                            <td>

                                                {

                                                    log.description || "-"

                                                }

                                            </td>


                                            <td>

                                                {

                                                    log.createdAt

                                                        ?

                                                        new Date(

                                                            log.createdAt

                                                        ).toLocaleString()

                                                        :

                                                        "-"

                                                }

                                            </td>

                                        </tr>

                                    ))

                                )

                        }

                    </tbody>

                </table>

            </div>


        </div>

    );

}


export default AuditLogs;
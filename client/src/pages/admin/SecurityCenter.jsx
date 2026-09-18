import { useEffect, useState } from "react";
import api from "../../config/axios";

import ThreatMonitor from "../../components/admin/ThreatMonitor";
import SecurityAlerts from "../../components/admin/SecurityAlerts";

import "./SecurityCenter.css";


function SecurityCenter() {

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [data, setData] = useState({
        statistics: {
            totalUsers: 0,
            totalAdmins: 0,
            blockedUsers: 0,
            successfulLogins: 0,
            failedLogins: 0,
            todayLogins: 0,
            todayFailed: 0,
            auditLogs: 0,
            passwordResets: 0,
            adminLogins: 0
        },

        latestLogins: [],
        latestAuditLogs: []
    });


    /* ==========================================
       LOAD SECURITY DATA
    ========================================== */

    const loadSecurity = async (showRefresh = false) => {

        try {

            if (showRefresh) {
                setRefreshing(true);
            }

            setError("");

            const response = await api.get(
                "/admin/security/overview"
            );

            setData({
                statistics:
                    response.data.statistics || {},

                latestLogins:
                    response.data.latestLogins || [],

                latestAuditLogs:
                    response.data.latestAuditLogs || []
            });

        }

        catch (error) {

            console.log(
                "SECURITY CENTER ERROR:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to load security information."
            );

        }

        finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    /* ==========================================
       AUTO REFRESH
    ========================================== */

    useEffect(() => {

        loadSecurity();

        const interval = setInterval(() => {

            loadSecurity();

        }, 30000);

        return () => clearInterval(interval);

    }, []);


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="security-page">

                <div className="security-loading">

                    <div className="loader"></div>

                    <h2>Loading Security Center...</h2>

                </div>

            </div>

        );

    }


    const stats = data.statistics || {};


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="security-page">


            {/* ======================================
               HEADER
            ====================================== */}

            <div className="security-header">

                <div>

                    <h1>
                        🛡 Security Center
                    </h1>

                    <p>
                        Monitor marketplace security,
                        login activity and system threats.
                    </p>

                </div>


                <button
                    className="refresh-security-btn"
                    onClick={() => loadSecurity(true)}
                    disabled={refreshing}
                >

                    {
                        refreshing
                            ? "Refreshing..."
                            : "Refresh"
                    }

                </button>

            </div>


            {/* ======================================
               ERROR
            ====================================== */}

            {

                error && (

                    <div className="security-error">

                        {error}

                    </div>

                )

            }


            {/* ======================================
               SECURITY OVERVIEW
            ====================================== */}

            <div className="security-grid">


                <div className="security-card">

                    <h2>
                        {stats.totalUsers || 0}
                    </h2>

                    <p>Total Users</p>

                </div>


                <div className="security-card">

                    <h2>
                        {stats.totalAdmins || 0}
                    </h2>

                    <p>Administrators</p>

                </div>


                <div className="security-card warning">

                    <h2>
                        {stats.blockedUsers || 0}
                    </h2>

                    <p>Blocked Users</p>

                </div>


                <div className="security-card">

                    <h2>
                        {stats.successfulLogins || 0}
                    </h2>

                    <p>Successful Logins</p>

                </div>


                <div className="security-card danger">

                    <h2>
                        {stats.failedLogins || 0}
                    </h2>

                    <p>Failed Logins</p>

                </div>


                <div className="security-card">

                    <h2>
                        {stats.todayLogins || 0}
                    </h2>

                    <p>Today's Logins</p>

                </div>


                <div className="security-card warning">

                    <h2>
                        {stats.todayFailed || 0}
                    </h2>

                    <p>Today's Failed Logins</p>

                </div>


                <div className="security-card">

                    <h2>
                        {stats.auditLogs || 0}
                    </h2>

                    <p>Audit Logs</p>

                </div>


            </div>


            {/* ======================================
               THREAT MONITOR
            ====================================== */}

            <ThreatMonitor

                stats={{

                    failedLogins:
                        stats.failedLogins || 0,

                    lockedAccounts:
                        stats.blockedUsers || 0,

                    passwordResets:
                        stats.passwordResets || 0,

                    adminLogins:
                        stats.adminLogins || 0

                }}

            />


            {/* ======================================
               SECURITY ALERTS
            ====================================== */}

            <SecurityAlerts />


            {/* ======================================
               RECENT LOGINS
            ====================================== */}

            <div className="security-section">

                <div className="section-title">

                    <h2>
                        Recent Login Activity
                    </h2>

                    <span>
                        {data.latestLogins.length} Records
                    </span>

                </div>


                {

                    data.latestLogins.length === 0

                        ?

                        (

                            <div className="empty-state">

                                No recent login activity found.

                            </div>

                        )

                        :

                        (

                            <div className="table-wrapper">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>User</th>

                                            <th>Role</th>

                                            <th>Browser</th>

                                            <th>IP Address</th>

                                            <th>Status</th>

                                            <th>Date</th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {

                                            data.latestLogins.map(
                                                (login) => (

                                                    <tr
                                                        key={login.id}
                                                    >

                                                        <td>

                                                            {
                                                                login.user?.name ||
                                                                "Unknown"
                                                            }

                                                        </td>


                                                        <td>

                                                            {
                                                                login.user?.role ||
                                                                "User"
                                                            }

                                                        </td>


                                                        <td>

                                                            {
                                                                login.browser ||
                                                                login.device ||
                                                                "-"
                                                            }

                                                        </td>


                                                        <td>

                                                            {
                                                                login.ipAddress ||
                                                                "-"
                                                            }

                                                        </td>


                                                        <td>

                                                            {

                                                                login.success

                                                                    ?

                                                                    <span className="status-success">

                                                                        ✓ Success

                                                                    </span>

                                                                    :

                                                                    <span className="status-failed">

                                                                        ✕ Failed

                                                                    </span>

                                                            }

                                                        </td>


                                                        <td>

                                                            {

                                                                login.createdAt

                                                                    ?

                                                                    new Date(
                                                                        login.createdAt
                                                                    ).toLocaleString()

                                                                    :

                                                                    "-"

                                                            }

                                                        </td>

                                                    </tr>

                                                )

                                            )

                                        }

                                    </tbody>

                                </table>

                            </div>

                        )

                }

            </div>


            {/* ======================================
               AUDIT LOGS
            ====================================== */}

            <div className="security-section">

                <div className="section-title">

                    <h2>
                        Recent Audit Logs
                    </h2>

                    <span>
                        {data.latestAuditLogs.length} Records
                    </span>

                </div>


                {

                    data.latestAuditLogs.length === 0

                        ?

                        (

                            <div className="empty-state">

                                No audit logs found.

                            </div>

                        )

                        :

                        (

                            <div className="table-wrapper">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>Action</th>

                                            <th>Entity</th>

                                            <th>Description</th>

                                            <th>Date</th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {

                                            data.latestAuditLogs.map(
                                                (log) => (

                                                    <tr key={log.id}>

                                                        <td>

                                                            {log.action || "-"}

                                                        </td>


                                                        <td>

                                                            {log.entity || "-"}

                                                        </td>


                                                        <td>

                                                            {
                                                                log.description ||
                                                                "-"
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

                                                )

                                            )

                                        }

                                    </tbody>

                                </table>

                            </div>

                        )

                }

            </div>


        </div>

    );

}


export default SecurityCenter;
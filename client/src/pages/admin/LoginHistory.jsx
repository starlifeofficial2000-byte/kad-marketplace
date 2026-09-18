import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./LoginHistory.css";

function LoginHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadHistory();
    }, []);

    /* ==========================================
       LOAD LOGIN HISTORY
    ========================================== */

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/login-history"
            );

            setHistory(
                response.data.history ||
                response.data.data ||
                response.data ||
                []
            );
        } catch (error) {
            console.log(
                "LOGIN HISTORY ERROR:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to load login history."
            );

            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    /* ==========================================
       FILTER HISTORY
    ========================================== */

    const filteredHistory = history.filter((item) => {
        const searchText = search.toLowerCase();

        const name =
            item.user?.name?.toLowerCase() || "";

        const email =
            item.user?.email?.toLowerCase() || "";

        const ip =
            item.ipAddress?.toLowerCase() || "";

        return (
            name.includes(searchText) ||
            email.includes(searchText) ||
            ip.includes(searchText)
        );
    });

    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {
        return (
            <div className="login-history-page">
                <div className="loading-container">
                    <div className="loader"></div>
                    <h2>Loading login history...</h2>
                </div>
            </div>
        );
    }

    /* ==========================================
       PAGE
    ========================================== */

    return (
        <div className="login-history-page">

            <div className="login-history-header">

                <div>
                    <h1>Login History</h1>

                    <p>
                        View and monitor every login attempt
                        on the marketplace.
                    </p>
                </div>

                <div className="header-actions">

                    <input
                        type="text"
                        placeholder="Search name, email or IP..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    <button
                        onClick={loadHistory}
                        className="refresh-btn"
                    >
                        Refresh
                    </button>

                </div>

            </div>

            {/* ERROR MESSAGE */}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* SUMMARY */}

            <div className="login-summary">

                <div className="summary-card">
                    <span>Total Attempts</span>

                    <strong>
                        {history.length}
                    </strong>
                </div>

                <div className="summary-card success-card">
                    <span>Successful</span>

                    <strong>
                        {
                            history.filter(
                                (item) => item.success
                            ).length
                        }
                    </strong>
                </div>

                <div className="summary-card failed-card">
                    <span>Failed</span>

                    <strong>
                        {
                            history.filter(
                                (item) => !item.success
                            ).length
                        }
                    </strong>
                </div>

            </div>

            {/* TABLE */}

            <div className="table-wrapper">

                <table className="login-history-table">

                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>IP Address</th>
                            <th>Browser / Device</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>

                    <tbody>

                        {
                            filteredHistory.length === 0
                                ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="empty-row"
                                        >
                                            No login history found.
                                        </td>
                                    </tr>
                                )
                                : (
                                    filteredHistory.map((item) => (

                                        <tr key={item.id}>

                                            <td>
                                                {item.user?.name || "Unknown"}
                                            </td>

                                            <td>
                                                {item.user?.email || "-"}
                                            </td>

                                            <td>
                                                {item.ipAddress || "-"}
                                            </td>

                                            <td>
                                                {item.browser ||
                                                    item.device ||
                                                    "-"
                                                }
                                            </td>

                                            <td>

                                                {
                                                    item.success
                                                        ? (
                                                            <span className="success">
                                                                Successful
                                                            </span>
                                                        )
                                                        : (
                                                            <span className="failed">
                                                                Failed
                                                            </span>
                                                        )
                                                }

                                            </td>

                                            <td>
                                                {
                                                    item.createdAt
                                                        ? new Date(
                                                            item.createdAt
                                                        ).toLocaleString()
                                                        : "-"
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

export default LoginHistory;
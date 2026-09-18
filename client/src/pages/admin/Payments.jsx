import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../config/axios";
import AdminTable from "../../components/admin/AdminTable";

import "./Payments.css";

function Payments() {
    const navigate = useNavigate();

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [summary, setSummary] = useState({
        totalRevenue: 0,
        subscriptions: 0,
        promotions: 0,
        advertisements: 0,
        totalTransactions: 0
    });


    /* ==========================================
       LOAD DATA
    ========================================== */

    useEffect(() => {
        loadPaymentsData();
    }, []);


    /* ==========================================
       LOAD PAYMENTS + SUMMARY
    ========================================== */

    const loadPaymentsData = async () => {
        try {
            setLoading(true);
            setError("");

            const [summaryResponse, paymentsResponse] =
                await Promise.all([
                    api.get("/admin/payments/summary"),
                    api.get("/admin/payments")
                ]);

            /* SUMMARY */

            setSummary(
                summaryResponse.data.summary ||
                summaryResponse.data ||
                {
                    totalRevenue: 0,
                    subscriptions: 0,
                    promotions: 0,
                    advertisements: 0,
                    totalTransactions: 0
                }
            );


            /* PAYMENTS */

            setPayments(
                paymentsResponse.data.payments ||
                paymentsResponse.data.data ||
                paymentsResponse.data ||
                []
            );

        } catch (error) {
            console.error(
                "LOAD PAYMENTS ERROR:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to load payment information."
            );

            setPayments([]);

        } finally {
            setLoading(false);
        }
    };


    /* ==========================================
       REFUND PAYMENT
    ========================================== */

    const refundPayment = async (payment) => {
        const confirmed = window.confirm(
            `Are you sure you want to refund GH₵ ${payment.amount}?`
        );

        if (!confirmed) return;

        try {
            await api.put(
                `/admin/payments/${payment.id}/refund`
            );

            alert("Payment refunded successfully.");

            loadPaymentsData();

        } catch (error) {
            console.error(
                "REFUND ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to refund payment."
            );
        }
    };


    /* ==========================================
       DELETE PAYMENT
    ========================================== */

    const deletePayment = async (payment) => {
        const confirmed = window.confirm(
            "Delete this payment record permanently?"
        );

        if (!confirmed) return;

        try {
            await api.delete(
                `/admin/payments/${payment.id}`
            );

            alert("Payment deleted successfully.");

            loadPaymentsData();

        } catch (error) {
            console.error(
                "DELETE PAYMENT ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete payment."
            );
        }
    };


    /* ==========================================
       TABLE COLUMNS
    ========================================== */

    const columns = [
        {
            key: "createdAt",
            label: "Date",

            render: (payment) =>
                payment.createdAt
                    ? new Date(
                        payment.createdAt
                    ).toLocaleDateString()
                    : "-"
        },

        {
            key: "user",
            label: "Customer",

            render: (payment) =>
                payment.user?.name ||
                payment.User?.name ||
                "-"
        },

        {
            key: "type",
            label: "Payment Type",

            render: (payment) =>
                payment.type ||
                payment.paymentType ||
                "-"
        },

        {
            key: "amount",
            label: "Amount",

            render: (payment) =>
                `GH₵ ${Number(
                    payment.amount || 0
                ).toLocaleString()}`
        },

        {
            key: "status",
            label: "Status",

            render: (payment) => {
                const status =
                    payment.status || "Unknown";

                return (
                    <span
                        className={`status ${status.toLowerCase()}`}
                    >
                        {status}
                    </span>
                );
            }
        },

        {
            key: "reference",
            label: "Reference",

            render: (payment) =>
                payment.reference ||
                payment.transactionReference ||
                "-"
        }
    ];


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {
        return (
            <div className="payments-page">
                <div className="payments-loading">
                    <div className="loader"></div>
                    <p>Loading payments...</p>
                </div>
            </div>
        );
    }


    /* ==========================================
       PAGE
    ========================================== */

    return (
        <div className="payments-page">

            {/* PAGE HEADER */}

            <div className="payments-header">

                <div>
                    <h1>
                        Payment Management
                    </h1>

                    <p>
                        Monitor marketplace transactions,
                        revenue and payment activity.
                    </p>
                </div>

                <button
                    className="refresh-btn"
                    onClick={loadPaymentsData}
                >
                    Refresh
                </button>

            </div>


            {/* ERROR */}

            {
                error && (
                    <div className="error-message">
                        {error}
                    </div>
                )
            }


            {/* ==========================================
               PAYMENT SUMMARY
            ========================================== */}

            <div className="payment-cards">

                <div className="payment-card revenue">

                    <h3>Total Revenue</h3>

                    <h2>
                        GH₵ {Number(
                            summary.totalRevenue || 0
                        ).toLocaleString()}
                    </h2>

                </div>


                <div className="payment-card subscriptions">

                    <h3>Subscriptions</h3>

                    <h2>
                        GH₵ {Number(
                            summary.subscriptions || 0
                        ).toLocaleString()}
                    </h2>

                </div>


                <div className="payment-card promotions">

                    <h3>Promotions</h3>

                    <h2>
                        GH₵ {Number(
                            summary.promotions || 0
                        ).toLocaleString()}
                    </h2>

                </div>


                <div className="payment-card advertisements">

                    <h3>Advertisements</h3>

                    <h2>
                        GH₵ {Number(
                            summary.advertisements || 0
                        ).toLocaleString()}
                    </h2>

                </div>


                <div className="payment-card transactions">

                    <h3>Total Transactions</h3>

                    <h2>
                        {summary.totalTransactions || 0}
                    </h2>

                </div>

            </div>


            {/* ==========================================
               PAYMENTS TABLE
            ========================================== */}

            <div className="payments-table-container">

                <div className="table-header">

                    <div>

                        <h2>
                            All Payments
                        </h2>

                        <p>
                            {payments.length} payment record(s)
                        </p>

                    </div>

                </div>


                <AdminTable
                    columns={columns}
                    data={payments}

                    renderActions={(payment) => (

                        <div className="action-buttons">

                            <button
                                className="view-btn"

                                onClick={() =>
                                    navigate(
                                        `/admin/payments/${payment.id}`
                                    )
                                }
                            >
                                View
                            </button>


                            {
                                payment.status?.toLowerCase() === "paid" && (

                                    <button
                                        className="refund-btn"

                                        onClick={() =>
                                            refundPayment(payment)
                                        }
                                    >
                                        Refund
                                    </button>

                                )
                            }


                            <button
                                className="delete-btn"

                                onClick={() =>
                                    deletePayment(payment)
                                }
                            >
                                Delete
                            </button>

                        </div>

                    )}
                />

            </div>

        </div>
    );
}

export default Payments;
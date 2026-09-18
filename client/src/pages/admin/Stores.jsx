import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";

import "./Stores.css";

function Stores() {
    const navigate = useNavigate();

    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        pending: 0,
        suspended: 0
    });

    /* ==========================================
       LOAD STORES
    ========================================== */

    useEffect(() => {
        loadStores();
    }, []);

    const loadStores = async () => {
        try {
            setLoading(true);

            const response = await api.get("/admin/stores");

            console.log("STORES RESPONSE:", response.data);

            const storesData =
                response.data?.stores ||
                response.data?.data ||
                response.data ||
                [];

            const safeStores = Array.isArray(storesData)
                ? storesData
                : [];

            setStores(safeStores);

            /* ==========================================
               CALCULATE STATISTICS
            ========================================== */

            setStats({
                total: safeStores.length,

                verified: safeStores.filter(
                    (store) => store.verified === true
                ).length,

                pending: safeStores.filter(
                    (store) =>
                        String(store.status || "").toLowerCase() ===
                        "pending"
                ).length,

                suspended: safeStores.filter(
                    (store) =>
                        String(store.status || "").toLowerCase() ===
                        "suspended"
                ).length
            });

        } catch (error) {
            console.error("LOAD STORES ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Failed to load stores."
            );

            setStores([]);

        } finally {
            setLoading(false);
        }
    };

    /* ==========================================
       VERIFY STORE
    ========================================== */

    const verifyStore = async (id) => {
        const confirmed = window.confirm(
            "Verify this store?"
        );

        if (!confirmed) return;

        try {
            await api.put(
                `/admin/stores/${id}/verify`
            );

            alert("Store verified successfully.");

            loadStores();

        } catch (error) {
            console.error("VERIFY STORE ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Unable to verify store."
            );
        }
    };

    /* ==========================================
       SUSPEND STORE
    ========================================== */

    const suspendStore = async (id) => {
        const confirmed = window.confirm(
            "Suspend this store?"
        );

        if (!confirmed) return;

        try {
            await api.put(
                `/admin/stores/${id}/suspend`
            );

            alert("Store suspended successfully.");

            loadStores();

        } catch (error) {
            console.error("SUSPEND STORE ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Unable to suspend store."
            );
        }
    };

    /* ==========================================
       ACTIVATE STORE
    ========================================== */

    const activateStore = async (id) => {
        const confirmed = window.confirm(
            "Activate this store?"
        );

        if (!confirmed) return;

        try {
            await api.put(
                `/admin/stores/${id}/activate`
            );

            alert("Store activated successfully.");

            loadStores();

        } catch (error) {
            console.error("ACTIVATE STORE ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Unable to activate store."
            );
        }
    };

    /* ==========================================
       DELETE STORE
    ========================================== */

    const deleteStore = async (id) => {
        const confirmed = window.confirm(
            "Delete this store permanently?"
        );

        if (!confirmed) return;

        try {
            await api.delete(
                `/admin/stores/${id}`
            );

            alert("Store deleted successfully.");

            loadStores();

        } catch (error) {
            console.error("DELETE STORE ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Unable to delete store."
            );
        }
    };

    /* ==========================================
       FILTER STORES
    ========================================== */

    const filteredStores = stores.filter((store) => {
        const keyword = search.toLowerCase();

        const storeName =
            String(
                store.storeName ||
                store.name ||
                ""
            ).toLowerCase();

        const ownerName =
            String(
                store.owner?.name ||
                store.User?.name ||
                store.user?.name ||
                ""
            ).toLowerCase();

        const email =
            String(
                store.email ||
                store.owner?.email ||
                store.User?.email ||
                store.user?.email ||
                ""
            ).toLowerCase();

        return (
            storeName.includes(keyword) ||
            ownerName.includes(keyword) ||
            email.includes(keyword)
        );
    });

    /* ==========================================
       IMAGE HELPER
    ========================================== */

    const getStoreLogo = (store) => {
        if (!store.logo) {
            return null;
        }

        if (
            store.logo.startsWith("http://") ||
            store.logo.startsWith("https://")
        ) {
            return store.logo;
        }

        return `/uploads/${store.logo}`;
    };

    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {
        return (
            <div className="stores-page">
                <h2>Loading Stores...</h2>
            </div>
        );
    }

    return (
        <div className="stores-page">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="stores-header">

                <div>
                    <h1>Store Management</h1>

                    <p>
                        Manage all marketplace stores
                    </p>
                </div>

                <input
                    type="text"
                    placeholder="Search stores..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

            </div>


            {/* ==========================================
                STATISTICS
            ========================================== */}

            <div className="store-stats">

                <div className="stat-card">
                    <h2>{stats.total}</h2>
                    <p>Total Stores</p>
                </div>

                <div className="stat-card verified-card">
                    <h2>{stats.verified}</h2>
                    <p>Verified Stores</p>
                </div>

                <div className="stat-card pending-card">
                    <h2>{stats.pending}</h2>
                    <p>Pending Stores</p>
                </div>

                <div className="stat-card suspended-card">
                    <h2>{stats.suspended}</h2>
                    <p>Suspended Stores</p>
                </div>

            </div>


            {/* ==========================================
                STORES TABLE
            ========================================== */}

            <div className="stores-table-container">

                <table className="stores-table">

                    <thead>

                        <tr>
                            <th>Logo</th>
                            <th>Store</th>
                            <th>Owner</th>
                            <th>Products</th>
                            <th>Rating</th>
                            <th>Verified</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>

                    </thead>

                    <tbody>

                        {filteredStores.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="8"
                                    style={{
                                        textAlign: "center",
                                        padding: "30px"
                                    }}
                                >
                                    No stores found.
                                </td>
                            </tr>

                        ) : (

                            filteredStores.map((store) => {

                                const logo = getStoreLogo(store);

                                const storeName =
                                    store.storeName ||
                                    store.name ||
                                    "Unnamed Store";

                                const ownerName =
                                    store.owner?.name ||
                                    store.User?.name ||
                                    store.user?.name ||
                                    "Unknown";

                                const productCount =
                                    store.productCount ??
                                    store.products?.length ??
                                    0;

                                const rating =
                                    store.rating ??
                                    0;

                                const storeStatus =
                                    store.status ||
                                    "Pending";

                                return (

                                    <tr key={store.id}>

                                        {/* LOGO */}

                                        <td>

                                            {logo ? (

                                                <img
                                                    className="store-logo"
                                                    src={logo}
                                                    alt={storeName}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display =
                                                            "none";
                                                    }}
                                                />

                                            ) : (

                                                <div className="store-logo-placeholder">
                                                    🏪
                                                </div>

                                            )}

                                        </td>


                                        {/* STORE NAME */}

                                        <td>
                                            <strong>
                                                {storeName}
                                            </strong>
                                        </td>


                                        {/* OWNER */}

                                        <td>
                                            {ownerName}
                                        </td>


                                        {/* PRODUCTS */}

                                        <td>
                                            {productCount}
                                        </td>


                                        {/* RATING */}

                                        <td>
                                            ⭐ {Number(rating).toFixed(1)}
                                        </td>


                                        {/* VERIFIED */}

                                        <td>

                                            {store.verified ? (

                                                <span className="verified">
                                                    ✓ Verified
                                                </span>

                                            ) : (

                                                <span className="not-verified">
                                                    Not Verified
                                                </span>

                                            )}

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={`status ${String(
                                                    storeStatus
                                                ).toLowerCase()}`}
                                            >
                                                {storeStatus}
                                            </span>

                                        </td>


                                        {/* ACTIONS */}

                                        <td className="actions">

                                            <button
                                                className="view-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/store/${store.id}`
                                                    )
                                                }
                                            >
                                                View
                                            </button>


                                            {!store.verified && (

                                                <button
                                                    className="verify-btn"
                                                    onClick={() =>
                                                        verifyStore(store.id)
                                                    }
                                                >
                                                    Verify
                                                </button>

                                            )}


                                            {String(
                                                storeStatus
                                            ).toLowerCase() === "active" && (

                                                <button
                                                    className="suspend-btn"
                                                    onClick={() =>
                                                        suspendStore(store.id)
                                                    }
                                                >
                                                    Suspend
                                                </button>

                                            )}


                                            {String(
                                                storeStatus
                                            ).toLowerCase() ===
                                                "suspended" && (

                                                <button
                                                    className="activate-btn"
                                                    onClick={() =>
                                                        activateStore(store.id)
                                                    }
                                                >
                                                    Activate
                                                </button>

                                            )}


                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    deleteStore(store.id)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                );
                            })

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Stores;
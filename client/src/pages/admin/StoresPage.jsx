import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./StoresPage.css";

function StoresPage() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    /* ===========================
       LOAD STORES
    =========================== */

    useEffect(() => {
        loadStores();
    }, []);

    const loadStores = async () => {
        try {
            setLoading(true);

            const response = await api.get("/admin/stores");

            console.log("STORES RESPONSE:", response.data);

            // Support different backend response formats
            const storesData =
                response.data?.stores ||
                response.data?.data ||
                response.data ||
                [];

            setStores(
                Array.isArray(storesData)
                    ? storesData
                    : []
            );

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


    /* ===========================
       VERIFY STORE
    =========================== */

    const verifyStore = async (id) => {
        if (!window.confirm("Verify this store?")) {
            return;
        }

        try {
            await api.put(
                `/admin/stores/verify/${id}`
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


    /* ===========================
       SUSPEND STORE
    =========================== */

    const suspendStore = async (id) => {
        if (!window.confirm("Suspend this store?")) {
            return;
        }

        try {
            await api.put(
                `/admin/stores/suspend/${id}`
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


    /* ===========================
       ACTIVATE STORE
    =========================== */

    const activateStore = async (id) => {
        if (!window.confirm("Activate this store?")) {
            return;
        }

        try {
            await api.put(
                `/admin/stores/activate/${id}`
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


    /* ===========================
       DELETE STORE
    =========================== */

    const deleteStore = async (id) => {
        if (
            !window.confirm(
                "Delete this store permanently?"
            )
        ) {
            return;
        }

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


    /* ===========================
       SEARCH / FILTER
    =========================== */

    const filteredStores = stores.filter((store) => {
        const keyword = search.toLowerCase();

        const storeName = String(
            store.storeName ||
            store.name ||
            ""
        ).toLowerCase();

        const ownerName = String(
            store.owner?.name ||
            store.User?.name ||
            store.user?.name ||
            ""
        ).toLowerCase();

        const email = String(
            store.owner?.email ||
            store.User?.email ||
            store.user?.email ||
            store.email ||
            ""
        ).toLowerCase();

        return (
            storeName.includes(keyword) ||
            ownerName.includes(keyword) ||
            email.includes(keyword)
        );
    });


    /* ===========================
       LOADING
    =========================== */

    if (loading) {
        return (
            <div className="page-container">
                <h2>Loading stores...</h2>
            </div>
        );
    }


    return (
        <div className="page-container">

            {/* ===========================
                HEADER
            =========================== */}

            <div className="stores-page-header">

                <div>
                    <h1>🏪 Store Management</h1>

                    <p>
                        Manage and monitor all marketplace stores.
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


            {/* ===========================
                TABLE
            =========================== */}

            <div className="table-responsive">

                <table className="admin-table">

                    <thead>

                        <tr>
                            <th>Store</th>
                            <th>Owner</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Followers</th>
                            <th>Rating</th>
                            <th>Verified</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>

                    </thead>


                    <tbody>

                        {filteredStores.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="9"
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

                                const storeName =
                                    store.storeName ||
                                    store.name ||
                                    "Unnamed Store";

                                const ownerName =
                                    store.owner?.name ||
                                    store.User?.name ||
                                    store.user?.name ||
                                    "Unknown";

                                const ownerEmail =
                                    store.owner?.email ||
                                    store.User?.email ||
                                    store.user?.email ||
                                    store.email ||
                                    "-";

                                const phone =
                                    store.phone ||
                                    store.owner?.phone ||
                                    store.User?.phone ||
                                    store.user?.phone ||
                                    "-";

                                const followers =
                                    store.followers ??
                                    store.followersCount ??
                                    0;

                                const rating =
                                    store.rating ??
                                    0;

                                const status =
                                    store.status ||
                                    "Pending";

                                return (

                                    <tr key={store.id}>

                                        {/* STORE */}

                                        <td>
                                            <strong>
                                                {storeName}
                                            </strong>
                                        </td>


                                        {/* OWNER */}

                                        <td>
                                            {ownerName}
                                        </td>


                                        {/* EMAIL */}

                                        <td>
                                            {ownerEmail}
                                        </td>


                                        {/* PHONE */}

                                        <td>
                                            {phone}
                                        </td>


                                        {/* FOLLOWERS */}

                                        <td>
                                            {followers}
                                        </td>


                                        {/* RATING */}

                                        <td>
                                            ⭐ {Number(rating).toFixed(1)}
                                        </td>


                                        {/* VERIFIED */}

                                        <td>

                                            {store.verified ? (

                                                <span className="verified-status">
                                                    ✅ Verified
                                                </span>

                                            ) : (

                                                <span className="not-verified-status">
                                                    ❌ Not Verified
                                                </span>

                                            )}

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={`store-status ${String(
                                                    status
                                                ).toLowerCase()}`}
                                            >
                                                {status}
                                            </span>

                                        </td>


                                        {/* ACTIONS */}

                                        <td className="store-actions">

                                            {!store.verified && (

                                                <button
                                                    className="approve-btn"
                                                    onClick={() =>
                                                        verifyStore(store.id)
                                                    }
                                                >
                                                    Verify
                                                </button>

                                            )}


                                            {String(status).toLowerCase() ===
                                                "active" && (

                                                <button
                                                    className="reject-btn"
                                                    onClick={() =>
                                                        suspendStore(store.id)
                                                    }
                                                >
                                                    Suspend
                                                </button>

                                            )}


                                            {String(status).toLowerCase() ===
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

export default StoresPage;
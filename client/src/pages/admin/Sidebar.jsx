

function Sidebar({ page, setPage, navigate }) {

    return (

        <aside className="admin-sidebar">

            <div className="logo">

                <h2>Marketplace</h2>

                <p>Admin Panel</p>

            </div>

            <ul>

                <li
                    className={page === "dashboard" ? "active" : ""}
                    onClick={() => setPage("dashboard")}
                >
                    📊 Dashboard
                </li>

                <li
                    className={page === "products" ? "active" : ""}
                    onClick={() => setPage("products")}
                >
                    📦 Products
                </li>

                <li
                    className={page === "users" ? "active" : ""}
                    onClick={() => setPage("users")}
                >
                    👥 Users
                </li>

                <li
                    className={page === "reviews" ? "active" : ""}
                    onClick={() => setPage("reviews")}
                >
                    ⭐ Reviews
                </li>

                <li
                    className={page === "messages" ? "active" : ""}
                    onClick={() => setPage("messages")}
                >
                    💬 Messages
                </li>

                <li
                    className={page === "reports" ? "active" : ""}
                    onClick={() => setPage("reports")}
                >
                    🚩 Reports
                </li>
<li onClick={() => setPage("subscriptions")}>
    💳 Subscriptions
</li>

<li onClick={() => setPage("payments")}>
    💰 Payments
</li>

<li onClick={() => setPage("stores")}>
    🏪 Stores
</li>

<li onClick={() => setPage("analytics")}>
    📈 Analytics
</li>

<li onClick={() => setPage("advertisements")}>
    📢 Advertisements
</li>
                <li
                    className={page === "settings" ? "active" : ""}
                    onClick={() => setPage("settings")}
                >
                    ⚙ Settings
                </li>

            </ul>

            <button

                className="logout-btn"

                onClick={() => {

                    localStorage.clear();

                    navigate("/login");

                }}

            >

                Logout

            </button>

        </aside>

    );

}

export default Sidebar;
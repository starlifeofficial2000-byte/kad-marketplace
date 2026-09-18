import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../config/axios";

import {
    FaArrowLeft,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaIdCard,
    FaCalendarAlt,
    FaStore,
    FaBoxOpen,
    FaRocket,
    FaStar,
    FaCheckCircle,
    FaCrown,
    FaTrash,
    FaUserShield,
    FaBan,
    FaUnlock,
    FaChartLine,
    FaClock,
    FaShieldAlt
} from "react-icons/fa";

import "./ViewUser.css";


const API_BASE_URL =
    import.meta.env.VITE_API_URL || "/api";

const SERVER_URL =
    API_BASE_URL.replace("/api", "");


/* ==========================================
   HELPER FUNCTIONS
========================================== */

const getImageUrl = (image) => {

    if (!image) return null;

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    return `${SERVER_URL}/uploads/${image}`;
};


const getUserRoles = (user) => {

    if (!user?.roles) return [];

    if (!Array.isArray(user.roles)) {

        return [user.roles];
    }

    return user.roles.map(role => {

        if (typeof role === "string") {
            return role;
        }

        return role?.name || role?.role || "";

    }).filter(Boolean);
};


const parseImages = (images) => {

    if (!images) return [];

    if (Array.isArray(images)) {
        return images;
    }

    try {

        return JSON.parse(images);

    }
    catch {

        return [];

    }

};


function ViewUser() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [actionLoading, setActionLoading] = useState(false);

    const [user, setUser] = useState(null);

    const [store, setStore] = useState(null);

    const [subscription, setSubscription] = useState(null);

    const [products, setProducts] = useState([]);

    const [loginHistory, setLoginHistory] = useState([]);

    const [securityAlerts, setSecurityAlerts] = useState([]);

    const [stats, setStats] = useState({

        totalProducts: 0,
        approvedProducts: 0,
        pendingProducts: 0,
        rejectedProducts: 0,
        featuredProducts: 0,
        boostedProducts: 0,
        expressProducts: 0,
        totalViews: 0

    });


    /* ==========================================
       LOAD USER
    ========================================== */

    const loadUser = useCallback(async () => {

        try {

            setLoading(true);

            /*
               IMPORTANT:

               Your backend should provide:

               GET /api/admin/users/:id

               OR

               GET /api/users/admin/:id
            */

            const response = await api.get(
                `/admin/users/${id}`
            );

            const data =
                response.data?.user ||
                response.data?.data ||
                response.data;

            if (!data) {

                setUser(null);

                return;

            }


            setUser(data);

            setStore(
                data.store || null
            );

            setSubscription(
                data.subscription || null
            );

            const userProducts =
                data.products || [];

            setProducts(userProducts);

            setLoginHistory(
                data.loginHistory || []
            );

            setSecurityAlerts(
                data.securityAlerts || []
            );


            /* ==========================================
               CALCULATE STATISTICS
            ========================================== */

            setStats({

                totalProducts:
                    userProducts.length,

                approvedProducts:
                    userProducts.filter(
                        product =>
                            product.status?.toLowerCase() === "approved"
                    ).length,

                pendingProducts:
                    userProducts.filter(
                        product =>
                            product.status?.toLowerCase() === "pending"
                    ).length,

                rejectedProducts:
                    userProducts.filter(
                        product =>
                            product.status?.toLowerCase() === "rejected"
                    ).length,

                featuredProducts:
                    userProducts.filter(
                        product =>
                            product.featured === true ||
                            product.isFeatured === true
                    ).length,

                boostedProducts:
                    userProducts.filter(
                        product =>
                            product.boosted === true ||
                            product.isBoosted === true
                    ).length,

                expressProducts:
                    userProducts.filter(
                        product =>
                            product.express === true ||
                            product.isExpress === true
                    ).length,

                totalViews:
                    userProducts.reduce(

                        (total, product) =>

                            total +
                            Number(product.views || 0),

                        0

                    )

            });

        }

        catch (error) {

            console.error(
                "LOAD USER ERROR:",
                error.response?.data || error.message
            );

            setUser(null);

        }

        finally {

            setLoading(false);

        }

    }, [id]);


    useEffect(() => {

        loadUser();

    }, [loadUser]);


    /* ==========================================
       BLOCK USER
    ========================================== */

    const blockUser = async () => {

        if (
            !window.confirm(
                "Are you sure you want to block this user?"
            )
        ) return;


        try {

            setActionLoading(true);

            await api.put(
                `/admin/users/${id}/block`
            );

            alert(
                "User blocked successfully."
            );

            loadUser();

        }

        catch (error) {

            console.error(error);

            alert(

                error.response?.data?.message ||

                "Unable to block user."

            );

        }

        finally {

            setActionLoading(false);

        }

    };


    /* ==========================================
       UNBLOCK USER
    ========================================== */

    const unblockUser = async () => {

        try {

            setActionLoading(true);

            await api.put(
                `/admin/users/${id}/unblock`
            );

            alert(
                "User unblocked successfully."
            );

            loadUser();

        }

        catch (error) {

            console.error(error);

            alert(

                error.response?.data?.message ||

                "Unable to unblock user."

            );

        }

        finally {

            setActionLoading(false);

        }

    };


    /* ==========================================
       MAKE ADMIN
    ========================================== */

    const makeAdmin = async () => {

        if (
            !window.confirm(
                "Promote this user to Administrator?"
            )
        ) return;


        try {

            setActionLoading(true);

            await api.put(
                `/admin/users/${id}/admin`
            );

            alert(
                "User promoted to Admin successfully."
            );

            loadUser();

        }

        catch (error) {

            console.error(error);

            alert(

                error.response?.data?.message ||

                "Unable to promote user."

            );

        }

        finally {

            setActionLoading(false);

        }

    };


    /* ==========================================
       DELETE USER
    ========================================== */

    const deleteUser = async () => {

        const confirmed = window.confirm(

            "Delete this user permanently?\n\n" +
            "This action cannot be undone."

        );


        if (!confirmed) return;


        try {

            setActionLoading(true);

            await api.delete(
                `/admin/users/${id}`
            );

            alert(
                "User deleted successfully."
            );

            navigate(
                "/admin/users"
            );

        }

        catch (error) {

            console.error(error);

            alert(

                error.response?.data?.message ||

                "Unable to delete user."

            );

        }

        finally {

            setActionLoading(false);

        }

    };


    /* ==========================================
       LOADING SCREEN
    ========================================== */

    if (loading) {

        return (

            <div className="loading-screen">

                <div className="loader"></div>

                <h2>
                    Loading User...
                </h2>

            </div>

        );

    }


    /* ==========================================
       USER NOT FOUND
    ========================================== */

    if (!user) {

        return (

            <div className="loading-screen">

                <h2>
                    User not found.
                </h2>

                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/admin/users")
                    }
                >

                    Back to Users

                </button>

            </div>

        );

    }


    /* ==========================================
       USER INFORMATION
    ========================================== */

    const roles = getUserRoles(user);

    const roleText =
        roles.length > 0
            ? roles.join(", ")
            : user.role || "User";


    const isAdmin =
        roles.some(role =>

            role.toLowerCase() === "admin" ||
            role.toLowerCase() === "super admin"

        ) ||

        user.role?.toLowerCase() === "admin" ||

        user.role?.toLowerCase() === "super admin";


    const status =
        user.status?.toLowerCase() || "active";


    const failedLogins =
        loginHistory.filter(
            login => login.success === false
        ).length;


    /* ==========================================
       RISK SCORE
    ========================================== */

    let trustScore = 97;

    if (status === "blocked") {

        trustScore = 42;

    }

    else if (securityAlerts.length > 5) {

        trustScore = 68;

    }

    else if (failedLogins > 5) {

        trustScore = 75;

    }


    return (

        <div className="view-user">


            {/* ======================================
               BACK BUTTON
            ====================================== */}

            <button

                className="back-button"

                onClick={() => navigate(-1)}

            >

                <FaArrowLeft />

                Back

            </button>


            {/* ======================================
               PROFILE HEADER
            ====================================== */}

            <div className="profile-header">

                <div className="profile-left">

                    <img

                        className="profile-image"

                        src={

                            user.profileImage

                                ? getImageUrl(
                                    user.profileImage
                                )

                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user.name || "User"
                                )}&background=0A66C2&color=fff`

                        }

                        alt={
                            user.name || "User"
                        }

                    />


                    <div>

                        <h1>

                            {user.name || "Unknown User"}

                        </h1>


                        <p>

                            <FaEnvelope />

                            {user.email || "-"}

                        </p>


                        <p>

                            <FaPhone />

                            {user.phone || "-"}

                        </p>


                        <span className="role-badge">

                            {roleText}

                        </span>


                        <span

                            className={
                                `status-badge ${status}`
                            }

                        >

                            {status}

                        </span>

                    </div>

                </div>

            </div>


            {/* ======================================
               STATISTICS
            ====================================== */}

            <div className="stats-grid">


                <div className="stat-card">

                    <FaBoxOpen />

                    <h2>
                        {stats.totalProducts}
                    </h2>

                    <p>
                        Total Products
                    </p>

                </div>


                <div className="stat-card">

                    <FaCheckCircle />

                    <h2>
                        {stats.approvedProducts}
                    </h2>

                    <p>
                        Approved
                    </p>

                </div>


                <div className="stat-card">

                    <FaStar />

                    <h2>
                        {stats.featuredProducts}
                    </h2>

                    <p>
                        Featured
                    </p>

                </div>


                <div className="stat-card">

                    <FaRocket />

                    <h2>
                        {stats.boostedProducts}
                    </h2>

                    <p>
                        Boosted
                    </p>

                </div>


                <div className="stat-card">

                    <FaChartLine />

                    <h2>
                        {stats.totalViews}
                    </h2>

                    <p>
                        Total Views
                    </p>

                </div>

            </div>


            {/* ======================================
               INFORMATION GRID
            ====================================== */}

            <div className="info-grid">


                {/* SUBSCRIPTION */}

                <div className="info-card">

                    <h2>

                        <FaCrown />

                        Subscription

                    </h2>


                    {

                        subscription

                            ?

                            <>

                                <div className="info-row">

                                    <span>
                                        Plan
                                    </span>

                                    <strong>

                                        {
                                            subscription.planName ||
                                            subscription.plan?.name ||
                                            "-"
                                        }

                                    </strong>

                                </div>


                                <div className="info-row">

                                    <span>
                                        Status
                                    </span>

                                    <strong>

                                        {
                                            subscription.status ||
                                            "-"
                                        }

                                    </strong>

                                </div>


                                <div className="info-row">

                                    <span>
                                        Amount
                                    </span>

                                    <strong>

                                        GH₵ {
                                            subscription.amount || 0
                                        }

                                    </strong>

                                </div>


                                <div className="info-row">

                                    <span>
                                        Expires
                                    </span>

                                    <strong>

                                        {

                                            subscription.endDate

                                                ?

                                                new Date(
                                                    subscription.endDate
                                                ).toLocaleDateString()

                                                :

                                                "-"

                                        }

                                    </strong>

                                </div>

                            </>

                            :

                            <p>
                                No active subscription.
                            </p>

                    }

                </div>


                {/* STORE */}

                <div className="info-card">

                    <h2>

                        <FaStore />

                        Store

                    </h2>


                    {

                        store

                            ?

                            <>

                                <div className="info-row">

                                    <span>
                                        Name
                                    </span>

                                    <strong>

                                        {
                                            store.storeName ||
                                            store.name ||
                                            "-"
                                        }

                                    </strong>

                                </div>


                                <div className="info-row">

                                    <span>
                                        Status
                                    </span>

                                    <strong>

                                        {
                                            store.status ||
                                            "-"
                                        }

                                    </strong>

                                </div>


                                <div className="info-row">

                                    <span>
                                        Followers
                                    </span>

                                    <strong>

                                        {
                                            store.followers ||
                                            store.followersCount ||
                                            0
                                        }

                                    </strong>

                                </div>


                                <div className="info-row">

                                    <span>
                                        Rating
                                    </span>

                                    <strong>

                                        ⭐ {
                                            store.rating || 0
                                        }

                                    </strong>

                                </div>

                            </>

                            :

                            <p>
                                No Store Created
                            </p>

                    }

                </div>


                {/* PERSONAL DETAILS */}

                <div className="info-card">

                    <h2>

                        <FaUser />

                        Personal Details

                    </h2>


                    <div className="info-row">

                        <FaEnvelope />

                        <span>

                            {user.email || "-"}

                        </span>

                    </div>


                    <div className="info-row">

                        <FaPhone />

                        <span>

                            {user.phone || "-"}

                        </span>

                    </div>


                    <div className="info-row">

                        <FaIdCard />

                        <span>

                            {
                                user.ghanaCard ||
                                user.idCardNumber ||
                                "-"
                            }

                        </span>

                    </div>


                    <div className="info-row">

                        <FaMapMarkerAlt />

                        <span>

                            {

                                [
                                    user.city,
                                    user.region
                                ]

                                    .filter(Boolean)

                                    .join(", ") || "-"

                            }

                        </span>

                    </div>


                    <div className="info-row">

                        <FaCalendarAlt />

                        <span>

                            {

                                user.createdAt

                                    ?

                                    new Date(
                                        user.createdAt
                                    ).toLocaleDateString()

                                    :

                                    "-"

                            }

                        </span>

                    </div>

                </div>

            </div>


            {/* ==========================================
               LOGIN HISTORY
            ========================================== */}

            <div className="history-card">

                <h2>

                    <FaClock />

                    Login History

                </h2>


                {

                    loginHistory.length === 0

                        ?

                        <p className="empty-text">

                            No login history found.

                        </p>

                        :

                        <table className="history-table">

                            <thead>

                                <tr>

                                    <th>Date</th>

                                    <th>IP Address</th>

                                    <th>Browser</th>

                                    <th>Status</th>

                                </tr>

                            </thead>


                            <tbody>

                                {

                                    loginHistory.map(login => (

                                        <tr
                                            key={login.id}
                                        >

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


                                            <td>

                                                {
                                                    login.ipAddress ||
                                                    "-"
                                                }

                                            </td>


                                            <td>

                                                {
                                                    login.browser ||
                                                    login.userAgent ||
                                                    "-"
                                                }

                                            </td>


                                            <td>

                                                {

                                                    login.success

                                                        ?

                                                        <span className="success-badge">

                                                            Success

                                                        </span>

                                                        :

                                                        <span className="danger-badge">

                                                            Failed

                                                        </span>

                                                }

                                            </td>

                                        </tr>

                                    ))

                                }

                            </tbody>

                        </table>

                }

            </div>


            {/* ==========================================
               SECURITY ALERTS
            ========================================== */}

            <div className="history-card">

                <h2>

                    <FaShieldAlt />

                    Security Alerts

                </h2>


                {

                    securityAlerts.length === 0

                        ?

                        <p className="empty-text">

                            No security alerts.

                        </p>

                        :

                        <table className="history-table">

                            <thead>

                                <tr>

                                    <th>Title</th>

                                    <th>Risk Level</th>

                                    <th>Status</th>

                                    <th>Date</th>

                                </tr>

                            </thead>


                            <tbody>

                                {

                                    securityAlerts.map(alert => (

                                        <tr
                                            key={alert.id}
                                        >

                                            <td>

                                                {
                                                    alert.title ||
                                                    alert.message ||
                                                    "-"
                                                }

                                            </td>


                                            <td>

                                                {
                                                    alert.level ||
                                                    alert.riskLevel ||
                                                    "-"
                                                }

                                            </td>


                                            <td>

                                                {
                                                    alert.status ||
                                                    "-"
                                                }

                                            </td>


                                            <td>

                                                {

                                                    alert.createdAt

                                                        ?

                                                        new Date(
                                                            alert.createdAt
                                                        ).toLocaleString()

                                                        :

                                                        "-"

                                                }

                                            </td>

                                        </tr>

                                    ))

                                }

                            </tbody>

                        </table>

                }

            </div>


            {/* ==========================================
               PRODUCTS
            ========================================== */}

            <div className="products-section">

                <div className="section-header">

                    <h2>

                        <FaBoxOpen />

                        Products

                    </h2>


                    <span>

                        {products.length} Products

                    </span>

                </div>


                {

                    products.length === 0

                        ?

                        <div className="empty-products">

                            No products uploaded.

                        </div>

                        :

                        <table className="products-table">

                            <thead>

                                <tr>

                                    <th>Image</th>

                                    <th>Title</th>

                                    <th>Price</th>

                                    <th>Status</th>

                                    <th>Views</th>

                                    <th>Promotion</th>

                                    <th>Date</th>

                                </tr>

                            </thead>


                            <tbody>

                                {

                                    products.map(product => {

                                        const images =
                                            parseImages(
                                                product.images
                                            );


                                        let promotion =
                                            "Normal";


                                        if (
                                            product.featured ||
                                            product.isFeatured
                                        ) {

                                            promotion =
                                                "⭐ Featured";

                                        }

                                        else if (
                                            product.boosted ||
                                            product.isBoosted
                                        ) {

                                            promotion =
                                                "🚀 Boosted";

                                        }

                                        else if (
                                            product.express ||
                                            product.isExpress
                                        ) {

                                            promotion =
                                                "⚡ Express";

                                        }


                                        return (

                                            <tr
                                                key={product.id}
                                            >

                                                <td>

                                                    {

                                                        images.length > 0

                                                            ?

                                                            <img

                                                                className="product-image"

                                                                src={
                                                                    getImageUrl(
                                                                        images[0]
                                                                    )
                                                                }

                                                                alt={
                                                                    product.title ||
                                                                    "Product"
                                                                }

                                                            />

                                                            :

                                                            <div className="no-product-image">

                                                                <FaBoxOpen />

                                                            </div>

                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        product.title ||
                                                        product.name ||
                                                        "-"
                                                    }

                                                </td>


                                                <td>

                                                    GH₵ {
                                                        Number(
                                                            product.price || 0
                                                        ).toLocaleString()
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        product.status ||
                                                        "-"
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        product.views || 0
                                                    }

                                                </td>


                                                <td>

                                                    {promotion}

                                                </td>


                                                <td>

                                                    {

                                                        product.createdAt

                                                            ?

                                                            new Date(
                                                                product.createdAt
                                                            ).toLocaleDateString()

                                                            :

                                                            "-"

                                                    }

                                                </td>

                                            </tr>

                                        );

                                    })

                                }

                            </tbody>

                        </table>

                }

            </div>


            {/* ==========================================
               ADMIN ACTIONS
            ========================================== */}

            <div className="admin-actions">


                {

                    status === "blocked"

                        ?

                        <button

                            className="action-btn unblock"

                            onClick={unblockUser}

                            disabled={actionLoading}

                        >

                            <FaUnlock />

                            {
                                actionLoading
                                    ? "Processing..."
                                    : "Unblock User"
                            }

                        </button>

                        :

                        <button

                            className="action-btn block"

                            onClick={blockUser}

                            disabled={actionLoading}

                        >

                            <FaBan />

                            {
                                actionLoading
                                    ? "Processing..."
                                    : "Block User"
                            }

                        </button>

                }


                {

                    !isAdmin &&

                    <button

                        className="action-btn admin"

                        onClick={makeAdmin}

                        disabled={actionLoading}

                    >

                        <FaUserShield />

                        Make Admin

                    </button>

                }


                <button

                    className="action-btn delete"

                    onClick={deleteUser}

                    disabled={actionLoading}

                >

                    <FaTrash />

                    Delete User

                </button>

            </div>


            {/* ==========================================
               AI RISK ANALYSIS
            ========================================== */}

            <div className="info-card ai-card">

                <h2>

                    🤖 AI Risk Analysis

                </h2>


                <div className="info-row">

                    <span>
                        Account Status
                    </span>

                    <strong>

                        {

                            status === "blocked"

                                ?

                                "High Risk"

                                :

                                "Normal"

                        }

                    </strong>

                </div>


                <div className="info-row">

                    <span>
                        Total Security Alerts
                    </span>

                    <strong>

                        {securityAlerts.length}

                    </strong>

                </div>


                <div className="info-row">

                    <span>
                        Failed Logins
                    </span>

                    <strong>

                        {failedLogins}

                    </strong>

                </div>


                <div className="info-row">

                    <span>
                        Products Uploaded
                    </span>

                    <strong>

                        {stats.totalProducts}

                    </strong>

                </div>


                <div className="info-row">

                    <span>
                        Marketplace Trust Score
                    </span>

                    <strong className="trust-score">

                        {trustScore}%

                    </strong>

                </div>

            </div>


        </div>

    );

}


export default ViewUser;
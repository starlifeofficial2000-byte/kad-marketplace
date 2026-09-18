import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./AdminUsers.css";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "";

function AdminUsers() {

    const [users, setUsers] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [actionLoading, setActionLoading] =
        useState(null);


    /* ==========================================
       LOAD USERS
    ========================================== */

    useEffect(() => {

        loadUsers();

    }, []);


    const loadUsers = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/admin/users"
            );

            console.log(
                "ADMIN USERS RESPONSE:",
                response.data
            );

            const userData =
                response.data?.users ||
                response.data?.data ||
                response.data ||
                [];

            setUsers(
                Array.isArray(userData)
                    ? userData
                    : []
            );

        }

        catch (error) {

            console.error(
                "LOAD USERS ERROR:",
                error.response?.data ||
                error.message
            );

            setUsers([]);

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       GET PROFILE IMAGE URL
    ========================================== */

    const getProfileImage = (user) => {

        const image =
            user.profileImage ||
            user.profile_image ||
            user.avatar ||
            "";

        if (!image) {

            return `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name || "User"
            )}&background=0A66C2&color=fff&size=100`;

        }


        // Already a full URL

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {

            return image;

        }


        // Starts with /uploads/

        if (
            image.startsWith("/uploads/")
        ) {

            return `${API_BASE_URL}${image}`;

        }


        // Starts with uploads/

        if (
            image.startsWith("uploads/")
        ) {

            return `${API_BASE_URL}/${image}`;

        }


        // Plain filename

        return `${API_BASE_URL}/uploads/${image}`;

    };


    /* ==========================================
       NORMALIZE STATUS
    ========================================== */

    const getUserStatus = (user) => {

        return String(
            user.status || "active"
        ).toLowerCase();

    };


    /* ==========================================
       BLOCK USER
    ========================================== */

    const blockUser = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to block this user?"
            );

        if (!confirmed) return;


        try {

            setActionLoading(id);

            await api.put(
                `/admin/users/${id}/block`
            );

            alert(
                "User blocked successfully."
            );

            await loadUsers();

        }

        catch (error) {

            console.error(
                "BLOCK USER ERROR:",
                error
            );

            alert(

                error.response?.data?.message ||

                "Unable to block user."

            );

        }

        finally {

            setActionLoading(null);

        }

    };


    /* ==========================================
       UNBLOCK USER
    ========================================== */

    const unblockUser = async (id) => {

        try {

            setActionLoading(id);

            await api.put(
                `/admin/users/${id}/unblock`
            );

            alert(
                "User unblocked successfully."
            );

            await loadUsers();

        }

        catch (error) {

            console.error(
                "UNBLOCK USER ERROR:",
                error
            );

            alert(

                error.response?.data?.message ||

                "Unable to unblock user."

            );

        }

        finally {

            setActionLoading(null);

        }

    };


    /* ==========================================
       MAKE ADMIN
    ========================================== */

    const makeAdmin = async (id) => {

        const confirmed =
            window.confirm(
                "Promote this user to Administrator?"
            );

        if (!confirmed) return;


        try {

            setActionLoading(id);

            await api.put(
                `/admin/users/${id}/admin`
            );

            alert(
                "User promoted to Admin successfully."
            );

            await loadUsers();

        }

        catch (error) {

            console.error(
                "MAKE ADMIN ERROR:",
                error
            );

            alert(

                error.response?.data?.message ||

                "Unable to promote user."

            );

        }

        finally {

            setActionLoading(null);

        }

    };


    /* ==========================================
       DELETE USER
    ========================================== */

    const deleteUser = async (id, name) => {

        const confirmed =
            window.confirm(

                `Delete ${name || "this user"} permanently?\n\nThis action cannot be undone.`

            );

        if (!confirmed) return;


        try {

            setActionLoading(id);

            await api.delete(
                `/admin/users/${id}`
            );

            alert(
                "User deleted successfully."
            );

            await loadUsers();

        }

        catch (error) {

            console.error(
                "DELETE USER ERROR:",
                error
            );

            alert(

                error.response?.data?.message ||

                "Unable to delete user."

            );

        }

        finally {

            setActionLoading(null);

        }

    };


    /* ==========================================
       FILTER USERS
    ========================================== */

    const filteredUsers =
        users.filter((user) => {

            const searchText =
                search.trim().toLowerCase();

            if (!searchText) {
                return true;
            }


            const name =
                String(
                    user.name || ""
                ).toLowerCase();

            const email =
                String(
                    user.email || ""
                ).toLowerCase();

            const phone =
                String(
                    user.phone || ""
                ).toLowerCase();

            const role =
                String(
                    user.role || ""
                ).toLowerCase();


            return (

                name.includes(searchText) ||

                email.includes(searchText) ||

                phone.includes(searchText) ||

                role.includes(searchText)

            );

        });


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="admin-users">

                <div className="admin-loading">

                    <h2>
                        Loading users...
                    </h2>

                </div>

            </div>

        );

    }


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="admin-users">


            {/* HEADER */}

            <div className="admin-users-header">

                <div>

                    <h1>
                        User Management
                    </h1>

                    <p>
                        Manage marketplace users, roles and account status.
                    </p>

                </div>


                <button
                    className="refresh-btn"
                    onClick={loadUsers}
                >

                    ↻ Refresh

                </button>

            </div>


            {/* SEARCH */}

            <div className="users-toolbar">

                <input

                    type="text"

                    placeholder="Search by name, email, phone or role..."

                    value={search}

                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }

                    className="search-box"

                />


                <div className="user-count">

                    Showing

                    {" "}

                    <strong>
                        {filteredUsers.length}
                    </strong>

                    {" "}

                    of

                    {" "}

                    <strong>
                        {users.length}
                    </strong>

                    {" "}

                    users

                </div>

            </div>


            {/* TABLE */}

            <div className="users-table-container">

                <table>

                    <thead>

                        <tr>

                            <th>Photo</th>

                            <th>Name</th>

                            <th>Email</th>

                            <th>Phone</th>

                            <th>Role</th>

                            <th>Status</th>

                            <th>Actions</th>

                        </tr>

                    </thead>


                    <tbody>


                        {filteredUsers.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    className="no-users"
                                >

                                    No users found.

                                </td>

                            </tr>

                        ) : (

                            filteredUsers.map(
                                (user) => {

                                    const status =
                                        getUserStatus(user);

                                    const role =
                                        String(
                                            user.role || "User"
                                        );

                                    const isAdmin =
                                        role.toLowerCase() ===
                                        "admin";

                                    const isBlocked =
                                        status === "blocked" ||
                                        status === "inactive" ||
                                        status === "suspended";

                                    const isUpdating =
                                        actionLoading ===
                                        user.id;


                                    return (

                                        <tr
                                            key={user.id}
                                        >


                                            {/* PHOTO */}

                                            <td>

                                                <img

                                                    src={
                                                        getProfileImage(user)
                                                    }

                                                    alt={
                                                        user.name ||
                                                        "User"
                                                    }

                                                    className="avatar"

                                                    onError={(event) => {

                                                        event.currentTarget.src =
                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                user.name ||
                                                                "User"
                                                            )}&background=0A66C2&color=fff`;

                                                    }}

                                                />

                                            </td>


                                            {/* NAME */}

                                            <td>

                                                <strong>

                                                    {
                                                        user.name ||
                                                        "N/A"
                                                    }

                                                </strong>

                                            </td>


                                            {/* EMAIL */}

                                            <td>

                                                {
                                                    user.email ||
                                                    "N/A"
                                                }

                                            </td>


                                            {/* PHONE */}

                                            <td>

                                                {
                                                    user.phone ||
                                                    "N/A"
                                                }

                                            </td>


                                            {/* ROLE */}

                                            <td>

                                                <span
                                                    className={
                                                        `role-badge ${isAdmin
                                                            ? "admin-role"
                                                            : "user-role"
                                                        }`
                                                    }
                                                >

                                                    {role}

                                                </span>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={
                                                        `status-badge ${isBlocked
                                                            ? "blocked"
                                                            : "active"
                                                        }`
                                                    }
                                                >

                                                    {
                                                        isBlocked

                                                            ? "Blocked"

                                                            : "Active"
                                                    }

                                                </span>

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="user-actions">


                                                    {/* BLOCK / UNBLOCK */}

                                                    {isBlocked ? (

                                                        <button

                                                            className="unblock-btn"

                                                            disabled={
                                                                isUpdating
                                                            }

                                                            onClick={() =>
                                                                unblockUser(
                                                                    user.id
                                                                )
                                                            }

                                                        >

                                                            {
                                                                isUpdating

                                                                    ? "Please wait..."

                                                                    : "Unblock"
                                                            }

                                                        </button>

                                                    ) : (

                                                        <button

                                                            className="block-btn"

                                                            disabled={
                                                                isUpdating
                                                            }

                                                            onClick={() =>
                                                                blockUser(
                                                                    user.id
                                                                )
                                                            }

                                                        >

                                                            {
                                                                isUpdating

                                                                    ? "Please wait..."

                                                                    : "Block"
                                                            }

                                                        </button>

                                                    )}


                                                    {/* MAKE ADMIN */}

                                                    {!isAdmin && (

                                                        <button

                                                            className="admin-btn"

                                                            disabled={
                                                                isUpdating
                                                            }

                                                            onClick={() =>
                                                                makeAdmin(
                                                                    user.id
                                                                )
                                                            }

                                                        >

                                                            Make Admin

                                                        </button>

                                                    )}


                                                    {/* DELETE */}

                                                    <button

                                                        className="delete"

                                                        disabled={
                                                            isUpdating
                                                        }

                                                        onClick={() =>
                                                            deleteUser(

                                                                user.id,

                                                                user.name

                                                            )
                                                        }

                                                    >

                                                        Delete

                                                    </button>


                                                </div>

                                            </td>


                                        </tr>

                                    );

                                }

                            )

                        )}


                    </tbody>

                </table>

            </div>


        </div>

    );

}

export default AdminUsers;
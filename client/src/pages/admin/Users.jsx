import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../config/axios";

import "./Users.css";

function Users() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        blocked: 0,
        admins: 0
    });


    /* ==========================================
       LOAD DATA
    ========================================== */

    useEffect(() => {
        loadUsers();
        loadRoles();
    }, []);


    /* ==========================================
       LOAD USERS
    ========================================== */

    const loadUsers = async () => {
        try {
            setLoading(true);

            // Correct backend route:
            // GET /api/admin/users
            const response = await api.get("/admin/users");

            console.log("USERS RESPONSE:", response.data);

            const usersData =
                response.data?.users ||
                response.data?.data ||
                (Array.isArray(response.data)
                    ? response.data
                    : []);

            const allUsers = Array.isArray(usersData)
                ? usersData
                : [];

            setUsers(allUsers);

            setStats({
                total: allUsers.length,

                active: allUsers.filter(
                    (user) =>
                        user.status !== "blocked"
                ).length,

                blocked: allUsers.filter(
                    (user) =>
                        user.status === "blocked"
                ).length,

                admins: allUsers.filter(
                    (user) =>
                        user.role === "admin" ||
                        user.roles?.some(
                            (role) =>
                                role.name === "Super Admin" ||
                                role.name === "Administrator"
                        )
                ).length
            });

        } catch (error) {

            console.error(
                "LOAD USERS ERROR:",
                error.response?.data || error.message
            );

            setUsers([]);

            setStats({
                total: 0,
                active: 0,
                blocked: 0,
                admins: 0
            });

            alert(
                error.response?.data?.message ||
                "Unable to load users."
            );

        } finally {
            setLoading(false);
        }
    };


    /* ==========================================
       LOAD ROLES
    ========================================== */

    const loadRoles = async () => {
        try {

            /*
               IMPORTANT:

               This assumes your backend has:

               GET /api/roles

               If roles are under admin routes,
               change this to /admin/roles
            */

            const response = await api.get("/roles");

            console.log(
                "ROLES RESPONSE:",
                response.data
            );

            const rolesData =
                response.data?.roles ||
                response.data?.data ||
                (Array.isArray(response.data)
                    ? response.data
                    : []);

            setRoles(
                Array.isArray(rolesData)
                    ? rolesData
                    : []
            );

        } catch (error) {

            console.error(
                "LOAD ROLES ERROR:",
                error.response?.data || error.message
            );

            setRoles([]);
        }
    };


    /* ==========================================
       CHANGE ROLE
    ========================================== */

    const changeRole = async (userId, roleId) => {

        if (!roleId) return;

        try {

            /*
               This route must exist in backend.

               Recommended:
               PUT /api/admin/users/:id/role
            */

            await api.put(
                `/admin/users/${userId}/role`,
                {
                    roleId
                }
            );

            await loadUsers();

        } catch (error) {

            console.error(
                "CHANGE ROLE ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to change role."
            );
        }
    };


    /* ==========================================
       BLOCK USER
    ========================================== */

    const blockUser = async (id) => {

        if (!window.confirm("Block this user?")) {
            return;
        }

        try {

            // PUT /api/admin/users/:id/block
            await api.put(
                `/admin/users/${id}/block`,
                {}
            );

            await loadUsers();

        } catch (error) {

            console.error(
                "BLOCK USER ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to block user."
            );
        }
    };


    /* ==========================================
       UNBLOCK USER
    ========================================== */

    const unblockUser = async (id) => {

        try {

            // PUT /api/admin/users/:id/unblock
            await api.put(
                `/admin/users/${id}/unblock`,
                {}
            );

            await loadUsers();

        } catch (error) {

            console.error(
                "UNBLOCK USER ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to unblock user."
            );
        }
    };


    /* ==========================================
       DELETE USER
    ========================================== */

    const deleteUser = async (id) => {

        if (
            !window.confirm(
                "Delete this user permanently?"
            )
        ) {
            return;
        }

        try {

            // DELETE /api/admin/users/:id
            await api.delete(
                `/admin/users/${id}`
            );

            await loadUsers();

        } catch (error) {

            console.error(
                "DELETE USER ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete user."
            );
        }
    };


    /* ==========================================
       SEARCH USERS
    ========================================== */

    const filteredUsers = users.filter((user) => {

        const searchText =
            search.toLowerCase();

        return (
            user.name
                ?.toLowerCase()
                .includes(searchText)

            ||

            user.email
                ?.toLowerCase()
                .includes(searchText)

            ||

            user.phone
                ?.toLowerCase()
                .includes(searchText)
        );
    });


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {
        return (
            <div className="users-page">
                <h2>Loading users...</h2>
            </div>
        );
    }


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="users-page">

            {/* HEADER */}

            <div className="users-header">

                <div>

                    <h1>
                        User Management
                    </h1>

                    <p>
                        Manage users, roles and permissions.
                    </p>

                </div>


                <input
                    type="text"
                    className="search-input"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

            </div>


            {/* STATISTICS */}

            <div className="stats-grid">

                <div className="stat-card">
                    <h2>{stats.total}</h2>
                    <p>Total Users</p>
                </div>


                <div className="stat-card">
                    <h2>{stats.active}</h2>
                    <p>Active</p>
                </div>


                <div className="stat-card">
                    <h2>{stats.blocked}</h2>
                    <p>Blocked</p>
                </div>


                <div className="stat-card">
                    <h2>{stats.admins}</h2>
                    <p>Administrators</p>
                </div>

            </div>


            {/* USERS TABLE */}

            <div className="table-wrapper">

                <table className="users-table">

                    <thead>

                        <tr>
                            <th>Photo</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Current Role</th>
                            <th>Change Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>

                    </thead>


                    <tbody>

                        {
                            filteredUsers.length === 0

                                ?

                                <tr>

                                    <td
                                        colSpan="9"
                                        style={{
                                            textAlign: "center",
                                            padding: "30px"
                                        }}
                                    >
                                        No users found.
                                    </td>

                                </tr>

                                :

                                filteredUsers.map((user) => {

                                    const currentRole =

                                        user.roles?.length > 0

                                            ?

                                            user.roles
                                                .map(
                                                    (role) =>
                                                        role.name
                                                )
                                                .join(", ")

                                            :

                                            user.role === "admin"

                                                ?

                                                "Administrator"

                                                :

                                                "User";


                                    return (

                                        <tr key={user.id}>

                                            {/* PHOTO */}

                                            <td>

                                                <img
                                                    className="user-photo"
                                                    src={
                                                        user.profileImage
                                                            ? `${
                                                                import.meta.env
                                                                    .VITE_API_BASE_URL ||
                                                                ""
                                                            }/uploads/${
                                                                user.profileImage
                                                            }`
                                                            : "/default.png"
                                                    }
                                                    alt={user.name || "User"}
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "/default.png";
                                                    }}
                                                />

                                            </td>


                                            {/* NAME */}

                                            <td>
                                                {user.name || "-"}
                                            </td>


                                            {/* EMAIL */}

                                            <td>
                                                {user.email || "-"}
                                            </td>


                                            {/* PHONE */}

                                            <td>
                                                {user.phone || "-"}
                                            </td>


                                            {/* CURRENT ROLE */}

                                            <td>

                                                <span className="role-badge">

                                                    {currentRole}

                                                </span>

                                            </td>


                                            {/* CHANGE ROLE */}

                                            <td>

                                                <select
                                                    value={
                                                        user.roles?.[0]?.id ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        changeRole(
                                                            user.id,
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                >

                                                    <option value="">
                                                        Select Role
                                                    </option>


                                                    {
                                                        roles.map((role) => (

                                                            <option
                                                                key={role.id}
                                                                value={role.id}
                                                            >
                                                                {role.name}
                                                            </option>

                                                        ))
                                                    }

                                                </select>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                {
                                                    user.status === "blocked"

                                                        ?

                                                        <span className="blocked">
                                                            Blocked
                                                        </span>

                                                        :

                                                        <span className="active">
                                                            Active
                                                        </span>
                                                }

                                            </td>


                                            {/* JOINED */}

                                            <td>

                                                {
                                                    user.createdAt

                                                        ?

                                                        new Date(
                                                            user.createdAt
                                                        ).toLocaleDateString()

                                                        :

                                                        "-"
                                                }

                                            </td>


                                            {/* ACTIONS */}

                                            <td className="user-actions">

                                                <button
                                                    className="view-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/users/${user.id}`
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>


                                                {
                                                    user.status === "blocked"

                                                        ?

                                                        <button
                                                            className="unblock-btn"
                                                            onClick={() =>
                                                                unblockUser(
                                                                    user.id
                                                                )
                                                            }
                                                        >
                                                            Unblock
                                                        </button>

                                                        :

                                                        <button
                                                            className="block-btn"
                                                            onClick={() =>
                                                                blockUser(
                                                                    user.id
                                                                )
                                                            }
                                                        >
                                                            Block
                                                        </button>
                                                }


                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        deleteUser(user.id)
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>

                                    );

                                })
                        }

                    </tbody>

                </table>

            </div>

        </div>

    );
}

export default Users;
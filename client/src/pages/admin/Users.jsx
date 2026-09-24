import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../config/axios";

import "./Users.css";


function Users() {

    const navigate = useNavigate();


    /* =========================================================
       STATE
    ========================================================= */

    const [users, setUsers] = useState([]);

    const [roles, setRoles] = useState([]);

    const [loading, setLoading] = useState(true);

    const [rolesLoading, setRolesLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [actionLoading, setActionLoading] = useState({});

    const [roleUpdating, setRoleUpdating] = useState({});

    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        blocked: 0,
        admins: 0
    });


    /* =========================================================
       HELPERS
    ========================================================= */

    const normalizeRole = (role) => {

        if (!role) {
            return null;
        }

        if (typeof role === "string") {

            return {
                id: "",
                name: role
            };

        }

        return {
            ...role,

            id:
                role.id ??
                role.roleId ??
                role._id ??
                "",

            name:
                role.name ??
                role.role ??
                role.title ??
                "User"
        };

    };


    const getUserRoles = (user) => {

        if (!user) {
            return [];
        }


        if (Array.isArray(user.roles)) {

            return user.roles
                .map(normalizeRole)
                .filter(Boolean);

        }


        if (user.roles) {

            const normalized = normalizeRole(user.roles);

            return normalized
                ? [normalized]
                : [];

        }


        if (user.role) {

            return [
                {
                    id:
                        user.roleId ??
                        "",

                    name:
                        typeof user.role === "string"
                            ? user.role
                            : user.role?.name || "User"
                }
            ];

        }


        return [];

    };


    const getPrimaryRole = (user) => {

        const userRoles = getUserRoles(user);

        if (userRoles.length > 0) {
            return userRoles[0];
        }

        return {
            id: "",
            name: "User"
        };

    };


    const isAdminRole = (roleName) => {

        const normalized =
            String(roleName || "")
                .trim()
                .toLowerCase();

        return (
            normalized === "admin" ||
            normalized === "administrator" ||
            normalized === "super admin"
        );

    };


    const calculateStats = (userList) => {

        const allUsers =
            Array.isArray(userList)
                ? userList
                : [];


        return {

            total: allUsers.length,

            active:
                allUsers.filter(
                    (user) =>
                        String(
                            user.status || "active"
                        ).toLowerCase() !== "blocked"
                ).length,

            blocked:
                allUsers.filter(
                    (user) =>
                        String(
                            user.status || ""
                        ).toLowerCase() === "blocked"
                ).length,

            admins:
                allUsers.filter((user) => {

                    const primaryRole =
                        getPrimaryRole(user);

                    return (
                        isAdminRole(
                            primaryRole.name
                        ) ||
                        user.role === "admin"
                    );

                }).length

        };

    };


   const getProfileImage = (user) => {
    if (!user) {
        return "/default.png";
    }

    if (user.profileImageUrl) {
        return user.profileImageUrl;
    }

    if (
        user.profileImage &&
        /^https?:\/\//i.test(
            user.profileImage
        )
    ) {
        return user.profileImage;
    }

    return "/default.png";
};

    /* =========================================================
       LOAD USERS
    ========================================================= */

    const loadUsers = async () => {

        try {

            setLoading(true);


            const response =
                await api.get(
                    "/admin/users"
                );


            const usersData =
                response.data?.users ||
                response.data?.data ||
                (
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : []
                );


            const allUsers =
                Array.isArray(usersData)
                    ? usersData
                    : [];


            setUsers(allUsers);

            setStats(
                calculateStats(
                    allUsers
                )
            );


        }
        catch (error) {

            console.error(
                "LOAD USERS ERROR:",
                error.response?.data ||
                error.message
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

        }
        finally {

            setLoading(false);

        }

    };


    /* =========================================================
       LOAD ROLES
    ========================================================= */

    const loadRoles = async () => {

        try {

            setRolesLoading(true);


            const response =
                await api.get(
                    "/roles"
                );


            const rolesData =
                response.data?.roles ||
                response.data?.data ||
                (
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : []
                );


            const normalizedRoles =
                Array.isArray(rolesData)
                    ? rolesData
                        .map(normalizeRole)
                        .filter(
                            (role) =>
                                role &&
                                role.id !== ""
                        )
                    : [];


            setRoles(
                normalizedRoles
            );


        }
        catch (error) {

            console.error(
                "LOAD ROLES ERROR:",
                error.response?.data ||
                error.message
            );


            setRoles([]);


            alert(
                error.response?.data?.message ||
                "Unable to load roles."
            );

        }
        finally {

            setRolesLoading(false);

        }

    };


    /* =========================================================
       INITIAL LOAD
    ========================================================= */

    useEffect(() => {

        loadUsers();

        loadRoles();

    }, []);


    /* =========================================================
       CHANGE USER ROLE
    ========================================================= */

    const changeRole = async (
        userId,
        roleId
    ) => {

        const normalizedRoleId =
            String(roleId || "").trim();


        if (!normalizedRoleId) {
            return;
        }


        if (
            roleUpdating[userId]
        ) {
            return;
        }


        const selectedRole =
            roles.find(
                (role) =>
                    String(role.id) ===
                    normalizedRoleId
            );


        if (!selectedRole) {

            alert(
                "The selected role could not be found."
            );

            return;

        }


        const previousUsers =
            users.map(
                (user) => {

                    if (
                        user.id !== userId
                    ) {
                        return user;
                    }

                    return {
                        ...user
                    };

                }
            );


        /* -----------------------------------------------------
           Optimistic UI update
        ----------------------------------------------------- */

        setRoleUpdating(
            (current) => ({
                ...current,
                [userId]: true
            })
        );


        setUsers(
            (currentUsers) => {

                return currentUsers.map(
                    (user) => {

                        if (
                            user.id !== userId
                        ) {
                            return user;
                        }


                        return {

                            ...user,

                            roles: [
                                {
                                    ...selectedRole,

                                    id:
                                        selectedRole.id,

                                    name:
                                        selectedRole.name
                                }
                            ]

                        };

                    }
                );

            }
        );


        try {

            const response =
                await api.put(
                    `/admin/users/${userId}/role`,
                    {
                        roleId:
                            Number(
                                normalizedRoleId
                            )
                    }
                );


            /* -------------------------------------------------
               If backend returns updated user,
               use it. Otherwise keep optimistic state.
            ------------------------------------------------- */

            const updatedUser =
                response.data?.user ||
                response.data?.data;


            if (updatedUser) {

                setUsers(
                    (currentUsers) =>
                        currentUsers.map(
                            (user) =>
                                user.id === userId
                                    ? updatedUser
                                    : user
                        )
                );

            }


            /* -------------------------------------------------
               Recalculate statistics without reloading table
            ------------------------------------------------- */

            setUsers(
                (currentUsers) => {

                    setStats(
                        calculateStats(
                            currentUsers
                        )
                    );

                    return currentUsers;

                }
            );


        }
        catch (error) {

            console.error(
                "CHANGE ROLE ERROR:",
                error.response?.data ||
                error.message
            );


            /* -------------------------------------------------
               Restore previous state
            ------------------------------------------------- */

            setUsers(
                previousUsers
            );


            setStats(
                calculateStats(
                    previousUsers
                )
            );


            alert(
                error.response?.data?.message ||
                "Unable to change role."
            );

        }
        finally {

            setRoleUpdating(
                (current) => {

                    const updated = {
                        ...current
                    };

                    delete updated[userId];

                    return updated;

                }
            );

        }

    };


    /* =========================================================
       BLOCK USER
    ========================================================= */

    const blockUser = async (id) => {

        if (
            !window.confirm(
                "Block this user?"
            )
        ) {
            return;
        }


        try {

            setActionLoading(
                (current) => ({
                    ...current,
                    [id]: true
                })
            );


            await api.put(
                `/admin/users/${id}/block`,
                {}
            );


            setUsers(
                (currentUsers) => {

                    const updated =
                        currentUsers.map(
                            (user) =>
                                user.id === id
                                    ? {
                                        ...user,
                                        status:
                                            "blocked"
                                    }
                                    : user
                        );


                    setStats(
                        calculateStats(
                            updated
                        )
                    );


                    return updated;

                }
            );


        }
        catch (error) {

            console.error(
                "BLOCK USER ERROR:",
                error.response?.data ||
                error.message
            );


            alert(
                error.response?.data?.message ||
                "Unable to block user."
            );

        }
        finally {

            setActionLoading(
                (current) => {

                    const updated = {
                        ...current
                    };

                    delete updated[id];

                    return updated;

                }
            );

        }

    };


    /* =========================================================
       UNBLOCK USER
    ========================================================= */

    const unblockUser = async (id) => {

        try {

            setActionLoading(
                (current) => ({
                    ...current,
                    [id]: true
                })
            );


            await api.put(
                `/admin/users/${id}/unblock`,
                {}
            );


            setUsers(
                (currentUsers) => {

                    const updated =
                        currentUsers.map(
                            (user) =>
                                user.id === id
                                    ? {
                                        ...user,
                                        status:
                                            "active"
                                    }
                                    : user
                        );


                    setStats(
                        calculateStats(
                            updated
                        )
                    );


                    return updated;

                }
            );


        }
        catch (error) {

            console.error(
                "UNBLOCK USER ERROR:",
                error.response?.data ||
                error.message
            );


            alert(
                error.response?.data?.message ||
                "Unable to unblock user."
            );

        }
        finally {

            setActionLoading(
                (current) => {

                    const updated = {
                        ...current
                    };

                    delete updated[id];

                    return updated;

                }
            );

        }

    };


    /* =========================================================
       DELETE USER
    ========================================================= */

    const deleteUser = async (id) => {

        if (
            !window.confirm(
                "Delete this user permanently?\n\nThis action cannot be undone."
            )
        ) {
            return;
        }


        try {

            setActionLoading(
                (current) => ({
                    ...current,
                    [id]: true
                })
            );


            await api.delete(
                `/admin/users/${id}`
            );


            setUsers(
                (currentUsers) => {

                    const updated =
                        currentUsers.filter(
                            (user) =>
                                user.id !== id
                        );


                    setStats(
                        calculateStats(
                            updated
                        )
                    );


                    return updated;

                }
            );


        }
        catch (error) {

            console.error(
                "DELETE USER ERROR:",
                error.response?.data ||
                error.message
            );


            alert(
                error.response?.data?.message ||
                "Unable to delete user."
            );

        }
        finally {

            setActionLoading(
                (current) => {

                    const updated = {
                        ...current
                    };

                    delete updated[id];

                    return updated;

                }
            );

        }

    };


    /* =========================================================
       SEARCH
    ========================================================= */

    const filteredUsers =
        useMemo(() => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();


            if (!searchText) {
                return users;
            }


            return users.filter(
                (user) => {

                    const primaryRole =
                        getPrimaryRole(
                            user
                        );


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
                            primaryRole.name || ""
                        ).toLowerCase();


                    return (
                        name.includes(
                            searchText
                        ) ||
                        email.includes(
                            searchText
                        ) ||
                        phone.includes(
                            searchText
                        ) ||
                        role.includes(
                            searchText
                        )
                    );

                }
            );

        }, [
            users,
            search
        ]);


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (

            <div className="users-page">

                <div className="users-loading">

                    <div className="users-loader"></div>

                    <h2>
                        Loading users...
                    </h2>

                    <p>
                        Please wait while the users are loaded.
                    </p>

                </div>

            </div>

        );

    }


    /* =========================================================
       PAGE
    ========================================================= */

    return (

        <div className="users-page">


            {/* =================================================
               HEADER
            ================================================= */}

            <div className="users-header">

                <div className="users-title">

                    <h1>
                        User Management
                    </h1>

                    <p>
                        Manage users, roles and permissions.
                    </p>

                </div>


                <div className="users-search">

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search name, email, phone or role..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        aria-label="Search users"
                    />

                </div>

            </div>


            {/* =================================================
               STATISTICS
            ================================================= */}

            <div className="stats-grid">

                <div className="stat-card">

                    <span className="stat-label">
                        Total Users
                    </span>

                    <strong>
                        {stats.total}
                    </strong>

                </div>


                <div className="stat-card">

                    <span className="stat-label">
                        Active
                    </span>

                    <strong>
                        {stats.active}
                    </strong>

                </div>


                <div className="stat-card">

                    <span className="stat-label">
                        Blocked
                    </span>

                    <strong>
                        {stats.blocked}
                    </strong>

                </div>


                <div className="stat-card">

                    <span className="stat-label">
                        Administrators
                    </span>

                    <strong>
                        {stats.admins}
                    </strong>

                </div>

            </div>


            {/* =================================================
               TABLE
            ================================================= */}

            <div className="table-card">

                <div className="table-header">

                    <div>

                        <h2>
                            All Users
                        </h2>

                        <span>
                            Showing{" "}
                            <strong>
                                {filteredUsers.length}
                            </strong>{" "}
                            of{" "}
                            <strong>
                                {users.length}
                            </strong>{" "}
                            users
                        </span>

                    </div>

                </div>


                <div className="table-wrapper">

                    <table className="users-table">

                        <thead>

                            <tr>

                                <th className="photo-column">
                                    Photo
                                </th>

                                <th className="name-column">
                                    Name
                                </th>

                                <th className="email-column">
                                    Email
                                </th>

                                <th className="phone-column">
                                    Phone
                                </th>

                                <th className="role-column">
                                    Current Role
                                </th>

                                <th className="change-role-column">
                                    Change Role
                                </th>

                                <th className="status-column">
                                    Status
                                </th>

                                <th className="joined-column">
                                    Joined
                                </th>

                                <th className="actions-column">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredUsers.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="empty-table"
                                    >

                                        <div className="empty-content">

                                            <strong>
                                                No users found
                                            </strong>

                                            <span>
                                                Try changing your search.
                                            </span>

                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                filteredUsers.map(
                                    (user) => {

                                        const primaryRole =
                                            getPrimaryRole(
                                                user
                                            );


                                        const roleId =
                                            primaryRole.id
                                                ? String(
                                                    primaryRole.id
                                                )
                                                : "";


                                        const roleName =
                                            primaryRole.name ||
                                            "User";


                                        const isBlocked =
                                            String(
                                                user.status || ""
                                            ).toLowerCase() ===
                                            "blocked";


                                        const isRoleUpdating =
                                            Boolean(
                                                roleUpdating[
                                                    user.id
                                                ]
                                            );


                                        const isActionLoading =
                                            Boolean(
                                                actionLoading[
                                                    user.id
                                                ]
                                            );


                                        return (

                                            <tr
                                                key={user.id}
                                                className={
                                                    isRoleUpdating
                                                        ? "role-updating"
                                                        : ""
                                                }
                                            >


                                                {/* PHOTO */}

                                                <td>

                                                    <img
                                                        className="user-photo"
                                                        src={
                                                            getProfileImage(
                                                                user
                                                            )
                                                        }
                                                        alt={
                                                            user.name ||
                                                            "User"
                                                        }
                                                        onError={(
                                                            event
                                                        ) => {

                                                            event.currentTarget.src =
                                                                "/default.png";

                                                        }}
                                                    />

                                                </td>


                                                {/* NAME */}

                                                <td>

                                                    <div className="user-name-cell">

                                                        <strong>
                                                            {
                                                                user.name ||
                                                                "-"
                                                            }
                                                        </strong>

                                                    </div>

                                                </td>


                                                {/* EMAIL */}

                                                <td
                                                    title={
                                                        user.email ||
                                                        ""
                                                    }
                                                >
                                                    {
                                                        user.email ||
                                                        "-"
                                                    }
                                                </td>


                                                {/* PHONE */}

                                                <td>
                                                    {
                                                        user.phone ||
                                                        "-"
                                                    }
                                                </td>


                                                {/* CURRENT ROLE */}

                                                <td>

                                                    <span
                                                        className={
                                                            `role-badge ${
                                                                isAdminRole(
                                                                    roleName
                                                                )
                                                                    ? "admin-role"
                                                                    : "user-role"
                                                            }`
                                                        }
                                                    >
                                                        {
                                                            roleName
                                                        }
                                                    </span>

                                                </td>


                                                {/* CHANGE ROLE */}

                                                <td>

                                                    <div className="role-select-container">

                                                        <select
                                                            className={
                                                                isRoleUpdating
                                                                    ? "role-select updating"
                                                                    : "role-select"
                                                            }
                                                            value={
                                                                roleId
                                                            }
                                                            disabled={
                                                                isRoleUpdating ||
                                                                rolesLoading ||
                                                                roles.length === 0
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                changeRole(
                                                                    user.id,
                                                                    event.target.value
                                                                )
                                                            }
                                                            aria-label={
                                                                `Change role for ${
                                                                    user.name ||
                                                                    "user"
                                                                }`
                                                            }
                                                        >

                                                            {!roleId && (

                                                                <option value="">
                                                                    Select Role
                                                                </option>

                                                            )}


                                                            {roles.map(
                                                                (role) => (

                                                                    <option
                                                                        key={
                                                                            role.id
                                                                        }
                                                                        value={
                                                                            String(
                                                                                role.id
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            role.name
                                                                        }
                                                                    </option>

                                                                )
                                                            )}

                                                        </select>


                                                        {isRoleUpdating && (

                                                            <span className="role-spinner"></span>

                                                        )}

                                                    </div>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            isBlocked
                                                                ? "status-badge blocked"
                                                                : "status-badge active"
                                                        }
                                                    >
                                                        {
                                                            isBlocked
                                                                ? "Blocked"
                                                                : "Active"
                                                        }
                                                    </span>

                                                </td>


                                                {/* JOINED */}

                                                <td>

                                                    {
                                                        user.createdAt

                                                            ? new Date(
                                                                user.createdAt
                                                            ).toLocaleDateString()

                                                            : "-"
                                                    }

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="user-actions">

                                                        <button
                                                            type="button"
                                                            className="view-btn"
                                                            disabled={
                                                                isActionLoading
                                                            }
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/users/${user.id}`
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>


                                                        {isBlocked ? (

                                                            <button
                                                                type="button"
                                                                className="unblock-btn"
                                                                disabled={
                                                                    isActionLoading
                                                                }
                                                                onClick={() =>
                                                                    unblockUser(
                                                                        user.id
                                                                    )
                                                                }
                                                            >

                                                                {
                                                                    isActionLoading
                                                                        ? "..."
                                                                        : "Unblock"
                                                                }

                                                            </button>

                                                        ) : (

                                                            <button
                                                                type="button"
                                                                className="block-btn"
                                                                disabled={
                                                                    isActionLoading
                                                                }
                                                                onClick={() =>
                                                                    blockUser(
                                                                        user.id
                                                                    )
                                                                }
                                                            >

                                                                {
                                                                    isActionLoading
                                                                        ? "..."
                                                                        : "Block"
                                                                }

                                                            </button>

                                                        )}


                                                        <button
                                                            type="button"
                                                            className="delete-btn"
                                                            disabled={
                                                                isActionLoading
                                                            }
                                                            onClick={() =>
                                                                deleteUser(
                                                                    user.id
                                                                )
                                                            }
                                                        >

                                                            {
                                                                isActionLoading
                                                                    ? "..."
                                                                    : "Delete"
                                                            }

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

        </div>

    );

}


export default Users;
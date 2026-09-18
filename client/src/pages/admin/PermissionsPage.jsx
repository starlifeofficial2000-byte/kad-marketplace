import { useEffect, useMemo, useState } from "react";
import api from "../../config/axios";
import "./PermissionsPage.css";

function PermissionsPage() {

    /* =========================================
       STATE
    ========================================= */

    const [permissions, setPermissions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });

    const [editingPermission, setEditingPermission] = useState(null);

    const [submitting, setSubmitting] = useState(false);


    /* =========================================
       LOAD PERMISSIONS
    ========================================= */

    useEffect(() => {

        loadPermissions();

    }, []);


    const loadPermissions = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await api.get(
                "/permissions"
            );

            console.log(
                "PERMISSIONS RESPONSE:",
                response.data
            );


            /*
            ======================================
            SUPPORT DIFFERENT BACKEND RESPONSES
            ======================================
            */

            const permissionsData =

                response.data?.permissions ||

                response.data?.data?.permissions ||

                response.data?.data ||

                [];


            const safePermissions =

                Array.isArray(permissionsData)

                    ? permissionsData

                    : [];


            setPermissions(
                safePermissions
            );

        }

        catch (error) {

            console.error(
                "LOAD PERMISSIONS ERROR:",
                error
            );

            setPermissions([]);

            setError(

                error.response?.data?.message ||

                "Unable to load permissions."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================
       HANDLE INPUT CHANGE
    ========================================= */

    const handleChange = (e) => {

        const {

            name,

            value

        } = e.target;


        setFormData((previous) => ({

            ...previous,

            [name]: value

        }));

    };


    /* =========================================
       CREATE PERMISSION
    ========================================= */

    const createPermission = async () => {

        if (

            !formData.name.trim()

        ) {

            setError(
                "Permission name is required."
            );

            return;

        }


        try {

            setSubmitting(true);

            setError("");

            setSuccess("");


            const response = await api.post(

                "/permissions",

                {

                    name:

                        formData.name
                            .trim()
                            .toLowerCase()
                            .replace(/\s+/g, "_"),

                    description:

                        formData.description.trim()

                }

            );


            console.log(

                "CREATE PERMISSION RESPONSE:",

                response.data

            );


            setSuccess(
                "Permission created successfully."
            );


            setFormData({

                name: "",

                description: ""

            });


            await loadPermissions();

        }

        catch (error) {

            console.error(

                "CREATE PERMISSION ERROR:",

                error

            );


            setError(

                error.response?.data?.message ||

                "Unable to create permission."

            );

        }

        finally {

            setSubmitting(false);

        }

    };


    /* =========================================
       START EDITING
    ========================================= */

    const startEdit = (permission) => {

        setEditingPermission(
            permission
        );


        setFormData({

            name:

                permission.name || "",

            description:

                permission.description || ""

        });


        setError("");

        setSuccess("");


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    };


    /* =========================================
       CANCEL EDIT
    ========================================= */

    const cancelEdit = () => {

        setEditingPermission(null);


        setFormData({

            name: "",

            description: ""

        });


        setError("");

        setSuccess("");

    };


    /* =========================================
       UPDATE PERMISSION
    ========================================= */

    const updatePermission = async () => {

        if (

            !editingPermission?.id

        ) {

            return;

        }


        if (

            !formData.name.trim()

        ) {

            setError(
                "Permission name is required."
            );

            return;

        }


        try {

            setSubmitting(true);

            setError("");

            setSuccess("");


            const response = await api.put(

                `/permissions/${editingPermission.id}`,

                {

                    name:

                        formData.name
                            .trim()
                            .toLowerCase()
                            .replace(/\s+/g, "_"),

                    description:

                        formData.description.trim()

                }

            );


            console.log(

                "UPDATE PERMISSION RESPONSE:",

                response.data

            );


            setSuccess(
                "Permission updated successfully."
            );


            setEditingPermission(null);


            setFormData({

                name: "",

                description: ""

            });


            await loadPermissions();

        }

        catch (error) {

            console.error(

                "UPDATE PERMISSION ERROR:",

                error

            );


            setError(

                error.response?.data?.message ||

                "Unable to update permission."

            );

        }

        finally {

            setSubmitting(false);

        }

    };


    /* =========================================
       DELETE PERMISSION
    ========================================= */

    const deletePermission = async (permission) => {

        if (

            !permission?.id

        ) {

            return;

        }


        const confirmed = window.confirm(

            `Are you sure you want to delete "${permission.name}"?`

        );


        if (!confirmed) {

            return;

        }


        try {

            setError("");

            setSuccess("");


            await api.delete(

                `/permissions/${permission.id}`

            );


            setSuccess(
                "Permission deleted successfully."
            );


            await loadPermissions();

        }

        catch (error) {

            console.error(

                "DELETE PERMISSION ERROR:",

                error

            );


            setError(

                error.response?.data?.message ||

                "Unable to delete permission."

            );

        }

    };


    /* =========================================
       FILTER PERMISSIONS
    ========================================= */

    const filteredPermissions = useMemo(() => {

        const safePermissions =

            Array.isArray(permissions)

                ? permissions

                : [];


        const searchText =

            search
                .toLowerCase()
                .trim();


        if (!searchText) {

            return safePermissions;

        }


        return safePermissions.filter(

            (permission) => {

                const name =

                    permission?.name ||

                    "";


                const description =

                    permission?.description ||

                    "";


                return (

                    name
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    description
                        .toLowerCase()
                        .includes(searchText)

                );

            }

        );

    }, [

        permissions,

        search

    ]);


    /* =========================================
       PERMISSION STATISTICS
    ========================================= */

    const totalPermissions =

        Array.isArray(permissions)

            ? permissions.length

            : 0;


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="permissions-loading">

                <h2>

                    Loading permissions...

                </h2>

            </div>

        );

    }


    /* =========================================
       UI
    ========================================= */

    return (

        <div className="permissions-page">


            {/* =====================================
               HEADER
            ===================================== */}

            <div className="permissions-header">

                <div>

                    <h1>

                        Permission Management

                    </h1>


                    <p>

                        Manage administrator permissions and system access controls.

                    </p>

                </div>


                <div className="permissions-count">

                    Total Permissions:

                    <strong>

                        {totalPermissions}

                    </strong>

                </div>

            </div>


            {/* =====================================
               ALERTS
            ===================================== */}

            {

                error &&

                <div className="permission-alert error">

                    {error}

                </div>

            }


            {

                success &&

                <div className="permission-alert success">

                    {success}

                </div>

            }


            {/* =====================================
               CREATE / EDIT FORM
            ===================================== */}

            <div className="permission-form-card">

                <div className="form-header">

                    <h2>

                        {

                            editingPermission

                                ?

                                "Edit Permission"

                                :

                                "Create Permission"

                        }

                    </h2>


                    <p>

                        {

                            editingPermission

                                ?

                                "Update the selected system permission."

                                :

                                "Create a new permission for administrator roles."

                        }

                    </p>

                </div>


                <div className="permission-form">


                    <div className="form-group">

                        <label>

                            Permission Name

                        </label>


                        <input

                            type="text"

                            name="name"

                            placeholder="Example: approve_products"

                            value={formData.name}

                            onChange={handleChange}

                        />

                        <small>

                            Example: manage_users, approve_products, manage_security

                        </small>

                    </div>


                    <div className="form-group">

                        <label>

                            Description

                        </label>


                        <textarea

                            name="description"

                            placeholder="Describe what this permission allows..."

                            value={formData.description}

                            onChange={handleChange}

                            rows="3"

                        />

                    </div>


                    <div className="form-actions">


                        {

                            editingPermission

                                ?

                                <>

                                    <button

                                        className="primary-btn"

                                        onClick={updatePermission}

                                        disabled={submitting}

                                    >

                                        {

                                            submitting

                                                ?

                                                "Updating..."

                                                :

                                                "Update Permission"

                                        }

                                    </button>


                                    <button

                                        className="cancel-btn"

                                        onClick={cancelEdit}

                                        disabled={submitting}

                                    >

                                        Cancel

                                    </button>

                                </>

                                :

                                <button

                                    className="primary-btn"

                                    onClick={createPermission}

                                    disabled={submitting}

                                >

                                    {

                                        submitting

                                            ?

                                            "Creating..."

                                            :

                                            "Create Permission"

                                    }

                                </button>

                        }

                    </div>

                </div>

            </div>


            {/* =====================================
               SEARCH
            ===================================== */}

            <div className="permissions-toolbar">

                <input

                    type="text"

                    className="permissions-search"

                    placeholder="Search permissions..."

                    value={search}

                    onChange={(e) =>

                        setSearch(
                            e.target.value
                        )

                    }

                />


                <button

                    className="refresh-btn"

                    onClick={loadPermissions}

                >

                    Refresh

                </button>

            </div>


            {/* =====================================
               TABLE
            ===================================== */}

            <div className="permissions-table-wrapper">

                <table className="permissions-table">


                    <thead>

                        <tr>

                            <th>

                                ID

                            </th>

                            <th>

                                Permission

                            </th>

                            <th>

                                Description

                            </th>

                            <th>

                                Created

                            </th>

                            <th>

                                Actions

                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {

                            filteredPermissions.length === 0

                                ?

                                <tr>

                                    <td

                                        colSpan="5"

                                        className="empty-row"

                                    >

                                        No permissions found.

                                    </td>

                                </tr>

                                :

                                filteredPermissions.map(

                                    (permission) => (

                                        <tr

                                            key={permission.id}

                                        >

                                            <td>

                                                #{permission.id}

                                            </td>


                                            <td>

                                                <span className="permission-name">

                                                    {

                                                        permission.name ||

                                                        "Unnamed Permission"

                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                {

                                                    permission.description ||

                                                    "-"

                                                }

                                            </td>


                                            <td>

                                                {

                                                    permission.createdAt

                                                        ?

                                                        new Date(

                                                            permission.createdAt

                                                        ).toLocaleDateString()

                                                        :

                                                        "-"

                                                }

                                            </td>


                                            <td className="action-buttons">

                                                <button

                                                    className="edit-btn"

                                                    onClick={() =>

                                                        startEdit(
                                                            permission
                                                        )

                                                    }

                                                >

                                                    Edit

                                                </button>


                                                <button

                                                    className="delete-btn"

                                                    onClick={() =>

                                                        deletePermission(
                                                            permission
                                                        )

                                                    }

                                                >

                                                    Delete

                                                </button>

                                            </td>

                                        </tr>

                                    )

                                )

                        }

                    </tbody>

                </table>

            </div>


        </div>

    );

}


export default PermissionsPage;
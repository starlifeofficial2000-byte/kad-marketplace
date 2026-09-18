import { useEffect, useState } from "react";
import api from "../../config/axios";
import PermissionMatrix from "./PermissionMatrix";
import "./RolesPage.css";

function RolesPage() {

    const [roles, setRoles] = useState([]);

    const [loading, setLoading] = useState(true);

    const [selectedRole, setSelectedRole] = useState(null);

    const [showMatrix, setShowMatrix] = useState(false);

    const [name, setName] = useState("");

    const [description, setDescription] = useState("");

    const [creating, setCreating] = useState(false);


    /* =========================================
       LOAD ROLES
    ========================================= */

    useEffect(() => {

        loadRoles();

    }, []);


    const loadRoles = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/roles"
            );


            console.log(
                "ROLES RESPONSE:",
                response.data
            );


            const rolesData =

                response.data?.roles ||

                response.data?.data ||

                [];


            setRoles(

                Array.isArray(rolesData)

                    ? rolesData

                    : []

            );

        }

        catch (error) {

            console.error(
                "LOAD ROLES ERROR:",
                error
            );


            alert(

                error.response?.data?.message ||

                "Unable to load roles."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================
       CREATE ROLE
    ========================================= */

    const createRole = async () => {

        if (!name.trim()) {

            alert(
                "Role name is required."
            );

            return;

        }


        try {

            setCreating(true);


            await api.post(

                "/roles",

                {

                    name:
                        name.trim(),

                    description:
                        description.trim()

                }

            );


            setName("");

            setDescription("");


            await loadRoles();


            alert(
                "Role created successfully."
            );

        }

        catch (error) {

            console.error(
                "CREATE ROLE ERROR:",
                error
            );


            alert(

                error.response?.data?.message ||

                "Unable to create role."

            );

        }

        finally {

            setCreating(false);

        }

    };


    /* =========================================
       DELETE ROLE
    ========================================= */

    const deleteRole = async (role) => {

        if (role.isSystem) {

            alert(
                "System roles cannot be deleted."
            );

            return;

        }


        const confirmed = window.confirm(

            `Delete the role "${role.name}"?`

        );


        if (!confirmed) {

            return;

        }


        try {

            await api.delete(

                `/roles/${role.id}`

            );


            await loadRoles();


            alert(
                "Role deleted successfully."
            );

        }

        catch (error) {

            console.error(
                "DELETE ROLE ERROR:",
                error
            );


            alert(

                error.response?.data?.message ||

                "Unable to delete role."

            );

        }

    };


    /* =========================================
       OPEN PERMISSION MATRIX
    ========================================= */

    const openPermissions = (role) => {

        setSelectedRole(role);

        setShowMatrix(true);

    };


    /* =========================================
       CLOSE PERMISSION MATRIX
    ========================================= */

    const closePermissions = () => {

        setShowMatrix(false);

        setSelectedRole(null);

        loadRoles();

    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="roles-loading">

                <h2>
                    Loading Roles...
                </h2>

            </div>

        );

    }


    return (

        <div className="roles-page">


            {/* =====================================
               HEADER
            ===================================== */}

            <div className="roles-header">

                <div>

                    <h1>
                        Role Management
                    </h1>

                    <p>
                        Create roles and assign permissions to administrators.
                    </p>

                </div>

            </div>


            {/* =====================================
               CREATE ROLE
            ===================================== */}

            <div className="create-role">

                <div className="role-input-group">

                    <label>
                        Role Name
                    </label>

                    <input

                        type="text"

                        placeholder="Example: Content Manager"

                        value={name}

                        onChange={(e) =>

                            setName(
                                e.target.value
                            )

                        }

                    />

                </div>


                <div className="role-input-group">

                    <label>
                        Description
                    </label>

                    <input

                        type="text"

                        placeholder="Describe the role"

                        value={description}

                        onChange={(e) =>

                            setDescription(
                                e.target.value
                            )

                        }

                    />

                </div>


                <button

                    className="create-role-btn"

                    onClick={createRole}

                    disabled={creating}

                >

                    {

                        creating

                            ?

                            "Creating..."

                            :

                            "+ Create Role"

                    }

                </button>

            </div>


            {/* =====================================
               ROLES TABLE
            ===================================== */}

            <div className="roles-table-wrapper">

                <table className="roles-table">

                    <thead>

                        <tr>

                            <th>
                                ID
                            </th>

                            <th>
                                Role
                            </th>

                            <th>
                                Description
                            </th>

                            <th>
                                Type
                            </th>

                            <th>
                                Permissions
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {

                            roles.length === 0

                                ?

                                <tr>

                                    <td

                                        colSpan="6"

                                        style={{

                                            textAlign: "center",

                                            padding: "30px"

                                        }}

                                    >

                                        No roles found.

                                    </td>

                                </tr>

                                :

                                roles.map((role) => (

                                    <tr

                                        key={role.id}

                                    >

                                        <td>

                                            #{role.id}

                                        </td>


                                        <td>

                                            <strong>

                                                {role.name}

                                            </strong>

                                        </td>


                                        <td>

                                            {

                                                role.description ||

                                                "-"

                                            }

                                        </td>


                                        <td>

                                            {

                                                role.isSystem

                                                    ?

                                                    <span className="system-role">

                                                        System Role

                                                    </span>

                                                    :

                                                    <span className="custom-role">

                                                        Custom Role

                                                    </span>

                                            }

                                        </td>


                                        <td>

                                            <span className="permission-count">

                                                {

                                                    role.permissions?.length ||

                                                    0

                                                }

                                                {" "}
                                                Permissions

                                            </span>

                                        </td>


                                        <td>

                                            <button

                                                className="edit-btn"

                                                onClick={() =>

                                                    openPermissions(
                                                        role
                                                    )

                                                }

                                            >

                                                Manage Permissions

                                            </button>


                                            {

                                                !role.isSystem &&

                                                <button

                                                    className="delete-btn"

                                                    onClick={() =>

                                                        deleteRole(
                                                            role
                                                        )

                                                    }

                                                >

                                                    Delete

                                                </button>

                                            }

                                        </td>

                                    </tr>

                                ))

                        }

                    </tbody>

                </table>

            </div>


            {/* =====================================
               PERMISSION MATRIX
            ===================================== */}

            {

                showMatrix &&

                selectedRole && (

                    <PermissionMatrix

                        role={selectedRole}

                        close={closePermissions}

                    />

                )

            }


        </div>

    );

}


export default RolesPage;
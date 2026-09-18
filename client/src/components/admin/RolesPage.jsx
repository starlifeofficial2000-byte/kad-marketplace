import { useEffect, useState } from "react";
import api from "../../config/axios";
import PermissionMatrix from "./PermissionMatrix";
import "./RolesPage.css";

function RolesPage() {

    const token = localStorage.getItem("token");

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedRole, setSelectedRole] = useState(null);
    const [showMatrix, setShowMatrix] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {

        loadRoles();

    }, []);

    const loadRoles = async () => {

        try {

            const response = await axios.get(

                "/api/roles",

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            setRoles(response.data.roles);

        }

        catch (error) {

            console.log(error);

            alert("Unable to load roles.");

        }

        finally {

            setLoading(false);

        }

    };

    const createRole = async () => {

        try {

            await axios.post(

                "/api/roles",

                {

                    name,

                    description

                },

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            setName("");
            setDescription("");

            loadRoles();

        }

        catch (error) {

            alert(

                error.response?.data?.message ||

                "Unable to create role."

            );

        }

    };

    const deleteRole = async (id) => {

        if (!window.confirm("Delete this role?")) {

            return;

        }

        try {

            await axios.delete(

                `/api/roles/${id}`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            loadRoles();

        }

        catch (error) {

            alert(

                error.response?.data?.message ||

                "Unable to delete role."

            );

        }

    };

    if (loading) {

        return <h2>Loading Roles...</h2>;

    }

    return (

        <div className="roles-page">

            <div className="roles-header">

                <h1>Role Management</h1>

            </div>

            <div className="create-role">

                <input

                    type="text"

                    placeholder="Role Name"

                    value={name}

                    onChange={(e) => setName(e.target.value)}

                />

                <input

                    type="text"

                    placeholder="Description"

                    value={description}

                    onChange={(e) => setDescription(e.target.value)}

                />

                <button onClick={createRole}>

                    + Create Role

                </button>

            </div>

            <table className="roles-table">

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Role</th>

                        <th>Description</th>

                        <th>System</th>

                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        roles.map((role) => (

                            <tr key={role.id}>

                                <td>{role.id}</td>

                                <td>{role.name}</td>

                                <td>{role.description}</td>

                                <td>

                                    {

                                        role.isSystem

                                            ? "✅ Yes"

                                            : "❌ No"

                                    }

                                </td>

                                <td>

                                    <button

                                        className="edit-btn"

                                        onClick={() => {

                                            setSelectedRole(role);

                                            setShowMatrix(true);

                                        }}

                                    >

                                        Edit

                                    </button>

                                    <button

                                        className="delete-btn"

                                        onClick={() =>

                                            deleteRole(role.id)

                                        }

                                    >

                                        Delete

                                    </button>

                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

            {

                showMatrix && selectedRole && (

                    <PermissionMatrix

                        role={selectedRole}

                        close={() => {

                            setShowMatrix(false);

                            setSelectedRole(null);

                            loadRoles();

                        }}

                    />

                )

            }

        </div>

    );

}

export default RolesPage;
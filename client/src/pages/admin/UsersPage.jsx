import { useEffect, useState } from "react";
import api from "../../config/axios";

function UsersPage() {

    const token = localStorage.getItem("token");

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {

        loadUsers();

    }, []);

    const loadUsers = async () => {

        try {

         const response = await api.get(
    "/settings"
);

            setUsers(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    const suspendUser = async (id) => {

        if (!window.confirm("Suspend this user?")) return;

        try {

            await axios.put(

                `/api/admin/users/suspend/${id}`,

                {},

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            loadUsers();

        }

        catch (error) {

            console.log(error);

        }

    };

    const deleteUser = async (id) => {

        if (!window.confirm("Delete this user permanently?")) return;

        try {

            await axios.delete(

                `/api/admin/users/${id}`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            loadUsers();

        }

        catch (error) {

            console.log(error);

        }

    };

    const filteredUsers = users.filter(user =>

        user.name.toLowerCase().includes(search.toLowerCase()) ||

        user.email.toLowerCase().includes(search.toLowerCase())

    );

    return (

        <div className="page-container">

            <div className="page-header">

                <h1>👥 Users Management</h1>

                <input

                    type="text"

                    placeholder="Search users..."

                    value={search}

                    onChange={(e)=>setSearch(e.target.value)}

                />

            </div>

            <table className="admin-table">

                <thead>

                    <tr>

                        <th>Name</th>

                        <th>Email</th>

                        <th>Phone</th>

                        <th>Role</th>

                        <th>Status</th>

                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        filteredUsers.map(user=>(

                            <tr key={user.id}>

                                <td>{user.name}</td>

                                <td>{user.email}</td>

                                <td>{user.phone}</td>

                                <td>{user.role}</td>

                                <td>

                                    {

                                        user.suspended ?

                                        <span className="rejected">

                                            Suspended

                                        </span>

                                        :

                                        <span className="approved">

                                            Active

                                        </span>

                                    }

                                </td>

                                <td>

                                    <button

                                        className="approve"

                                        onClick={()=>suspendUser(user.id)}

                                    >

                                        Suspend

                                    </button>

                                    <button

                                        className="reject"

                                        onClick={()=>deleteUser(user.id)}

                                    >

                                        Delete

                                    </button>

                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}

export default UsersPage;
import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./UserRoles.css";

function UserRoles(){

const token=localStorage.getItem("token");

const [users,setUsers]=useState([]);

const [roles,setRoles]=useState([]);

useEffect(()=>{

loadUsers();

loadRoles();

},[]);

const loadUsers=async()=>{

const response = await api.get("/admin/users");
setUsers(response.data?.users || []);

};

const loadRoles=async()=>{

const response = await api.get("/roles");
setRoles(response.data?.roles || response.data || []);

};

const changeRole=async(userId,roleId)=>{

await api.put(

`/admin/users/${userId}/role`,

{

roleId

},

{

headers:{

Authorization:`Bearer ${token}`

}

}

);

loadUsers();

};

return(

<div className="user-role-page">

<h1>User Role Management</h1>

<table>

<thead>

<tr>

<th>Name</th>

<th>Email</th>

<th>Current Role</th>

<th>Change Role</th>

</tr>

</thead>

<tbody>

{

users.map(user=>(

<tr key={user.id}>

<td>{user.name}</td>

<td>{user.email}</td>

<td>

{

(user.roles || []).length

?

user.roles[0].name

:

"None"

}

</td>

<td>

<select

onChange={(e)=>

changeRole(

user.id,

e.target.value

)

}

defaultValue={

(user.roles || []).length

?

user.roles[0].id

:

""

}

>

{

roles.map(role=>(

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

</tr>

))

}

</tbody>

</table>

</div>

);

}

export default UserRoles;
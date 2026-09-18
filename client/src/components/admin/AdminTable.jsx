import "./AdminTable.css";

function AdminTable({

    columns,

    data,

    renderActions

}){

    return(

<div className="admin-table-container">

<table className="admin-table">

<thead>

<tr>

{

columns.map(column=>(

<th key={column.key}>

{column.label}

</th>

))

}

<th>

Actions

</th>

</tr>

</thead>

<tbody>

{

data.length===0

?

(

<tr>

<td

colSpan={columns.length+1}

className="empty"

>

No records found

</td>

</tr>

)

:

data.map(row=>(

<tr key={row.id}>

{

columns.map(column=>(

<td key={column.key}>

{

column.render

?

column.render(row)

:

row[column.key]

}

</td>

))

}

<td>

{

renderActions(row)

}

</td>

</tr>

))

}

</tbody>

</table>

</div>

);

}

export default AdminTable;
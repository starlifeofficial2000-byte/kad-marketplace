function Categories(){

    const categories=[
        "Mobile Phones",
        "Laptops",
        "TV",
        "Radio",
        "Music Equipment",
        "Food Stuff",
        "Clothes",
        "Accessories",
        "Cars",
        "Motorcycles",
        "Employment Opportunities"
    ];

    return(
        <div>
            <h1>Categories</h1>

            {
                categories.map((item,index)=>(
                    <p key={index}>{item}</p>
                ))
            }

        </div>
    )
}

export default Categories;
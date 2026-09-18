import "./CategorySection.css";

const categories = [



       {
        name:"All",
        icon:"🏪"
    },
    {
        name:"Mobile Phones",
        icon:"📱"
    },

    {
        name:"Laptops",
        icon:"💻"
    },

    {
        name:"TV",
        icon:"📺"
    },

    {
        name:"Cars",
        icon:"🚗"
    },

    {
        name:"Motorcycles",
        icon:"🏍"
    },

    {
        name:"Clothes",
        icon:"👕"
    },

    {
        name:"Accessories",
        icon:"👜"
    },

    {
        name:"Food Stuff",
        icon:"🍎"
    },

    {
        name:"Employment Opportunities",
        icon:"💼"
    }

];

function CategorySection({ setCategory, products = [] }) {

    return(

        <section className="category-section">

            <h2>

                Browse Categories

            </h2>

            <div className="category-grid">

                {

                    categories.map(category=>(
<div
    key={category.name}
    className="category-card"
    onClick={() => setCategory(category.name)}
>

    <span>{category.icon}</span>

    <h3>{category.name}</h3>

    <p>

        {

            category.name === "All"

            ? products.length

            : products.filter(

                p => p.category === category.name

            ).length

        }

        {" "}Products

    </p>

</div>

                    ))

                }

            </div>

        </section>

    );

}

export default CategorySection;
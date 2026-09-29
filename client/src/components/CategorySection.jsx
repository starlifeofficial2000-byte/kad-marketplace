import "./CategorySection.css";

const categories = [
    {
        name: "All",
        icon: "🏪",
        description: "Browse everything"
    },
    {
        name: "Mobile Phones",
        icon: "📱",
        description: "Phones & smartphones"
    },
    {
        name: "Laptops",
        icon: "💻",
        description: "Laptops & computers"
    },
    {
        name: "TV",
        icon: "📺",
        description: "TVs & entertainment"
    },
    {
        name: "Cars",
        icon: "🚗",
        description: "Cars & vehicles"
    },
    {
        name: "Motorcycles",
        icon: "🏍️",
        description: "Motorcycles & bikes"
    },
    {
        name: "Real Estate",
        icon: "🏠",
        description: "Houses, land & property"
    },
    {
        name: "Electronics",
        icon: "🔌",
        description: "Electronic devices"
    },
    {
        name: "Furniture",
        icon: "🛋️",
        description: "Furniture & home items"
    },
    {
        name: "Clothes",
        icon: "👕",
        description: "Fashion & clothing"
    },
    {
        name: "Accessories",
        icon: "👜",
        description: "Fashion & personal items"
    },
    {
        name: "Food Stuff",
        icon: "🍎",
        description: "Food & groceries"
    },
    {
        name: "Agriculture",
        icon: "🌾",
        description: "Farming & agricultural items"
    },
    {
        name: "Construction",
        icon: "🏗️",
        description: "Building materials & equipment"
    },
    {
        name: "Services",
        icon: "🛠️",
        description: "Professional & local services"
    },
    {
        name: "Employment Opportunities",
        icon: "💼",
        description: "Jobs & opportunities"
    }
];

function CategorySection({ setCategory, products = [] }) {

    const getProductCount = (categoryName) => {

        if (categoryName === "All") {
            return products.length;
        }

        return products.filter(
            product =>
                product.category?.toLowerCase() ===
                categoryName.toLowerCase()
        ).length;
    };

    return (
        <section className="category-section">

            <div className="category-section-header">

                <div>

                    <span className="category-eyebrow">
                        EXPLORE MARKETPLACE
                    </span>

                    <h2>
                        Browse Categories
                    </h2>

                    <p>
                        Find products and services from trusted sellers
                        across Ghana.
                    </p>

                </div>

                <button
                    type="button"
                    className="category-view-all"
                    onClick={() => setCategory("All")}
                >
                    View All
                    <span>→</span>
                </button>

            </div>


            <div className="category-grid">

                {categories.map((category) => {

                    const productCount =
                        getProductCount(category.name);

                    const isAll =
                        category.name === "All";

                    return (

                        <button
                            type="button"
                            key={category.name}
                            className={`category-card ${
                                isAll
                                    ? "category-card-all"
                                    : ""
                            }`}
                            onClick={() =>
                                setCategory(category.name)
                            }
                        >

                            <div className="category-card-top">

                                <div className="category-icon">

                                    <span>
                                        {category.icon}
                                    </span>

                                </div>

                                <span className="category-arrow">
                                    →
                                </span>

                            </div>


                            <div className="category-card-content">

                                <h3>
                                    {category.name}
                                </h3>

                                <p>
                                    {category.description}
                                </p>

                            </div>


                            <div className="category-card-footer">

                                <span>
                                    {productCount}
                                </span>

                                <span>
                                    {productCount === 1
                                        ? "Product"
                                        : "Products"}
                                </span>

                            </div>

                        </button>

                    );

                })}

            </div>

        </section>
    );
}

export default CategorySection;
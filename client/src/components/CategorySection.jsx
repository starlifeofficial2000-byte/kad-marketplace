import { useState } from "react";
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

function CategorySection({
    setCategory,
    products = []
}) {

    const [open, setOpen] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState(
        categories[0]
    );

    const getProductCount = (categoryName) => {

        if (categoryName === "All") {
            return products.length;
        }

        return products.filter(
            (product) =>
                product.category?.toLowerCase() ===
                categoryName.toLowerCase()
        ).length;
    };

    const handleCategorySelect = (category) => {

        setSelectedCategory(category);

        setCategory(category.name);

        setOpen(false);
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
                        Find products and services from trusted
                        sellers across Ghana.
                    </p>

                </div>

            </div>


            <div className="category-selector-wrapper">

                <button
                    type="button"
                    className={`category-selector ${
                        open ? "category-selector-open" : ""
                    }`}
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                >

                    <div className="selected-category">

                        <div className="selected-category-icon">

                            {selectedCategory.icon}

                        </div>

                        <div className="selected-category-info">

                            <span className="selected-category-label">
                                CATEGORY
                            </span>

                            <strong>
                                {selectedCategory.name}
                            </strong>

                        </div>

                    </div>


                    <div className="category-selector-right">

                        <span className="selected-product-count">

                            {getProductCount(
                                selectedCategory.name
                            )}

                            {" "}

                            {getProductCount(
                                selectedCategory.name
                            ) === 1
                                ? "Product"
                                : "Products"}

                        </span>

                        <span
                            className={`category-chevron ${
                                open ? "rotate" : ""
                            }`}
                        >
                            ▼
                        </span>

                    </div>

                </button>


                {open && (

                    <div className="category-dropdown">

                        <div className="category-dropdown-header">

                            <span>
                                SELECT CATEGORY
                            </span>

                        </div>


                        <div className="category-dropdown-list">

                            {categories.map((category) => {

                                const count =
                                    getProductCount(
                                        category.name
                                    );

                                const selected =
                                    selectedCategory.name ===
                                    category.name;

                                return (

                                    <button
                                        type="button"
                                        key={category.name}
                                        className={`category-option ${
                                            selected
                                                ? "category-option-selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleCategorySelect(
                                                category
                                            )
                                        }
                                    >

                                        <div className="category-option-icon">

                                            {category.icon}

                                        </div>


                                        <div className="category-option-content">

                                            <strong>
                                                {category.name}
                                            </strong>

                                            <span>
                                                {category.description}
                                            </span>

                                        </div>


                                        <div className="category-option-count">

                                            {count}

                                        </div>


                                        {selected && (

                                            <span className="category-check">
                                                ✓
                                            </span>

                                        )}

                                    </button>

                                );

                            })}

                        </div>

                    </div>

                )}

            </div>


            <div className="category-results-info">

                <span>
                    Showing
                </span>

                <strong>
                    {" "}
                    {selectedCategory.name}
                </strong>

                <span>
                    {" "}•{" "}
                    {getProductCount(
                        selectedCategory.name
                    )}{" "}
                    {getProductCount(
                        selectedCategory.name
                    ) === 1
                        ? "product"
                        : "products"}
                </span>

            </div>

        </section>

    );
}

export default CategorySection;
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaMobileAlt,
    FaLaptop,
    FaTv,
    FaRadio,
    FaMusic,
    FaUtensils,
    FaTshirt,
    FaShoppingBag,
    FaCar,
    FaMotorcycle,
    FaBriefcase,
    FaHome,
    FaTools,
    FaFootballBall,
    FaCamera,
    FaBaby,
    FaBook,
    FaSolarPanel,
    FaBuilding,
    FaGamepad,
    FaSearch,
    FaArrowRight,
    FaThLarge
} from "react-icons/fa";

import "./Categories.css";


function Categories() {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const categories = [
        {
            name: "Phones & Tablets",
            description: "Mobile phones, tablets and accessories",
            icon: FaMobileAlt,
            color: "blue",
            subcategories: [
                "Mobile Phones",
                "iPhone",
                "Samsung",
                "Tecno",
                "Infinix",
                "Tablets",
                "other",
                "Phone Accessories"
            ]
        },

         {
            name: "Land & Property",
            subcategories: [
                "Land for Sale",
                "Land for Rent",
                "Houses for Sale",
                "Houses for Rent",
                "Apartments for Sale",
                "Apartments for Rent",
                "Commercial Property",
                "Office Spaces",
                "Shops & Stores",
                "Buildings",
                "Farms & Agricultural Land"
            ]
        },
        {
            name: "Computers & Laptops",
            description: "Laptops, desktops, monitors and accessories",
            icon: FaLaptop,
            color: "purple",
            subcategories: [
                "Laptops",
                "Desktop Computers",
                "Monitors",
                "Printers",
                "Computer Accessories"
            ]
        },

        {
            name: "Electronics",
            description: "TVs, radios, speakers and electronic devices",
            icon: FaTv,
            color: "orange",
            subcategories: [
                "Televisions",
                "Radios",
                "Speakers",
                "Headphones",
                "Home Electronics"
            ]
        },

        {
            name: "Music & Entertainment",
            description: "Music equipment and entertainment products",
            icon: FaMusic,
            color: "pink",
            subcategories: [
                "DJ Equipment",
                "Musical Instruments",
                "Studio Equipment",
                "Speakers",
                "Music Accessories"
            ]
        },

        {
            name: "Food & Groceries",
            description: "Food products and household groceries",
            icon: FaUtensils,
            color: "green",
            subcategories: [
                "Food Stuff",
                "Drinks",
                "Snacks",
                "Grains",
                "Household Groceries"
            ]
        },

        {
            name: "Fashion & Clothing",
            description: "Clothing, shoes and fashion accessories",
            icon: FaTshirt,
            color: "red",
            subcategories: [
                "Men's Clothing",
                "Women's Clothing",
                "Children's Clothing",
                "Shoes",
                "Fashion Accessories"
            ]
        },

        {
            name: "Bags & Accessories",
            description: "Bags, watches, jewellery and accessories",
            icon: FaShoppingBag,
            color: "gold",
            subcategories: [
                "Bags",
                "Watches",
                "Jewellery",
                "Wallets",
                "Accessories"
            ]
        },

        {
            name: "Cars & Vehicles",
            description: "Cars, trucks and vehicle accessories",
            icon: FaCar,
            color: "dark",
            subcategories: [
                "Cars",
                "Trucks",
                "Buses",
                "Car Spare Parts",
                "Car Accessories"
            ]
        },

        {
            name: "Motorcycles",
            description: "Motorcycles, parts and accessories",
            icon: FaMotorcycle,
            color: "cyan",
            subcategories: [
                "Motorcycles",
                "Motorbike Parts",
                "Motorbike Accessories",
                "Helmets"
            ]
        },

        {
            name: "Home & Furniture",
            description: "Furniture, appliances and home products",
            icon: FaHome,
            color: "brown",
            subcategories: [
                "Beds",
                "Sofas",
                "Tables",
                "Chairs",
                "Wardrobes",
                "Home Appliances"
            ]
        },

        {
            name: "Tools & Equipment",
            description: "Tools, machines and professional equipment",
            icon: FaTools,
            color: "steel",
            subcategories: [
                "Power Tools",
                "Hand Tools",
                "Construction Equipment",
                "Workshop Equipment"
            ]
        },

        {
            name: "Sports & Fitness",
            description: "Sports equipment and fitness products",
            icon: FaFootballBall,
            color: "lime",
            subcategories: [
                "Football",
                "Gym Equipment",
                "Fitness Equipment",
                "Bicycles",
                "Sports Accessories"
            ]
        },

        {
            name: "Cameras & Photography",
            description: "Cameras, lenses and photography equipment",
            icon: FaCamera,
            color: "indigo",
            subcategories: [
                "Digital Cameras",
                "DSLR Cameras",
                "Mirrorless Cameras",
                "Lenses",
                "Camera Accessories"
            ]
        },

        {
            name: "Baby & Kids",
            description: "Products for babies and children",
            icon: FaBaby,
            color: "sky",
            subcategories: [
                "Baby Clothes",
                "Baby Equipment",
                "Toys",
                "Children's Products"
            ]
        },

        {
            name: "Books & Education",
            description: "Books, textbooks and educational materials",
            icon: FaBook,
            color: "navy",
            subcategories: [
                "Textbooks",
                "Novels",
                "School Supplies",
                "Educational Materials"
            ]
        },

        {
            name: "Solar & Power",
            description: "Solar panels, inverters, batteries and generators",
            icon: FaSolarPanel,
            color: "yellow",
            subcategories: [
                "Solar Panels",
                "Inverters",
                "Batteries",
                "Generators",
                "Solar Accessories"
            ]
        },

        {
            name: "Building & Construction",
            description: "Building materials and construction products",
            icon: FaBuilding,
            color: "construction",
            subcategories: [
                "Building Materials",
                "Plumbing",
                "Electrical Materials",
                "Construction Equipment"
            ]
        },

        {
            name: "Gaming",
            description: "Gaming consoles, games and accessories",
            icon: FaGamepad,
            color: "violet",
            subcategories: [
                "PlayStation",
                "Xbox",
                "Nintendo",
                "Gaming PCs",
                "Gaming Accessories"
            ]
        },

        {
            name: "Jobs & Services",
            description: "Employment opportunities and professional services",
            icon: FaBriefcase,
            color: "teal",
            subcategories: [
                "Employment Opportunities",
                "Freelance Services",
                "Professional Services",
                "Repairs",
                "Cleaning Services"
            ]
        }
    ];


    const filteredCategories = useMemo(() => {

        const keyword = search
            .trim()
            .toLowerCase();

        if (!keyword) {
            return categories;
        }

        return categories.filter((category) => {

            const categoryMatch =
                category.name
                    .toLowerCase()
                    .includes(keyword);

            const descriptionMatch =
                category.description
                    .toLowerCase()
                    .includes(keyword);

            const subcategoryMatch =
                category.subcategories.some((item) =>
                    item.toLowerCase().includes(keyword)
                );

            return (
                categoryMatch ||
                descriptionMatch ||
                subcategoryMatch
            );
        });

    }, [search]);


    const handleCategoryClick = (category) => {

        navigate(
            `/search?category=${encodeURIComponent(
                category.name
            )}`
        );
    };


    const handleSubcategoryClick = (
        event,
        category,
        subcategory
    ) => {

        event.stopPropagation();

        navigate(
            `/search?category=${encodeURIComponent(
                category.name
            )}&subcategory=${encodeURIComponent(
                subcategory
            )}`
        );
    };


    return (

        <main className="categories-page">

            {/* =========================================
               HERO
            ========================================= */}

            <section className="categories-hero">

                <div className="categories-hero-content">

                    <div className="categories-badge">
                        <FaThLarge />
                        <span>
                            KAD MARKETPLACE
                        </span>
                    </div>

                    <h1>
                        Explore Categories
                    </h1>

                    <p>
                        Discover products and services
                        from sellers across Ghana.
                    </p>


                    <div className="categories-search">

                        <FaSearch />

                        <input
                            type="search"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search categories..."
                            aria-label="Search categories"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch("")
                                }
                                className="clear-search"
                            >
                                ×
                            </button>
                        )}

                    </div>

                </div>

            </section>


            {/* =========================================
               CATEGORY CONTENT
            ========================================= */}

            <section className="categories-content">

                <div className="categories-heading">

                    <div>

                        <span>
                            MARKETPLACE
                        </span>

                        <h2>
                            Browse Categories
                        </h2>

                    </div>

                    <p>
                        {filteredCategories.length}
                        {" "}
                        {filteredCategories.length === 1
                            ? "category"
                            : "categories"
                        }
                    </p>

                </div>


                {/* =====================================
                   CATEGORY GRID
                ===================================== */}

                {filteredCategories.length > 0 ? (

                    <div className="categories-grid">

                        {filteredCategories.map(
                            (category) => {

                                const Icon =
                                    category.icon;

                                return (

                                    <article
                                        key={category.name}
                                        className="category-card"
                                        onClick={() =>
                                            handleCategoryClick(
                                                category
                                            )
                                        }
                                    >

                                        <div
                                            className={`category-icon ${category.color}`}
                                        >
                                            <Icon />
                                        </div>


                                        <div className="category-card-content">

                                            <h3>
                                                {category.name}
                                            </h3>

                                            <p>
                                                {category.description}
                                            </p>


                                            <div className="subcategory-list">

                                                {category.subcategories
                                                    .slice(0, 4)
                                                    .map(
                                                        (
                                                            subcategory
                                                        ) => (

                                                            <button
                                                                key={
                                                                    subcategory
                                                                }
                                                                type="button"
                                                                onClick={(
                                                                    event
                                                                ) =>
                                                                    handleSubcategoryClick(
                                                                        event,
                                                                        category,
                                                                        subcategory
                                                                    )
                                                                }
                                                            >
                                                                {
                                                                    subcategory
                                                                }
                                                            </button>

                                                        )
                                                    )}

                                            </div>


                                            <div className="category-card-footer">

                                                <span>
                                                    View products
                                                </span>

                                                <FaArrowRight />

                                            </div>

                                        </div>

                                    </article>

                                );

                            }
                        )}

                    </div>

                ) : (

                    <div className="categories-empty">

                        <div>
                            <FaSearch />
                        </div>

                        <h3>
                            No categories found
                        </h3>

                        <p>
                            Try searching for another
                            category.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            Show all categories
                        </button>

                    </div>

                )}

            </section>

        </main>
    );
}


export default Categories;
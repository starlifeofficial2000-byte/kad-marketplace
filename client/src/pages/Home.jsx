import { useEffect, useState, useRef } from "react";
import api from "../config/axios";

import Layout from "../components/Layout";
import BannerSlider from "../components/BannerSlider";
import FeaturedProducts from "../components/home/FeaturedProducts";
import TrendingProducts from "../components/home/TrendingProducts";
import RecommendedProducts from "../components/home/RecommendedProducts";
import CategorySection from "../components/CategorySection";
import ProductCard from "../components/ProductCard";

import { ghanaLocations } from "../data/ghanaLocations";

import "./Home.css";

function Home() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [region, setRegion] = useState("All");
    const [city, setCity] = useState("All");
    const [condition, setCondition] = useState("All");

    const token = localStorage.getItem("token");

    const productsSectionRef = useRef(null);


    /* ==========================================
       FETCH PRODUCTS
    ========================================== */

    useEffect(() => {

        fetchProducts();

    }, []);


    const fetchProducts = async () => {

        try {

            setLoading(true);

            const response = await api.get("/products");

            console.log(
                "HOME PRODUCTS RESPONSE:",
                response.data
            );

            setProducts(
                response.data.products || response.data || []
            );

        }

        catch (error) {

            console.error(
                "PRODUCT LOAD ERROR:",
                error.response?.data || error.message
            );

            setProducts([]);

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       CATEGORY CLICK
    ========================================== */

    const handleCategorySelect = (selectedCategory) => {

        setCategory(selectedCategory);

        setTimeout(() => {

            productsSectionRef.current?.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }, 100);

    };


    /* ==========================================
       FILTER PRODUCTS
    ========================================== */

    const filteredProducts = products.filter((product) => {

        const title = product.title || "";
        const description = product.description || "";
        const productCategory = product.category || "";
        const productLocation = product.location || "";
        const productRegion = product.region || "";
        const productCity = product.city || "";
        const productCondition = product.condition || "";

        const keyword = search.toLowerCase().trim();


        /* SEARCH */

        const matchesSearch =

            title.toLowerCase().includes(keyword) ||

            description.toLowerCase().includes(keyword) ||

            productCategory.toLowerCase().includes(keyword) ||

            productLocation.toLowerCase().includes(keyword) ||

            productRegion.toLowerCase().includes(keyword) ||

            productCity.toLowerCase().includes(keyword);


        /* CATEGORY */

        const matchesCategory =

            category === "All" ||

            productCategory.toLowerCase() ===
            category.toLowerCase();


        /* REGION */

        const matchesRegion =

            region === "All" ||

            productRegion.toLowerCase() ===
            region.toLowerCase();


        /* CITY */

        const matchesCity =

            city === "All" ||

            productCity.toLowerCase() ===
            city.toLowerCase();


        /* CONDITION */

        const matchesCondition =

            condition === "All" ||

            productCondition.toLowerCase() ===
            condition.toLowerCase();


        return (

            matchesSearch &&

            matchesCategory &&

            matchesRegion &&

            matchesCity &&

            matchesCondition

        );

    });


    /* ==========================================
       SAVE SEARCH HISTORY
    ========================================== */

    const saveSearch = async () => {

        if (!search.trim()) return;

        if (!token) return;

        try {

            await api.post(
                "/search/save",
                {
                    keyword: search.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

        }

        catch (error) {

            console.log(
                "SAVE SEARCH ERROR:",
                error.response?.data || error.message
            );

        }

    };


    /* ==========================================
       SEARCH BUTTON
    ========================================== */

    const handleSearch = async () => {

        await saveSearch();

        productsSectionRef.current?.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    };


    /* ==========================================
       RESET FILTERS
    ========================================== */

    const resetFilters = () => {

        setSearch("");
        setCategory("All");
        setRegion("All");
        setCity("All");
        setCondition("All");

    };


    return (

        <Layout>

            {/* ======================================
                ADVERTISEMENT BANNER
            ====================================== */}

            <BannerSlider />


            {/* ======================================
                FEATURED PRODUCTS
            ====================================== */}

            <FeaturedProducts />


            {/* ======================================
                BROWSE CATEGORIES
            ====================================== */}

            <CategorySection

                selectedCategory={category}

                setCategory={handleCategorySelect}

                products={products}

            />


            {/* ======================================
                HOME SEARCH INTRO
            ====================================== */}

            <section className="home-search">

                <div className="home-search-content">

                    <h1>

                        Buy & Sell Anything In Ghana

                    </h1>

                    <p>

                        Find thousands of products from trusted sellers
                        across Ghana.

                    </p>

                </div>

            </section>


            {/* ======================================
                FILTERS
            ====================================== */}

            <section className="market-filters-container">

                <div className="market-filters">


                    {/* SEARCH */}

                    <div className="search-box">

                        <input

                            type="text"

                            placeholder="Search for products..."

                            value={search}

                            onChange={(e) =>
                                setSearch(e.target.value)
                            }

                            onKeyDown={(e) => {

                                if (e.key === "Enter") {

                                    handleSearch();

                                }

                            }}

                        />

                        <button
                            onClick={handleSearch}
                        >

                            🔍 Search

                        </button>

                    </div>


                    {/* CATEGORY */}

                    <select

                        value={category}

                        onChange={(e) =>
                            setCategory(e.target.value)
                        }

                    >

                        <option value="All">
                            All Categories
                        </option>

                        <option value="Mobile Phones">
                            📱 Mobile Phones
                        </option>

                        <option value="Laptops">
                            💻 Laptops
                        </option>

                        <option value="TV">
                            📺 TV
                        </option>

                        <option value="Radio">
                            📻 Radio
                        </option>

                        <option value="Music Equipment">
                            🎵 Music Equipment
                        </option>

                        <option value="Food Stuff">
                            🍎 Food Stuff
                        </option>

                        <option value="Clothes">
                            👕 Clothes
                        </option>

                        <option value="Accessories">
                            👜 Accessories
                        </option>

                        <option value="Cars">
                            🚗 Cars
                        </option>

                        <option value="Motorcycles">
                            🏍 Motorcycles
                        </option>

                        <option value="Employment Opportunities">
                            💼 Jobs
                        </option>

                    </select>


                    {/* REGION */}

                    <select

                        value={region}

                        onChange={(e) => {

                            setRegion(e.target.value);

                            setCity("All");

                        }}

                    >

                        <option value="All">
                            🌍 All Regions
                        </option>

                        {

                            Object.keys(ghanaLocations).map(
                                (item) => (

                                    <option
                                        key={item}
                                        value={item}
                                    >

                                        {item}

                                    </option>

                                )
                            )

                        }

                    </select>


                    {/* CITY */}

                    <select

                        value={city}

                        onChange={(e) =>
                            setCity(e.target.value)
                        }

                        disabled={region === "All"}

                    >

                        <option value="All">
                            🏙 All Cities
                        </option>

                        {

                            region !== "All" &&

                            ghanaLocations[region]?.map(
                                (item) => (

                                    <option
                                        key={item}
                                        value={item}
                                    >

                                        {item}

                                    </option>

                                )
                            )

                        }

                    </select>


                    {/* CONDITION */}

                    <select

                        value={condition}

                        onChange={(e) =>
                            setCondition(e.target.value)
                        }

                    >

                        <option value="All">
                            All Conditions
                        </option>

                        <option value="New">
                            ✨ New
                        </option>

                        <option value="Used">
                            ♻️ Used
                        </option>

                    </select>


                    {/* RESET */}

                    <button

                        className="reset-filter-btn"

                        onClick={resetFilters}

                    >

                        Reset

                    </button>

                </div>

            </section>


            {/* ======================================
                TRENDING PRODUCTS
            ====================================== */}

            <TrendingProducts />


            {/* ======================================
                RECOMMENDED PRODUCTS
            ====================================== */}

            <RecommendedProducts />


            {/* ======================================
                LATEST PRODUCTS
            ====================================== */}

            <section

                className="products-section"

                ref={productsSectionRef}

            >

                <div className="section-header">

                    <div>

                        <h2>

                            {category === "All"

                                ? "Latest Products"

                                : category

                            }

                        </h2>

                        <p>

                            Browse the latest listings available now.

                        </p>

                    </div>


                    <span className="product-count">

                        {filteredProducts.length}

                        {" "}

                        Product

                        {filteredProducts.length !== 1 ? "s" : ""}

                        {" "} Found

                    </span>

                </div>


                {

                    loading ? (

                        <div className="empty-products">

                            <div className="loading-spinner"></div>

                            <h2>
                                Loading products...
                            </h2>

                        </div>

                    )

                    :

                    filteredProducts.length === 0 ? (

                        <div className="empty-products">

                            <div className="empty-icon">

                                📦

                            </div>

                            <h2>
                                No products found
                            </h2>

                            <p>

                                We couldn't find products matching
                                your filters.

                            </p>

                            <button
                                onClick={resetFilters}
                            >

                                Clear Filters

                            </button>

                        </div>

                    )

                    :

                    (

                        <div className="products">

                            {

                                filteredProducts.map(
                                    (product) => (

                                        <ProductCard

                                            key={product.id}

                                            product={product}

                                        />

                                    )
                                )

                            }

                        </div>

                    )

                }

            </section>

        </Layout>

    );

}

export default Home;
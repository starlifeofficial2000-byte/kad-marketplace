import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import api from "../config/axios";

import Layout from "../components/Layout";
import BannerSlider from "../components/BannerSlider";
import FeaturedProducts from "../components/home/FeaturedProducts";
import TrendingProducts from "../components/home/TrendingProducts";
import RecommendedProducts from "../components/home/RecommendedProducts";
import CategorySection from "../components/CategorySection";
import ProductCard from "../components/ProductCard";

import { ghanaLocations } from "../data/ghanaLocations";
import categories from "../data/categories";

import "./Home.css";


function Home() {

    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [keyword, setKeyword] = useState(
        searchParams.get("keyword") || ""
    );

    const [category, setCategory] = useState(
        searchParams.get("category") || ""
    );

    const [subcategory, setSubcategory] = useState(
        searchParams.get("subcategory") || ""
    );

    const [condition, setCondition] = useState(
        searchParams.get("condition") || ""
    );

    const [region, setRegion] = useState(
        searchParams.get("region") || ""
    );

    const [city, setCity] = useState(
        searchParams.get("city") || ""
    );

    const [minPrice, setMinPrice] = useState(
        searchParams.get("minPrice") || ""
    );

    const [maxPrice, setMaxPrice] = useState(
        searchParams.get("maxPrice") || ""
    );

    const [sort, setSort] = useState(
        searchParams.get("sort") || "newest"
    );

    const productsSectionRef = useRef(null);

    const searchSectionRef = useRef(null);

    const token = localStorage.getItem("token");


    /*
    ============================================================
    SELECTED CATEGORY
    ============================================================
    */

    const selectedCategory = useMemo(() => {

        return categories.find(
            (item) =>
                String(item.name).toLowerCase() ===
                String(category).toLowerCase()
        );

    }, [category]);


    /*
    ============================================================
    FETCH PRODUCTS
    ============================================================
    */

    useEffect(() => {

        fetchProducts();

    }, []);


    const fetchProducts = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await api.get("/products");

            console.log(
                "HOME PRODUCTS RESPONSE:",
                response.data
            );

            const productsData =
                response.data?.products ||
                response.data?.data ||
                (
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

            setProducts(productsData);

        } catch (error) {

            console.error(
                "HOME PRODUCT LOAD ERROR:",
                error.response?.data ||
                error.message ||
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load products."
            );

            setProducts([]);

        } finally {

            setLoading(false);

        }

    };


    /*
    ============================================================
    UPDATE URL
    ============================================================
    */

    const updateSearchUrl = () => {

        const params = {};

        if (keyword.trim()) {
            params.keyword = keyword.trim();
        }

        if (category) {
            params.category = category;
        }

        if (subcategory) {
            params.subcategory = subcategory;
        }

        if (condition) {
            params.condition = condition;
        }

        if (region) {
            params.region = region;
        }

        if (city) {
            params.city = city;
        }

        if (minPrice) {
            params.minPrice = minPrice;
        }

        if (maxPrice) {
            params.maxPrice = maxPrice;
        }

        if (sort && sort !== "newest") {
            params.sort = sort;
        }

        setSearchParams(params);

    };


    /*
    ============================================================
    SAVE SEARCH HISTORY
    ============================================================
    */

    const saveSearch = async () => {

        if (!keyword.trim()) {
            return;
        }

        if (!token) {
            return;
        }

        try {

            await api.post(
                "/search/save",
                {
                    keyword: keyword.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

        } catch (error) {

            console.log(
                "SAVE SEARCH ERROR:",
                error.response?.data ||
                error.message
            );

        }

    };


    /*
    ============================================================
    SEARCH
    ============================================================
    */

    const handleSearch = async () => {

        updateSearchUrl();

        await saveSearch();

        setTimeout(() => {

            productsSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 100);

    };


    /*
    ============================================================
    ENTER KEY
    ============================================================
    */

    const handleKeyDown = (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            handleSearch();

        }

    };


    /*
    ============================================================
    CATEGORY CHANGE
    ============================================================
    */

    const handleCategoryChange = (event) => {

        const value = event.target.value;

        setCategory(value);

        setSubcategory("");

    };


    /*
    ============================================================
    CATEGORY SECTION
    ============================================================
    */

    const handleCategorySelect = (selectedCategoryName) => {

        setCategory(selectedCategoryName);

        setSubcategory("");

        setTimeout(() => {

            productsSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 100);

    };


    /*
    ============================================================
    REGION CHANGE
    ============================================================
    */

    const handleRegionChange = (event) => {

        setRegion(event.target.value);

        setCity("");

    };


    /*
    ============================================================
    CLEAR FILTERS
    ============================================================
    */

    const clearFilters = () => {

        setKeyword("");
        setCategory("");
        setSubcategory("");
        setCondition("");
        setRegion("");
        setCity("");
        setMinPrice("");
        setMaxPrice("");
        setSort("newest");

        setSearchParams({});

        setTimeout(() => {

            productsSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 100);

    };


    /*
    ============================================================
    FILTER PRODUCTS
    ============================================================
    */

    const filteredProducts = useMemo(() => {

        let result = [...products];


        /*
        --------------------------------------------------------
        KEYWORD
        --------------------------------------------------------
        */

        const normalizedKeyword =
            keyword.trim().toLowerCase();

        if (normalizedKeyword) {

            result = result.filter((product) => {

                const title =
                    String(product.title || "").toLowerCase();

                const description =
                    String(product.description || "").toLowerCase();

                const productCategory =
                    String(product.category || "").toLowerCase();

                const productSubcategory =
                    String(product.subcategory || "").toLowerCase();

                const location =
                    String(product.location || "").toLowerCase();

                const productRegion =
                    String(product.region || "").toLowerCase();

                const productCity =
                    String(product.city || "").toLowerCase();

                return (
                    title.includes(normalizedKeyword) ||
                    description.includes(normalizedKeyword) ||
                    productCategory.includes(normalizedKeyword) ||
                    productSubcategory.includes(normalizedKeyword) ||
                    location.includes(normalizedKeyword) ||
                    productRegion.includes(normalizedKeyword) ||
                    productCity.includes(normalizedKeyword)
                );

            });

        }


        /*
        --------------------------------------------------------
        CATEGORY
        --------------------------------------------------------
        */

        if (category) {

            result = result.filter((product) => {

                return String(product.category || "")
                    .toLowerCase() ===
                    category.toLowerCase();

            });

        }


        /*
        --------------------------------------------------------
        SUBCATEGORY
        --------------------------------------------------------
        */

        if (subcategory) {

            result = result.filter((product) => {

                return String(product.subcategory || "")
                    .toLowerCase() ===
                    subcategory.toLowerCase();

            });

        }


        /*
        --------------------------------------------------------
        CONDITION
        --------------------------------------------------------
        */

        if (condition) {

            result = result.filter((product) => {

                return String(product.condition || "")
                    .toLowerCase() ===
                    condition.toLowerCase();

            });

        }


        /*
        --------------------------------------------------------
        REGION
        --------------------------------------------------------
        */

        if (region) {

            result = result.filter((product) => {

                return String(product.region || "")
                    .toLowerCase() ===
                    region.toLowerCase();

            });

        }


        /*
        --------------------------------------------------------
        CITY
        --------------------------------------------------------
        */

        if (city) {

            result = result.filter((product) => {

                return String(product.city || "")
                    .toLowerCase() ===
                    city.toLowerCase();

            });

        }


        /*
        --------------------------------------------------------
        MINIMUM PRICE
        --------------------------------------------------------
        */

        if (minPrice !== "") {

            const minimum = Number(minPrice);

            result = result.filter((product) => {

                const price =
                    Number(product.price || 0);

                return price >= minimum;

            });

        }


        /*
        --------------------------------------------------------
        MAXIMUM PRICE
        --------------------------------------------------------
        */

        if (maxPrice !== "") {

            const maximum = Number(maxPrice);

            result = result.filter((product) => {

                const price =
                    Number(product.price || 0);

                return price <= maximum;

            });

        }


        /*
        --------------------------------------------------------
        SORTING
        --------------------------------------------------------
        */

        result.sort((a, b) => {

            if (sort === "lowPrice") {

                return (
                    Number(a.price || 0) -
                    Number(b.price || 0)
                );

            }

            if (sort === "highPrice") {

                return (
                    Number(b.price || 0) -
                    Number(a.price || 0)
                );

            }

            if (sort === "oldest") {

                return (
                    new Date(a.createdAt || 0) -
                    new Date(b.createdAt || 0)
                );

            }

            if (sort === "popular") {

                return (
                    Number(b.views || 0) -
                    Number(a.views || 0)
                );

            }

            return (
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
            );

        });

        return result;

    }, [
        products,
        keyword,
        category,
        subcategory,
        condition,
        region,
        city,
        minPrice,
        maxPrice,
        sort
    ]);


    /*
    ============================================================
    ACTIVE FILTER COUNT
    ============================================================
    */

    const activeFilterCount = [
        keyword,
        category,
        subcategory,
        condition,
        region,
        city,
        minPrice,
        maxPrice
    ].filter(
        (value) =>
            String(value).trim() !== ""
    ).length;


    /*
    ============================================================
    RESULT TITLE
    ============================================================
    */

    const resultTitle = useMemo(() => {

        if (keyword.trim()) {
            return `Results for "${keyword.trim()}"`;
        }

        if (subcategory) {
            return subcategory;
        }

        if (category) {
            return category;
        }

        return "Latest Products";

    }, [
        keyword,
        category,
        subcategory
    ]);


    /*
    ============================================================
    RENDER
    ============================================================
    */

    return (

        <Layout>

            <BannerSlider />


            <FeaturedProducts />


            <CategorySection
                selectedCategory={
                    category || "All"
                }
                setCategory={
                    handleCategorySelect
                }
                products={products}
            />


            <section
                className="home-search"
                ref={searchSectionRef}
            >

                <div className="home-search-content">

                    <span className="search-eyebrow">
                        KAD MARKETPLACE
                    </span>

                    <h1>
                        Find What You Need
                    </h1>

                    <p>
                        Search products, services and listings
                        from trusted sellers across Ghana.
                    </p>

                </div>

            </section>


            <section className="market-filters-container">

                <div className="market-filters">


                    <div className="filter-group filter-keyword">

                        <label>
                            Search
                        </label>

                        <input
                            type="text"
                            placeholder="What are you looking for?"
                            value={keyword}
                            onChange={(event) =>
                                setKeyword(
                                    event.target.value
                                )
                            }
                            onKeyDown={handleKeyDown}
                        />

                    </div>


                    <div className="filter-group">

                        <label>
                            Category
                        </label>

                        <select
                            value={category}
                            onChange={
                                handleCategoryChange
                            }
                        >

                            <option value="">
                                All Categories
                            </option>

                            {categories.map((item) => (

                                <option
                                    key={item.name}
                                    value={item.name}
                                >

                                    {item.icon
                                        ? `${item.icon} `
                                        : ""}

                                    {item.name}

                                </option>

                            ))}

                        </select>

                    </div>


                    <div className="filter-group">

                        <label>
                            Subcategory
                        </label>

                        <select
                            value={subcategory}
                            onChange={(event) =>
                                setSubcategory(
                                    event.target.value
                                )
                            }
                            disabled={!selectedCategory}
                        >

                            <option value="">

                                {selectedCategory
                                    ? "All Subcategories"
                                    : "Select Category First"}

                            </option>

                            {selectedCategory?.subcategories?.map(
                                (item) => (

                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    <div className="filter-group">

                        <label>
                            Minimum Price
                        </label>

                        <input
                            type="number"
                            min="0"
                            placeholder="GH₵ Minimum"
                            value={minPrice}
                            onChange={(event) =>
                                setMinPrice(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <div className="filter-group">

                        <label>
                            Maximum Price
                        </label>

                        <input
                            type="number"
                            min="0"
                            placeholder="GH₵ Maximum"
                            value={maxPrice}
                            onChange={(event) =>
                                setMaxPrice(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <div className="filter-group">

                        <label>
                            Condition
                        </label>

                        <select
                            value={condition}
                            onChange={(event) =>
                                setCondition(
                                    event.target.value
                                )
                            }
                        >

                            <option value="">
                                All Conditions
                            </option>

                            <option value="New">
                                New
                            </option>

                            <option value="Used">
                                Used
                            </option>

                        </select>

                    </div>


                    <div className="filter-group">

                        <label>
                            Region
                        </label>

                        <select
                            value={region}
                            onChange={
                                handleRegionChange
                            }
                        >

                            <option value="">
                                All Regions
                            </option>

                            {Object.keys(
                                ghanaLocations
                            ).map((item) => (

                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>

                            ))}

                        </select>

                    </div>


                    <div className="filter-group">

                        <label>
                            City / Town
                        </label>

                        <select
                            value={city}
                            onChange={(event) =>
                                setCity(
                                    event.target.value
                                )
                            }
                            disabled={!region}
                        >

                            <option value="">

                                {region
                                    ? "All Cities"
                                    : "Select Region First"}

                            </option>

                            {region &&
                                ghanaLocations[
                                    region
                                ]?.map((item) => (

                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>

                                ))
                            }

                        </select>

                    </div>


                    <div className="filter-group">

                        <label>
                            Sort By
                        </label>

                        <select
                            value={sort}
                            onChange={(event) =>
                                setSort(
                                    event.target.value
                                )
                            }
                        >

                            <option value="newest">
                                Newest
                            </option>

                            <option value="oldest">
                                Oldest
                            </option>

                            <option value="lowPrice">
                                Lowest Price
                            </option>

                            <option value="highPrice">
                                Highest Price
                            </option>

                            <option value="popular">
                                Most Viewed
                            </option>

                        </select>

                    </div>


                    <div className="filter-actions">

                        <button
                            type="button"
                            className="search-button"
                            onClick={handleSearch}
                            disabled={loading}
                        >

                            {loading
                                ? "Searching..."
                                : "🔍 Search Products"}

                        </button>


                        <button
                            type="button"
                            className="clear-button"
                            onClick={clearFilters}
                        >
                            Clear
                        </button>

                    </div>

                </div>


                <div className="search-status">

                    <span>

                        {activeFilterCount > 0
                            ? `${activeFilterCount} active filter${
                                activeFilterCount !== 1
                                    ? "s"
                                    : ""
                            }`
                            : "Browse all marketplace listings"}

                    </span>

                    <span>

                        {filteredProducts.length} result
                        {filteredProducts.length !== 1
                            ? "s"
                            : ""}

                    </span>

                </div>

            </section>


            <TrendingProducts />


            <RecommendedProducts />


            <section
                className="products-section"
                ref={productsSectionRef}
            >

                <div className="section-header">

                    <div>

                        <h2>
                            {resultTitle}
                        </h2>

                        <p>
                            Browse marketplace listings
                            available now.
                        </p>

                    </div>


                    <span className="product-count">

                        {filteredProducts.length}

                        {" "}

                        Product
                        {filteredProducts.length !== 1
                            ? "s"
                            : ""}

                        {" "}Found

                    </span>

                </div>


                {error && (

                    <div className="empty-products">

                        <div className="empty-icon">
                            ⚠️
                        </div>

                        <h2>
                            Unable to load products
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchProducts}
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {!error && loading && (

                    <div className="empty-products">

                        <div className="loading-spinner"></div>

                        <h2>
                            Finding products...
                        </h2>

                        <p>
                            Please wait while we load
                            marketplace listings.
                        </p>

                    </div>

                )}


                {!error &&
                    !loading &&
                    filteredProducts.length === 0 && (

                        <div className="empty-products">

                            <div className="empty-icon">
                                🔍
                            </div>

                            <h2>
                                No products found
                            </h2>

                            <p>
                                Try changing your keyword,
                                category, location or price range.
                            </p>

                            <button
                                type="button"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>

                        </div>

                    )
                }


                {!error &&
                    !loading &&
                    filteredProducts.length > 0 && (

                        <div className="products">

                            {filteredProducts.map(
                                (product) => (

                                    <ProductCard
                                        key={
                                            product.id ||
                                            product._id
                                        }
                                        product={product}
                                    />

                                )
                            )}

                        </div>

                    )
                }

            </section>

        </Layout>

    );

}


export default Home;
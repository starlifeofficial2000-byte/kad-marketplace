import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    useSearchParams
} from "react-router-dom";

import {
    FaSearch,
    FaSlidersH,
    FaTimes,
    FaChevronDown,
    FaMapMarkerAlt,
    FaTag,
    FaMoneyBillWave,
    FaSortAmountDown
} from "react-icons/fa";

import api from "../config/axios";

import Layout from "../components/Layout";
import BannerSlider from "../components/BannerSlider";
import FeaturedProducts from "../components/home/FeaturedProducts";
import TrendingProducts from "../components/home/TrendingProducts";
import RecommendedProducts from "../components/home/RecommendedProducts";
import CategorySection from "../components/CategorySection";
import ProductCard from "../components/ProductCard";

import {
    ghanaLocations
} from "../data/ghanaLocations";

import categories from "../data/categories";

import "./Home.css";


function Home() {

    const [searchParams, setSearchParams] =
        useSearchParams();

    const productsSectionRef =
        useRef(null);


    /*
    ============================================================
    PRODUCTS
    ============================================================
    */

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /*
    ============================================================
    SEARCH STATE
    ============================================================
    */

    const [keyword, setKeyword] =
        useState(
            searchParams.get("keyword") || ""
        );

    const [category, setCategory] =
        useState(
            searchParams.get("category") || ""
        );

    const [subcategory, setSubcategory] =
        useState(
            searchParams.get("subcategory") || ""
        );

    const [condition, setCondition] =
        useState(
            searchParams.get("condition") || ""
        );

    const [region, setRegion] =
        useState(
            searchParams.get("region") || ""
        );

    const [city, setCity] =
        useState(
            searchParams.get("city") || ""
        );

    const [minPrice, setMinPrice] =
        useState(
            searchParams.get("minPrice") || ""
        );

    const [maxPrice, setMaxPrice] =
        useState(
            searchParams.get("maxPrice") || ""
        );

    const [sort, setSort] =
        useState(
            searchParams.get("sort") || "newest"
        );


    /*
    ============================================================
    UI STATE
    ============================================================
    */

    const [showFilters, setShowFilters] =
        useState(false);

    const [searching, setSearching] =
        useState(false);


    /*
    ============================================================
    AUTH
    ============================================================
    */

    const token =
        localStorage.getItem("token");


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
    GET SEARCH PARAMETERS
    ============================================================
    */

const buildSearchParams = () => {

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

    if (minPrice !== "") {
        params.minPrice = minPrice;
    }

    if (maxPrice !== "") {
        params.maxPrice = maxPrice;
    }

    if (sort) {
        params.sort = sort;
    }

    return params;

};

    /*
    ============================================================
    FETCH ALL PRODUCTS
    ============================================================
    */

    const fetchAllProducts = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await api.get("/products");

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


const searchProducts = async (customParams = null) => {

    try {

        setSearching(true);
        setLoading(true);
        setError("");

        const params =
            customParams || buildSearchParams();

        console.log(
            "HOME SEARCH PARAMETERS:",
            params
        );

        const response = await api.get(
            "/products/search",
            {
                params
            }
        );

        console.log(
            "HOME SEARCH RESPONSE:",
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
            "HOME SEARCH ERROR:",
            error.response?.data ||
            error.message ||
            error
        );

        setError(
            error.response?.data?.message ||
            "Failed to search products."
        );

        setProducts([]);

    } finally {

        setSearching(false);
        setLoading(false);

    }

};

    /*
    ============================================================
    INITIAL LOAD
    ============================================================
    */

    useEffect(() => {

        const hasSearchParams =
            searchParams.get("keyword") ||
            searchParams.get("category") ||
            searchParams.get("subcategory") ||
            searchParams.get("condition") ||
            searchParams.get("region") ||
            searchParams.get("city") ||
            searchParams.get("minPrice") ||
            searchParams.get("maxPrice") ||
            searchParams.get("sort");

        if (hasSearchParams) {

            const params = {};

            [
                "keyword",
                "category",
                "subcategory",
                "condition",
                "region",
                "city",
                "minPrice",
                "maxPrice",
                "sort"
            ].forEach((key) => {

                const value =
                    searchParams.get(key);

                if (value) {
                    params[key] = value;
                }

            });

            searchProducts(params);

        } else {

            fetchAllProducts();

        }

    }, []);


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
                    keyword:
                        keyword.trim()
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
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

const handleSearch = async () => {

    const params = buildSearchParams();

    setSearchParams(params);

    await saveSearch();

    await searchProducts(params);

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

        const value =
            event.target.value;

        setCategory(value);

        setSubcategory("");

    };


    /*
    ============================================================
    CATEGORY SECTION CLICK
    ============================================================
    */

    const handleCategorySelect =
        async (selectedCategoryName) => {

            setCategory(
                selectedCategoryName
            );

            setSubcategory("");

            const params = {
                category:
                    selectedCategoryName,
                sort:
                    "newest"
            };

            setSearchParams(params);

            await searchProducts(params);

            setTimeout(() => {

                productsSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 150);

        };


    /*
    ============================================================
    REGION CHANGE
    ============================================================
    */

    const handleRegionChange =
        (event) => {

            setRegion(
                event.target.value
            );

            setCity("");

        };


    /*
    ============================================================
    CLEAR FILTERS
    ============================================================
    */

    const clearFilters = async () => {

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

        setShowFilters(false);

        await fetchAllProducts();

        setTimeout(() => {

            productsSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 150);

    };


    /*
    ============================================================
    ACTIVE FILTER COUNT
    ============================================================
    */

    const activeFilterCount = [

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
    SEARCH RESULT TITLE
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
    CURRENT RESULT COUNT
    ============================================================
    */

    const resultCount =
        products.length;


    /*
    ============================================================
    RENDER
    ============================================================
    */

    return (

        <Layout>

            {/* =================================================
                BANNER
            ================================================= */}

            <BannerSlider />


            {/* =================================================
                FEATURED
            ================================================= */}

            <FeaturedProducts />


            {/* =================================================
                CATEGORIES
            ================================================= */}

            <CategorySection

                selectedCategory={
                    category || "All"
                }

                setCategory={
                    handleCategorySelect
                }

                products={products}

            />


            {/* =================================================
                COMPACT SEARCH AREA
            ================================================= */}

            <section className="home-search">

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


                {/* =================================================
                    MAIN SEARCH BAR
                ================================================= */}

                <div className="home-search-box">

                    <div className="home-search-input">

                        <FaSearch />

                        <input
                            type="text"
                            value={keyword}
                            placeholder="Search for phones, laptops, cars, clothes..."
                            onChange={(event) =>
                                setKeyword(
                                    event.target.value
                                )
                            }
                            onKeyDown={
                                handleKeyDown
                            }
                        />

                        {keyword && (

                            <button
                                type="button"
                                className="search-clear"
                                onClick={() =>
                                    setKeyword("")
                                }
                                aria-label="Clear search"
                            >

                                <FaTimes />

                            </button>

                        )}

                    </div>


                    <select
                        className="home-search-category"
                        value={category}
                        onChange={
                            handleCategoryChange
                        }
                    >

                        <option value="">
                            All Categories
                        </option>

                        {categories.map(
                            (item) => (

                                <option
                                    key={item.name}
                                    value={item.name}
                                >

                                    {item.icon
                                        ? `${item.icon} `
                                        : ""}

                                    {item.name}

                                </option>

                            )
                        )}

                    </select>


                    <button
                        type="button"
                        className="home-search-button"
                        onClick={handleSearch}
                        disabled={searching}
                    >

                        <FaSearch />

                        {searching
                            ? "Searching..."
                            : "Search"}

                    </button>


                    <button
                        type="button"
                        className={
                            showFilters
                                ? "home-filter-button active"
                                : "home-filter-button"
                        }
                        onClick={() =>
                            setShowFilters(
                                (previous) =>
                                    !previous
                            )
                        }
                    >

                        <FaSlidersH />

                        <span>
                            Filters
                        </span>

                        {activeFilterCount > 0 && (

                            <span className="filter-badge">

                                {
                                    activeFilterCount
                                }

                            </span>

                        )}

                    </button>

                </div>


                {/* =================================================
                    ACTIVE SEARCH SUMMARY
                ================================================= */}

                {(keyword ||
                    category ||
                    activeFilterCount > 0) && (

                    <div className="home-search-summary">

                        <div className="search-summary-left">

                            {keyword && (

                                <span className="search-chip">

                                    <FaSearch />

                                    {keyword}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setKeyword("")
                                        }
                                    >

                                        <FaTimes />

                                    </button>

                                </span>

                            )}

                            {category && (

                                <span className="search-chip">

                                    <FaTag />

                                    {category}

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setCategory("");
                                            setSubcategory("");

                                        }}
                                    >

                                        <FaTimes />

                                    </button>

                                </span>

                            )}

                            {region && (

                                <span className="search-chip">

                                    <FaMapMarkerAlt />

                                    {region}

                                    {city
                                        ? `, ${city}`
                                        : ""}

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setRegion("");
                                            setCity("");

                                        }}
                                    >

                                        <FaTimes />

                                    </button>

                                </span>

                            )}

                            {minPrice && (

                                <span className="search-chip">

                                    <FaMoneyBillWave />

                                    From GH₵
                                    {minPrice}

                                </span>

                            )}

                            {maxPrice && (

                                <span className="search-chip">

                                    Up to GH₵
                                    {maxPrice}

                                </span>

                            )}

                        </div>


                        <button
                            type="button"
                            className="clear-search-button"
                            onClick={
                                clearFilters
                            }
                        >

                            Clear all

                        </button>

                    </div>

                )}


                {/* =================================================
                    ADVANCED FILTERS
                ================================================= */}

                {showFilters && (

                    <div className="advanced-search-panel">

                        <div className="advanced-search-header">

                            <div>

                                <h3>
                                    Refine Your Search
                                </h3>

                                <p>
                                    Use filters to find exactly
                                    what you are looking for.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowFilters(false)
                                }
                                aria-label="Close filters"
                            >

                                <FaTimes />

                            </button>

                        </div>


                        <div className="advanced-search-grid">

                            {/* SUBCATEGORY */}

                            <div className="filter-group">

                                <label>
                                    Category Type
                                </label>

                                <select
                                    value={
                                        subcategory
                                    }
                                    onChange={(event) =>
                                        setSubcategory(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        !selectedCategory
                                    }
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


                            {/* MIN PRICE */}

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


                            {/* MAX PRICE */}

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


                            {/* CONDITION */}

                            <div className="filter-group">

                                <label>
                                    Condition
                                </label>

                                <select
                                    value={
                                        condition
                                    }
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


                            {/* REGION */}

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
                                    ).map(
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


                            {/* CITY */}

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
                                        ]?.map(
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

                            </div>


                            {/* SORT */}

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

                        </div>


                        {/* FILTER ACTIONS */}

                        <div className="advanced-search-actions">

                            <button
                                type="button"
                                className="clear-button"
                                onClick={
                                    clearFilters
                                }
                            >

                                Clear Filters

                            </button>

                            <button
                                type="button"
                                className="search-button"
                                onClick={
                                    handleSearch
                                }
                                disabled={searching}
                            >

                                <FaSearch />

                                {searching
                                    ? "Searching..."
                                    : "Apply Filters"}

                            </button>

                        </div>

                    </div>

                )}

            </section>


            {/* =================================================
                TRENDING
            ================================================= */}

            <TrendingProducts />


            {/* =================================================
                RECOMMENDED
            ================================================= */}

            <RecommendedProducts />


            {/* =================================================
                PRODUCTS
            ================================================= */}

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

                            {keyword ||
                            category ||
                            activeFilterCount > 0

                                ? "Marketplace results matching your search."

                                : "Browse the latest marketplace listings available now."}

                        </p>

                    </div>


                    {!loading && !error && (

                        <span className="product-count">

                            {resultCount}

                            {" "}

                            Product
                            {resultCount !== 1
                                ? "s"
                                : ""}

                            {" "}Found

                        </span>

                    )}

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

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
                            onClick={() =>
                                keyword ||
                                category ||
                                activeFilterCount > 0
                                    ? searchProducts()
                                    : fetchAllProducts()
                            }
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {/* =================================================
                    LOADING
                ================================================= */}

                {!error && loading && (

                    <div className="empty-products">

                        <div className="loading-spinner" />

                        <h2>
                            {searching
                                ? "Searching marketplace..."
                                : "Loading products..."}
                        </h2>

                        <p>
                            Please wait while we find
                            the best listings for you.
                        </p>

                    </div>

                )}


                {/* =================================================
                    NO RESULTS
                ================================================= */}

                {!error &&
                    !loading &&
                    products.length === 0 && (

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
                                onClick={
                                    clearFilters
                                }
                            >
                                Clear Filters
                            </button>

                        </div>

                    )
                }


                {/* =================================================
                    RESULTS
                ================================================= */}

                {!error &&
                    !loading &&
                    products.length > 0 && (

                        <div className="products">

                            {products.map(
                                (product) => (

                                    <ProductCard
                                        key={
                                            product.id ||
                                            product._id
                                        }
                                        product={
                                            product
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

            </section>

        </Layout>

    );

}


export default Home;
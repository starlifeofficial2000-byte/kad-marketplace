import { useEffect, useState } from "react";
import api from "../../config/axios";
import ProductCard from "../components/ProductCard";
import categories from "../../data/categories";
import "./SearchPage.css";

function SearchPage() {
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [keyword, setKeyword] = useState("");
    const [category, setCategory] = useState("");
    const [subcategory, setSubcategory] = useState("");

    const [condition, setCondition] = useState("");
    const [region, setRegion] = useState("");
    const [city, setCity] = useState("");

    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const [sort, setSort] = useState("newest");

    const selectedCategory = categories.find(
        (item) => item.name === category
    );

    const searchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                keyword: keyword.trim(),
                category,
                subcategory,
                condition,
                region,
                city,
                minPrice,
                maxPrice,
                sort
            };

            const res = await api.get(
                "/products/search",
                {
                    params
                }
            );

            console.log(
                "SEARCH RESPONSE:",
                res.data
            );

            const productsData =
                res.data?.products ||
                res.data?.data ||
                (
                    Array.isArray(res.data)
                        ? res.data
                        : []
                );

            setProducts(productsData);

        } catch (error) {
            console.error(
                "SEARCH ERROR:",
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
            setLoading(false);
        }
    };

    useEffect(() => {
        searchProducts();
    }, []);

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            searchProducts();
        }
    };

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
        setSubcategory("");
    };

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

        setTimeout(() => {
            searchProducts();
        }, 0);
    };

    return (
        <main className="search-page">

            <section className="search-header">

                <div>
                    <span className="search-eyebrow">
                        KAD MARKETPLACE
                    </span>

                    <h1>
                        Find What You Need
                    </h1>

                    <p>
                        Search products, services and listings
                        across the marketplace.
                    </p>
                </div>

            </section>


            {/* SEARCH FILTERS */}

            <section className="filters">

                {/* KEYWORD */}

                <div className="filter-group filter-keyword">

                    <label>
                        Search
                    </label>

                    <input
                        type="text"
                        placeholder="What are you looking for?"
                        value={keyword}
                        onChange={(event) =>
                            setKeyword(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                    />

                </div>


                {/* CATEGORY */}

                <div className="filter-group">

                    <label>
                        Category
                    </label>

                    <select
                        value={category}
                        onChange={handleCategoryChange}
                    >

                        <option value="">
                            All Categories
                        </option>

                        {categories.map((item) => (
                            <option
                                key={item.name}
                                value={item.name}
                            >
                                {item.icon} {item.name}
                            </option>
                        ))}

                    </select>

                </div>


                {/* SUBCATEGORY */}

                <div className="filter-group">

                    <label>
                        Subcategory
                    </label>

                    <select
                        value={subcategory}
                        onChange={(event) =>
                            setSubcategory(event.target.value)
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
                            setMinPrice(event.target.value)
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
                            setMaxPrice(event.target.value)
                        }
                    />

                </div>


                {/* CONDITION */}

                <div className="filter-group">

                    <label>
                        Condition
                    </label>

                    <select
                        value={condition}
                        onChange={(event) =>
                            setCondition(event.target.value)
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

                    <input
                        type="text"
                        placeholder="e.g. Ashanti"
                        value={region}
                        onChange={(event) =>
                            setRegion(event.target.value)
                        }
                    />

                </div>


                {/* CITY */}

                <div className="filter-group">

                    <label>
                        City / Town
                    </label>

                    <input
                        type="text"
                        placeholder="e.g. Kumasi"
                        value={city}
                        onChange={(event) =>
                            setCity(event.target.value)
                        }
                    />

                </div>


                {/* SORT */}

                <div className="filter-group">

                    <label>
                        Sort By
                    </label>

                    <select
                        value={sort}
                        onChange={(event) =>
                            setSort(event.target.value)
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


                {/* ACTIONS */}

                <div className="filter-actions">

                    <button
                        type="button"
                        className="search-button"
                        onClick={searchProducts}
                        disabled={loading}
                    >
                        {loading
                            ? "Searching..."
                            : "Search Products"}
                    </button>

                    <button
                        type="button"
                        className="clear-button"
                        onClick={clearFilters}
                    >
                        Clear
                    </button>

                </div>

            </section>


            {/* ERROR */}

            {error && (
                <div className="search-error">
                    {error}
                </div>
            )}


            {/* RESULTS HEADER */}

            {!loading && !error && (
                <div className="results-header">

                    <div>
                        <h2>
                            Search Results
                        </h2>

                        <p>
                            {products.length} product
                            {products.length !== 1
                                ? "s"
                                : ""}{" "}
                            found
                        </p>
                    </div>

                </div>
            )}


            {/* LOADING */}

            {loading && (
                <div className="search-loading">

                    <div className="search-spinner" />

                    <p>
                        Finding products...
                    </p>

                </div>
            )}


            {/* NO RESULTS */}

            {!loading && products.length === 0 && !error && (
                <div className="empty-search">

                    <div className="empty-search-icon">
                        🔍
                    </div>

                    <h2>
                        No products found
                    </h2>

                    <p>
                        Try changing your search keyword,
                        category, location or price range.
                    </p>

                    <button
                        type="button"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>

                </div>
            )}


            {/* PRODUCTS */}

            {!loading && products.length > 0 && (
                <div className="products-grid">

                    {products.map((product) => (
                        <ProductCard
                            key={
                                product.id ||
                                product._id
                            }
                            product={product}
                        />
                    ))}

                </div>
            )}

        </main>
    );
}

export default SearchPage;
import { useEffect, useState } from "react";
import api from "../../config/axios";
import ProductCard from "../components/ProductCard";
import "./SearchPage.css";

function SearchPage() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [keyword, setKeyword] = useState("");

    const [category, setCategory] = useState("");

    const [condition, setCondition] = useState("");

    const [region, setRegion] = useState("");

    const [city, setCity] = useState("");

    const [minPrice, setMinPrice] = useState("");

    const [maxPrice, setMaxPrice] = useState("");

    const [sort, setSort] = useState("newest");


    /* ==========================================
       LOAD / SEARCH PRODUCTS
    ========================================== */

    const searchProducts = async () => {

        try {

            setLoading(true);

            setError("");

            const res = await api.get(

                "/products/search",

                {
                    params: {

                        keyword,
                        category,
                        condition,
                        region,
                        city,
                        minPrice,
                        maxPrice,
                        sort

                    }
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

        }

        catch (error) {

            console.error(

                "SEARCH ERROR:",

                error.response?.data || error.message

            );


            setError(

                error.response?.data?.message ||

                "Failed to search products."

            );


            setProducts([]);

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       INITIAL LOAD
    ========================================== */

    useEffect(() => {

        searchProducts();

    }, []);


    /* ==========================================
       HANDLE ENTER KEY
    ========================================== */

    const handleKeyDown = (e) => {

        if (e.key === "Enter") {

            searchProducts();

        }

    };


    return (

        <div className="search-page">

            <h1>

                Marketplace Search

            </h1>


            {/* ==============================
                SEARCH FILTERS
            ============================== */}

            <div className="filters">


                {/* KEYWORD */}

                <input

                    type="text"

                    placeholder="Search products..."

                    value={keyword}

                    onChange={(e) =>
                        setKeyword(e.target.value)
                    }

                    onKeyDown={handleKeyDown}

                />


                {/* CATEGORY */}

                <input

                    type="text"

                    placeholder="Category"

                    value={category}

                    onChange={(e) =>
                        setCategory(e.target.value)
                    }

                />


                {/* MIN PRICE */}

                <input

                    type="number"

                    placeholder="Minimum Price"

                    min="0"

                    value={minPrice}

                    onChange={(e) =>
                        setMinPrice(e.target.value)
                    }

                />


                {/* MAX PRICE */}

                <input

                    type="number"

                    placeholder="Maximum Price"

                    min="0"

                    value={maxPrice}

                    onChange={(e) =>
                        setMaxPrice(e.target.value)
                    }

                />


                {/* CONDITION */}

                <select

                    value={condition}

                    onChange={(e) =>
                        setCondition(e.target.value)
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


                {/* REGION */}

                <input

                    type="text"

                    placeholder="Region"

                    value={region}

                    onChange={(e) =>
                        setRegion(e.target.value)
                    }

                />


                {/* CITY */}

                <input

                    type="text"

                    placeholder="City / Town"

                    value={city}

                    onChange={(e) =>
                        setCity(e.target.value)
                    }

                />


                {/* SORT */}

                <select

                    value={sort}

                    onChange={(e) =>
                        setSort(e.target.value)
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


                {/* SEARCH BUTTON */}

                <button

                    onClick={searchProducts}

                    disabled={loading}

                >

                    {

                        loading

                            ? "Searching..."

                            : "Search"

                    }

                </button>

            </div>


            {/* ==============================
                ERROR MESSAGE
            ============================== */}

            {

                error && (

                    <div className="search-error">

                        {error}

                    </div>

                )

            }


            {/* ==============================
                RESULTS
            ============================== */}

            {

                loading

                    ?

                    (

                        <h2 className="loading">

                            Loading products...

                        </h2>

                    )

                    :

                    products.length === 0

                        ?

                        (

                            <div className="no-results">

                                <h2>

                                    No products found

                                </h2>

                                <p>

                                    Try changing your search filters.

                                </p>

                            </div>

                        )

                        :

                        (

                            <>

                                <p className="results-count">

                                    {products.length} product

                                    {products.length !== 1 ? "s" : ""}

                                    {" "}found

                                </p>


                                <div className="products-grid">

                                    {

                                        products.map((product) => (

                                            <ProductCard

                                                key={
                                                    product.id ||
                                                    product._id
                                                }

                                                product={product}

                                            />

                                        ))

                                    }

                                </div>

                            </>

                        )

            }

        </div>

    );

}

export default SearchPage;
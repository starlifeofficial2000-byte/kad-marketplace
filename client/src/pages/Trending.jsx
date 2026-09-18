import { useEffect, useState } from "react";
import api from "../config/axios";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";

import "./Trending.css";


function Trending() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* ==========================================
       LOAD TRENDING PRODUCTS
    ========================================== */

    useEffect(() => {

        loadProducts();

    }, []);


    const loadProducts = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(

                "/products/express"

            );


            console.log(

                "TRENDING PRODUCTS RESPONSE:",

                response.data

            );


            /*
                Support different backend
                response structures
            */

            const productsData =

                response.data?.products ||

                response.data?.data ||

                (

                    Array.isArray(response.data)

                        ? response.data

                        : []

                );


            setProducts(productsData);

        }

        catch (error) {

            console.error(

                "LOAD TRENDING PRODUCTS ERROR:",

                error.response?.data || error.message

            );


            setError(

                error.response?.data?.message ||

                "Failed to load trending products."

            );


            setProducts([]);

        }

        finally {

            setLoading(false);

        }

    };


    return (

        <Layout>


            {/* =====================================
               HERO SECTION
            ====================================== */}

            <section className="trending-page-hero">

                <div className="trending-overlay">

                    <h1>

                        🔥 Trending Products

                    </h1>

                    <p>

                        Discover the hottest and fastest-growing
                        products on KAD Marketplace.

                    </p>

                </div>

            </section>


            {/* =====================================
               PRODUCTS SECTION
            ====================================== */}

            <section className="trending-page">


                {/* ERROR */}

                {

                    error &&

                    <div className="trending-error">

                        {error}

                    </div>

                }


                {/* LOADING */}

                {

                    loading

                        ?

                        (

                            <h2 className="loading">

                                Loading trending products...

                            </h2>

                        )

                        :


                        /* EMPTY STATE */

                        products.length === 0

                            ?

                            (

                                <div className="empty">

                                    <h2>

                                        No trending products available.

                                    </h2>

                                    <button

                                        onClick={loadProducts}

                                    >

                                        Try Again

                                    </button>

                                </div>

                            )


                            :


                            /* PRODUCTS */

                            (

                                <div className="trending-grid">

                                    {

                                        products.map(

                                            (product) => (

                                                <ProductCard

                                                    key={

                                                        product.id ||

                                                        product._id

                                                    }

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


export default Trending;
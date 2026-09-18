import { useEffect, useState } from "react";
import api from "../config/axios";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";

import "./Recommended.css";


function Recommended() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* =====================================
       LOAD RECOMMENDED PRODUCTS
    ===================================== */

    useEffect(() => {

        loadProducts();

    }, []);


    const loadProducts = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(

                "/products/trending"

            );


            console.log(

                "RECOMMENDED PRODUCTS RESPONSE:",

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


            setProducts(

                Array.isArray(productsData)

                    ? productsData

                    : []

            );

        }

        catch (error) {

            console.error(

                "LOAD RECOMMENDED PRODUCTS ERROR:",

                error.response?.data || error.message

            );


            setError(

                error.response?.data?.message ||

                "Failed to load recommended products."

            );


            setProducts([]);

        }

        finally {

            setLoading(false);

        }

    };


    return (

        <Layout>


            {/* ==============================
                HERO SECTION
            ============================== */}

            <section className="recommended-page-hero">

                <div className="recommended-overlay">

                    <h1>

                        👍 Recommended Products

                    </h1>

                    <p>

                        Products specially recommended for you based on quality and popularity.

                    </p>

                </div>

            </section>


            {/* ==============================
                PRODUCTS SECTION
            ============================== */}

            <section className="recommended-page">


                {/* LOADING */}

                {

                    loading && (

                        <h2 className="loading">

                            Loading recommended products...

                        </h2>

                    )

                }


                {/* ERROR */}

                {

                    !loading && error && (

                        <div className="empty">

                            <h2>

                                {error}

                            </h2>

                            <button

                                onClick={loadProducts}

                            >

                                Try Again

                            </button>

                        </div>

                    )

                }


                {/* EMPTY */}

                {

                    !loading &&

                    !error &&

                    products.length === 0 && (

                        <div className="empty">

                            <h2>

                                No recommended products available.

                            </h2>

                            <p>

                                Check back later for trending products.

                            </p>

                        </div>

                    )

                }


                {/* PRODUCTS */}

                {

                    !loading &&

                    !error &&

                    products.length > 0 && (

                        <div className="recommended-grid">

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

                    )

                }


            </section>


        </Layout>

    );

}


export default Recommended;
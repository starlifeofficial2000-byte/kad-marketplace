import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../config/axios";

import ProductCard from "../components/ProductCard";

import "./PublicStore.css";

function PublicStore() {

    const { id } = useParams();

    const [loading, setLoading] = useState(true);

    const [store, setStore] = useState(null);

    const [products, setProducts] = useState([]);

    const [error, setError] = useState("");

    useEffect(() => {

        loadStore();

    }, [id]);


    /* =====================================
       LOAD STORE
    ===================================== */

    const loadStore = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await api.get(
                `/store/public/${id}`
            );

            console.log(
                "PUBLIC STORE RESPONSE:",
                response.data
            );

            const data = response.data;

            setStore(
                data.store ||
                data.data?.store ||
                null
            );

            setProducts(
                data.products ||
                data.data?.products ||
                []
            );

        }

        catch (error) {

            console.error(
                "LOAD PUBLIC STORE ERROR:",
                error.response?.data || error.message
            );

            setError(

                error.response?.data?.message ||

                "Failed to load store."

            );

            setStore(null);

            setProducts([]);

        }

        finally {

            setLoading(false);

        }

    };


    /* =====================================
       IMAGE URL HELPER
    ===================================== */

    const getImageUrl = (image) => {

        if (!image) {

            return null;

        }

        if (

            image.startsWith("http://") ||

            image.startsWith("https://")

        ) {

            return image;

        }

        return `/uploads/${image}`;

    };


    /* =====================================
       LOADING
    ===================================== */

    if (loading) {

        return (

            <div className="loading">

                Loading Store...

            </div>

        );

    }


    /* =====================================
       ERROR
    ===================================== */

    if (error) {

        return (

            <div className="loading">

                {error}

            </div>

        );

    }


    /* =====================================
       STORE NOT FOUND
    ===================================== */

    if (!store) {

        return (

            <div className="loading">

                Store not found.

            </div>

        );

    }


    return (

        <div className="public-store">


            {/* =====================================
                STORE BANNER
            ===================================== */}

            <div

                className="store-banner"

                style={{

                    backgroundImage:

                        store.banner

                            ? `url(${getImageUrl(store.banner)})`

                            : "linear-gradient(135deg,#0A66C2,#1E3A8A)"

                }}

            >

                <div className="banner-overlay">


                    {/* STORE LOGO */}

                    <img

                        src={

                            store.logo

                                ? getImageUrl(store.logo)

                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(

                                    store.storeName || "Store"

                                )}`

                        }

                        alt={store.storeName}

                        className="store-logo"

                    />


                    <div>

                        <h1>

                            {store.storeName}

                        </h1>


                        <p>

                            {store.description}

                        </p>


                        <div className="store-badges">


                            {/* VERIFIED */}

                            {

                                store.verified && (

                                    <span className="verified">

                                        ✔ Verified Store

                                    </span>

                                )

                            }


                            {/* SUBSCRIPTION */}

                            <span className="plan">

                                {

                                    store.subscription?.plan ||

                                    store.plan ||

                                    "Basic"

                                }

                            </span>


                        </div>

                    </div>


                </div>

            </div>


            {/* =====================================
                STORE INFORMATION
            ===================================== */}

            <div className="store-info">


                {/* LOCATION */}

                <div>

                    <h3>

                        📍 Location

                    </h3>

                    <p>

                        {

                            [

                                store.city,

                                store.region

                            ]

                                .filter(Boolean)

                                .join(", ")

                                ||

                            "Not available"

                        }

                    </p>

                </div>


                {/* PHONE */}

                <div>

                    <h3>

                        📞 Phone

                    </h3>

                    <p>

                        {

                            store.phone ||

                            "Not available"

                        }

                    </p>

                </div>


                {/* WEBSITE */}

                <div>

                    <h3>

                        🌐 Website

                    </h3>


                    {

                        store.website

                            ?

                            (

                                <a

                                    href={

                                        store.website.startsWith("http")

                                            ?

                                            store.website

                                            :

                                            `https://${store.website}`

                                    }

                                    target="_blank"

                                    rel="noreferrer"

                                >

                                    {store.website}

                                </a>

                            )

                            :

                            (

                                <p>

                                    Not available

                                </p>

                            )

                    }

                </div>


                {/* RATING */}

                <div>

                    <h3>

                        ⭐ Rating

                    </h3>

                    <p>

                        {store.rating || 0}

                    </p>

                </div>


                {/* FOLLOWERS */}

                <div>

                    <h3>

                        👥 Followers

                    </h3>

                    <p>

                        {store.followers || 0}

                    </p>

                </div>


            </div>


            {/* =====================================
                STORE PRODUCTS
            ===================================== */}

            <section className="store-products">


                <h2>

                    Products ({products.length})

                </h2>


                <div className="products">


                    {

                        products.length === 0

                            ?

                            (

                                <div className="no-products">

                                    <h3>

                                        No Products Available

                                    </h3>

                                    <p>

                                        This store has not added any products yet.

                                    </p>

                                </div>

                            )

                            :

                            (

                                products.map((product) => (

                                    <ProductCard

                                        key={

                                            product.id ||

                                            product._id

                                        }

                                        product={product}

                                    />

                                ))

                            )

                    }


                </div>


            </section>


        </div>

    );

}


export default PublicStore;
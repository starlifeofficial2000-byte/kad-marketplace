import { useEffect, useRef, useState } from "react";
import api from "../../config/axios";
import { Link } from "react-router-dom";
import "./TrendingProducts.css";


function TrendingProducts() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const sliderRef = useRef(null);


    /* =========================================
       LOAD EXPRESS PRODUCTS
    ========================================= */

    useEffect(() => {

        loadProducts();

    }, []);


    const loadProducts = async () => {

        try {

            const res = await api.get(
                "/products/express"
            );


            setProducts(
                res.data.products || []
            );

        }

        catch (error) {

            console.error(
                "LOAD EXPRESS PRODUCTS ERROR:",
                error
            );


            setProducts([]);

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================
       SCROLL LEFT
    ========================================= */

    const scrollLeft = () => {

        if (!sliderRef.current) return;


        sliderRef.current.scrollBy({

            left: -350,

            behavior: "smooth"

        });

    };


    /* =========================================
       SCROLL RIGHT
    ========================================= */

    const scrollRight = () => {

        if (!sliderRef.current) return;


        sliderRef.current.scrollBy({

            left: 350,

            behavior: "smooth"

        });

    };


    /* =========================================
       GET PRODUCT IMAGE URL
    ========================================= */

    const getImageUrl = (product) => {

        let images = [];


        try {

            images = Array.isArray(product.images)

                ? product.images

                : JSON.parse(
                    product.images || "[]"
                );

        }

        catch {

            images = [];

        }


        if (!images.length) {

            return "https://via.placeholder.com/300";

        }


        const image = images[0];


        /* Full URL already provided */

        if (

            image.startsWith("http://") ||

            image.startsWith("https://")

        ) {

            return image;

        }


        /*
           Get backend URL dynamically.

           Example:

           VITE_API_URL=
           https://api.yoursite.com/api

           becomes:

           https://api.yoursite.com
        */

        const backendUrl = (

            import.meta.env.VITE_API_URL ||

            "/api"

        ).replace(/\/api\/?$/, "");


        return `${backendUrl}/uploads/${image}`;

    };


    return (

        <section className="trending-products">


            {/* =====================================
               HEADER
            ===================================== */}

            <div className="section-header">

                <h2>
                    ⚡ Express Products
                </h2>


                <Link to="/trending">

                    VIEW ALL

                </Link>

            </div>


            {/* =====================================
               CAROUSEL
            ===================================== */}

            <div className="carousel-wrapper">


                {/* LEFT BUTTON */}

                <button

                    type="button"

                    className="carousel-btn left"

                    onClick={scrollLeft}

                    aria-label="Scroll left"

                >

                    ❮

                </button>


                {/* PRODUCTS */}

                <div

                    className="trending-slider"

                    ref={sliderRef}

                >

                    {

                        loading

                            ? (

                                <p className="no-products">

                                    Loading products...

                                </p>

                            )

                            : products.length === 0

                                ? (

                                    <p className="no-products">

                                        No express products available.

                                    </p>

                                )

                                : (

                                    products.map(product => (

                                        <div

                                            className="trending-card"

                                            key={product.id}

                                        >

                                            <img

                                                src={getImageUrl(product)}

                                                alt={
                                                    product.title ||
                                                    "Product"
                                                }

                                                loading="lazy"

                                            />


                                            <div className="trending-info">


                                                <h3>

                                                    {product.title}

                                                </h3>


                                                <h2>

                                                    GH₵ {product.price}

                                                </h2>


                                                <p>

                                                    {product.location}

                                                </p>


                                                <Link

                                                    to={`/product/${product.id}`}

                                                    className="details-btn"

                                                >

                                                    View Details

                                                </Link>


                                            </div>

                                        </div>

                                    ))

                                )

                    }

                </div>


                {/* RIGHT BUTTON */}

                <button

                    type="button"

                    className="carousel-btn right"

                    onClick={scrollRight}

                    aria-label="Scroll right"

                >

                    ❯

                </button>


            </div>

        </section>

    );

}


export default TrendingProducts;
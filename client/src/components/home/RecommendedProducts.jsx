import { useEffect, useRef, useState } from "react";
import api from "../../config/axios";
import { Link } from "react-router-dom";
import "./TrendingProducts.css";
import SEO from "../SEO";
import { normalizeHomePromotionProducts } from "../../utils/homePromotionProducts";

function TrendingProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const sliderRef = useRef(null);


    /* =========================================
       LOAD RECOMMENDED PRODUCTS
    ========================================= */

    useEffect(() => {
        loadProducts();
    }, []);


    const loadProducts = async () => {
        try {

            setLoading(true);

            const res = await api.get("/home-builder/recommended");

            console.log(
                "TRENDING / RECOMMENDED RESPONSE:",
                res.data
            );


            /*
                Handle different possible
                backend response formats
            */

            setProducts(normalizeHomePromotionProducts(res.data));

        } catch (error) {

            console.error(
                "LOAD RECOMMENDED PRODUCTS ERROR:",
                error.response?.data || error
            );

            setProducts([]);

        } finally {

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
       GET PRODUCT IMAGE
    ========================================= */

    const getImageUrl = (product) => {

        let images = [];

        if (Array.isArray(product.images)) {

            images = product.images;

        } else if (typeof product.images === "string") {

            try {

                images = JSON.parse(product.images);

            } catch {

                images = [];

            }

        }


        if (!images || images.length === 0) {

            return "https://via.placeholder.com/400x300?text=No+Image";

        }


        const image = images[0];


        /*
            If image is already a full URL
        */

        if (
            typeof image === "string" &&
            (
                image.startsWith("http://") ||
                image.startsWith("https://")
            )
        ) {

            return image;

        }


        /*
            Backend URL
        */

        const backendUrl = (
            import.meta.env.VITE_API_URL ||
            "/api"
        ).replace(/\/api$/, "");


        return `${backendUrl}/uploads/${image}`;

    };


    // Hide the entire homepage collection when there are no promoted products.
    if (loading || products.length === 0) return null;

    return (

        <section className="trending-products">
            <SEO
    title="Recommended Products | KAD Marketplace Ghana"
    description="Discover recommended products and listings selected for shoppers on KAD Marketplace Ghana."
    keywords="recommended products Ghana, Ghana online marketplace, buy and sell Ghana, KAD Marketplace"
    canonical="https://kadmarket.com/recommended"
/>

            {/* HEADER */}

            <div className="section-header">

                <div>

                    <h2>
                        👍 Recommended Products
                    </h2>

                    <p>
                        Products recommended for you based on popularity and quality.
                    </p>

                </div>


                <Link to="/recommended">

                    VIEW ALL →

                </Link>

            </div>


            {/* LOADING */}

            {loading ? (

                <div className="no-products">

                    Loading recommended products...

                </div>

            ) : (

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

                            products.length === 0

                                ?

                                (

                                    <p className="no-products">

                                        No recommended products available.

                                    </p>

                                )

                                :

                                (

                                    products.map((product) => (

                                        <div
                                            className="trending-card"
                                            key={product.id || product._id}
                                        >

                                            <Link
                                                to={`/product/${product.id || product._id}`}
                                            >

                                                <img
                                                    src={getImageUrl(product)}
                                                    alt={product.title || "Product"}
                                                    loading="lazy"
                                                    onError={(e) => {

                                                        e.currentTarget.src =
                                                            "https://via.placeholder.com/400x300?text=No+Image";

                                                    }}
                                                />

                                            </Link>


                                            <div className="trending-info">


                                                <h3>

                                                    {product.title}

                                                </h3>


                                                <h2>

                                                    GH₵ {

                                                        Number(
                                                            product.price || 0
                                                        ).toLocaleString()

                                                    }

                                                </h2>


                                                <p>

                                                    📍 {

                                                        product.city ||

                                                        product.location ||

                                                        "Ghana"

                                                    }

                                                </p>


                                                <Link
                                                    to={`/product/${product.id || product._id}`}
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

            )}

        </section>

    );

}

export default TrendingProducts;
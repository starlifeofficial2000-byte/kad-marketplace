import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../config/axios";
import ReviewList from "../components/ReviewList";

import "./SellerProfile.css";


const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ||
    "";


function SellerProfile() {

    const { id } = useParams();


    const [seller, setSeller] = useState(null);

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* ==========================================
       LOAD SELLER
    ========================================== */

    useEffect(() => {

        loadSeller();

    }, [id]);


    const loadSeller = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(

                `/users/${id}`

            );


            console.log(

                "SELLER RESPONSE:",

                response.data

            );


            const sellerData =

                response.data?.seller ||

                response.data?.data?.seller ||

                response.data?.data ||

                null;


            const productsData =

                response.data?.products ||

                response.data?.data?.products ||

                [];


            setSeller(sellerData);

            setProducts(

                Array.isArray(productsData)

                    ? productsData

                    : []

            );

        }

        catch (error) {

            console.error(

                "LOAD SELLER ERROR:",

                error.response?.data || error.message

            );


            setError(

                error.response?.data?.message ||

                "Failed to load seller profile."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       IMAGE URL HELPER
    ========================================== */

    const getImageUrl = (image) => {

        if (!image) {

            return "https://via.placeholder.com/300";

        }


        if (

            image.startsWith("http://") ||

            image.startsWith("https://")

        ) {

            return image;

        }


        if (image.startsWith("/")) {

            return `${SERVER_URL}${image}`;

        }


        return `${SERVER_URL}/uploads/${image}`;

    };


    /* ==========================================
       GET PRODUCT IMAGE
    ========================================== */

    const getProductImage = (product) => {

        if (!product.images) {

            return "https://via.placeholder.com/300";

        }


        let images = [];


        try {

            if (

                typeof product.images === "string"

            ) {

                images = JSON.parse(product.images);

            }

            else if (

                Array.isArray(product.images)

            ) {

                images = product.images;

            }

        }

        catch (error) {

            images = [product.images];

        }


        if (

            !Array.isArray(images) ||

            images.length === 0

        ) {

            return "https://via.placeholder.com/300";

        }


        return getImageUrl(images[0]);

    };


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="seller-profile-loading">

                <h2>

                    Loading Seller...

                </h2>

            </div>

        );

    }


    /* ==========================================
       ERROR
    ========================================== */

    if (error) {

        return (

            <div className="seller-profile-loading">

                <h2>

                    {error}

                </h2>


                <button onClick={loadSeller}>

                    Try Again

                </button>

            </div>

        );

    }


    /* ==========================================
       SELLER NOT FOUND
    ========================================== */

    if (!seller) {

        return (

            <div className="seller-profile-loading">

                <h2>

                    Seller not found.

                </h2>

            </div>

        );

    }


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="seller-profile">


            {/* ======================================
               SELLER COVER
            ====================================== */}

            <div className="seller-cover">


                <div className="seller-card">


                    <img

                        className="seller-image"

                        src={

                            getImageUrl(

                                seller.profileImage

                            )

                        }

                        alt={seller.name || "Seller"}

                        onError={(e) => {

                            e.target.src =

                                "https://ui-avatars.com/api/?name=" +

                                encodeURIComponent(

                                    seller.name || "Seller"

                                );

                        }}

                    />


                    <div className="seller-details">


                        <h1>

                            {seller.name || "Seller"}

                            {

                                seller.verified &&

                                <span className="verified">

                                    ✔ Verified Seller

                                </span>

                            }

                        </h1>


                        <p>

                            📧 {seller.email || "Not Available"}

                        </p>


                        <p>

                            📞 {

                                seller.phone ||

                                "Not Available"

                            }

                        </p>


                        <p>

                            📍 {

                                seller.location ||

                                seller.city ||

                                "Ghana"

                            }

                        </p>


                        <p>

                            📅 Joined{" "}

                            {

                                seller.createdAt

                                    ?

                                    new Date(

                                        seller.createdAt

                                    ).toLocaleDateString()

                                    :

                                    "Not Available"

                            }

                        </p>


                        <p>

                            🟢 {

                                seller.lastSeen

                                    ?

                                    new Date(

                                        seller.lastSeen

                                    ).toLocaleString()

                                    :

                                    "Recently Active"

                            }

                        </p>


                    </div>


                </div>


            </div>


            {/* ======================================
               SELLER STATISTICS
            ====================================== */}

            <div className="seller-stats">


                <div className="stat-box">

                    <h2>

                        {products.length}

                    </h2>

                    <p>

                        Active Listings

                    </p>

                </div>


                <div className="stat-box">

                    <h2>

                        {

                            Number(

                                seller.averageRating || 0

                            ).toFixed(1)

                        }

                    </h2>

                    <p>

                        Average Rating

                    </p>

                </div>


                <div className="stat-box">

                    <h2>

                        {

                            seller.totalReviews || 0

                        }

                    </h2>

                    <p>

                        Buyer Reviews

                    </p>

                </div>


            </div>


            {/* ======================================
               PRODUCTS
            ====================================== */}

            <h2 className="section-title">

                Products From This Seller

            </h2>


            {

                products.length === 0

                    ?

                    (

                        <div className="no-seller-products">

                            <p>

                                This seller currently has no products available.

                            </p>

                        </div>

                    )

                    :

                    (

                        <div className="seller-products">

                            {

                                products.map(

                                    (product) => (

                                        <Link

                                            key={product.id}

                                            to={`/product/${product.id}`}

                                            className="seller-product"

                                        >


                                            <img

                                                src={

                                                    getProductImage(

                                                        product

                                                    )

                                                }

                                                alt={

                                                    product.title ||

                                                    "Product"

                                                }

                                                onError={(e) => {

                                                    e.target.src =

                                                        "https://via.placeholder.com/250";

                                                }}

                                            />


                                            <h3>

                                                {

                                                    product.title ||

                                                    "Untitled Product"

                                                }

                                            </h3>


                                            <h2>

                                                GH₵ {

                                                    Number(

                                                        product.price || 0

                                                    ).toLocaleString()

                                                }

                                            </h2>


                                            <span>

                                                {

                                                    product.condition ||

                                                    "Not specified"

                                                }

                                            </span>


                                        </Link>

                                    )

                                )

                            }

                        </div>

                    )

            }


            {/* ======================================
               REVIEWS
            ====================================== */}

            <ReviewList

                sellerId={seller.id}

            />


        </div>

    );

}


export default SellerProfile;
import { useEffect, useState } from "react";
import api from "../config/axios";
import { Link } from "react-router-dom";

import "./SellerCard.css";


function SellerCard({ sellerId }) {

    const [seller, setSeller] = useState(null);

    const [loading, setLoading] = useState(true);


    /* =========================================
       LOAD SELLER
    ========================================= */

    useEffect(() => {

        if (!sellerId) {

            setSeller(null);

            setLoading(false);

            return;

        }


        loadSeller();

    }, [sellerId]);


    const loadSeller = async () => {

        try {

            setLoading(true);


            const response = await api.get(

                `/users/${sellerId}`

            );


            const sellerData =

                response.data?.seller ||

                response.data?.user ||

                response.data;


            setSeller(sellerData);

        }

        catch (error) {

            console.error(

                "SELLER LOAD ERROR:",

                error.response?.data ||

                error.message

            );


            setSeller(null);

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================
       IMAGE URL
    ========================================= */

    const getProfileImage = () => {

        if (!seller?.profileImage) {

            return `https://ui-avatars.com/api/?name=${encodeURIComponent(
                seller?.name || "Seller"
            )}&background=2563eb&color=ffffff&size=200`;

        }


        if (

            seller.profileImage.startsWith("http://") ||

            seller.profileImage.startsWith("https://")

        ) {

            return seller.profileImage;

        }


        return `/uploads/${seller.profileImage}`;

    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="seller-card seller-loading">

                Loading seller information...

            </div>

        );

    }


    /* =========================================
       NO SELLER
    ========================================= */

    if (!seller) {

        return (

            <div className="seller-card">

                <h3>

                    Seller information unavailable.

                </h3>

            </div>

        );

    }


    /* =========================================
       PAGE
    ========================================= */

    return (

        <div className="seller-card">


            {/* SELLER HEADER */}

            <div className="seller-top">

                <img

                    src={getProfileImage()}

                    alt={seller.name || "Seller"}

                    onError={(e) => {

                        e.currentTarget.src =

                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                seller.name || "Seller"
                            )}&background=2563eb&color=ffffff`;

                    }}

                />


                <div>

                    <h2>

                        {seller.name || "Unknown Seller"}

                    </h2>


                    <p className="seller-rating">

                        ⭐ {Number(seller.averageRating || 0).toFixed(1)}

                        {" "}

                        ({seller.totalReviews || 0} Reviews)

                    </p>

                </div>

            </div>


            {/* SELLER INFORMATION */}

            <div className="seller-info">


                <div className="info-card">

                    <h3>📦</h3>

                    <p>

                        {seller.totalProducts || 0} Listings

                    </p>

                </div>


                <div className="info-card">

                    <h3>📞</h3>

                    <p>

                        {seller.phone || "Not Available"}

                    </p>

                </div>


                <div className="info-card">

                    <h3>📍</h3>

                    <p>

                        {seller.location || "Ghana"}

                    </p>

                </div>


                <div className="info-card">

                    <h3>⭐</h3>

                    <p>

                        {Number(
                            seller.averageRating || 0
                        ).toFixed(1)} Rating

                    </p>

                </div>


                <div className="info-card">

                    <h3>💬</h3>

                    <p>

                        {seller.totalReviews || 0} Reviews

                    </p>

                </div>


                <div className="info-card">

                    <h3>📅</h3>

                    <p>

                        {seller.createdAt

                            ? new Date(
                                seller.createdAt
                            ).toLocaleDateString()

                            : "N/A"

                        }

                    </p>

                </div>


                <div className="info-card">

                    <h3>

                        {

                            seller.verified

                                ? "✔"

                                : "👤"

                        }

                    </h3>


                    <p>

                        {

                            seller.verified

                                ? "Verified Seller"

                                : "Regular Seller"

                        }

                    </p>

                </div>


                <div className="info-card">

                    <h3>🟢</h3>

                    <p>

                        {seller.lastSeen ||

                            "Recently Active"

                        }

                    </p>

                </div>


            </div>


            {/* PROFILE BUTTON */}

            <Link

                to={`/seller/${seller.id}`}

                className="visit-profile"

            >

                View Seller Profile

            </Link>


        </div>

    );

}


export default SellerCard;
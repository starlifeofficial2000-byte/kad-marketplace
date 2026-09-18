import { useEffect, useState } from "react";
import api from "../config/axios";

import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";

import "./Wishlist.css";


function Wishlist() {

    const [wishlist, setWishlist] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* =========================================
       LOAD WISHLIST
    ========================================= */

    useEffect(() => {

        loadWishlist();

    }, []);


    const loadWishlist = async () => {

        try {

            setLoading(true);

            setError("");


            const res = await api.get("/wishlist");


            console.log(
                "WISHLIST RESPONSE:",
                res.data
            );


            const wishlistData =

                res.data?.wishlist ||

                res.data?.data ||

                (

                    Array.isArray(res.data)

                        ? res.data

                        : []

                );


            setWishlist(wishlistData);

        }

        catch (error) {

            console.error(

                "LOAD WISHLIST ERROR:",

                error.response?.data || error.message

            );


            setError(

                error.response?.data?.message ||

                "Unable to load your wishlist."

            );


            setWishlist([]);

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================
       REMOVE ITEM
    ========================================= */

    const removeItem = async (productId) => {

        if (
            !window.confirm(
                "Remove this product from your wishlist?"
            )
        ) {
            return;
        }


        try {

            await api.delete(
                `/wishlist/${productId}`
            );


            setWishlist((currentWishlist) =>

                currentWishlist.filter((item) => {

                    const currentProductId =

                        item.productId ||

                        item.ProductId ||

                        item.product?.id ||

                        item.Product?.id ||

                        item.id;


                    return (

                        Number(currentProductId) !==
                        Number(productId)

                    );

                })

            );

        }

        catch (error) {

            console.error(

                "REMOVE WISHLIST ERROR:",

                error.response?.data || error.message

            );


            alert(

                error.response?.data?.message ||

                "Unable to remove product from wishlist."

            );

        }

    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <Layout>

                <div className="wishlist-loading">

                    Loading Wishlist...

                </div>

            </Layout>

        );

    }


    /* =========================================
       PAGE
    ========================================= */

    return (

        <Layout>

            <div className="wishlist-page">

                <h1>
                    ❤️ My Wishlist
                </h1>


                {

                    error && (

                        <div className="wishlist-error">

                            {error}

                        </div>

                    )

                }


                {

                    wishlist.length === 0

                        ?

                        (

                            <div className="empty-wishlist">

                                <h2>
                                    Your wishlist is empty.
                                </h2>

                                <p>
                                    Save products you like and
                                    they'll appear here.
                                </p>

                            </div>

                        )

                        :

                        (

                            <div className="wishlist-grid">

                                {

                                    wishlist.map((item) => {


                                        const product =

                                            item.product ||

                                            item.Product ||

                                            item;


                                        const productId =

                                            item.productId ||

                                            item.ProductId ||

                                            product.id;


                                        return (

                                            <div

                                                key={
                                                    item.id ||
                                                    productId
                                                }

                                                className="wishlist-item"

                                            >

                                                <ProductCard

                                                    product={product}

                                                />


                                                <button

                                                    className="remove-btn"

                                                    onClick={() =>
                                                        removeItem(productId)
                                                    }

                                                >

                                                    Remove

                                                </button>


                                            </div>

                                        );

                                    })

                                }

                            </div>

                        )

                }

            </div>

        </Layout>

    );

}


export default Wishlist;
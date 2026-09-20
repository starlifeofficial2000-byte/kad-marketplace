import { useCallback, useEffect, useState } from "react";
import api from "../../config/axios";
import ProductCard from "../ProductCard";
import "./FeaturedProducts.css";

function FeaturedProducts() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * =====================================================
     * LOAD PUBLIC FEATURED PRODUCTS
     * =====================================================
     *
     * The backend is responsible for deciding which
     * promotions are visible.
     *
     * A promotion should only reach this component when:
     *
     * paymentStatus   = PAID
     * status          = APPROVED
     * promotionType   = FEATURED
     * showOnHomepage  = true
     *
     * The frontend simply displays the returned products.
     */

    const loadFeaturedProducts = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/home-builder/featured"
            );

            console.log(
                "FEATURED PRODUCTS RESPONSE:",
                response.data
            );

            /*
             * Make sure the API returned the expected
             * structure.
             */

            if (
                !response.data ||
                response.data.success !== true
            ) {

                throw new Error(
                    response.data?.message ||
                    "Unable to load featured products."
                );

            }


            const promotions =
                Array.isArray(
                    response.data.products
                )
                    ? response.data.products
                    : [];


            /*
             * =================================================
             * CONVERT PROMOTIONS INTO PRODUCT DATA
             * =================================================
             *
             * The backend returns ProductPromotion records
             * containing:
             *
             * promotion.product
             *
             * We convert them into the format expected by
             * ProductCard.
             */

            const productsData = [];

            const seenProductIds = new Set();


            promotions.forEach((promotion) => {

                /*
                 * Ignore invalid promotion records.
                 */

                if (
                    !promotion ||
                    !promotion.product
                ) {

                    return;

                }


                const product =
                    promotion.product;


                /*
                 * Ignore products without a valid ID.
                 */

                const productId =
                    product.id ||
                    product._id;


                if (!productId) {

                    return;

                }


                /*
                 * Prevent the same product from appearing
                 * multiple times.
                 */

                if (
                    seenProductIds.has(
                        String(productId)
                    )
                ) {

                    return;

                }


                seenProductIds.add(
                    String(productId)
                );


                productsData.push({

                    ...product,

                    /*
                     * Keep promotion information available
                     * to the card and future features.
                     */

                    promotionId:
                        promotion.id,

                    promotionType:
                        promotion.promotionType,

                    homepageOrder:
                        promotion.homepageOrder,

                    showOnHomepage:
                        promotion.showOnHomepage

                });

            });


            /*
             * Backend already orders the promotions, but we
             * maintain the homepage order here as an additional
             * safety measure.
             */

            productsData.sort(
                (a, b) => {

                    const orderA =
                        Number(
                            a.homepageOrder
                        ) || 0;

                    const orderB =
                        Number(
                            b.homepageOrder
                        ) || 0;

                    return orderA - orderB;

                }
            );


            setProducts(
                productsData
            );

        }

        catch (error) {

            console.error(
                "FEATURED PRODUCT LOAD ERROR:",
                error.response?.data ||
                error.message ||
                error
            );


            setProducts([]);


            /*
             * Don't expose technical Axios/server errors
             * directly to customers.
             */

            setError(
                error.response?.data?.message ||
                "Failed to load featured products."
            );

        }

        finally {

            setLoading(false);

        }

    }, []);


    /*
     * =====================================================
     * INITIAL LOAD
     * =====================================================
     */

    useEffect(() => {

        loadFeaturedProducts();

    }, [loadFeaturedProducts]);


    /*
     * =====================================================
     * LOADING STATE
     * =====================================================
     */

    if (loading) {

        return (

            <section
                className="featured-products"
                aria-labelledby="featured-products-title"
            >

                <div className="section-header">

                    <div>

                        <h2 id="featured-products-title">
                            Featured Products
                        </h2>

                        <p>
                            Discover amazing featured
                            products from trusted sellers.
                        </p>

                    </div>

                </div>


                <div
                    className="no-products"
                    role="status"
                    aria-live="polite"
                >

                    <h3>
                        Loading featured products...
                    </h3>

                </div>

            </section>

        );

    }


    /*
     * =====================================================
     * ERROR STATE
     * =====================================================
     */

    if (error) {

        return (

            <section
                className="featured-products"
                aria-labelledby="featured-products-title"
            >

                <div className="section-header">

                    <div>

                        <h2 id="featured-products-title">
                            Featured Products
                        </h2>

                        <p>
                            Discover amazing featured
                            products from trusted sellers.
                        </p>

                    </div>

                </div>


                <div
                    className="no-products"
                    role="alert"
                >

                    <h3>
                        {error}
                    </h3>

                    <button
                        type="button"
                        onClick={loadFeaturedProducts}
                        className="retry-button"
                    >
                        Try Again
                    </button>

                </div>

            </section>

        );

    }


    /*
     * =====================================================
     * EMPTY STATE
     * =====================================================
     */

    if (products.length === 0) {

        return (

            <section
                className="featured-products"
                aria-labelledby="featured-products-title"
            >

                <div className="section-header">

                    <div>

                        <h2 id="featured-products-title">
                            Featured Products
                        </h2>

                        <p>
                            Discover amazing featured
                            products from trusted sellers.
                        </p>

                    </div>

                </div>


                <div className="no-products">

                    <h3>
                        No featured products available yet.
                    </h3>

                    <p>
                        Check back soon for products
                        featured by our sellers.
                    </p>

                </div>

            </section>

        );

    }


    /*
     * =====================================================
     * FEATURED PRODUCTS
     * =====================================================
     */

    return (

        <section
            className="featured-products"
            aria-labelledby="featured-products-title"
        >

            <div className="section-header">

                <div>

                    <h2 id="featured-products-title">
                        Featured Products
                    </h2>

                    <p>
                        Discover amazing featured
                        products from trusted sellers.
                    </p>

                </div>

            </div>


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

        </section>

    );

}


export default FeaturedProducts;
import { useCallback, useEffect, useRef, useState } from "react";

import api from "../../config/axios";

import { Link } from "react-router-dom";

import "./FeaturedProducts.css";

function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const sliderRef = useRef(null);

    /*
     * =====================================================
     * LOAD FEATURED PRODUCTS
     * =====================================================
     *
     * The backend already controls which promotions are
     * allowed to appear on the public homepage.
     *
     * Expected:
     *
     * paymentStatus  = PAID
     * status         = APPROVED
     * promotionType  = FEATURED
     * showOnHomepage = true
     */

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);

            const response = await api.get(
                "/home-builder/featured"
            );

            console.log(
                "FEATURED PRODUCTS RESPONSE:",
                response.data
            );

            const promotions =
                Array.isArray(response.data?.products)
                    ? response.data.products
                    : [];

            /*
             * =================================================
             * CONVERT PROMOTIONS INTO PRODUCTS
             * =================================================
             */

            const productsData = [];

            const seenProductIds =
                new Set();

            promotions.forEach((promotion) => {
                if (
                    !promotion ||
                    !promotion.product
                ) {
                    return;
                }

                const product =
                    promotion.product;

                const productId =
                    product.id ||
                    product._id;

                if (!productId) {
                    return;
                }

                const normalizedId =
                    String(productId);

                /*
                 * Prevent duplicate products.
                 */

                if (
                    seenProductIds.has(
                        normalizedId
                    )
                ) {
                    return;
                }

                seenProductIds.add(
                    normalizedId
                );

                productsData.push({
                    ...product,

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
             * =================================================
             * HOMEPAGE ORDER
             * =================================================
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

            setProducts(productsData);
        } catch (error) {
            console.error(
                "LOAD FEATURED PRODUCTS ERROR:",
                error.response?.data ||
                error.message ||
                error
            );

            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    /*
     * =====================================================
     * INITIAL LOAD
     * =====================================================
     */

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    /*
     * =====================================================
     * SCROLL LEFT
     * =====================================================
     */

    const scrollLeft = () => {
        if (!sliderRef.current) {
            return;
        }

        sliderRef.current.scrollBy({
            left: -350,
            behavior: "smooth"
        });
    };

    /*
     * =====================================================
     * SCROLL RIGHT
     * =====================================================
     */

    const scrollRight = () => {
        if (!sliderRef.current) {
            return;
        }

        sliderRef.current.scrollBy({
            left: 350,
            behavior: "smooth"
        });
    };

    /*
     * =====================================================
     * GET PRODUCT IMAGE
     * =====================================================
     */

    const getImageUrl = (product) => {
        let images = [];

        /*
         * Images already parsed as array.
         */

        if (Array.isArray(product?.images)) {
            images = product.images;
        }

        /*
         * Images returned as JSON string.
         */

        else if (
            typeof product?.images === "string"
        ) {
            try {
                images =
                    JSON.parse(
                        product.images
                    );
            } catch {
                images = [];
            }
        }

        /*
         * No image.
         */

        if (
            !Array.isArray(images) ||
            images.length === 0
        ) {
            return "/no-image.png";
        }

        const image = images[0];

        /*
         * Full external URL.
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
         * Build backend upload URL.
         */

        const apiUrl =
            import.meta.env.VITE_API_URL ||
            "/api";

        const backendUrl =
            apiUrl
                .replace(/\/api\/?$/, "")
                .replace(/\/$/, "");

        /*
         * Remove an accidental leading slash
         * to prevent //uploads.
         */

        const cleanImage =
            String(image)
                .replace(/^\/+/, "");

        return `${backendUrl}/uploads/${cleanImage}`;
    };

    /*
     * =====================================================
     * LOADING
     * =====================================================
     */

    if (loading) {
        return (
            <section className="featured-products">

                <div className="section-header">

                    <div>
                        <h2>
                            ⭐ Featured Products
                        </h2>

                        <p>
                            Discover amazing featured
                            products from trusted sellers.
                        </p>
                    </div>

                </div>

                <div className="no-products">
                    Loading featured products...
                </div>

            </section>
        );
    }

    /*
     * =====================================================
     * RENDER
     * =====================================================
     */

    return (
        <section className="featured-products">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="section-header">

                <div>

                    <h2>
                        ⭐ Featured Products
                    </h2>

                    <p>
                        Discover amazing featured
                        products from trusted sellers.
                    </p>

                </div>

                <Link
                    to="/featured"
                    className="view-all-link"
                >
                    VIEW ALL →
                </Link>

            </div>

            {/* =================================================
                PRODUCT CAROUSEL
            ================================================= */}

            <div className="carousel-wrapper">

                {/* LEFT BUTTON */}

                <button
                    type="button"
                    className="carousel-btn left"
                    onClick={scrollLeft}
                    aria-label="Scroll featured products left"
                >
                    ❮
                </button>

                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <div
                    className="featured-slider"
                    ref={sliderRef}
                >

                    {products.length === 0 ? (

                        <div className="no-products">
                            <h3>
                                No featured products
                                available.
                            </h3>

                            <p>
                                Check back soon for
                                products featured by
                                our sellers.
                            </p>
                        </div>

                    ) : (

                        products.map((product) => {

                            const productId =
                                product.id ||
                                product._id;

                            return (
                                <div
                                    className="featured-card"
                                    key={productId}
                                >

                                    {/* =================================================
                                        PRODUCT IMAGE
                                    ================================================= */}

                                    <Link
                                        to={`/product/${productId}`}
                                        className="featured-image-link"
                                    >

                                        <img
                                            src={
                                                getImageUrl(
                                                    product
                                                )
                                            }
                                            alt={
                                                product.title ||
                                                "Featured product"
                                            }
                                            loading="lazy"
                                            onError={(event) => {
                                                if (
                                                    event
                                                        .currentTarget
                                                        .dataset
                                                        .fallbackApplied
                                                ) {
                                                    return;
                                                }

                                                event
                                                    .currentTarget
                                                    .dataset
                                                    .fallbackApplied =
                                                    "true";

                                                event
                                                    .currentTarget
                                                    .src =
                                                    "/no-image.png";
                                            }}
                                        />

                                        {/* FEATURED BADGE */}

                                        <span className="featured-badge">
                                            ⭐ FEATURED
                                        </span>

                                    </Link>

                                    {/* =================================================
                                        PRODUCT INFORMATION
                                    ================================================= */}

                                    <div className="featured-info">

                                        <h3
                                            title={
                                                product.title ||
                                                "Product"
                                            }
                                        >
                                            {
                                                product.title ||
                                                "Untitled Product"
                                            }
                                        </h3>

                                        <h2>
                                            GH₵{" "}
                                            {Number(
                                                product.price ||
                                                0
                                            ).toLocaleString(
                                                "en-GH"
                                            )}
                                        </h2>

                                        <p>
                                            📍{" "}
                                            {
                                                product.city ||
                                                product.location ||
                                                "Ghana"
                                            }
                                        </p>

                                        {/* VIEW DETAILS */}

                                        <Link
                                            to={`/product/${productId}`}
                                            className="details-btn"
                                        >
                                            View Details
                                        </Link>

                                    </div>

                                </div>
                            );
                        })

                    )}

                </div>

                {/* RIGHT BUTTON */}

                <button
                    type="button"
                    className="carousel-btn right"
                    onClick={scrollRight}
                    aria-label="Scroll featured products right"
                >
                    ❯
                </button>

            </div>

        </section>
    );
}

export default FeaturedProducts;
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../config/axios";
import { Link } from "react-router-dom";
import getImageUrl from "../../utils/imageUrl";
import "./FeaturedProducts.css";

function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const sliderRef = useRef(null);

    /*
     * =====================================================
     * LOAD FEATURED PRODUCTS
     * =====================================================
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

            const promotions = Array.isArray(
                response.data?.products
            )
                ? response.data.products
                : [];

            /*
             * Convert promotion objects into
             * normal product objects.
             */

            const productsData = [];

            const seenProductIds = new Set();

            promotions.forEach((promotion) => {
                if (
                    !promotion ||
                    !promotion.product
                ) {
                    return;
                }

                const product = promotion.product;

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
             * Sort according to homepage order.
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

            console.log(
                "FINAL FEATURED PRODUCTS:",
                productsData
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
     *
     * IMPORTANT:
     *
     * Do NOT manually create:
     *
     * /uploads/image.jpg
     *
     * Product images are now stored in Cloudflare R2.
     *
     * We use the application's shared getImageUrl()
     * utility so that R2 URLs and legacy images are
     * handled correctly.
     */

    const getProductImage = (product) => {
        let images = [];

        /*
         * Images already returned as an array.
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
                const parsed =
                    JSON.parse(
                        product.images
                    );

                if (Array.isArray(parsed)) {
                    images = parsed;
                } else if (
                    typeof parsed === "string"
                ) {
                    images = [parsed];
                }
            } catch {
                /*
                 * It may simply be a single
                 * filename/key.
                 */

                images = [
                    product.images
                ];
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

        const firstImage =
            images[0];

        if (!firstImage) {
            return "/no-image.png";
        }

        /*
         * Let the application's shared
         * image utility resolve:
         *
         * - R2 public URLs
         * - R2 keys
         * - old image paths
         * - full HTTP/HTTPS URLs
         */

        return getImageUrl(
            firstImage
        );
    };

    /*
     * =====================================================
     * IMAGE ERROR HANDLER
     * =====================================================
     */

    const handleImageError = (
        event
    ) => {
        const image =
            event.currentTarget;

        /*
         * Prevent infinite fallback loop.
         */

        if (
            image.dataset
                .fallbackApplied ===
            "true"
        ) {
            return;
        }

        image.dataset
            .fallbackApplied =
            "true";

        image.src =
            "/no-image.png";
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
                            Discover amazing
                            featured products
                            from trusted
                            sellers.
                        </p>
                    </div>
                </div>

                <div className="no-products">
                    Loading featured
                    products...
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
                        Discover amazing
                        featured products
                        from trusted
                        sellers.
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
                                No featured
                                products
                                available.
                            </h3>

                            <p>
                                Check back soon
                                for products
                                featured by
                                our sellers.
                            </p>
                        </div>
                    ) : (
                        products.map(
                            (product) => {
                                const productId =
                                    product.id ||
                                    product._id;

                                const imageUrl =
                                    getProductImage(
                                        product
                                    );

                                console.log(
                                    "FEATURED PRODUCT:",
                                    product.title
                                );

                                console.log(
                                    "FEATURED PRODUCT IMAGES:",
                                    product.images
                                );

                                console.log(
                                    "FEATURED PRODUCT IMAGE URL:",
                                    imageUrl
                                );

                                return (
                                    <div
                                        className="featured-card"
                                        key={
                                            productId
                                        }
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
                                                    imageUrl
                                                }
                                                alt={
                                                    product.title ||
                                                    "Featured product"
                                                }
                                                loading="lazy"
                                                onError={
                                                    handleImageError
                                                }
                                            />

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

                                            <Link
                                                to={`/product/${productId}`}
                                                className="details-btn"
                                            >
                                                View Details
                                            </Link>

                                        </div>

                                    </div>
                                );
                            }
                        )
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
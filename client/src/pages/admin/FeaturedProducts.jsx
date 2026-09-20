import { useCallback, useEffect, useState } from "react";
import api from "../../config/axios";
import "./FeaturedProducts.css";

function FeaturedProducts() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [error, setError] = useState("");


    /*
     * =====================================================
     * API / IMAGE URL
     * =====================================================
     */

    const API_URL =
        import.meta.env.VITE_API_URL || "/api";


    const getApiOrigin = () => {

        try {

            if (
                API_URL.startsWith("http://") ||
                API_URL.startsWith("https://")
            ) {

                return new URL(API_URL).origin;

            }

        } catch (error) {

            console.warn(
                "INVALID API URL:",
                API_URL
            );

        }

        return window.location.origin;

    };


    const API_ORIGIN =
        getApiOrigin();


    const getImageUrl = (image) => {

        if (!image) {

            return "/no-image.png";

        }


        /*
         * Already a complete URL.
         */

        if (
            image.startsWith("http://") ||
            image.startsWith("https://") ||
            image.startsWith("blob:")
        ) {

            return image;

        }


        const cleanImage =
            String(image)
                .replace(/^\/+/, "")
                .replace(/^uploads\//i, "");


        return `${API_ORIGIN}/uploads/${cleanImage}`;

    };


    /*
     * =====================================================
     * LOAD FEATURED PRODUCTS
     * =====================================================
     */

    const loadProducts = useCallback(
        async () => {

            try {

                setLoading(true);
                setError("");


                const response =
                    await api.get(
                        "/admin/home-builder/featured"
                    );


                console.log(
                    "ADMIN FEATURED PRODUCTS RESPONSE:",
                    response.data
                );


                if (
                    !response.data ||
                    response.data.success !== true
                ) {

                    throw new Error(
                        response.data?.message ||
                        "Failed to load featured products."
                    );

                }


                const promotions =
                    Array.isArray(
                        response.data.products
                    )
                        ? response.data.products
                        : [];


                setProducts(
                    promotions
                );

            }

            catch (error) {

                console.error(
                    "LOAD FEATURED PRODUCTS ERROR:",
                    error.response?.data ||
                    error.message ||
                    error
                );


                setProducts([]);


                setError(
                    error.response?.data?.message ||
                    "Failed to load featured products."
                );

            }

            finally {

                setLoading(false);

            }

        },
        []
    );


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
     * SHOW / HIDE ON HOMEPAGE
     * =====================================================
     *
     * IMPORTANT:
     *
     * This checkbox does NOT approve the promotion.
     *
     * The promotion is already:
     *
     * paymentStatus = PAID
     * status        = APPROVED
     * promotionType = FEATURED
     *
     * The checkbox ONLY controls:
     *
     * showOnHomepage
     */

    const toggleHomepage = async (promotion) => {

        if (!promotion?.id) {

            return;

        }


        try {

            setUpdating(
                promotion.id
            );


            const response =
                await api.patch(
                    `/admin/home-builder/promotion/${promotion.id}/visibility`
                );


            console.log(
                "HOMEPAGE VISIBILITY RESPONSE:",
                response.data
            );


            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ||
                    "Failed to update homepage visibility."
                );

            }


            /*
             * Update the specific row immediately rather than
             * reloading the entire page.
             */

            const updatedPromotion =
                response.data.promotion;


            setProducts(
                (currentProducts) =>
                    currentProducts.map(
                        (item) => {

                            if (
                                item.id !==
                                promotion.id
                            ) {

                                return item;

                            }


                            return {

                                ...item,

                                showOnHomepage:
                                    updatedPromotion
                                        ?.showOnHomepage ??
                                    !item.showOnHomepage

                            };

                        }
                    )
            );

        }

        catch (error) {

            console.error(
                "TOGGLE HOMEPAGE ERROR:",
                error.response?.data ||
                error.message ||
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to update homepage visibility."
            );

        }

        finally {

            setUpdating(null);

        }

    };


    /*
     * =====================================================
     * UPDATE HOMEPAGE ORDER
     * =====================================================
     */

    const updateOrder = async (
        id,
        homepageOrder
    ) => {

        const order =
            Number(homepageOrder);


        if (
            !Number.isInteger(order) ||
            order < 0
        ) {

            return;

        }


        try {

            setUpdating(id);


            const response =
                await api.patch(
                    `/admin/home-builder/promotion/${id}/order`,
                    {
                        homepageOrder: order
                    }
                );


            console.log(
                "UPDATE HOMEPAGE ORDER RESPONSE:",
                response.data
            );


            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ||
                    "Failed to update homepage order."
                );

            }


            setProducts(
                (currentProducts) =>
                    currentProducts.map(
                        (promotion) => {

                            if (
                                promotion.id !== id
                            ) {

                                return promotion;

                            }


                            return {

                                ...promotion,

                                homepageOrder:
                                    order

                            };

                        }
                    )
            );

        }

        catch (error) {

            console.error(
                "UPDATE ORDER ERROR:",
                error.response?.data ||
                error.message ||
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to update homepage order."
            );

        }

        finally {

            setUpdating(null);

        }

    };


    /*
     * =====================================================
     * LOADING
     * =====================================================
     */

    if (loading) {

        return (

            <div className="featured-products">

                <div className="section-header">

                    <h2>
                        ⭐ Featured Products
                    </h2>

                    <p>
                        Loading approved featured products...
                    </p>

                </div>

            </div>

        );

    }


    /*
     * =====================================================
     * ERROR
     * =====================================================
     */

    if (error && products.length === 0) {

        return (

            <div className="featured-products">

                <div className="section-header">

                    <h2>
                        ⭐ Featured Products
                    </h2>

                </div>


                <div className="no-products">

                    <h3>
                        {error}
                    </h3>


                    <button
                        type="button"
                        onClick={loadProducts}
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    /*
     * =====================================================
     * RENDER
     * =====================================================
     */

    return (

        <div className="featured-products">

            <div className="section-header">

                <div>

                    <h2>
                        ⭐ Featured Products
                    </h2>

                    <p>
                        Manage approved paid Featured
                        promotions and choose which ones
                        appear on the homepage.
                    </p>

                </div>

            </div>


            {error && (

                <div
                    className="admin-inline-error"
                    role="alert"
                >

                    {error}

                </div>

            )}


            {products.length === 0 ? (

                <div className="no-products">

                    <h3>
                        No approved featured products found.
                    </h3>

                    <p>
                        Paid and approved Featured
                        promotions will appear here.
                    </p>

                </div>

            ) : (

                <div className="featured-table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Image
                                </th>

                                <th>
                                    Product
                                </th>

                                <th>
                                    Seller
                                </th>

                                <th>
                                    Price
                                </th>

                                <th>
                                    Payment
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Show on Homepage
                                </th>

                                <th>
                                    Order
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {products.map(
                                (promotion) => {

                                    const product =
                                        promotion.product;


                                    const firstImage =
                                        Array.isArray(
                                            product?.images
                                        )
                                            ? product.images[0]
                                            : typeof product?.images ===
                                                "string"
                                                ? (() => {

                                                    try {

                                                        const parsed =
                                                            JSON.parse(
                                                                product.images
                                                            );

                                                        return Array.isArray(
                                                            parsed
                                                        )
                                                            ? parsed[0]
                                                            : product.images;

                                                    }

                                                    catch {

                                                        return product.images;

                                                    }

                                                })()
                                                : null;


                                    return (

                                        <tr
                                            key={
                                                promotion.id
                                            }
                                        >

                                            {/* IMAGE */}

                                            <td>

                                                <img
                                                    className="product-image"
                                                    src={
                                                        getImageUrl(
                                                            firstImage
                                                        )
                                                    }
                                                    alt={
                                                        product?.title ||
                                                        "Product"
                                                    }
                                                    onError={(
                                                        event
                                                    ) => {

                                                        event.currentTarget.src =
                                                            "/no-image.png";

                                                    }}
                                                />

                                            </td>


                                            {/* PRODUCT */}

                                            <td>

                                                <strong>
                                                    {
                                                        product?.title ||
                                                        "Unknown Product"
                                                    }
                                                </strong>

                                            </td>


                                            {/* SELLER */}

                                            <td>

                                                {
                                                    promotion.seller?.name ||
                                                    "Unknown Seller"
                                                }

                                            </td>


                                            {/* PRICE */}

                                            <td>

                                                GH₵{" "}

                                                {
                                                    Number(
                                                        product?.price || 0
                                                    ).toLocaleString(
                                                        "en-GH",
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }
                                                    )
                                                }

                                            </td>


                                            {/* PAYMENT */}

                                            <td>

                                                <span className="status-paid">

                                                    {
                                                        promotion.paymentStatus ||
                                                        "PAID"
                                                    }

                                                </span>

                                            </td>


                                            {/* APPROVAL */}

                                            <td>

                                                <span className="status-approved">

                                                    {
                                                        promotion.status ||
                                                        "APPROVED"
                                                    }

                                                </span>

                                            </td>


                                            {/* HOMEPAGE CHECKBOX */}

                                            <td>

                                                <label
                                                    className="homepage-toggle"
                                                >

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            Boolean(
                                                                promotion.showOnHomepage
                                                            )
                                                        }
                                                        disabled={
                                                            updating ===
                                                            promotion.id
                                                        }
                                                        onChange={() =>
                                                            toggleHomepage(
                                                                promotion
                                                            )
                                                        }
                                                    />

                                                    <span>
                                                        {
                                                            promotion.showOnHomepage
                                                                ? "Visible"
                                                                : "Hidden"
                                                        }
                                                    </span>

                                                </label>

                                            </td>


                                            {/* HOMEPAGE ORDER */}

                                            <td>

                                                <input
                                                    className="order-input"
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        promotion.homepageOrder ??
                                                        0
                                                    }
                                                    disabled={
                                                        updating ===
                                                        promotion.id
                                                    }
                                                    onChange={(event) =>
                                                        updateOrder(
                                                            promotion.id,
                                                            event.target.value
                                                        )
                                                    }
                                                />

                                            </td>

                                        </tr>

                                    );

                                }
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}

export default FeaturedProducts;
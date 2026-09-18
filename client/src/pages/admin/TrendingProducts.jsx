import { useEffect, useState } from "react";
import api from "../../config/axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "";

function TrendingProducts() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);


    // ==========================
    // LOAD TRENDING PRODUCTS
    // ==========================

    const loadProducts = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/admin/home-builder/trending"
            );

            console.log(
                "TRENDING PRODUCTS RESPONSE:",
                response.data
            );

            const data =
                response.data?.products ||
                response.data?.promotions ||
                response.data?.data ||
                response.data ||
                [];

            setProducts(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "LOAD TRENDING PRODUCTS ERROR:",
                error
            );

            setProducts([]);

        } finally {

            setLoading(false);

        }

    };


    // ==========================
    // IMAGE HELPERS
    // ==========================

    const getImages = (product) => {

        if (!product?.images) return [];

        if (Array.isArray(product.images)) {
            return product.images;
        }

        try {

            const parsed =
                JSON.parse(product.images);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch {

            return [];

        }

    };


    const getImageUrl = (image) => {

        if (!image) return "";

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        if (image.startsWith("/uploads/")) {
            return `${API_BASE_URL}${image}`;
        }

        return `${API_BASE_URL}/uploads/${image}`;

    };


    // ==========================
    // TOGGLE VISIBILITY
    // ==========================

    const toggleHomepage = async (id) => {

        try {

            setUpdating(id);

            await api.patch(
                `/admin/home-builder/promotion/${id}/visibility`,
                {}
            );

            await loadProducts();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Unable to update product."
            );

        } finally {

            setUpdating(null);

        }

    };


    // ==========================
    // UPDATE ORDER
    // ==========================

    const updateOrder = async (
        id,
        homepageOrder
    ) => {

        const order = Number(homepageOrder);

        if (Number.isNaN(order)) return;

        try {

            setUpdating(id);

            await api.patch(
                `/admin/home-builder/promotion/${id}/order`,
                {
                    homepageOrder: order
                }
            );

        } catch (error) {

            console.error(error);

            alert(
                "Unable to update order."
            );

            loadProducts();

        } finally {

            setUpdating(null);

        }

    };


    if (loading) {

        return (
            <div className="trending-products">
                <h2>Loading Trending Products...</h2>
            </div>
        );

    }


    return (

        <div className="trending-products">

            <div className="featured-header">

                <div>

                    <h2>
                        ⚡ Trending Products
                    </h2>

                    <p>
                        Manage trending products
                        displayed on the homepage.
                    </p>

                </div>

            </div>


            <div className="featured-table-container">

                <table>

                    <thead>

                        <tr>

                            <th>Image</th>
                            <th>Product</th>
                            <th>Seller</th>
                            <th>Price</th>
                            <th>Homepage</th>
                            <th>Order</th>

                        </tr>

                    </thead>


                    <tbody>

                        {products.length === 0 ? (

                            <tr>

                                <td colSpan="6">

                                    No trending products found.

                                </td>

                            </tr>

                        ) : (

                            products.map((promotion) => {

                                const product =
                                    promotion.product || {};

                                const seller =
                                    promotion.seller ||
                                    product.seller ||
                                    {};

                                const images =
                                    getImages(product);

                                const imageUrl =
                                    images.length
                                        ? getImageUrl(images[0])
                                        : "";

                                return (

                                    <tr
                                        key={promotion.id}
                                    >

                                        <td>

                                            {imageUrl ? (

                                                <img
                                                    className="product-image"
                                                    src={imageUrl}
                                                    alt={product.title}
                                                />

                                            ) : (

                                                "No Image"

                                            )}

                                        </td>


                                        <td>

                                            {product.title ||
                                                "Unknown Product"}

                                        </td>


                                        <td>

                                            {seller.name ||
                                                "Unknown Seller"}

                                        </td>


                                        <td>

                                            GH₵{" "}

                                            {Number(
                                                product.price || 0
                                            ).toFixed(2)}

                                        </td>


                                        <td>

                                            <input
                                                type="checkbox"
                                                checked={Boolean(
                                                    promotion.showOnHomepage
                                                )}
                                                disabled={
                                                    updating ===
                                                    promotion.id
                                                }
                                                onChange={() =>
                                                    toggleHomepage(
                                                        promotion.id
                                                    )
                                                }
                                            />

                                        </td>


                                        <td>

                                            <input
                                                type="number"
                                                className="order-input"
                                                value={
                                                    promotion.homepageOrder ??
                                                    0
                                                }
                                                disabled={
                                                    updating ===
                                                    promotion.id
                                                }
                                                onBlur={(e) =>
                                                    updateOrder(
                                                        promotion.id,
                                                        e.target.value
                                                    )
                                                }
                                                onChange={(e) => {

                                                    const value =
                                                        e.target.value;

                                                    setProducts(
                                                        (previous) =>
                                                            previous.map(
                                                                (item) =>
                                                                    item.id ===
                                                                    promotion.id
                                                                        ? {
                                                                            ...item,
                                                                            homepageOrder: value
                                                                        }
                                                                        : item
                                                            )
                                                    );

                                                }}
                                            />

                                        </td>

                                    </tr>

                                );

                            })

                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default TrendingProducts;
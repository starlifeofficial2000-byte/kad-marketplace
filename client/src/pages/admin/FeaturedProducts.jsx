import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./FeaturedProducts.css";

function FeaturedProducts() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);


    const loadProducts = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/admin/home-builder/featured"
            );

            console.log(
                "FEATURED PRODUCTS RESPONSE:",
                response.data
            );

            setProducts(
                response.data.products || []
            );

        }

        catch (error) {

            console.error(
                "LOAD FEATURED PRODUCTS ERROR:",
                error
            );

            setProducts([]);

        }

        finally {

            setLoading(false);

        }

    };


    const toggleHomepage = async (id) => {

        try {

            setUpdating(id);

            await api.patch(
                `/admin/home-builder/promotion/${id}/visibility`
            );

            await loadProducts();

        }

        catch (error) {

            console.error(
                "TOGGLE ERROR:",
                error
            );

        }

        finally {

            setUpdating(null);

        }

    };


    const updateOrder = async (id, homepageOrder) => {

        try {

            setUpdating(id);

            await api.patch(

                `/admin/home-builder/promotion/${id}/order`,

                {
                    homepageOrder: Number(homepageOrder)
                }

            );

        }

        catch (error) {

            console.error(
                "UPDATE ORDER ERROR:",
                error
            );

        }

        finally {

            setUpdating(null);

        }

    };


    if (loading) {

        return <h2>Loading Featured Products...</h2>;

    }


    return (

        <div className="featured-products">

            <h2>
                ⭐ Featured Products
            </h2>


            {products.length === 0 ? (

                <p>No featured products found.</p>

            ) : (

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

                        {products.map((promotion) => (

                            <tr key={promotion.id}>

                                <td>

                                    <img

                                        className="product-image"

                                        src={
                                            promotion.product?.images?.length > 0

                                                ? `/uploads/${promotion.product.images[0]}`

                                                : "/no-image.png"
                                        }

                                        alt={
                                            promotion.product?.title ||
                                            "Product"
                                        }

                                    />

                                </td>


                                <td>

                                    {promotion.product?.title}

                                </td>


                                <td>

                                    {promotion.seller?.name ||
                                        "Unknown Seller"}

                                </td>


                                <td>

                                    GH₵ {promotion.product?.price}

                                </td>


                                <td>

                                    <input

                                        type="checkbox"

                                        checked={
                                            Boolean(
                                                promotion.showOnHomepage
                                            )
                                        }

                                        disabled={
                                            updating === promotion.id
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

                                        className="order-input"

                                        type="number"

                                        value={
                                            promotion.homepageOrder || 0
                                        }

                                        disabled={
                                            updating === promotion.id
                                        }

                                        onChange={(e) =>
                                            updateOrder(

                                                promotion.id,

                                                e.target.value

                                            )
                                        }

                                    />

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            )}

        </div>

    );

}

export default FeaturedProducts;
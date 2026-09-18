import { useEffect, useState } from "react";
import api from "../../config/axios";
import ProductCard from "../ProductCard";
import "./FeaturedProducts.css";

function FeaturedProducts() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        loadProducts();

    }, []);


    const loadProducts = async () => {

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


            const promotions =
                response.data?.products || [];


            const productsData =
                promotions
                    .map((promotion) => {

                        return {
                            ...promotion.product,

                            promotionId: promotion.id,

                            homepageOrder:
                                promotion.homepageOrder

                        };

                    })
                    .filter(Boolean);


            setProducts(productsData);

        }

        catch (error) {

            console.error(
                "FEATURED PRODUCT LOAD ERROR:",
                error.response?.data || error.message
            );

            setError(
                "Failed to load featured products."
            );

        }

        finally {

            setLoading(false);

        }

    };


    if (loading) {

        return (

            <section className="featured-products">

                <h2>
                    Loading featured products...
                </h2>

            </section>

        );

    }


    if (error) {

        return (

            <section className="featured-products">

                <h2>
                    {error}
                </h2>

            </section>

        );

    }


    return (

        <section className="featured-products">

            <div className="section-header">

                <div>

                    <h2>
                        Featured Products
                    </h2>

                    <p>
                        Discover amazing featured products
                        from trusted sellers.
                    </p>

                </div>

            </div>


            {

                products.length === 0

                    ?

                    <div className="no-products">

                        <h3>
                            No featured products available yet.
                        </h3>

                    </div>

                    :

                    <div className="products-grid">

                        {

                            products.map((product) => (

                                <ProductCard
                                    key={
                                        product.id ||
                                        product._id
                                    }
                                    product={product}
                                />

                            ))

                        }

                    </div>

            }

        </section>

    );

}

export default FeaturedProducts;
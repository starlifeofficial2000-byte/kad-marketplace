import { useEffect, useState } from "react";
import api from "../config/axios";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import "./Featured.css";

function Featured() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadProducts();

    }, []);

    const loadProducts = async () => {

        try {
const response = await api.get(
    "/settings"
);

            setProducts(res.data.products || []);

        }

        catch (error) {

            console.log(error);

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <Layout>

            <section className="featured-page-hero">

                <div className="featured-overlay">

                    <h1>⭐ Featured Products</h1>

                    <p>

                        Discover premium products selected to stand out on KAD Marketplace.

                    </p>

                </div>

            </section>

            <section className="featured-page">

                {

                    loading ?

                    (

                        <h2 className="loading">

                            Loading featured products...

                        </h2>

                    )

                    :

                    products.length === 0 ?

                    (

                        <div className="empty">

                            <h2>No featured products available.</h2>

                        </div>

                    )

                    :

                    (

                        <div className="featured-grid">

                            {

                                products.map((product) => (

                                    <ProductCard

                                        key={product.id}

                                        product={product}

                                    />

                                ))

                            }

                        </div>

                    )

                }

            </section>

        </Layout>

    );

}

export default Featured;
import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./FeaturedStores.css";

function FeaturedStores() {

    const [stores, setStores] = useState([]);

    useEffect(() => {

        loadStores();

    }, []);

    const loadStores = async () => {

        try {

            const res = await api.get(
                "/store/featured"
            );

            setStores(
                res.data.stores || res.data || []
            );

        }

        catch (error) {

            console.error(
                "Featured stores error:",
                error
            );

            setStores([]);

        }

    };

    return (

        <section className="featured-stores">

            <div className="featured-header">

                <h2>👑 Featured Stores</h2>

                <p>
                    Meet Ghana's best sellers
                </p>

            </div>

            <div className="stores-grid">

                {

                    stores.map(store => (

                        <div
                            className="store-card"
                            key={store.id}
                        >

                            <img

                                src={
                                    store.logo

                                        ? `/uploads/store/${store.logo}`

                                        : "https://via.placeholder.com/100"
                                }

                                alt={store.storeName || "Store"}

                                className="store-logo"

                            />

                            <h3>
                                {store.storeName}
                            </h3>

                            <p>

                                {
                                    store.subscription?.plan ||
                                    "Basic"
                                }

                            </p>

                            <p>
                                ⭐ {store.rating || 0}
                            </p>

                            <p>
                                👥 {store.followers || 0} Followers
                            </p>

                            <button>
                                Visit Store
                            </button>

                        </div>

                    ))

                }

            </div>

        </section>

    );

}

export default FeaturedStores;
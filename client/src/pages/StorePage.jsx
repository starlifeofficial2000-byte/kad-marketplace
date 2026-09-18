import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../config/axios";
import "./StorePage.css";

const SERVER_URL = "";

function StorePage() {

    const { storeSlug } = useParams();

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [following, setFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);


    /* ==========================================
       LOAD STORE
    ========================================== */

    useEffect(() => {

        const loadStore = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await api.get(
                    `/store/${encodeURIComponent(storeSlug)}`
                );


                console.log(
                    "STORE RESPONSE:",
                    response.data
                );


                if (!response.data?.success) {

                    throw new Error(
                        response.data?.message ||
                        "Store not found."
                    );

                }


                const storeData =
                    response.data.store;


                setStore(storeData);


                if (
                    Array.isArray(response.data.products)
                ) {

                    setProducts(
                        response.data.products
                    );

                }

                else if (
                    Array.isArray(storeData?.products)
                ) {

                    setProducts(
                        storeData.products
                    );

                }

                else {

                    setProducts([]);

                }


                if (
                    response.data.following !== undefined
                ) {

                    setFollowing(
                        response.data.following
                    );

                }

            }

            catch (error) {

                console.error(
                    "STORE LOAD ERROR:",
                    error.response?.data ||
                    error.message
                );


                setError(

                    error.response?.data?.message ||

                    error.message ||

                    "Unable to load this store."

                );

            }

            finally {

                setLoading(false);

            }

        };


        if (storeSlug) {

            loadStore();

        }

        else {

            setLoading(false);

            setError("Invalid store.");

        }

    }, [storeSlug]);


    /* ==========================================
       FOLLOW / UNFOLLOW STORE
    ========================================== */

    const handleFollow = async () => {

        const token =
            localStorage.getItem("token");


        if (!token) {

            alert(
                "Please login to follow this store."
            );

            return;

        }


        if (!store?.id) return;


        try {

            setFollowLoading(true);


            if (following) {

                await api.delete(

                    `/store/follow/${store.id}`

                );


                setFollowing(false);


                setStore((previous) => ({

                    ...previous,

                    followers: Math.max(

                        0,

                        Number(
                            previous.followers || 0
                        ) - 1

                    )

                }));

            }

            else {

                await api.post(

                    `/store/follow/${store.id}`

                );


                setFollowing(true);


                setStore((previous) => ({

                    ...previous,

                    followers:

                        Number(
                            previous.followers || 0
                        ) + 1

                }));

            }

        }

        catch (error) {

            console.error(

                "FOLLOW ERROR:",

                error.response?.data ||
                error.message

            );


            alert(

                error.response?.data?.message ||

                "Unable to update follow status."

            );

        }

        finally {

            setFollowLoading(false);

        }

    };


    /* ==========================================
       IMAGE URL HELPER
    ========================================== */

    const getImageUrl = (image) => {

        if (!image) {

            return null;

        }


        if (

            image.startsWith("http://") ||

            image.startsWith("https://")

        ) {

            return image;

        }


        const cleanImage =
            image.replace(/^\/+/, "");


        return `${SERVER_URL}/${cleanImage}`;

    };


    /* ==========================================
       PRODUCT IMAGE HELPER
    ========================================== */

    const getProductImage = (product) => {

        let images = [];


        if (

            Array.isArray(product.images)

        ) {

            images = product.images;

        }

        else if (

            typeof product.images === "string"

        ) {

            try {

                const parsed =
                    JSON.parse(product.images);


                images =

                    Array.isArray(parsed)

                        ? parsed

                        : [parsed];

            }

            catch {

                images = [

                    product.images

                ];

            }

        }


        if (images.length > 0) {

            const image =
                images[0];


            if (

                image.startsWith("http://") ||

                image.startsWith("https://")

            ) {

                return image;

            }


            const cleanImage =
                image.replace(/^\/+/, "");


            if (
                cleanImage.startsWith("uploads/")
            ) {

                return `${SERVER_URL}/${cleanImage}`;

            }


            return `${SERVER_URL}/uploads/${cleanImage}`;

        }


        return "https://via.placeholder.com/600x450?text=No+Image";

    };


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="store-page-state">

                <div className="store-loader"></div>

                <h2>
                    Loading Store...
                </h2>

                <p>
                    Please wait while we load the store.
                </p>

            </div>

        );

    }


    /* ==========================================
       ERROR
    ========================================== */

    if (error || !store) {

        return (

            <div className="store-page-state error-state">

                <div className="error-icon">

                    🏪

                </div>


                <h2>
                    Store Not Found
                </h2>


                <p>

                    {

                        error ||

                        "The store you are looking for does not exist."

                    }

                </p>


                <Link

                    to="/"

                    className="back-home-btn"

                >

                    ← Back to Marketplace

                </Link>

            </div>

        );

    }


    /* ==========================================
       STORE IMAGES
    ========================================== */

    const bannerUrl =
        getImageUrl(store.banner);

    const logoUrl =
        getImageUrl(store.logo);


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="store-page">


            {/* STORE HERO */}

            <section className="store-hero">


                <div className="store-banner">

                    {

                        bannerUrl

                            ?

                            <img

                                src={bannerUrl}

                                alt={`${store.storeName} banner`}

                            />

                            :

                            <div

                                className="default-banner"

                                style={{

                                    background:

                                        store.coverColor ||

                                        "#2563eb"

                                }}

                            >

                                <span>
                                    🏪
                                </span>

                            </div>

                    }

                </div>


                <div className="store-profile-container">


                    {/* LOGO */}

                    <div className="store-logo">

                        {

                            logoUrl

                                ?

                                <img

                                    src={logoUrl}

                                    alt={store.storeName}

                                />

                                :

                                <div className="default-logo">

                                    {

                                        store.storeName

                                            ?.charAt(0)

                                            ?.toUpperCase()

                                    }

                                </div>

                        }

                    </div>


                    {/* STORE INFORMATION */}

                    <div className="store-main-info">


                        <div className="store-title-row">

                            <h1>

                                {store.storeName}

                            </h1>


                            {

                                store.verified && (

                                    <span

                                        className="verified-badge"

                                        title="Verified Store"

                                    >

                                        ✓ Verified

                                    </span>

                                )

                            }

                        </div>


                        {

                            store.businessCategory && (

                                <div className="business-category">

                                    {store.businessCategory}

                                </div>

                            )

                        }


                        <div className="store-meta">


                            <span>

                                ⭐ {

                                    Number(
                                        store.rating || 0
                                    ).toFixed(1)

                                } Rating

                            </span>


                            <span>

                                👥 {

                                    Number(
                                        store.followers || 0
                                    ).toLocaleString()

                                } Followers

                            </span>


                            <span>

                                📦 {

                                    Number(

                                        store.totalProducts ||

                                        products.length ||

                                        0

                                    ).toLocaleString()

                                } Products

                            </span>


                        </div>

                    </div>


                    {/* FOLLOW BUTTON */}

                    <div className="store-actions">

                        <button

                            onClick={handleFollow}

                            disabled={followLoading}

                            className={

                                following

                                    ?

                                    "following-btn"

                                    :

                                    "follow-btn"

                            }

                        >

                            {

                                followLoading

                                    ?

                                    "Please wait..."

                                    :

                                    following

                                        ?

                                        "✓ Following"

                                        :

                                        "+ Follow Store"

                            }

                        </button>

                    </div>


                </div>

            </section>


            {/* MAIN CONTENT */}

            <div className="store-content">


                {/* LEFT SIDE */}

                <main className="store-main">


                    {/* ABOUT */}

                    <section className="store-section">

                        <h2>
                            About This Store
                        </h2>


                        <p className="store-description">

                            {

                                store.description ||

                                "This store has not added a description yet."

                            }

                        </p>

                    </section>


                    {/* PRODUCTS */}

                    <section className="store-section">


                        <div className="section-header">

                            <div>

                                <h2>
                                    Store Products
                                </h2>

                                <p>
                                    Browse products available from this store.
                                </p>

                            </div>


                            <span className="product-count">

                                {products.length} Products

                            </span>

                        </div>


                        {

                            products.length === 0

                                ?

                                <div className="empty-products">

                                    <div>
                                        📦
                                    </div>

                                    <h3>
                                        No Products Yet
                                    </h3>

                                    <p>
                                        This store has not listed any products yet.
                                    </p>

                                </div>

                                :

                                <div className="store-products-grid">

                                    {

                                        products.map((product) => (

                                            <Link

                                                key={product.id}

                                                to={`/product/${product.id}`}

                                                className="store-product-card"

                                            >


                                                <div className="store-product-image">

                                                    <img

                                                        src={
                                                            getProductImage(product)
                                                        }

                                                        alt={product.title}

                                                        onError={(e) => {

                                                            e.currentTarget.src =
                                                                "https://via.placeholder.com/600x450?text=No+Image";

                                                        }}

                                                    />


                                                    {

                                                        product.featured && (

                                                            <span className="product-featured">

                                                                ⭐ Featured

                                                            </span>

                                                        )

                                                    }

                                                </div>


                                                <div className="store-product-info">

                                                    <h3>

                                                        {product.title}

                                                    </h3>


                                                    <strong>

                                                        GH₵ {

                                                            Number(

                                                                product.price || 0

                                                            ).toLocaleString()

                                                        }

                                                    </strong>


                                                    <p>

                                                        📍 {

                                                            product.city ||

                                                            store.city ||

                                                            "Ghana"

                                                        }

                                                    </p>

                                                </div>


                                            </Link>

                                        ))

                                    }

                                </div>

                        }

                    </section>

                </main>


                {/* SIDEBAR */}

                <aside className="store-sidebar">


                    {/* CONTACT */}

                    <div className="sidebar-card">

                        <h3>
                            Contact Information
                        </h3>


                        {

                            store.phone && (

                                <a

                                    href={`tel:${store.phone}`}

                                    className="contact-item"

                                >

                                    📞

                                    <span>
                                        {store.phone}
                                    </span>

                                </a>

                            )

                        }


                        {

                            store.email && (

                                <a

                                    href={`mailto:${store.email}`}

                                    className="contact-item"

                                >

                                    ✉️

                                    <span>
                                        {store.email}
                                    </span>

                                </a>

                            )

                        }


                        {

                            store.website && (

                                <a

                                    href={

                                        store.website.startsWith("http")

                                            ?

                                            store.website

                                            :

                                            `https://${store.website}`

                                    }

                                    target="_blank"

                                    rel="noreferrer"

                                    className="contact-item"

                                >

                                    🌐

                                    <span>
                                        Visit Website
                                    </span>

                                </a>

                            )

                        }


                        {

                            !store.phone &&

                            !store.email &&

                            !store.website && (

                                <p className="no-info">

                                    No contact information available.

                                </p>

                            )

                        }

                    </div>


                    {/* LOCATION */}

                    <div className="sidebar-card">

                        <h3>
                            Store Location
                        </h3>


                        <div className="location-info">

                            📍

                            <div>


                                {

                                    store.city && (

                                        <strong>

                                            {store.city}

                                        </strong>

                                    )

                                }


                                {

                                    store.region && (

                                        <p>

                                            {store.region}, Ghana

                                        </p>

                                    )

                                }


                                {

                                    store.address && (

                                        <p>

                                            {store.address}

                                        </p>

                                    )

                                }


                            </div>

                        </div>

                    </div>


                    {/* BUSINESS HOURS */}

                    {

                        store.businessHours && (

                            <div className="sidebar-card">

                                <h3>
                                    Business Hours
                                </h3>

                                <p>

                                    🕒 {store.businessHours}

                                </p>

                            </div>

                        )

                    }


                    {/* SOCIAL MEDIA */}

                    {

                        (

                            store.facebook ||

                            store.instagram ||

                            store.tiktok ||

                            store.x ||

                            store.whatsapp

                        ) && (

                            <div className="sidebar-card">

                                <h3>
                                    Follow Us
                                </h3>


                                <div className="social-links">


                                    {

                                        store.facebook && (

                                            <a

                                                href={store.facebook}

                                                target="_blank"

                                                rel="noreferrer"

                                            >

                                                Facebook

                                            </a>

                                        )

                                    }


                                    {

                                        store.instagram && (

                                            <a

                                                href={store.instagram}

                                                target="_blank"

                                                rel="noreferrer"

                                            >

                                                Instagram

                                            </a>

                                        )

                                    }


                                    {

                                        store.tiktok && (

                                            <a

                                                href={store.tiktok}

                                                target="_blank"

                                                rel="noreferrer"

                                            >

                                                TikTok

                                            </a>

                                        )

                                    }


                                    {

                                        store.x && (

                                            <a

                                                href={store.x}

                                                target="_blank"

                                                rel="noreferrer"

                                            >

                                                X / Twitter

                                            </a>

                                        )

                                    }


                                    {

                                        store.whatsapp && (

                                            <a

                                                href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}

                                                target="_blank"

                                                rel="noreferrer"

                                            >

                                                WhatsApp

                                            </a>

                                        )

                                    }


                                </div>

                            </div>

                        )

                    }


                </aside>


            </div>


        </div>

    );

}

export default StorePage;
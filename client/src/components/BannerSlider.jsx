import { useEffect, useState } from "react";
import api from "../config/axios";
import { Link } from "react-router-dom";

import getImageUrl from "../utils/imageUrl";

import "./BannerSlider.css";

function BannerSlider() {

    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);


    /* ==========================================
       LOAD APPROVED BANNERS
    ========================================== */

    useEffect(() => {

        fetchBanners();

    }, []);


    const fetchBanners = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/advertisements/approved"
            );

            if (
                response.data?.success &&
                Array.isArray(
                    response.data?.advertisements
                )
            ) {

                setBanners(
                    response.data.advertisements
                );

            } else {

                setBanners([]);

            }

        }

        catch (error) {

            console.error(
                "BANNER LOAD ERROR:",
                error.response?.data ||
                error.message ||
                error
            );

            setBanners([]);

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       AUTO SLIDER
    ========================================== */

    useEffect(() => {

        if (banners.length <= 1) {
            return;
        }

        const interval = setInterval(() => {

            setCurrentSlide((previous) =>
                previous >= banners.length - 1
                    ? 0
                    : previous + 1
            );

        }, 5000);


        return () => {
            clearInterval(interval);
        };

    }, [banners.length]);


    /* ==========================================
       KEEP CURRENT SLIDE VALID
    ========================================== */

    useEffect(() => {

        if (
            currentSlide >= banners.length &&
            banners.length > 0
        ) {

            setCurrentSlide(0);

        }

    }, [
        banners.length,
        currentSlide
    ]);


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="banner-loading">

                Loading advertisements...

            </div>

        );

    }


    /* ==========================================
       NO BANNERS
    ========================================== */

    if (!banners.length) {

        return null;

    }


    /* ==========================================
       CURRENT BANNER
    ========================================== */

    const banner =
        banners[currentSlide];
console.log("BANNER DATA:", banner);
console.log("BANNER IMAGE:", banner?.image);
console.log(
    "BANNER IMAGE URL:",
    getImageUrl(banner?.image)
);

    /* ==========================================
       BANNER IMAGE URL
    ========================================== */

    const imageUrl =
        getImageUrl(
            banner?.image
        );


    /* ==========================================
       IMAGE ERROR HANDLER
    ========================================== */

    const handleImageError = (event) => {

        const image =
            event.currentTarget;

        /*
         * Prevent an infinite fallback loop.
         */

        if (
            image.dataset.fallbackApplied ===
            "true"
        ) {

            return;

        }

        image.dataset.fallbackApplied =
            "true";

        image.src =
            "/images/product-placeholder.png";

    };


    /* ==========================================
       PREVIOUS SLIDE
    ========================================== */

    const previousSlide = () => {

        setCurrentSlide((previous) =>
            previous === 0
                ? banners.length - 1
                : previous - 1
        );

    };


    /* ==========================================
       NEXT SLIDE
    ========================================== */

    const nextSlide = () => {

        setCurrentSlide((previous) =>
            previous >= banners.length - 1
                ? 0
                : previous + 1
        );

    };


    /* ==========================================
       BANNER LINK
    ========================================== */

    const getBannerLink = () => {

        if (
            !banner?.link ||
            banner.link === "#"
        ) {

            return null;

        }

        return banner.link;

    };


    const bannerLink =
        getBannerLink();


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <section className="banner-slider">

            <div className="banner-container">


                {/* =================================
                    BANNER IMAGE
                ================================= */}

                <img
                    src={imageUrl}
                    alt={
                        banner?.title ||
                        "Advertisement"
                    }
                    className="banner-image"
                    loading="eager"
                    decoding="async"
                    onError={handleImageError}
                />


                {/* =================================
                    OVERLAY
                ================================= */}

                <div className="banner-overlay">

                    <div className="banner-content">


                        {/* =============================
                            SUBTITLE
                        ============================= */}

                        {banner?.subtitle && (

                            <span className="banner-subtitle">

                                {banner.subtitle}

                            </span>

                        )}


                        {/* =============================
                            TITLE
                        ============================= */}

                        {banner?.title && (

                            <h2>

                                {banner.title}

                            </h2>

                        )}


                        {/* =============================
                            DESCRIPTION
                        ============================= */}

                        {banner?.description && (

                            <p>

                                {banner.description}

                            </p>

                        )}


                        {/* =============================
                            BUTTON
                        ============================= */}

                        {bannerLink && (

                            <Link
                                to={bannerLink}
                                className="banner-button"
                            >

                                {banner?.buttonText ||
                                    "Shop Now"}

                            </Link>

                        )}

                    </div>

                </div>


                {/* =================================
                    SLIDER CONTROLS
                ================================= */}

                {banners.length > 1 && (

                    <>

                        {/* PREVIOUS */}

                        <button
                            className="banner-arrow left"
                            onClick={previousSlide}
                            type="button"
                            aria-label="Previous banner"
                        >
                            ❮
                        </button>


                        {/* NEXT */}

                        <button
                            className="banner-arrow right"
                            onClick={nextSlide}
                            type="button"
                            aria-label="Next banner"
                        >
                            ❯
                        </button>


                        {/* DOTS */}

                        <div className="banner-dots">

                            {banners.map(
                                (item, index) => (

                                    <button
                                        key={
                                            item.id ||
                                            item._id ||
                                            index
                                        }
                                        type="button"
                                        className={
                                            index ===
                                            currentSlide
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setCurrentSlide(
                                                index
                                            )
                                        }
                                        aria-label={
                                            `Go to slide ${
                                                index + 1
                                            }`
                                        }
                                    />

                                )
                            )}

                        </div>

                    </>

                )}

            </div>

        </section>

    );

}

export default BannerSlider;
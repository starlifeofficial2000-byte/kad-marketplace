import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../config/axios";
import getImageUrl from "../utils/imageUrl";
import "./BannerSlider.css";

function BannerSlider() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    /*
     * ============================================================
     * LOAD PUBLIC HOMEPAGE BANNERS
     * ============================================================
     *
     * IMPORTANT:
     * We use the new Home Builder public endpoint.
     *
     * DO NOT use:
     * /advertisements/approved
     *
     * The new system is:
     * /home-builder/banners
     */
    const fetchBanners = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                "/home-builder/banners"
            );

            console.log(
                "HOMEPAGE BANNERS RESPONSE:",
                response.data
            );

            if (
                response.data?.success &&
                Array.isArray(response.data?.banners)
            ) {
                setBanners(response.data.banners);
                setCurrentSlide(0);
            } else {
                setBanners([]);
            }
        } catch (error) {
            console.error(
                "HOMEPAGE BANNER LOAD ERROR:",
                error.response?.data ||
                    error.message ||
                    error
            );

            setBanners([]);
        } finally {
            setLoading(false);
        }
    };

    /*
     * ============================================================
     * INITIAL LOAD
     * ============================================================
     */
    useEffect(() => {
        fetchBanners();
    }, []);

    /*
     * ============================================================
     * AUTO SLIDE
     * ============================================================
     *
     * Changes banner every 5 seconds.
     */
    useEffect(() => {
        if (banners.length <= 1) {
            return;
        }

        const interval = setInterval(() => {
            setCurrentSlide((previous) => {
                if (previous >= banners.length - 1) {
                    return 0;
                }

                return previous + 1;
            });
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [banners.length]);

    /*
     * ============================================================
     * KEEP CURRENT SLIDE VALID
     * ============================================================
     */
    useEffect(() => {
        if (
            banners.length > 0 &&
            currentSlide >= banners.length
        ) {
            setCurrentSlide(0);
        }
    }, [banners.length, currentSlide]);

    /*
     * ============================================================
     * LOADING STATE
     * ============================================================
     */
    if (loading) {
        return (
            <section className="banner-slider">
                <div className="banner-container">
                    <div className="banner-loading">
                        Loading advertisements...
                    </div>
                </div>
            </section>
        );
    }

    /*
     * ============================================================
     * NO BANNERS
     * ============================================================
     */
    if (!banners.length) {
        return null;
    }

    /*
     * ============================================================
     * CURRENT BANNER
     * ============================================================
     */
    const banner = banners[currentSlide];

    /*
     * ============================================================
     * R2 IMAGE URL
     * ============================================================
     *
     * New Home Builder backend returns:
     *
     * banner.imageUrl
     *
     * But we also support:
     *
     * banner.image
     *
     * This makes the component compatible with old records too.
     */
    const imageSource =
        banner?.imageUrl ||
        banner?.image ||
        "";

    const imageUrl = getImageUrl(imageSource);

    console.log(
        "CURRENT BANNER:",
        banner
    );

    console.log(
        "BANNER IMAGE SOURCE:",
        imageSource
    );

    console.log(
        "BANNER IMAGE URL:",
        imageUrl
    );

    /*
     * ============================================================
     * IMAGE ERROR HANDLER
     * ============================================================
     */
    const handleImageError = (event) => {
        const image = event.currentTarget;

        /*
         * Prevent an infinite image-error loop.
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

    /*
     * ============================================================
     * PREVIOUS SLIDE
     * ============================================================
     */
    const previousSlide = () => {
        setCurrentSlide((previous) => {
            if (previous === 0) {
                return banners.length - 1;
            }

            return previous - 1;
        });
    };

    /*
     * ============================================================
     * NEXT SLIDE
     * ============================================================
     */
    const nextSlide = () => {
        setCurrentSlide((previous) => {
            if (
                previous >=
                banners.length - 1
            ) {
                return 0;
            }

            return previous + 1;
        });
    };

    /*
     * ============================================================
     * BANNER LINK
     * ============================================================
     */
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

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */
    return (
        <section className="banner-slider">
            <div className="banner-container">

                {/* =================================================
                    BANNER IMAGE
                ================================================= */}
                <img
                    src={imageUrl}
                    alt={
                        banner?.title ||
                        "Advertisement"
                    }
                    className="banner-image"
                    loading="eager"
                    decoding="async"
                    onError={
                        handleImageError
                    }
                />

                {/* =================================================
                    OVERLAY
                ================================================= */}
                <div className="banner-overlay">
                    <div className="banner-content">

                        {/* =================================================
                            SUBTITLE
                        ================================================= */}
                        {banner?.subtitle && (
                            <span className="banner-subtitle">
                                {banner.subtitle}
                            </span>
                        )}

                        {/* =================================================
                            TITLE
                        ================================================= */}
                        {banner?.title && (
                            <h2>
                                {banner.title}
                            </h2>
                        )}

                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}
                        {banner?.description && (
                            <p>
                                {
                                    banner.description
                                }
                            </p>
                        )}

                        {/* =================================================
                            BUTTON
                        ================================================= */}
                        {bannerLink && (
                            <Link
                                to={bannerLink}
                                className="banner-button"
                            >
                                {
                                    banner?.buttonText ||
                                    "Shop Now"
                                }
                            </Link>
                        )}
                    </div>
                </div>

                {/* =================================================
                    SLIDER CONTROLS
                ================================================= */}
                {banners.length > 1 && (
                    <>
                        {/* =================================================
                            PREVIOUS BUTTON
                        ================================================= */}
                        <button
                            className="banner-arrow left"
                            onClick={
                                previousSlide
                            }
                            type="button"
                            aria-label="Previous banner"
                        >
                            ❮
                        </button>

                        {/* =================================================
                            NEXT BUTTON
                        ================================================= */}
                        <button
                            className="banner-arrow right"
                            onClick={
                                nextSlide
                            }
                            type="button"
                            aria-label="Next banner"
                        >
                            ❯
                        </button>

                        {/* =================================================
                            SLIDE DOTS
                        ================================================= */}
                        <div className="banner-dots">
                            {banners.map(
                                (
                                    item,
                                    index
                                ) => (
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
                                        aria-label={`Go to slide ${
                                            index +
                                            1
                                        }`}
                                        aria-current={
                                            index ===
                                            currentSlide
                                                ? "true"
                                                : undefined
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
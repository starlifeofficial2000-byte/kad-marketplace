import { useEffect, useState } from "react";
import api from "../config/axios";
import { Link } from "react-router-dom";

import "./BannerSlider.css";

function BannerSlider() {

    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);


    useEffect(() => {

        fetchBanners();

    }, []);


    const fetchBanners = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/advertisements/approved"
            );

            if (response.data.success) {

                setBanners(
                    response.data.advertisements || []
                );

            } else {

                setBanners([]);

            }

        }

        catch (error) {

            console.error(
                "BANNER LOAD ERROR:",
                error
            );

            setBanners([]);

        }

        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        if (banners.length <= 1) {

            return;

        }

        const interval = setInterval(() => {

            setCurrentSlide((previous) =>
                previous === banners.length - 1
                    ? 0
                    : previous + 1
            );

        }, 5000);


        return () => {

            clearInterval(interval);

        };

    }, [banners.length]);


    const getImageUrl = (image) => {

        if (!image) {

            return null;

        }

        if (image.startsWith("http")) {

            return image;

        }

        const serverUrl =
            import.meta.env.VITE_SERVER_URL ||
            "";

        return `${serverUrl}/uploads/${image}`;

    };


    if (loading) {

        return (

            <div className="banner-loading">

                Loading advertisements...

            </div>

        );

    }


    if (!banners.length) {

        return null;

    }


    const banner = banners[currentSlide];

    const imageUrl = getImageUrl(
        banner.image
    );


    const previousSlide = () => {

        setCurrentSlide((previous) =>
            previous === 0
                ? banners.length - 1
                : previous - 1
        );

    };


    const nextSlide = () => {

        setCurrentSlide((previous) =>
            previous === banners.length - 1
                ? 0
                : previous + 1
        );

    };


    return (

        <section className="banner-slider">

            <div className="banner-container">


                {imageUrl && (

                    <img
                        src={imageUrl}
                        alt={banner.title || "Advertisement"}
                        className="banner-image"
                    />

                )}


                <div className="banner-overlay">

                    <div className="banner-content">


                        {banner.subtitle && (

                            <span className="banner-subtitle">

                                {banner.subtitle}

                            </span>

                        )}


                        <h2>

                            {banner.title}

                        </h2>


                        {banner.description && (

                            <p>

                                {banner.description}

                            </p>

                        )}


                        {banner.link &&
                            banner.link !== "#" && (

                                <Link
                                    to={banner.link}
                                    className="banner-button"
                                >

                                    {banner.buttonText ||
                                        "Shop Now"}

                                </Link>

                            )}

                    </div>

                </div>


                {banners.length > 1 && (

                    <>

                        <button
                            className="banner-arrow left"
                            onClick={previousSlide}
                            type="button"
                        >
                            ❮
                        </button>


                        <button
                            className="banner-arrow right"
                            onClick={nextSlide}
                            type="button"
                        >
                            ❯
                        </button>


                        <div className="banner-dots">

                            {banners.map((item, index) => (

                                <button
                                    key={item.id || index}
                                    type="button"
                                    className={
                                        index === currentSlide
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setCurrentSlide(index)
                                    }
                                    aria-label={`Go to slide ${index + 1}`}
                                />

                            ))}

                        </div>

                    </>

                )}

            </div>

        </section>

    );

}

export default BannerSlider;
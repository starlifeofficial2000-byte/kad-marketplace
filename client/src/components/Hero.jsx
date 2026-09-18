import { useEffect, useState } from "react";
import "./Hero.css";

const slides = [
    {
        image: "/banners/banner1.jpg",
        title: "Welcome to KAD Marketplace",
        subtitle: "Buy and Sell Anything Across Ghana"
    },
    {
        image: "/banners/banner2.jpg",
        title: "Discover Amazing Deals",
        subtitle: "Find the Best Prices Near You"
    },
    {
        image: "/banners/banner3.jpg",
        title: "Become a Premium Seller",
        subtitle: "Reach More Customers"
    }
];

function HeroSection() {

    const [current, setCurrent] = useState(0);

    useEffect(() => {

        const interval = setInterval(() => {

            setCurrent((prev) =>

                prev === slides.length - 1 ? 0 : prev + 1

            );

        }, 5000);

        return () => clearInterval(interval);

    }, []);

    return (

        <section className="hero">

            <img

                src={slides[current].image}

                alt="Banner"

                className="hero-image"

            />

            <div className="hero-overlay">

                <h1>{slides[current].title}</h1>

                <p>{slides[current].subtitle}</p>

            </div>

        </section>

    );

}

export default HeroSection;
import { useState } from "react";

import HeroBanners from "./HeroBanners";
import FeaturedProducts from "./FeaturedProducts";
import TrendingProducts from "./TrendingProducts";
import RecommendedProducts from "./RecommendedProducts";

import "./HomepageBuilder.css";

function HomepageBuilder() {
    const [activeTab, setActiveTab] = useState("hero");

    const tabs = [
        {
            id: "hero",
            label: "Hero Banner",
            icon: "🖼"
        },
        {
            id: "featured",
            label: "Featured",
            icon: "⭐"
        },
        {
            id: "trending",
            label: "Trending",
            icon: "⚡"
        },
        {
            id: "recommended",
            label: "Recommended",
            icon: "🚀"
        }
    ];

    const renderActiveComponent = () => {
        switch (activeTab) {
            case "hero":
                return <HeroBanners />;

            case "featured":
                return <FeaturedProducts />;

            case "trending":
                return <TrendingProducts />;

            case "recommended":
                return <RecommendedProducts />;

            default:
                return <HeroBanners />;
        }
    };

    return (
        <div className="homepage-builder">

            {/* HEADER */}
            <div className="builder-header">
                <div>
                    <h1>🏠 Homepage Builder</h1>
                    <p>
                        Manage everything that appears on the marketplace homepage.
                    </p>
                </div>
            </div>

            {/* TABS */}
            <div className="builder-tabs">

                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={
                            activeTab === tab.id
                                ? "active"
                                : ""
                        }
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">
                            {tab.icon}
                        </span>

                        {tab.label}
                    </button>
                ))}

            </div>

            {/* CONTENT */}
            <div className="builder-content">

                {renderActiveComponent()}

            </div>

        </div>
    );
}

export default HomepageBuilder;
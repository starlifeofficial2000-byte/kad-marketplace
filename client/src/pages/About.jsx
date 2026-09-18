import Layout from "../components/Layout";
import "./About.css";

function About() {

    return (

        <Layout>

            <section className="about-hero">

                <div className="about-overlay">

                    <h1>About KAD Marketplace</h1>

                    <p>

                        Ghana's trusted online marketplace where buyers and sellers meet to trade safely and securely.

                    </p>

                </div>

            </section>

            <section className="about-container">

                <div className="about-section">

                    <h2>Who We Are</h2>

                    <p>

                        KAD Marketplace is a modern digital marketplace built to connect buyers and sellers across Ghana. Our platform provides a secure, fast and reliable environment where individuals and businesses can buy, sell and promote products with confidence.

                    </p>

                </div>

                <div className="about-section">

                    <h2>Our Mission</h2>

                    <p>

                        To empower businesses and individuals by providing a secure and innovative marketplace that simplifies online buying and selling.

                    </p>

                </div>

                <div className="about-section">

                    <h2>Our Vision</h2>

                    <p>

                        To become Africa's most trusted digital marketplace through innovation, security and outstanding customer experience.

                    </p>

                </div>

            </section>

            <section className="stats-section">

                <div className="stat-card">

                    <h2>10K+</h2>

                    <p>Products Listed</p>

                </div>

                <div className="stat-card">

                    <h2>5K+</h2>

                    <p>Active Users</p>

                </div>

                <div className="stat-card">

                    <h2>500+</h2>

                    <p>Verified Stores</p>

                </div>

                <div className="stat-card">

                    <h2>16</h2>

                    <p>Regions Covered</p>

                </div>

            </section>

        </Layout>

    );

}

export default About;
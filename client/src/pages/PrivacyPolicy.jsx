import Layout from "../components/Layout";
import "./PrivacyPolicy.css";

function PrivacyPolicy() {

    return (

        <Layout>

            <section className="privacy-hero">

                <div className="privacy-overlay">

                    <h1>Privacy Policy</h1>

                    <p>

                        Your privacy matters to us. This policy explains how KAD Marketplace collects, uses, stores, and protects your personal information.

                    </p>

                </div>

            </section>

            <section className="privacy-container">

                <div className="privacy-card">

                    <h2>1. Information We Collect</h2>

                    <p>

                        We may collect your name, email address, phone number, location, payment information, and account details when you register, buy, sell, or communicate through our platform.

                    </p>

                </div>

                <div className="privacy-card">

                    <h2>2. How We Use Your Information</h2>

                    <ul>

                        <li>Create and manage your account.</li>

                        <li>Process purchases, subscriptions and promotions.</li>

                        <li>Improve marketplace security.</li>

                        <li>Personalize your shopping experience.</li>

                        <li>Provide customer support.</li>

                        <li>Prevent fraud and illegal activities.</li>

                    </ul>

                </div>

                <div className="privacy-card">

                    <h2>3. Cookies</h2>

                    <p>

                        We use cookies and similar technologies to remember your preferences, improve website performance, analyze traffic and enhance your browsing experience.

                    </p>

                </div>

                <div className="privacy-card">

                    <h2>4. Sharing Information</h2>

                    <p>

                        We do not sell your personal information. We may share limited information with trusted payment providers, delivery partners and authorities where required by law.

                    </p>

                </div>

                <div className="privacy-card">

                    <h2>5. Data Security</h2>

                    <p>

                        We use secure technologies, encrypted connections and access controls to help protect your information against unauthorized access, misuse or loss.

                    </p>

                </div>

                <div className="privacy-card">

                    <h2>6. Your Rights</h2>

                    <ul>

                        <li>Access your personal information.</li>

                        <li>Update your account details.</li>

                        <li>Delete your account.</li>

                        <li>Request a copy of your stored data.</li>

                        <li>Control your communication preferences.</li>

                    </ul>

                </div>

                <div className="privacy-card">

                    <h2>7. Children's Privacy</h2>

                    <p>

                        KAD Marketplace is not intended for children under the age required by applicable law. We do not knowingly collect personal information from children.

                    </p>

                </div>

                <div className="privacy-card">

                    <h2>8. Changes to this Policy</h2>

                    <p>

                        We may update this Privacy Policy periodically. Any changes will be published on this page with an updated revision date.

                    </p>

                </div>

                <div className="privacy-card">

                    <h2>9. Contact Us</h2>

                    <p>

                        If you have questions regarding this Privacy Policy, please contact the KAD Marketplace support team through our Contact Us page.

                    </p>

                </div>

            </section>

        </Layout>

    );

}

export default PrivacyPolicy;
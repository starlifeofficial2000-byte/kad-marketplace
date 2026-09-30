import {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaTiktok,
    FaYoutube,
    FaCcVisa,
    FaCcMastercard
} from "react-icons/fa";

import { Link } from "react-router-dom";

import "./Footer.css";


function Footer() {

    return (

        <footer className="footer">

            <div className="footer-container">


                {/* =====================================================
                    ABOUT
                ===================================================== */}

                <div className="footer-about">

                    <h2>
                        KAD Marketplace
                    </h2>

                    <p>
                        Ghana's fastest growing online marketplace
                        where buyers and sellers connect securely.
                    </p>


                    {/* =================================================
                        SOCIAL MEDIA
                    ================================================= */}

                    <div className="social-icons">

                        {/* Facebook */}

                        <a
                            href="https://www.facebook.com/share/1DpozJZpu2/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="KAD Marketplace on Facebook"
                            title="Facebook"
                        >
                            <FaFacebook />
                        </a>


                        {/* Instagram */}

                        <a
                            href="https://www.instagram.com/paroemiagh?stkn=MWZidzFucHl1a21udw=="
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="KAD Marketplace on Instagram"
                            title="Instagram"
                        >
                            <FaInstagram />
                        </a>


                        {/* TikTok */}

                        <a
                            href="https://www.tiktok.com/@kadmarket.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="KAD Marketplace on TikTok"
                            title="TikTok"
                        >
                            <FaTiktok />
                        </a>


                        {/* LinkedIn */}

                        <a
                            href="https://www.linkedin.com/in/asante-daniel-0397a5371?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="KAD Marketplace on LinkedIn"
                            title="LinkedIn"
                        >
                            <FaLinkedin />
                        </a>


                        {/* YouTube */}

                        <a
                            href="https://www.youtube.com/@kadmarket"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="KAD Marketplace on YouTube"
                            title="YouTube"
                        >
                            <FaYoutube />
                        </a>

                    </div>

                </div>


                {/* =====================================================
                    FOOTER LINKS
                ===================================================== */}

                <div className="footer-links">


                    {/* Marketplace */}

                    <div>

                        <h3>
                            Marketplace
                        </h3>

                        <Link to="/featured">
                            Featured
                        </Link>

                        <Link to="/trending">
                            Trending
                        </Link>

                        <Link to="/recommended">
                            Recommended
                        </Link>

                    </div>


                    {/* Company */}

                    <div>

                        <h3>
                            Company
                        </h3>

                        <Link to="/about">
                            About Us
                        </Link>

                        <Link to="/contact">
                            Contact Us
                        </Link>

                        <Link to="/privacy-policy">
                            Privacy Policy
                        </Link>

                    </div>


                </div>

            </div>


            {/* =========================================================
                SECURE PAYMENTS
            ========================================================= */}

            <div className="payment-section">

                <h3>
                    Secure Payments
                </h3>

                <div className="payments">

                    <span>
                        MTN MoMo
                    </span>

                    <span>
                        Telecel Cash
                    </span>

                    <span>
                        AirtelTigo Money
                    </span>

                    <FaCcVisa
                        aria-label="Visa"
                        title="Visa"
                    />

                    <FaCcMastercard
                        aria-label="Mastercard"
                        title="Mastercard"
                    />

                </div>

            </div>


            {/* =========================================================
                FOOTER BOTTOM
            ========================================================= */}

            <div className="footer-bottom">

                © 2026 KAD Marketplace. All Rights Reserved.

            </div>


        </footer>

    );

}


export default Footer;
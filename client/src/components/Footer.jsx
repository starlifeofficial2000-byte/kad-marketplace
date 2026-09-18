import {
    FaFacebook,
    FaInstagram,
    FaTwitter,
    FaLinkedin,
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

                <div className="footer-about">

                    <h2>KAD Marketplace</h2>

                    <p>

                        Ghana's fastest growing online marketplace where buyers and sellers connect securely.

                    </p>
<div className="social-icons">

    <a
        href="https://www.facebook.com/YourPage"
        target="_blank"
        rel="noopener noreferrer"
    >
        <FaFacebook />
    </a>

    <a
        href="https://www.instagram.com/YourPage"
        target="_blank"
        rel="noopener noreferrer"
    >
        <FaInstagram />
    </a>

    <a
        href="https://x.com/YourPage"
        target="_blank"
        rel="noopener noreferrer"
    >
        <FaTwitter />
    </a>

    <a
        href="https://www.linkedin.com/company/YourPage"
        target="_blank"
        rel="noopener noreferrer"
    >
        <FaLinkedin />
    </a>

    <a
        href="https://www.youtube.com/@YourChannel"
        target="_blank"
        rel="noopener noreferrer"
    >
        <FaYoutube />
    </a>

</div>

                </div>

                <div className="footer-links">

                    <div>

                        <h3>Marketplace</h3>

                       
<Link to="/featured">Featured</Link>
<Link to="/trending">Trending</Link>
<Link to="/recommended">Recommended</Link>
                    </div>

                    <div>

                        <h3>Company</h3>

                        <Link to="/about">About Us</Link>



<Link to="/contact">Contact Us</Link>

<Link to="/privacy-policy">Privacy Policy</Link>
                    </div>

                   
                    
                </div>

            </div>

            <div className="payment-section">

                <h3>Secure Payments</h3>

                <div className="payments">

                    <span>MTN MoMo</span>

                    <span>Telecel Cash</span>

                    <span>AirtelTigo Money</span>

                    <FaCcVisa />

                    <FaCcMastercard />

                    
                </div>

            </div>

            <div className="footer-bottom">

                © 2026 KAD Marketplace. All Rights Reserved.

            </div>

        </footer>

    );

}

export default Footer;
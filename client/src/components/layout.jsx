import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Layout.css";

function Layout({ children }) {

    return (

        <>

            <Navbar />

            <main className="main-content">

                {children}

            </main>

            <Footer />

        </>

    );

}

export default Layout;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../config/axios";

import "./ProductsPage.css";


function ProductsPage() {

    const [products, setProducts] = useState([]);

    const [filteredProducts, setFilteredProducts] = useState([]);

    const [search, setSearch] = useState("");

    const [status, setStatus] = useState("All");

    const [loading, setLoading] = useState(true);


    /* =========================================
       API BASE URL
    ========================================= */

    const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL ||
        "";


    /* =========================================
       LOAD PRODUCTS
    ========================================= */

    const loadProducts = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/admin/products"
            );


            console.log(
                "PRODUCT RESPONSE:",
                response.data
            );


            const productData =

                response.data?.products ||

                response.data?.data ||

                response.data?.results ||

                [];


            setProducts(

                Array.isArray(productData)

                    ? productData

                    : []

            );

        }

        catch (error) {

            console.error(
                "LOAD PRODUCTS ERROR:",
                error
            );


            setProducts([]);


            alert(

                error.response?.data?.message ||

                "Failed to load products."

            );

        }

        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadProducts();

    }, []);


    /* =========================================
       FILTER PRODUCTS
    ========================================= */

    useEffect(() => {

        let data = Array.isArray(products)

            ? [...products]

            : [];


        if (status !== "All") {

            data = data.filter(

                (product) =>

                    String(
                        product.status || ""
                    ).toLowerCase() ===

                    status.toLowerCase()

            );

        }


        if (search.trim()) {

            const keyword =
                search.toLowerCase();


            data = data.filter(

                (product) =>

                    String(
                        product.title || ""
                    )
                        .toLowerCase()
                        .includes(keyword)

            );

        }


        setFilteredProducts(data);

    }, [

        products,

        search,

        status

    ]);


    /* =========================================
       APPROVE PRODUCT
    ========================================= */

    const approveProduct = async (id) => {

        const confirmed = window.confirm(
            "Approve this product?"
        );


        if (!confirmed) {

            return;

        }


        try {

            await api.put(

                `/admin/products/${id}/approve`

            );


            alert(
                "Product approved successfully."
            );


            loadProducts();

        }

        catch (error) {

            console.error(
                "APPROVE PRODUCT ERROR:",
                error
            );


            alert(

                error.response?.data?.message ||

                "Unable to approve product."

            );

        }

    };


    /* =========================================
       REJECT PRODUCT
    ========================================= */

    const rejectProduct = async (id) => {

        const reason = window.prompt(

            "Enter reason for rejecting this product:"

        );


        if (!reason || !reason.trim()) {

            return;

        }


        try {

            await api.put(

                `/admin/products/${id}/reject`,

                {

                    reason:
                        reason.trim()

                }

            );


            alert(
                "Product rejected successfully."
            );


            loadProducts();

        }

        catch (error) {

            console.error(
                "REJECT PRODUCT ERROR:",
                error
            );


            alert(

                error.response?.data?.message ||

                "Unable to reject product."

            );

        }

    };


    /* =========================================
       FEATURE PRODUCT
    ========================================= */

    const featureProduct = async (id) => {

        try {

            await api.put(

                `/admin/products/${id}/feature`

            );


            alert(
                "Product featured successfully."
            );


            loadProducts();

        }

        catch (error) {

            console.error(
                "FEATURE PRODUCT ERROR:",
                error
            );


            alert(

                error.response?.data?.message ||

                "Unable to feature product."

            );

        }

    };


    /* =========================================
       EXPRESS PROMOTION
    ========================================= */

    const expressPromotion = async (id) => {

        try {

            await api.put(

                `/admin/products/${id}/express`

            );


            alert(
                "Product added to express promotion."
            );


            loadProducts();

        }

        catch (error) {

            console.error(
                "EXPRESS PROMOTION ERROR:",
                error
            );


            alert(

                error.response?.data?.message ||

                "Unable to promote product."

            );

        }

    };


    /* =========================================
       DELETE PRODUCT
    ========================================= */

    const deleteProduct = async (id) => {

        const confirmed = window.confirm(

            "Delete this product permanently?"

        );


        if (!confirmed) {

            return;

        }


        try {

            await api.delete(

                `/admin/products/${id}`

            );


            alert(
                "Product deleted successfully."
            );


            loadProducts();

        }

        catch (error) {

            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );


            alert(

                error.response?.data?.message ||

                "Unable to delete product."

            );

        }

    };


    /* =========================================
       PRODUCT IMAGE HELPER
    ========================================= */

    const getProductImage = (product) => {

        let images = [];


        if (Array.isArray(product.images)) {

            images = product.images;

        }

        else if (typeof product.images === "string") {

            try {

                images = JSON.parse(
                    product.images
                );

            }

            catch {

                images = [

                    product.images

                ];

            }

        }


        if (

            Array.isArray(images) &&

            images.length > 0 &&

            images[0]

        ) {

            const image = images[0];


            /* Already a complete URL */

            if (

                image.startsWith("http://") ||

                image.startsWith("https://")

            ) {

                return image;

            }


            /* Remove leading slash */

            const cleanImage = image.replace(
                /^\/+/,
                ""
            );


            return `${API_BASE_URL}/uploads/${cleanImage}`;

        }


        return "https://via.placeholder.com/300x250?text=No+Image";

    };


    /* =========================================
       STATISTICS
    ========================================= */

    const totalProducts =
        products.length;


    const pendingProducts = products.filter(

        (product) =>

            String(
                product.status || ""
            ).toLowerCase() === "pending"

    ).length;


    const approvedProducts = products.filter(

        (product) =>

            String(
                product.status || ""
            ).toLowerCase() === "approved"

    ).length;


    const rejectedProducts = products.filter(

        (product) =>

            String(
                product.status || ""
            ).toLowerCase() === "rejected"

    ).length;


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="products-page">

                <h2>
                    Loading Products...
                </h2>

            </div>

        );

    }


    return (

        <div className="products-page">


            {/* HEADER */}

            <div className="products-header">

                <div>

                    <h1>
                        📦 Products Management
                    </h1>

                    <p>
                        Manage all marketplace products.
                    </p>

                </div>


                <input

                    type="text"

                    placeholder="Search products..."

                    value={search}

                    onChange={(e) =>

                        setSearch(
                            e.target.value
                        )

                    }

                />

            </div>


            {/* STATISTICS */}

            <div className="product-stats">


                <div className="stat-card">

                    <h2>
                        {totalProducts}
                    </h2>

                    <p>
                        Total Products
                    </p>

                </div>


                <div className="stat-card pending-card">

                    <h2>
                        {pendingProducts}
                    </h2>

                    <p>
                        Pending
                    </p>

                </div>


                <div className="stat-card approved-card">

                    <h2>
                        {approvedProducts}
                    </h2>

                    <p>
                        Approved
                    </p>

                </div>


                <div className="stat-card rejected-card">

                    <h2>
                        {rejectedProducts}
                    </h2>

                    <p>
                        Rejected
                    </p>

                </div>


            </div>


            {/* FILTERS */}

            <div className="filter-bar">


                {[
                    "All",
                    "Pending",
                    "Approved",
                    "Rejected"
                ].map((filter) => (

                    <button

                        key={filter}

                        className={

                            status === filter

                                ? "active-filter"

                                : ""

                        }

                        onClick={() =>
                            setStatus(filter)
                        }

                    >

                        {filter}

                    </button>

                ))}


            </div>


            {/* PRODUCTS */}

            <div className="products-grid">


                {

                    filteredProducts.length === 0

                        ?

                        <div className="no-products">

                            <h2>
                                No Products Found
                            </h2>

                        </div>

                        :

                        filteredProducts.map(

                            (product) => (

                                <div

                                    className="product-card"

                                    key={product.id}

                                >


                                    {/* IMAGE */}

                                    <div className="product-image">

                                        <img

                                            src={

                                                getProductImage(
                                                    product
                                                )

                                            }

                                            alt={

                                                product.title ||

                                                "Product"

                                            }

                                            onError={(e) => {

                                                e.currentTarget.src =
                                                    "https://via.placeholder.com/300x250?text=No+Image";

                                            }}

                                        />


                                        <span

                                            className={`status-badge ${

                                                String(

                                                    product.status || ""

                                                ).toLowerCase()

                                            }`}

                                        >

                                            {

                                                product.status ||

                                                "Unknown"

                                            }

                                        </span>

                                    </div>


                                    {/* CONTENT */}

                                    <div className="product-content">


                                        <h2>

                                            {

                                                product.title ||

                                                "Untitled Product"

                                            }

                                        </h2>


                                        <h3>

                                            GH₵{" "}

                                            {

                                                Number(

                                                    product.price || 0

                                                ).toLocaleString()

                                            }

                                        </h3>


                                        <div className="product-details">


                                            <p>

                                                <strong>
                                                    Category:
                                                </strong>{" "}

                                                {

                                                    product.category ||

                                                    "-"

                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Condition:
                                                </strong>{" "}

                                                {

                                                    product.condition ||

                                                    "-"

                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Location:
                                                </strong>{" "}

                                                {

                                                    product.location ||

                                                    "-"

                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Seller:
                                                </strong>{" "}

                                                {

                                                    product.User?.name ||

                                                    product.user?.name ||

                                                    product.seller?.name ||

                                                    "Unknown"

                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Phone:
                                                </strong>{" "}

                                                {

                                                    product.User?.phone ||

                                                    product.user?.phone ||

                                                    product.seller?.phone ||

                                                    "-"

                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Date Posted:
                                                </strong>{" "}

                                                {

                                                    product.createdAt

                                                        ?

                                                        new Date(

                                                            product.createdAt

                                                        ).toLocaleDateString()

                                                        :

                                                        "-"

                                                }

                                            </p>


                                        </div>


                                        {/* ACTIONS */}

                                        <div className="product-actions">


                                            <Link

                                                to={`/admin/product/${product.id}`}

                                            >

                                                <button className="view-btn">

                                                    👁 View

                                                </button>

                                            </Link>


                                            {

                                                String(

                                                    product.status || ""

                                                ).toLowerCase() !==

                                                "approved" && (

                                                    <button

                                                        className="approve-btn"

                                                        onClick={() =>

                                                            approveProduct(

                                                                product.id

                                                            )

                                                        }

                                                    >

                                                        ✔ Approve

                                                    </button>

                                                )

                                            }


                                            {

                                                String(

                                                    product.status || ""

                                                ).toLowerCase() !==

                                                "rejected" && (

                                                    <button

                                                        className="reject-btn"

                                                        onClick={() =>

                                                            rejectProduct(

                                                                product.id

                                                            )

                                                        }

                                                    >

                                                        ✖ Reject

                                                    </button>

                                                )

                                            }


                                            <button

                                                className="feature-btn"

                                                onClick={() =>

                                                    featureProduct(

                                                        product.id

                                                    )

                                                }

                                            >

                                                ⭐ Feature

                                            </button>


                                            <button

                                                className="express-btn"

                                                onClick={() =>

                                                    expressPromotion(

                                                        product.id

                                                    )

                                                }

                                            >

                                                🚀 Express

                                            </button>


                                            <button

                                                className="delete-btn"

                                                onClick={() =>

                                                    deleteProduct(

                                                        product.id

                                                    )

                                                }

                                            >

                                                🗑 Delete

                                            </button>


                                        </div>


                                    </div>


                                </div>

                            )

                        )

                }


            </div>


        </div>

    );

}


export default ProductsPage;
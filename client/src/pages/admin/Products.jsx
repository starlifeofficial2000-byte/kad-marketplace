import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../config/axios";

import "./Products.css";


function Products() {

    const navigate = useNavigate();


    /* ==========================================
       STATE
    ========================================== */

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [actionLoading, setActionLoading] = useState(null);


    /* ==========================================
       LOAD PRODUCTS
    ========================================== */

    useEffect(() => {

        loadProducts();

    }, []);


    const loadProducts = async () => {

        try {

            setLoading(true);


            /*
            IMPORTANT:

            Change "/products" if your backend
            admin route uses another endpoint.

            Expected:
            GET /api/products
            or
            GET /api/admin/products
            */


            const response = await api.get(
                "/products"
            );


            console.log(
                "PRODUCTS RESPONSE:",
                response.data
            );


            /*
            Support multiple backend structures:

            {
                products: []
            }

            {
                data: []
            }

            []
            */


            const productsData =

                response.data?.products ||

                response.data?.data ||

                response.data ||

                [];


            setProducts(

                Array.isArray(productsData)

                    ? productsData

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

                "Unable to load products."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       APPROVE PRODUCT
    ========================================== */

    const approveProduct = async (id) => {

        const confirmed = window.confirm(

            "Approve this product?"

        );


        if (!confirmed) return;


        try {

            setActionLoading(id);


            await api.put(

                `/admin/products/${id}/approve`,

                {}

            );


            alert(

                "Product approved successfully."

            );


            await loadProducts();


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

        finally {

            setActionLoading(null);

        }

    };


    /* ==========================================
       REJECT PRODUCT
    ========================================== */

    const rejectProduct = async (id) => {

        const confirmed = window.confirm(

            "Reject this product?"

        );


        if (!confirmed) return;


        try {

            setActionLoading(id);


            await api.put(

                `/admin/products/${id}/reject`,

                {}

            );


            alert(

                "Product rejected successfully."

            );


            await loadProducts();


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

        finally {

            setActionLoading(null);

        }

    };


    /* ==========================================
       DELETE PRODUCT
    ========================================== */

    const deleteProduct = async (id) => {

        const confirmed = window.confirm(

            "Delete this product permanently?"

        );


        if (!confirmed) return;


        try {

            setActionLoading(id);


            await api.delete(

                `/admin/products/${id}`

            );


            alert(

                "Product deleted successfully."

            );


            await loadProducts();


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

        finally {

            setActionLoading(null);

        }

    };


    /* ==========================================
       SEARCH PRODUCTS
    ========================================== */

    const filteredProducts = (

        Array.isArray(products)

            ? products

            : []

    ).filter((product) => {

        const searchText =

            search.toLowerCase();


        return (

            product.title
                ?.toLowerCase()
                .includes(searchText)

            ||

            product.name
                ?.toLowerCase()
                .includes(searchText)

            ||

            product.category
                ?.toLowerCase()
                .includes(searchText)

            ||

            product.seller?.name
                ?.toLowerCase()
                .includes(searchText)

        );

    });


    /* ==========================================
       GET PRODUCT IMAGE
    ========================================== */

    const getProductImage = (product) => {

        if (

            !product.images ||

            !Array.isArray(product.images) ||

            product.images.length === 0

        ) {

            return "https://via.placeholder.com/60";

        }


        const image = product.images[0];


        /*
        If image is an object
        */


        if (

            typeof image === "object"

        ) {

            if (image.url) {

                return image.url;

            }


            if (image.filename) {

                return `${

                    import.meta.env.VITE_API_BASE_URL ||

                    ""

                }/uploads/${image.filename}`;

            }

        }


        /*
        If image is already a complete URL
        */


        if (

            typeof image === "string" &&

            image.startsWith("http")

        ) {

            return image;

        }


        /*
        Normal uploaded filename
        */


        return `${

            import.meta.env.VITE_API_BASE_URL ||

            ""

        }/uploads/${image}`;

    };


    /* ==========================================
       PRODUCT STATUS
    ========================================== */

    const renderStatus = (status) => {

        const normalizedStatus =

            status?.toLowerCase() ||

            "pending";


        if (normalizedStatus === "approved") {

            return (

                <span className="status approved">

                    Approved

                </span>

            );

        }


        if (normalizedStatus === "rejected") {

            return (

                <span className="status rejected">

                    Rejected

                </span>

            );

        }


        return (

            <span className="status pending">

                Pending

            </span>

        );

    };


    /* ==========================================
       LOADING
    ========================================== */

    if (loading) {

        return (

            <div className="products-page">

                <h2>

                    Loading Products...

                </h2>

            </div>

        );

    }


    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="products-page">


            {/* ==================================
                HEADER
            ================================== */}

            <div className="products-header">

                <div>

                    <h1>

                        Product Management

                    </h1>

                    <p>

                        Manage marketplace products and approvals.

                    </p>

                </div>


                <input

                    type="text"

                    placeholder="Search products..."

                    value={search}

                    onChange={(e) =>

                        setSearch(e.target.value)

                    }

                />

            </div>


            {/* ==================================
                PRODUCT COUNT
            ================================== */}

            <div className="products-summary">

                <p>

                    Total Products:

                    <strong>

                        {" "}{products.length}

                    </strong>

                </p>


                <p>

                    Showing:

                    <strong>

                        {" "}{filteredProducts.length}

                    </strong>

                </p>

            </div>


            {/* ==================================
                PRODUCTS TABLE
            ================================== */}

            <div className="table-wrapper">

                <table className="products-table">


                    <thead>

                        <tr>

                            <th>Image</th>

                            <th>Title</th>

                            <th>Seller</th>

                            <th>Category</th>

                            <th>Price</th>

                            <th>Status</th>

                            <th>Actions</th>

                        </tr>

                    </thead>


                    <tbody>


                        {

                            filteredProducts.length === 0

                                ?

                                <tr>

                                    <td

                                        colSpan="7"

                                        style={{

                                            textAlign: "center",

                                            padding: "30px"

                                        }}

                                    >

                                        No products found.

                                    </td>

                                </tr>

                                :

                                filteredProducts.map(

                                    (product) => {

                                        const status =

                                            product.status

                                                ?.toLowerCase() ||

                                            "pending";


                                        const isProcessing =

                                            actionLoading === product.id;


                                        return (

                                            <tr

                                                key={product.id}

                                            >


                                                {/* IMAGE */}

                                                <td>

                                                    <img

                                                        src={

                                                            getProductImage(product)

                                                        }

                                                        className="product-thumb"

                                                        alt={

                                                            product.title ||

                                                            product.name ||

                                                            "Product"

                                                        }

                                                        onError={(e) => {

                                                            e.currentTarget.src =

                                                                "https://via.placeholder.com/60";

                                                        }}

                                                    />

                                                </td>


                                                {/* TITLE */}

                                                <td>

                                                    {

                                                        product.title ||

                                                        product.name ||

                                                        "Untitled Product"

                                                    }

                                                </td>


                                                {/* SELLER */}

                                                <td>

                                                    {

                                                        product.seller?.name ||

                                                        product.user?.name ||

                                                        product.User?.name ||

                                                        "Unknown Seller"

                                                    }

                                                </td>


                                                {/* CATEGORY */}

                                                <td>

                                                    {

                                                        typeof product.category === "object"

                                                            ?

                                                            product.category?.name

                                                            :

                                                            product.category ||

                                                            "-"

                                                    }

                                                </td>


                                                {/* PRICE */}

                                                <td>

                                                    GH₵ {

                                                        Number(

                                                            product.price || 0

                                                        ).toLocaleString()

                                                    }

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    {

                                                        renderStatus(

                                                            product.status

                                                        )

                                                    }

                                                </td>


                                                {/* ACTIONS */}

                                                <td className="actions">


                                                    {/* VIEW */}

                                                    <button

                                                        className="view-btn"

                                                        onClick={() =>

                                                            navigate(

                                                                `/admin/product/${product.id}`

                                                            )

                                                        }

                                                    >

                                                        View

                                                    </button>


                                                    {/* PENDING */}

                                                    {

                                                        status === "pending" &&

                                                        <>

                                                            <button

                                                                className="approve-btn"

                                                                disabled={isProcessing}

                                                                onClick={() =>

                                                                    approveProduct(

                                                                        product.id

                                                                    )

                                                                }

                                                            >

                                                                {

                                                                    isProcessing

                                                                        ?

                                                                        "Processing..."

                                                                        :

                                                                        "Approve"

                                                                }

                                                            </button>


                                                            <button

                                                                className="reject-btn"

                                                                disabled={isProcessing}

                                                                onClick={() =>

                                                                    rejectProduct(

                                                                        product.id

                                                                    )

                                                                }

                                                            >

                                                                Reject

                                                            </button>

                                                        </>

                                                    }


                                                    {/* APPROVED */}

                                                    {

                                                        status === "approved" &&

                                                        <button

                                                            className="reject-btn"

                                                            disabled={isProcessing}

                                                            onClick={() =>

                                                                rejectProduct(

                                                                    product.id

                                                                )

                                                            }

                                                        >

                                                            Reject

                                                        </button>

                                                    }


                                                    {/* REJECTED */}

                                                    {

                                                        status === "rejected" &&

                                                        <button

                                                            className="approve-btn"

                                                            disabled={isProcessing}

                                                            onClick={() =>

                                                                approveProduct(

                                                                    product.id

                                                                )

                                                            }

                                                        >

                                                            Approve

                                                        </button>

                                                    }


                                                    {/* DELETE */}

                                                    <button

                                                        className="delete-btn"

                                                        disabled={isProcessing}

                                                        onClick={() =>

                                                            deleteProduct(

                                                                product.id

                                                            )

                                                        }

                                                    >

                                                        Delete

                                                    </button>


                                                </td>


                                            </tr>

                                        );

                                    }

                                )

                        }


                    </tbody>


                </table>

            </div>


        </div>

    );

}


export default Products;
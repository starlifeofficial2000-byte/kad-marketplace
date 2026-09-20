import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../config/axios";
import { ghanaLocations } from "../data/ghanaLocations";
import getImageUrl from "../utils/imageUrl";
import "./EditProduct.css";

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(true);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Mobile Phones");
    const [price, setPrice] = useState("");
    const [condition, setCondition] = useState("New");
    const [region, setRegion] = useState("");
    const [city, setCity] = useState("");
    const [description, setDescription] = useState("");

    const [oldImages, setOldImages] = useState([]);
    const [newImages, setNewImages] = useState([]);

    /* ==========================================
       LOAD PRODUCT
    ========================================== */

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoadingProduct(true);

            /*
             * IMPORTANT:
             * Do NOT request /settings here.
             *
             * We need the actual product.
             */
            const response = await api.get(
                `/products/${id}`
            );

            const data = response.data;

            /*
             * Support both:
             *
             * { success: true, product: {...} }
             *
             * and:
             *
             * { ...product }
             */

            const p =
                data?.product ||
                data?.data ||
                data;

            if (!p) {
                throw new Error(
                    "Product data was not returned."
                );
            }

            setTitle(p.title || "");
            setCategory(
                p.category || "Mobile Phones"
            );
            setPrice(p.price ?? "");
            setCondition(
                p.condition || "New"
            );
            setRegion(p.region || "");
            setCity(p.city || "");
            setDescription(
                p.description || ""
            );

            /* =================================
               PARSE PRODUCT IMAGES
            ================================= */

            let productImages = [];

            if (Array.isArray(p.images)) {
                productImages = p.images;
            } else if (
                typeof p.images === "string"
            ) {
                try {
                    const parsed =
                        JSON.parse(p.images);

                    if (Array.isArray(parsed)) {
                        productImages = parsed;
                    } else if (
                        typeof parsed === "string"
                    ) {
                        productImages = [parsed];
                    }
                } catch {
                    productImages = [
                        p.images
                    ];
                }
            }

            setOldImages(
                productImages.filter(
                    (image) =>
                        typeof image ===
                            "string" &&
                        image.trim() !== ""
                )
            );
        } catch (error) {
            console.error(
                "EDIT PRODUCT LOAD ERROR:",
                error
            );

            alert(
                error?.response?.data?.message ||
                    "Unable to load product."
            );
        } finally {
            setLoadingProduct(false);
        }
    };

    /* ==========================================
       UPDATE PRODUCT
    ========================================== */

    const updateProduct = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append(
                "title",
                title.trim()
            );

            formData.append(
                "category",
                category
            );

            formData.append(
                "price",
                price
            );

            formData.append(
                "condition",
                condition
            );

            formData.append(
                "region",
                region
            );

            formData.append(
                "city",
                city
            );

            formData.append(
                "location",
                `${city}, ${region}`
            );

            formData.append(
                "description",
                description.trim()
            );

            /* =================================
               NEW IMAGES
            ================================= */

            newImages.forEach((image) => {
                formData.append(
                    "images",
                    image
                );
            });

            /*
             * IMPORTANT:
             *
             * Use the project's configured
             * Axios instance.
             *
             * Do NOT use axios.put().
             *
             * Also don't manually set
             * Content-Type.
             *
             * Axios/browser will automatically
             * generate the multipart boundary.
             */

            await api.put(
                `/products/${id}`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            alert(
                "Product updated successfully."
            );

            navigate("/my-products");

        } catch (error) {
            console.error(
                "UPDATE PRODUCT ERROR:",
                error
            );

            alert(
                error?.response?.data?.message ||
                    "Unable to update product."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ==========================================
       LOADING
    ========================================== */

    if (loadingProduct) {
        return (
            <div className="edit-page">
                <div className="edit-form">
                    <h1>
                        Loading Product...
                    </h1>
                </div>
            </div>
        );
    }

    /* ==========================================
       RETURN
    ========================================== */

    return (
        <div className="edit-page">

            <form
                className="edit-form"
                onSubmit={updateProduct}
            >

                <h1>Edit Product</h1>

                {/* ==============================
                    TITLE
                ============================== */}

                <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                        setTitle(
                            e.target.value
                        )
                    }
                    placeholder="Product Title"
                    required
                />

                {/* ==============================
                    CATEGORY
                ============================== */}

                <select
                    value={category}
                    onChange={(e) =>
                        setCategory(
                            e.target.value
                        )
                    }
                >
                    <option>
                        Mobile Phones
                    </option>

                    <option>
                        Laptops
                    </option>

                    <option>
                        TV
                    </option>

                    <option>
                        Radio
                    </option>

                    <option>
                        Music Equipment
                    </option>

                    <option>
                        Food Stuff
                    </option>

                    <option>
                        Clothes
                    </option>

                    <option>
                        Accessories
                    </option>

                    <option>
                        Cars
                    </option>

                    <option>
                        Motorcycles
                    </option>

                    <option>
                        Employment Opportunities
                    </option>
                </select>

                {/* ==============================
                    PRICE
                ============================== */}

                <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) =>
                        setPrice(
                            e.target.value
                        )
                    }
                    placeholder="Price"
                    required
                />

                {/* ==============================
                    CONDITION
                ============================== */}

                <select
                    value={condition}
                    onChange={(e) =>
                        setCondition(
                            e.target.value
                        )
                    }
                >
                    <option value="New">
                        New
                    </option>

                    <option value="Used">
                        Used
                    </option>
                </select>

                {/* ==============================
                    REGION
                ============================== */}

                <select
                    value={region}
                    onChange={(e) => {
                        setRegion(
                            e.target.value
                        );

                        setCity("");
                    }}
                    required
                >
                    <option value="">
                        Select Region
                    </option>

                    {Object.keys(
                        ghanaLocations
                    ).map((r) => (
                        <option
                            key={r}
                            value={r}
                        >
                            {r}
                        </option>
                    ))}
                </select>

                {/* ==============================
                    CITY
                ============================== */}

                <select
                    value={city}
                    onChange={(e) =>
                        setCity(
                            e.target.value
                        )
                    }
                    required
                >
                    <option value="">
                        Select City
                    </option>

                    {region &&
                        ghanaLocations[
                            region
                        ]?.map((cityName) => (
                            <option
                                key={cityName}
                                value={cityName}
                            >
                                {cityName}
                            </option>
                        ))}
                </select>

                {/* ==============================
                    DESCRIPTION
                ============================== */}

                <textarea
                    rows="6"
                    value={description}
                    onChange={(e) =>
                        setDescription(
                            e.target.value
                        )
                    }
                    placeholder="Product description"
                />

                {/* ==============================
                    CURRENT IMAGES
                ============================== */}

                <h3>
                    Current Images
                </h3>

                <div className="old-images">

                    {oldImages.length > 0 ? (
                        oldImages.map(
                            (img, index) => (
                                <img
                                    key={`${img}-${index}`}
                                    src={getImageUrl(
                                        img
                                    )}
                                    alt={`Product ${
                                        index + 1
                                    }`}
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "/images/product-placeholder.png";
                                    }}
                                />
                            )
                        )
                    ) : (
                        <p>
                            No current images
                            available.
                        </p>
                    )}

                </div>

                {/* ==============================
                    NEW IMAGES
                ============================== */}

                <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                        setNewImages(
                            Array.from(
                                e.target.files || []
                            )
                        )
                    }
                />

                {/* ==============================
                    SELECTED NEW IMAGES
                ============================== */}

                {newImages.length > 0 && (
                    <div className="new-images-info">
                        <p>
                            {newImages.length} new
                            image
                            {newImages.length !== 1
                                ? "s"
                                : ""}{" "}
                            selected.
                        </p>
                    </div>
                )}

                {/* ==============================
                    SUBMIT
                ============================== */}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Updating..."
                        : "Save Changes"}
                </button>

            </form>

        </div>
    );
}

export default EditProduct;
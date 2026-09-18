import { useState } from "react";
import api from "../config/axios";
import { ghanaLocations } from "../data/ghanaLocations";

function ProductForm() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Mobile Phones");
    const [price, setPrice] = useState("");
    const [condition, setCondition] = useState("New");

    const [region, setRegion] = useState("");
    const [city, setCity] = useState("");

    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    /* =========================================
       VALIDATE FORM
    ========================================= */

    const validateForm = () => {
        const newErrors = {};

        if (!title.trim()) {
            newErrors.title = "Product title is required.";
        }

        if (!price || Number(price) <= 0) {
            newErrors.price = "Enter a valid price.";
        }

        if (!region) {
            newErrors.region = "Select a region.";
        }

        if (!city) {
            newErrors.city = "Select a city.";
        }

        if (!description.trim()) {
            newErrors.description = "Description is required.";
        } else if (description.trim().length < 20) {
            newErrors.description =
                "Description must be at least 20 characters.";
        }

        if (images.length === 0) {
            newErrors.images =
                "Please upload at least one image.";
        }

        if (images.length > 5) {
            newErrors.images =
                "Maximum 5 images allowed.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    /* =========================================
       HANDLE IMAGE CHANGE
    ========================================= */

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        if (selectedFiles.length > 5) {
            alert("Maximum 5 images allowed.");
            return;
        }

        setImages(selectedFiles);

        setErrors((prev) => ({
            ...prev,
            images: ""
        }));
    };

    /* =========================================
       REMOVE IMAGE
    ========================================= */

    const removeImage = (index) => {
        setImages((prevImages) =>
            prevImages.filter((_, i) => i !== index)
        );
    };

    /* =========================================
       SUBMIT PRODUCT
    ========================================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("title", title.trim());
            formData.append("category", category);
            formData.append("price", price);
            formData.append("condition", condition);

            formData.append("region", region);
            formData.append("city", city);

            formData.append(
                "location",
                `${city}, ${region}`
            );

            formData.append(
                "description",
                description.trim()
            );

            images.forEach((image) => {
                formData.append("images", image);
            });

            const response = await api.post(
                "/products",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            alert(
                response.data.message ||
                "Product submitted successfully."
            );

            /* RESET FORM */

            setTitle("");
            setCategory("Mobile Phones");
            setPrice("");
            setCondition("New");

            setRegion("");
            setCity("");

            setDescription("");
            setImages([]);
            setErrors({});
        }

        catch (error) {
            console.error(
                "PRODUCT UPLOAD ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to upload product."
            );
        }

        finally {
            setLoading(false);
        }
    };

    return (
        <form
            className="sell-form"
            onSubmit={handleSubmit}
        >

            {/* =====================================
               BASIC INFORMATION
            ===================================== */}

            <h2 className="section-title">
                Basic Information
            </h2>

            <div className="form-group">

                <label>
                    Product Title *
                </label>

                <input
                    type="text"
                    placeholder="Enter Product Title"
                    value={title}
                    onChange={(e) =>
                        setTitle(e.target.value)
                    }
                />

                {errors.title && (
                    <span className="error">
                        {errors.title}
                    </span>
                )}

            </div>


            <div className="form-row">

                <div className="form-group">

                    <label>
                        Category *
                    </label>

                    <select
                        value={category}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                    >

                        <option>Mobile Phones</option>
                        <option>Laptops</option>
                        <option>TV</option>
                        <option>Radio</option>
                        <option>Music Equipment</option>
                        <option>Food Stuff</option>
                        <option>Clothes</option>
                        <option>Accessories</option>
                        <option>Cars</option>
                        <option>Motorcycles</option>
                        <option>Employment Opportunities</option>

                    </select>

                </div>


                <div className="form-group">

                    <label>
                        Condition *
                    </label>

                    <select
                        value={condition}
                        onChange={(e) =>
                            setCondition(e.target.value)
                        }
                    >

                        <option>New</option>
                        <option>Used</option>

                    </select>

                </div>

            </div>


            {/* =====================================
               PRICE AND LOCATION
            ===================================== */}

            <div className="form-row">

                <div className="form-group">

                    <label>
                        Price (GH₵) *
                    </label>

                    <input
                        type="number"
                        value={price}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        onChange={(e) =>
                            setPrice(e.target.value)
                        }
                    />

                    {errors.price && (
                        <span className="error">
                            {errors.price}
                        </span>
                    )}

                </div>


                <div className="form-group">

                    <label>
                        Region *
                    </label>

                    <select
                        value={region}
                        onChange={(e) => {
                            setRegion(e.target.value);
                            setCity("");
                        }}
                    >

                        <option value="">
                            Select Region
                        </option>

                        {Object.keys(ghanaLocations).map(
                            (item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            )
                        )}

                    </select>

                    {errors.region && (
                        <span className="error">
                            {errors.region}
                        </span>
                    )}

                </div>

            </div>


            <div className="form-group">

                <label>
                    City *
                </label>

                <select
                    value={city}
                    disabled={!region}
                    onChange={(e) =>
                        setCity(e.target.value)
                    }
                >

                    <option value="">
                        Select City
                    </option>

                    {region &&
                        ghanaLocations[region]?.map(
                            (item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            )
                        )}

                </select>

                {errors.city && (
                    <span className="error">
                        {errors.city}
                    </span>
                )}

            </div>


            {/* =====================================
               DESCRIPTION
            ===================================== */}

            <h2 className="section-title">
                Description
            </h2>

            <textarea
                rows="6"
                maxLength="1000"
                placeholder="Describe your product..."
                value={description}
                onChange={(e) =>
                    setDescription(e.target.value)
                }
            />

            <small>
                {description.length}/1000 Characters
            </small>

            {errors.description && (
                <span className="error">
                    {errors.description}
                </span>
            )}


            {/* =====================================
               PRODUCT IMAGES
            ===================================== */}

            <h2 className="section-title">
                Product Images
            </h2>

            <div className="upload-box">

                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                />

                <p>
                    📷 Upload up to 5 Images
                </p>

            </div>

            {errors.images && (
                <span className="error">
                    {errors.images}
                </span>
            )}


            {/* =====================================
               IMAGE PREVIEW
            ===================================== */}

            <div className="preview-images">

                {images.map((image, index) => (

                    <div
                        className="preview-card"
                        key={`${image.name}-${index}`}
                    >

                        <img
                            className="preview-image"
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                        />

                        {index === 0 && (
                            <span className="cover-badge">
                                Cover
                            </span>
                        )}

                        <button
                            type="button"
                            className="remove-image"
                            onClick={() =>
                                removeImage(index)
                            }
                        >
                            ✕
                        </button>

                    </div>

                ))}

            </div>


            {/* =====================================
               SUBMIT BUTTON
            ===================================== */}

            <button
                type="submit"
                className="submit-btn"
                disabled={loading}
            >

                {loading
                    ? "Uploading..."
                    : "Submit For Approval"}

            </button>

        </form>
    );
}

export default ProductForm;
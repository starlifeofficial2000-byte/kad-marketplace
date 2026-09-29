import { useEffect, useMemo, useState } from "react";
import api from "../config/axios";
import "./ProductForm.css";

/*
|--------------------------------------------------------------------------
| KAD MARKETPLACE - PRODUCT FORM
|--------------------------------------------------------------------------
| Features:
| - Main category + subcategory
| - Product title
| - Price
| - Condition
| - Region / City / Location
| - Description
| - Up to 5 images
| - Image previews
| - Validation
| - Multipart upload
| - Authentication through existing axios configuration
|--------------------------------------------------------------------------
*/

const CATEGORY_DATA = {
    "Mobile Phones": [
        "Android Phones",
        "iPhones",
        "Samsung Phones",
        "Tecno Phones",
        "Infinix Phones",
        "Itel Phones",
        "Google Pixel",
        "Nokia Phones",
        "Other Phones"
    ],

    "Laptops": [
        "HP Laptops",
        "Dell Laptops",
        "Lenovo Laptops",
        "Apple MacBook",
        "Acer Laptops",
        "Asus Laptops",
        "Microsoft Surface",
        "Other Laptops"
    ],

    "TV": [
        "Smart TV",
        "LED TV",
        "OLED TV",
        "QLED TV",
        "Android TV",
        "Other TV"
    ],

    "Radio": [
        "Home Radio",
        "Car Radio",
        "Bluetooth Speakers",
        "Sound Systems",
        "Other Radio"
    ],

    "Music Equipment": [
        "DJ Equipment",
        "Mixers",
        "Microphones",
        "Amplifiers",
        "Speakers",
        "Musical Instruments",
        "Studio Equipment",
        "Other Music Equipment"
    ],

    "Food Stuff": [
        "Grains",
        "Fruits",
        "Vegetables",
        "Meat",
        "Fish",
        "Cooking Ingredients",
        "Drinks",
        "Other Food Stuff"
    ],

    "Clothes": [
        "Men's Clothing",
        "Women's Clothing",
        "Children's Clothing",
        "Shoes",
        "Bags",
        "Traditional Wear",
        "Other Clothes"
    ],

    "Accessories": [
        "Phone Accessories",
        "Laptop Accessories",
        "Watch",
        "Jewelry",
        "Bags",
        "Fashion Accessories",
        "Other Accessories"
    ],

    "Cars": [
        "Toyota",
        "Honda",
        "Hyundai",
        "Kia",
        "Mercedes-Benz",
        "BMW",
        "Nissan",
        "Ford",
        "Other Cars"
    ],

    "Motorcycles": [
        "Motorbike",
        "Scooter",
        "Tricycle",
        "Delivery Motorcycle",
        "Spare Parts",
        "Other Motorcycles"
    ],

    "Employment Opportunities": [
        "Full-Time Jobs",
        "Part-Time Jobs",
        "Remote Jobs",
        "Internships",
        "Apprenticeships",
        "Freelance Jobs",
        "Other Employment"
    ],

    "Land & Property": [
        "Land for Sale",
        "Residential Land",
        "Commercial Land",
        "Farm Land",
        "Building Land",
        "Houses for Sale",
        "Houses for Rent",
        "Apartments",
        "Rooms",
        "Commercial Property",
        "Shops",
        "Offices",
        "Warehouses",
        "Other Property"
    ]
};

const GHANA_REGIONS = {
    "Ahafo": [
        "Goaso",
        "Duayaw Nkwanta",
        "Bechem",
        "Kenyasi"
    ],

    "Ashanti": [
        "Kumasi",
        "Obuasi",
        "Ejisu",
        "Mampong",
        "Konongo",
        "Bekwai",
        "Tepa",
        "Offinso"
    ],

    "Bono": [
        "Sunyani",
        "Berekum",
        "Dormaa Ahenkro",
        "Wenchi"
    ],

    "Bono East": [
        "Techiman",
        "Kintampo",
        "Nkoranza",
        "Atebubu"
    ],

    "Central": [
        "Cape Coast",
        "Kasoa",
        "Winneba",
        "Elmina",
        "Mankessim",
        "Swedru"
    ],

    "Eastern": [
        "Koforidua",
        "Nkawkaw",
        "Akropong",
        "Suhum",
        "Nsawam",
        "Akim Oda"
    ],

    "Greater Accra": [
        "Accra",
        "Tema",
        "Madina",
        "Adenta",
        "Teshie",
        "Nungua",
        "Dansoman",
        "Kasoa"
    ],

    "North East": [
        "Nalerigu",
        "Walewale",
        "Gambaga"
    ],

    "Northern": [
        "Tamale",
        "Yendi",
        "Savelugu",
        "Bimbilla"
    ],

    "Oti": [
        "Dambai",
        "Jasikan",
        "Kete Krachi",
        "Nkwanta"
    ],

    "Savannah": [
        "Damongo",
        "Salaga",
        "Bole"
    ],

    "Upper East": [
        "Bolgatanga",
        "Navrongo",
        "Bawku"
    ],

    "Upper West": [
        "Wa",
        "Lawra",
        "Tumu"
    ],

    "Volta": [
        "Ho",
        "Hohoe",
        "Keta",
        "Aflao",
        "Kpando"
    ],

    "Western": [
        "Sekondi-Takoradi",
        "Tarkwa",
        "Axim",
        "Prestea",
        "Bogoso"
    ],

    "Western North": [
        "Sefwi Wiawso",
        "Bibiani",
        "Enchi"
    ]
};

function ProductForm() {

    /* ============================================================
       FORM STATE
    ============================================================ */

    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        subcategory: "",
        condition: "Used",
        region: "",
        city: "",
        location: ""
    });

    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* ============================================================
       AUTHENTICATION
    ============================================================ */

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Please login before creating a listing.");
        }

    }, []);

    /* ============================================================
       CATEGORY OPTIONS
    ============================================================ */

    const subcategories = useMemo(() => {

        if (!form.category) {
            return [];
        }

        return CATEGORY_DATA[form.category] || [];

    }, [form.category]);

    /* ============================================================
       CITY OPTIONS
    ============================================================ */

    const cities = useMemo(() => {

        if (!form.region) {
            return [];
        }

        return GHANA_REGIONS[form.region] || [];

    }, [form.region]);

    /* ============================================================
       INPUT HANDLER
    ============================================================ */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    /* ============================================================
       CATEGORY CHANGE
    ============================================================ */

    const handleCategoryChange = (e) => {

        const category = e.target.value;

        setForm((previous) => ({
            ...previous,
            category,
            subcategory: ""
        }));

        setError("");
    };

    /* ============================================================
       REGION CHANGE
    ============================================================ */

    const handleRegionChange = (e) => {

        const region = e.target.value;

        setForm((previous) => ({
            ...previous,
            region,
            city: ""
        }));

        setError("");
    };

    /* ============================================================
       IMAGE SELECTION
    ============================================================ */

    const handleImageChange = (e) => {

        const selectedFiles = Array.from(
            e.target.files || []
        );

        if (!selectedFiles.length) {
            return;
        }

        setError("");

        const availableSlots = 5 - images.length;

        if (availableSlots <= 0) {

            setError(
                "You can upload a maximum of 5 images."
            );

            e.target.value = "";
            return;
        }

        const filesToAdd =
            selectedFiles.slice(
                0,
                availableSlots
            );

        const invalidFile = filesToAdd.find(
            (file) => {

                const validTypes = [
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp"
                ];

                return (
                    !validTypes.includes(file.type) ||
                    file.size > 5 * 1024 * 1024
                );
            }
        );

        if (invalidFile) {

            setError(
                "Images must be JPG, JPEG, PNG or WEBP and each image must be below 5MB."
            );

            e.target.value = "";
            return;
        }

        const newPreviews = filesToAdd.map(
            (file) => URL.createObjectURL(file)
        );

        setImages((previous) => [
            ...previous,
            ...filesToAdd
        ]);

        setPreviews((previous) => [
            ...previous,
            ...newPreviews
        ]);

        e.target.value = "";
    };

    /* ============================================================
       REMOVE IMAGE
    ============================================================ */

    const removeImage = (index) => {

        setImages((previous) =>
            previous.filter(
                (_, imageIndex) =>
                    imageIndex !== index
            )
        );

        setPreviews((previous) => {

            const previewToRemove =
                previous[index];

            if (previewToRemove) {
                URL.revokeObjectURL(
                    previewToRemove
                );
            }

            return previous.filter(
                (_, imageIndex) =>
                    imageIndex !== index
            );
        });

        setError("");
    };

    /* ============================================================
       VALIDATION
    ============================================================ */

    const validateForm = () => {

        const required = [
            "title",
            "description",
            "price",
            "category",
            "condition",
            "location",
            "region",
            "city"
        ];

        for (const field of required) {

            if (!String(form[field] || "").trim()) {

                return `Please enter ${field.replace(
                    /([A-Z])/g,
                    " $1"
                )}.`;
            }
        }

        if (!form.subcategory.trim()) {

            return "Please select a subcategory.";
        }

        if (
            form.description.trim().length < 20
        ) {

            return "Description must contain at least 20 characters.";
        }

        const numericPrice =
            Number(form.price);

        if (
            !Number.isFinite(numericPrice) ||
            numericPrice <= 0
        ) {

            return "Please enter a valid price.";
        }

        if (images.length < 2) {

            return "Please upload at least 2 product images.";
        }

        if (images.length > 5) {

            return "You can upload a maximum of 5 images.";
        }

        return null;
    };

    /* ============================================================
       SUBMIT PRODUCT
    ============================================================ */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        const token =
            localStorage.getItem("token");

        if (!token) {

            setError(
                "Your session has expired. Please login again."
            );

            return;
        }

        const validationError =
            validateForm();

        if (validationError) {

            setError(validationError);

            return;
        }

        try {

            setLoading(true);

            const formData =
                new FormData();

            formData.append(
                "title",
                form.title.trim()
            );

            formData.append(
                "description",
                form.description.trim()
            );

            formData.append(
                "price",
                String(Number(form.price))
            );

            formData.append(
                "category",
                form.category
            );

            formData.append(
                "subcategory",
                form.subcategory
            );

            formData.append(
                "condition",
                form.condition
            );

            formData.append(
                "region",
                form.region
            );

            formData.append(
                "city",
                form.city
            );

            formData.append(
                "location",
                form.location.trim()
            );

            /*
             * DO NOT send userId.
             * The backend gets it from req.user.id.
             */

            images.forEach((image) => {

                formData.append(
                    "images",
                    image
                );

            });

            const response =
                await api.post(
                    "/products",
                    formData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            if (
                response.data?.success === false
            ) {

                throw new Error(
                    response.data?.message ||
                    "Unable to create listing."
                );
            }

            setSuccess(
                response.data?.message ||
                "Product submitted successfully."
            );

            setForm({
                title: "",
                description: "",
                price: "",
                category: "",
                subcategory: "",
                condition: "Used",
                region: "",
                city: "",
                location: ""
            });

            previews.forEach((preview) => {

                URL.revokeObjectURL(preview);

            });

            setImages([]);
            setPreviews([]);

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
        catch (error) {

            console.error(
                "PRODUCT SUBMISSION ERROR:",
                error.response?.data ||
                error.message ||
                error
            );

            const message =
                error.response?.data?.message ||
                error.message ||
                "Unable to submit product.";

            setError(message);

        }
        finally {

            setLoading(false);

        }
    };

    /* ============================================================
       CLEANUP PREVIEWS
    ============================================================ */

    useEffect(() => {

        return () => {

            previews.forEach((preview) => {

                URL.revokeObjectURL(preview);

            });

        };

    }, []);

    /* ============================================================
       RENDER
    ============================================================ */

    return (

        <form
            className="product-form"
            onSubmit={handleSubmit}
        >

            {error && (

                <div className="product-form-message error">
                    {error}
                </div>

            )}

            {success && (

                <div className="product-form-message success">
                    {success}
                </div>

            )}

            {/* ==================================================
               BASIC INFORMATION
            ================================================== */}

            <div className="form-section">

                <div className="form-section-header">

                    <h2>
                        Product Information
                    </h2>

                    <p>
                        Provide accurate information about
                        the item you are selling.
                    </p>

                </div>

                <div className="form-grid">

                    <div className="form-group full-width">

                        <label htmlFor="title">
                            Product Title *
                        </label>

                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. Samsung Galaxy S24 Ultra"
                            maxLength={150}
                            disabled={loading}
                        />

                    </div>


                    <div className="form-group">

                        <label htmlFor="category">
                            Category *
                        </label>

                        <select
                            id="category"
                            name="category"
                            value={form.category}
                            onChange={handleCategoryChange}
                            disabled={loading}
                        >

                            <option value="">
                                Select Category
                            </option>

                            {Object.keys(
                                CATEGORY_DATA
                            ).map((category) => (

                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>

                            ))}

                        </select>

                    </div>


                    <div className="form-group">

                        <label htmlFor="subcategory">
                            Subcategory *
                        </label>

                        <select
                            id="subcategory"
                            name="subcategory"
                            value={form.subcategory}
                            onChange={handleChange}
                            disabled={
                                loading ||
                                !form.category
                            }
                        >

                            <option value="">
                                {form.category
                                    ? "Select Subcategory"
                                    : "Select Category First"}
                            </option>

                            {subcategories.map(
                                (subcategory) => (

                                    <option
                                        key={subcategory}
                                        value={subcategory}
                                    >
                                        {subcategory}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    <div className="form-group">

                        <label htmlFor="condition">
                            Condition *
                        </label>

                        <select
                            id="condition"
                            name="condition"
                            value={form.condition}
                            onChange={handleChange}
                            disabled={loading}
                        >

                            <option value="New">
                                New
                            </option>

                            <option value="Used">
                                Used
                            </option>

                        </select>

                    </div>


                    <div className="form-group">

                        <label htmlFor="price">
                            Price (GHS) *
                        </label>

                        <input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            disabled={loading}
                        />

                    </div>

                </div>

            </div>


            {/* ==================================================
               LOCATION
            ================================================== */}

            <div className="form-section">

                <div className="form-section-header">

                    <h2>
                        Location
                    </h2>

                    <p>
                        Tell buyers where the item is located.
                    </p>

                </div>

                <div className="form-grid">

                    <div className="form-group">

                        <label htmlFor="region">
                            Region *
                        </label>

                        <select
                            id="region"
                            name="region"
                            value={form.region}
                            onChange={handleRegionChange}
                            disabled={loading}
                        >

                            <option value="">
                                Select Region
                            </option>

                            {Object.keys(
                                GHANA_REGIONS
                            ).map((region) => (

                                <option
                                    key={region}
                                    value={region}
                                >
                                    {region}
                                </option>

                            ))}

                        </select>

                    </div>


                    <div className="form-group">

                        <label htmlFor="city">
                            City / Town *
                        </label>

                        <select
                            id="city"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            disabled={
                                loading ||
                                !form.region
                            }
                        >

                            <option value="">
                                {form.region
                                    ? "Select City / Town"
                                    : "Select Region First"}
                            </option>

                            {cities.map((city) => (

                                <option
                                    key={city}
                                    value={city}
                                >
                                    {city}
                                </option>

                            ))}

                        </select>

                    </div>


                    <div className="form-group full-width">

                        <label htmlFor="location">
                            Specific Location *
                        </label>

                        <input
                            id="location"
                            name="location"
                            type="text"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Adum, Kumasi"
                            maxLength={150}
                            disabled={loading}
                        />

                    </div>

                </div>

            </div>


            {/* ==================================================
               DESCRIPTION
            ================================================== */}

            <div className="form-section">

                <div className="form-section-header">

                    <h2>
                        Description
                    </h2>

                    <p>
                        Give buyers enough information to
                        understand your listing.
                    </p>

                </div>

                <div className="form-group full-width">

                    <label htmlFor="description">
                        Product Description *
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Describe the product, its condition, features, specifications and anything buyers should know..."
                        rows={7}
                        maxLength={3000}
                        disabled={loading}
                    />

                    <div className="character-count">

                        {form.description.length}/3000

                    </div>

                </div>

            </div>


            {/* ==================================================
               IMAGES
            ================================================== */}

            <div className="form-section">

                <div className="form-section-header">

                    <h2>
                        Product Images
                    </h2>

                    <p>
                        Upload clear photos of the actual
                        product. Minimum 2 and maximum 5 images.
                    </p>

                </div>

                <div className="image-upload-area">

                    <label
                        htmlFor="product-images"
                        className="image-upload-box"
                    >

                        <div className="upload-icon">
                            📷
                        </div>

                        <strong>
                            Upload Product Images
                        </strong>

                        <span>
                            JPG, PNG or WEBP • Maximum 5MB each
                        </span>

                        <small>
                            {images.length}/5 images selected
                        </small>

                    </label>

                    <input
                        id="product-images"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={handleImageChange}
                        disabled={
                            loading ||
                            images.length >= 5
                        }
                        hidden
                    />

                </div>


                {previews.length > 0 && (

                    <div className="image-preview-grid">

                        {previews.map(
                            (preview, index) => (

                                <div
                                    className="image-preview"
                                    key={`${preview}-${index}`}
                                >

                                    <img
                                        src={preview}
                                        alt={`Product preview ${index + 1}`}
                                    />

                                    <span className="image-number">
                                        {index + 1}
                                    </span>

                                    <button
                                        type="button"
                                        className="remove-image"
                                        onClick={() =>
                                            removeImage(index)
                                        }
                                        disabled={loading}
                                        aria-label={`Remove image ${index + 1}`}
                                    >
                                        ×
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>


            {/* ==================================================
               SUBMISSION NOTICE
            ================================================== */}

            <div className="product-approval-notice">

                <div className="notice-icon">
                    ✓
                </div>

                <div>

                    <strong>
                        Listing Approval
                    </strong>

                    <p>
                        Your listing will be submitted for
                        marketplace processing according to
                        the current marketplace approval settings.
                    </p>

                </div>

            </div>


            {/* ==================================================
               SUBMIT
            ================================================== */}

            <div className="product-form-actions">

                <button
                    type="submit"
                    className="product-submit-button"
                    disabled={loading}
                >

                    {loading ? (
                        <>
                            <span className="submit-spinner"></span>
                            Submitting...
                        </>
                    ) : (
                        <>
                            Publish Listing
                            <span>→</span>
                        </>
                    )}

                </button>

            </div>

        </form>

    );
}

export default ProductForm;
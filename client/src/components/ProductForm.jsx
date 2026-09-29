import { useMemo, useState } from "react";
import api from "../config/axios";
import { ghanaLocations } from "../data/ghanaLocations";

function ProductForm() {
    const categories = useMemo(() => [
        {
            name: "Phones & Tablets",
            subcategories: [
                "Mobile Phones",
                "iPhone",
                "Samsung",
                "Tecno",
                "Infinix",
                "Tablets",
                "other",
                "Phone Accessories"
            ]
        },
        {
            name: "Land & Property",
            subcategories: [
                "Land for Sale",
                "Land for Rent",
                "Houses for Sale",
                "Houses for Rent",
                "Apartments for Sale",
                "Apartments for Rent",
                "Commercial Property",
                "Office Spaces",
                "Shops & Stores",
                "Buildings",
                "Farms & Agricultural Land"
            ]
        },
        {
            name: "Computers & Laptops",
            subcategories: [
                "Laptops",
                "Desktop Computers",
                "Monitors",
                "Printers",
                "Computer Accessories"
            ]
        },
        {
            name: "Electronics",
            subcategories: [
                "Televisions",
                "Radios",
                "Speakers",
                "Headphones",
                "Home Electronics"
            ]
        },
        {
            name: "Music & Entertainment",
            subcategories: [
                "DJ Equipment",
                "Musical Instruments",
                "Studio Equipment",
                "Speakers",
                "Music Accessories"
            ]
        },
        {
            name: "Food & Groceries",
            subcategories: [
                "Food Stuff",
                "Drinks",
                "Snacks",
                "Grains",
                "Household Groceries"
            ]
        },
        {
            name: "Fashion & Clothing",
            subcategories: [
                "Men's Clothing",
                "Women's Clothing",
                "Children's Clothing",
                "Shoes",
                "Fashion Accessories"
            ]
        },
        {
            name: "Bags & Accessories",
            subcategories: [
                "Bags",
                "Watches",
                "Jewellery",
                "Wallets",
                "Accessories"
            ]
        },
        {
            name: "Cars & Vehicles",
            subcategories: [
                "Cars",
                "Trucks",
                "Buses",
                "Car Spare Parts",
                "Car Accessories"
            ]
        },
        {
            name: "Motorcycles",
            subcategories: [
                "Motorcycles",
                "Motorbike Parts",
                "Motorbike Accessories",
                "Helmets"
            ]
        },
        {
            name: "Home & Furniture",
            subcategories: [
                "Beds",
                "Sofas",
                "Tables",
                "Chairs",
                "Wardrobes",
                "Home Appliances"
            ]
        },
        {
            name: "Tools & Equipment",
            subcategories: [
                "Power Tools",
                "Hand Tools",
                "Construction Equipment",
                "Workshop Equipment"
            ]
        },
        {
            name: "Sports & Fitness",
            subcategories: [
                "Football",
                "Gym Equipment",
                "Fitness Equipment",
                "Bicycles",
                "Sports Accessories"
            ]
        },
        {
            name: "Cameras & Photography",
            subcategories: [
                "Digital Cameras",
                "DSLR Cameras",
                "Mirrorless Cameras",
                "Lenses",
                "Camera Accessories"
            ]
        },
        {
            name: "Baby & Kids",
            subcategories: [
                "Baby Clothes",
                "Baby Equipment",
                "Toys",
                "Children's Products"
            ]
        },
        {
            name: "Books & Education",
            subcategories: [
                "Textbooks",
                "Novels",
                "School Supplies",
                "Educational Materials"
            ]
        },
        {
            name: "Solar & Power",
            subcategories: [
                "Solar Panels",
                "Inverters",
                "Batteries",
                "Generators",
                "Solar Accessories"
            ]
        },
        {
            name: "Building & Construction",
            subcategories: [
                "Building Materials",
                "Plumbing",
                "Electrical Materials",
                "Construction Equipment"
            ]
        },
        {
            name: "Gaming",
            subcategories: [
                "PlayStation",
                "Xbox",
                "Nintendo",
                "Gaming PCs",
                "Gaming Accessories"
            ]
        },
        {
            name: "Jobs & Services",
            subcategories: [
                "Employment Opportunities",
                "Freelance Services",
                "Professional Services",
                "Repairs",
                "Cleaning Services"
            ]
        }
    ], []);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Phones & Tablets");
    const [subcategory, setSubcategory] = useState("Mobile Phones");
    const [price, setPrice] = useState("");
    const [condition, setCondition] = useState("New");
    const [region, setRegion] = useState("");
    const [city, setCity] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const currentSubcategories =
        categories.find(
            (item) => item.name === category
        )?.subcategories || [];

    const validateForm = () => {
        const newErrors = {};

        if (!title.trim()) {
            newErrors.title = "Product title is required.";
        }

        if (!category) {
            newErrors.category = "Please select a category.";
        }

        if (!subcategory) {
            newErrors.subcategory =
                "Please select a subcategory.";
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
            newErrors.description =
                "Description is required.";
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

    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;

        setCategory(selectedCategory);

        const selected = categories.find(
            (item) => item.name === selectedCategory
        );

        setSubcategory(
            selected?.subcategories?.[0] || ""
        );

        setErrors((prev) => ({
            ...prev,
            category: "",
            subcategory: ""
        }));
    };

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(
            e.target.files || []
        );

        if (selectedFiles.length > 5) {
            alert("Maximum 5 images allowed.");
            e.target.value = "";
            return;
        }

        setImages(selectedFiles);

        setErrors((prev) => ({
            ...prev,
            images: ""
        }));
    };

    const removeImage = (index) => {
        setImages((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

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
                "subcategory",
                subcategory
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

            images.forEach((image) => {
                formData.append(
                    "images",
                    image
                );
            });

            const response = await api.post(
                "/products",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            alert(
                response.data?.message ||
                "Product submitted successfully."
            );

            setTitle("");
            setCategory("Phones & Tablets");
            setSubcategory("Mobile Phones");
            setPrice("");
            setCondition("New");
            setRegion("");
            setCity("");
            setDescription("");
            setImages([]);
            setErrors({});
        } catch (error) {
            console.error(
                "PRODUCT UPLOAD ERROR:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to upload product."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            className="sell-form"
            onSubmit={handleSubmit}
        >
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
                        onChange={
                            handleCategoryChange
                        }
                    >
                        <option value="">
                            Select Category
                        </option>

                        {categories.map(
                            (item) => (
                                <option
                                    key={item.name}
                                    value={item.name}
                                >
                                    {item.name}
                                </option>
                            )
                        )}
                    </select>

                    {errors.category && (
                        <span className="error">
                            {errors.category}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label>
                        Subcategory *
                    </label>

                    <select
                        value={subcategory}
                        onChange={(e) =>
                            setSubcategory(
                                e.target.value
                            )
                        }
                        disabled={
                            !category ||
                            currentSubcategories.length === 0
                        }
                    >
                        <option value="">
                            Select Subcategory
                        </option>

                        {currentSubcategories.map(
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

                    {errors.subcategory && (
                        <span className="error">
                            {errors.subcategory}
                        </span>
                    )}
                </div>

            </div>

            <div className="form-group">
                <label>
                    Condition *
                </label>

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
            </div>

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
                            setPrice(
                                e.target.value
                            )
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
                            setRegion(
                                e.target.value
                            );
                            setCity("");
                        }}
                    >
                        <option value="">
                            Select Region
                        </option>

                        {Object.keys(
                            ghanaLocations
                        ).map((item) => (
                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>
                        ))}
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
                        setCity(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        Select City
                    </option>

                    {region &&
                        ghanaLocations[
                            region
                        ]?.map((item) => (
                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>
                        ))}
                </select>

                {errors.city && (
                    <span className="error">
                        {errors.city}
                    </span>
                )}
            </div>

            <h2 className="section-title">
                Description
            </h2>

            <div className="form-group">
                <textarea
                    rows="6"
                    maxLength="1000"
                    placeholder="Describe your product..."
                    value={description}
                    onChange={(e) =>
                        setDescription(
                            e.target.value
                        )
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
            </div>

            <h2 className="section-title">
                Product Images
            </h2>

            <div className="upload-box">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={
                        handleImageChange
                    }
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

            <div className="preview-images">
                {images.map(
                    (image, index) => (
                        <div
                            className="preview-card"
                            key={`${image.name}-${index}`}
                        >
                            <img
                                className="preview-image"
                                src={URL.createObjectURL(
                                    image
                                )}
                                alt={`Preview ${
                                    index + 1
                                }`}
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
                                    removeImage(
                                        index
                                    )
                                }
                            >
                                ✕
                            </button>
                        </div>
                    )
                )}
            </div>

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
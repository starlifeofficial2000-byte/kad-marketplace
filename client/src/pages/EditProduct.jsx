import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../config/axios";
import { ghanaLocations } from "../data/ghanaLocations";
import "./EditProduct.css";

function EditProduct() {

    const { id } = useParams();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Mobile Phones");
    const [price, setPrice] = useState("");
    const [condition, setCondition] = useState("New");
    const [region, setRegion] = useState("");
    const [city, setCity] = useState("");
    const [description, setDescription] = useState("");

    const [oldImages, setOldImages] = useState([]);
    const [newImages, setNewImages] = useState([]);

    useEffect(() => {

        fetchProduct();

    }, []);

    const fetchProduct = async () => {

        try {

          const response = await api.get(
    "/settings"
);

            const p = res.data;

            setTitle(p.title);
            setCategory(p.category);
            setPrice(p.price);
            setCondition(p.condition);
            setRegion(p.region || "");
            setCity(p.city || "");
            setDescription(p.description);
            setOldImages(p.images || []);

        }

        catch (err) {

            console.log(err);

        }

    };

    const updateProduct = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append("title", title);
            formData.append("category", category);
            formData.append("price", price);
            formData.append("condition", condition);
            formData.append("region", region);
            formData.append("city", city);
            formData.append("location", `${city}, ${region}`);
            formData.append("description", description);

            newImages.forEach(image => {

                formData.append("images", image);

            });

            await axios.put(

                `/api/products/${id}`,

                formData,

                {

                    headers: {

                        Authorization: `Bearer ${token}`,

                        "Content-Type": "multipart/form-data"

                    }

                }

            );

            alert("Product updated successfully.");

            navigate("/my-products");

        }

        catch (err) {

            console.log(err);

            alert("Unable to update product.");

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="edit-page">

            <form
                className="edit-form"
                onSubmit={updateProduct}
            >

                <h1>Edit Product</h1>

                <input
                    value={title}
                    onChange={(e)=>setTitle(e.target.value)}
                    placeholder="Title"
                />

                <select
                    value={category}
                    onChange={(e)=>setCategory(e.target.value)}
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

                <input
                    type="number"
                    value={price}
                    onChange={(e)=>setPrice(e.target.value)}
                />

                <select
                    value={condition}
                    onChange={(e)=>setCondition(e.target.value)}
                >

                    <option>New</option>

                    <option>Used</option>

                </select>

                <select
                    value={region}
                    onChange={(e)=>{

                        setRegion(e.target.value);

                        setCity("");

                    }}
                >

                    <option value="">Select Region</option>

                    {

                        Object.keys(ghanaLocations).map(r=>(

                            <option
                                key={r}
                                value={r}
                            >

                                {r}

                            </option>

                        ))

                    }

                </select>

                <select
                    value={city}
                    onChange={(e)=>setCity(e.target.value)}
                >

                    <option value="">Select City</option>

                    {

                        region &&

                        ghanaLocations[region].map(city=>(

                            <option
                                key={city}
                                value={city}
                            >

                                {city}

                            </option>

                        ))

                    }

                </select>

                <textarea

                    rows="6"

                    value={description}

                    onChange={(e)=>setDescription(e.target.value)}

                />

                <h3>Current Images</h3>

                <div className="old-images">

                    {

                        oldImages.map((img,index)=>(

                            <img

                                key={index}

                                src={`/uploads/${img}`}

                                alt=""

                            />

                        ))

                    }

                </div>

                <input

                    type="file"

                    multiple

                    accept="image/*"

                    onChange={(e)=>

                        setNewImages(Array.from(e.target.files))

                    }

                />

                <button>

                    {

                        loading

                        ?

                        "Updating..."

                        :

                        "Save Changes"

                    }

                </button>

            </form>

        </div>

    );

}

export default EditProduct;
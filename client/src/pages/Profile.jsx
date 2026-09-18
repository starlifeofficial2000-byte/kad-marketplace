import { useState, useEffect } from "react";
import api from "../config/axios";
import "./Profile.css";

function Profile() {

    const token = localStorage.getItem("token");

    const [loading, setLoading] = useState(false);

    const [preview, setPreview] = useState("");

    const [profileImage, setProfileImage] = useState(null);

    const [formData, setFormData] = useState({

        name: "",

        email: "",

        phone: "",

        ghanaCard: "",

        region: "",

        city: "",

        address: ""

    });

    useEffect(() => {

        fetchProfile();

    }, []);

    const fetchProfile = async () => {

        try {

            const response = await axios.get(

                "/api/users/profile",

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            setFormData({

                name: response.data.name || "",

                email: response.data.email || "",

                phone: response.data.phone || "",

                ghanaCard: response.data.ghanaCard || "",

                region: response.data.region || "",

                city: response.data.city || "",

                address: response.data.address || ""

            });

            if (response.data.profileImage) {

                setPreview(

                    `/uploads/${response.data.profileImage}`

                );

            }

        }

        catch (error) {

            console.log(error);

        }

    };

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleImage = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setProfileImage(file);

        setPreview(URL.createObjectURL(file));

    };

    const updateProfile = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            const data = new FormData();

            data.append("name", formData.name);

            data.append("email", formData.email);

            data.append("phone", formData.phone);

            data.append("ghanaCard", formData.ghanaCard);

            data.append("region", formData.region);

            data.append("city", formData.city);

            data.append("address", formData.address);

            if (profileImage) {

                data.append("profileImage", profileImage);

            }

            const response = await axios.put(

                "/api/users/profile",

                data,

                {

                    headers: {

                        Authorization: `Bearer ${token}`,

                        "Content-Type":"multipart/form-data"

                    }

                }

            );

            alert(response.data.message);

            localStorage.setItem(

                "user",

                JSON.stringify(response.data.user)

            );

        }

        catch(error){

            console.log(error);

            alert(

                error.response?.data?.message ||

                "Unable to update profile."

            );

        }

        finally{

            setLoading(false);

        }

    };

    return (

        <div className="profile-page">

            <form

                className="profile-card"

                onSubmit={updateProfile}

            >

                <h1>

                    My Profile

                </h1>

                <div className="profile-picture">

                    <img

                        src={

                            preview ||

                            "https://ui-avatars.com/api/?name=User&background=0A66C2&color=fff"

                        }

                        alt=""

                    />

                    <input

                        type="file"

                        accept="image/*"

                        onChange={handleImage}

                    />

                </div>

                <div className="profile-grid">

                    <div>

                        <label>Full Name</label>

                        <input

                            type="text"

                            name="name"

                            value={formData.name}

                            onChange={handleChange}

                        />

                    </div>

                    <div>

                        <label>Email</label>

                        <input

                            type="email"

                            name="email"

                            value={formData.email}

                            onChange={handleChange}

                        />

                    </div>

                    <div>

                        <label>Phone Number</label>

                        <input

                            type="text"

                            name="phone"

                            value={formData.phone}

                            onChange={handleChange}

                        />

                    </div>

                    <div>

                        <label>Ghana Card</label>

                        <input

                            type="text"

                            name="ghanaCard"

                            value={formData.ghanaCard}

                            onChange={handleChange}

                        />

                    </div>

                    <div>

                        <label>Region</label>

                        <input

                            type="text"

                            name="region"

                            value={formData.region}

                            onChange={handleChange}

                        />

                    </div>

                    <div>

                        <label>City</label>

                        <input

                            type="text"

                            name="city"

                            value={formData.city}

                            onChange={handleChange}

                        />

                    </div>

                </div>

                <label>Address</label>

                <textarea

                    rows="4"

                    name="address"

                    value={formData.address}

                    onChange={handleChange}

                />

                <button>

                    {

                        loading

                        ?

                        "Saving..."

                        :

                        "Save Changes"

                    }

                </button>

            </form>

        </div>

    );

}

export default Profile;
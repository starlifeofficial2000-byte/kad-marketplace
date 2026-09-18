import { useEffect, useState } from "react";
import api from "../config/axios";
import "./Settings.css";


function Settings() {

    const [formData, setFormData] = useState({

        name: "",

        email: "",

        phone: "",

        emailNotifications: true,

        smsNotifications: false,

        pushNotifications: true,

        showPhone: true,

        showOnline: true

    });


    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    /* =====================================
       LOAD SETTINGS
    ===================================== */

    useEffect(() => {

        loadSettings();

    }, []);


    const loadSettings = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(

                "/user/settings"

            );


            const data =

                response.data?.settings ||

                response.data?.data ||

                {};


            setFormData({

                name: data.name || "",

                email: data.email || "",

                phone: data.phone || "",

                emailNotifications:
                    data.emailNotifications ?? true,

                smsNotifications:
                    data.smsNotifications ?? false,

                pushNotifications:
                    data.pushNotifications ?? true,

                showPhone:
                    data.showPhone ?? true,

                showOnline:
                    data.showOnline ?? true

            });

        }

        catch (error) {

            console.error(

                "LOAD SETTINGS ERROR:",

                error.response?.data || error.message

            );


            setError(

                error.response?.data?.message ||

                "Unable to load settings."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* =====================================
       HANDLE INPUT CHANGE
    ===================================== */

    const handleChange = (e) => {

        const {

            name,

            value,

            checked,

            type

        } = e.target;


        setFormData((previous) => ({

            ...previous,

            [name]:

                type === "checkbox"

                    ? checked

                    : value

        }));

    };


    /* =====================================
       SAVE SETTINGS
    ===================================== */

    const saveSettings = async () => {

        try {

            setSaving(true);

            setError("");

            setSuccess("");


            const response = await api.put(

                "/user/settings",

                formData

            );


            const updatedSettings =

                response.data?.settings;


            if (updatedSettings) {

                setFormData((previous) => ({

                    ...previous,

                    ...updatedSettings

                }));

            }


            setSuccess(

                response.data?.message ||

                "Settings updated successfully."

            );


            setTimeout(() => {

                setSuccess("");

            }, 4000);

        }

        catch (error) {

            console.error(

                "SAVE SETTINGS ERROR:",

                error.response?.data || error.message

            );


            setError(

                error.response?.data?.message ||

                "Unable to update settings."

            );

        }

        finally {

            setSaving(false);

        }

    };


    /* =====================================
       LOADING
    ===================================== */

    if (loading) {

        return (

            <div className="settings-page">

                <h2>

                    Loading settings...

                </h2>

            </div>

        );

    }


    /* =====================================
       PAGE
    ===================================== */

    return (

        <div className="settings-page">


            <h1>

                Account Settings

            </h1>


            {success && (

                <div className="settings-success">

                    {success}

                </div>

            )}


            {error && (

                <div className="settings-error">

                    {error}

                </div>

            )}


            <div className="settings-card">


                {/* PERSONAL INFORMATION */}

                <h3>

                    Personal Information

                </h3>


                <label>

                    Full Name

                </label>

                <input

                    type="text"

                    name="name"

                    value={formData.name}

                    onChange={handleChange}

                    placeholder="Full Name"

                />


                <label>

                    Email

                </label>

                <input

                    type="email"

                    name="email"

                    value={formData.email}

                    onChange={handleChange}

                    placeholder="Email Address"

                />


                <label>

                    Phone Number

                </label>

                <input

                    type="text"

                    name="phone"

                    value={formData.phone}

                    onChange={handleChange}

                    placeholder="Phone Number"

                />


                {/* NOTIFICATIONS */}

                <h3>

                    Notifications

                </h3>


                <label className="checkbox-label">

                    <input

                        type="checkbox"

                        name="emailNotifications"

                        checked={formData.emailNotifications}

                        onChange={handleChange}

                    />

                    Email Notifications

                </label>


                <label className="checkbox-label">

                    <input

                        type="checkbox"

                        name="smsNotifications"

                        checked={formData.smsNotifications}

                        onChange={handleChange}

                    />

                    SMS Notifications

                </label>


                <label className="checkbox-label">

                    <input

                        type="checkbox"

                        name="pushNotifications"

                        checked={formData.pushNotifications}

                        onChange={handleChange}

                    />

                    Push Notifications

                </label>


                {/* PRIVACY */}

                <h3>

                    Privacy

                </h3>


                <label className="checkbox-label">

                    <input

                        type="checkbox"

                        name="showPhone"

                        checked={formData.showPhone}

                        onChange={handleChange}

                    />

                    Show Phone Number

                </label>


                <label className="checkbox-label">

                    <input

                        type="checkbox"

                        name="showOnline"

                        checked={formData.showOnline}

                        onChange={handleChange}

                    />

                    Show Online Status

                </label>


                {/* SAVE */}

                <button

                    onClick={saveSettings}

                    disabled={saving}

                >

                    {

                        saving

                            ? "Saving..."

                            : "Save Changes"

                    }

                </button>


            </div>

        </div>

    );

}


export default Settings;
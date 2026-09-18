import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./MarketplaceSettings.css";


function MarketplaceSettings() {

    const token =
        localStorage.getItem("token");


    /* =========================================
       DEFAULT SETTINGS

       Database keys are used directly here.
    ========================================= */

    const [settings, setSettings] = useState({

        marketplace_name: "",

        marketplace_description: "",

        support_email: "",

        support_phone: "",

        business_address: "",

        primary_color: "#0A66C2",

        secondary_color: "#198754",

        maintenance_mode: false,

        registration_enabled: true,

        require_store_verification: true,

        require_product_approval: true,

        currency: "GHS"

    });


    const [loading, setLoading] =
        useState(true);


    const [saving, setSaving] =
        useState(false);


    /* =========================================
       LOAD SETTINGS
    ========================================= */

    useEffect(() => {

        loadSettings();

    }, []);


    const loadSettings = async () => {

        try {

            setLoading(true);


          const response = await api.get(
    "/settings"
);


            if (

                response.data.success &&

                Array.isArray(
                    response.data.settings
                )

            ) {

                const settingsObject = {

                    marketplace_name: "",

                    marketplace_description: "",

                    support_email: "",

                    support_phone: "",

                    business_address: "",

                    primary_color: "#0A66C2",

                    secondary_color: "#198754",

                    maintenance_mode: false,

                    registration_enabled: true,

                    require_store_verification: true,

                    require_product_approval: true,

                    currency: "GHS"

                };


                response.data.settings.forEach(

                    (item) => {

                        let value =
                            item.settingValue;


                        /*
                           Convert boolean strings
                           from the database.
                        */

                        if (

                            value === "true"

                        ) {

                            value = true;

                        }

                        else if (

                            value === "false"

                        ) {

                            value = false;

                        }


                        settingsObject[
                            item.settingKey
                        ] = value;

                    }

                );


                console.log(

                    "FORMATTED SETTINGS:",

                    settingsObject

                );


                setSettings(
                    settingsObject
                );

            }

        }

        catch (error) {

            console.error(

                "LOAD MARKETPLACE SETTINGS ERROR:",

                error

            );


            alert(

                error.response?.data?.message ||

                "Failed to load marketplace settings."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================
       HANDLE INPUT CHANGE
    ========================================= */

    const handleChange = (e) => {

        const {

            name,

            value,

            type,

            checked

        } = e.target;


        setSettings(

            (previous) => ({

                ...previous,

                [name]:

                    type === "checkbox"

                        ? checked

                        : value

            })

        );

    };


    /* =========================================
       SAVE SETTINGS
    ========================================= */

    const saveSettings = async () => {

        try {

            setSaving(true);


            /*
               Convert the settings object
               into the format expected by
               the backend.
            */

            const settingsData =

                Object.entries(settings).map(

                    ([key, value]) => ({

                        settingKey: key,

                        settingValue:
                            String(value),

                        category:
                            "Marketplace"

                    })

                );


            console.log(

                "SAVING SETTINGS:",

                settingsData

            );


            const response =
                await axios.put(

                    "/api/settings",

                    settingsData,

                    {

                        headers: {

                            Authorization:
                                `Bearer ${token}`

                        }

                    }

                );


            if (response.data.success) {

                alert(

                    "Marketplace settings updated successfully."

                );


                /*
                   Reload settings from database.

                   This ensures the frontend
                   always matches the backend.
                */

                await loadSettings();

            }

        }

        catch (error) {

            console.error(

                "SAVE MARKETPLACE SETTINGS ERROR:",

                error

            );


            alert(

                error.response?.data?.message ||

                "Failed to save marketplace settings."

            );

        }

        finally {

            setSaving(false);

        }

    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="marketplace-settings">

                <h2>

                    Loading Marketplace Settings...

                </h2>

            </div>

        );

    }


    /* =========================================
       PAGE
    ========================================= */

    return (

        <div className="marketplace-settings">


            <div className="settings-page-header">

                <div>

                    <h1>

                        Marketplace Settings

                    </h1>


                    <p>

                        Configure how your marketplace operates.

                    </p>

                </div>

            </div>


            <div className="settings-grid">


                {/* =====================================
                   MARKETPLACE NAME
                ===================================== */}

                <div className="form-group">

                    <label>

                        Marketplace Name

                    </label>


                    <input

                        type="text"

                        name="marketplace_name"

                        placeholder="Marketplace Name"

                        value={
                            settings.marketplace_name || ""
                        }

                        onChange={handleChange}

                    />

                </div>


                {/* =====================================
                   DESCRIPTION
                ===================================== */}

                <div className="form-group full-width">

                    <label>

                        Marketplace Description

                    </label>


                    <textarea

                        name="marketplace_description"

                        placeholder="Describe your marketplace"

                        value={
                            settings.marketplace_description || ""
                        }

                        onChange={handleChange}

                    />

                </div>


                {/* =====================================
                   SUPPORT EMAIL
                ===================================== */}

                <div className="form-group">

                    <label>

                        Support Email

                    </label>


                    <input

                        type="email"

                        name="support_email"

                        placeholder="support@example.com"

                        value={
                            settings.support_email || ""
                        }

                        onChange={handleChange}

                    />

                </div>


                {/* =====================================
                   SUPPORT PHONE
                ===================================== */}

                <div className="form-group">

                    <label>

                        Support Phone

                    </label>


                    <input

                        type="text"

                        name="support_phone"

                        placeholder="+233 XXX XXX XXX"

                        value={
                            settings.support_phone || ""
                        }

                        onChange={handleChange}

                    />

                </div>


                {/* =====================================
                   ADDRESS
                ===================================== */}

                <div className="form-group full-width">

                    <label>

                        Business Address

                    </label>


                    <input

                        type="text"

                        name="business_address"

                        placeholder="Business Address"

                        value={
                            settings.business_address || ""
                        }

                        onChange={handleChange}

                    />

                </div>


                {/* =====================================
                   CURRENCY
                ===================================== */}

                <div className="form-group">

                    <label>

                        Default Currency

                    </label>


                    <select

                        name="currency"

                        value={
                            settings.currency || "GHS"
                        }

                        onChange={handleChange}

                    >

                        <option value="GHS">

                            Ghana Cedi (GHS)

                        </option>

                        <option value="USD">

                            US Dollar (USD)

                        </option>

                        <option value="EUR">

                            Euro (EUR)

                        </option>

                        <option value="GBP">

                            British Pound (GBP)

                        </option>

                    </select>

                </div>


                {/* =====================================
                   PRIMARY COLOR
                ===================================== */}

                <div className="form-group">

                    <label>

                        Primary Color

                    </label>


                    <input

                        type="color"

                        name="primary_color"

                        value={
                            settings.primary_color || "#0A66C2"
                        }

                        onChange={handleChange}

                    />

                </div>


                {/* =====================================
                   SECONDARY COLOR
                ===================================== */}

                <div className="form-group">

                    <label>

                        Secondary Color

                    </label>


                    <input

                        type="color"

                        name="secondary_color"

                        value={
                            settings.secondary_color || "#198754"
                        }

                        onChange={handleChange}

                    />

                </div>


            </div>


            {/* =========================================
               SYSTEM SETTINGS
            ========================================= */}

            <div className="settings-card">


                <h2>

                    Marketplace Controls

                </h2>


                {/* MAINTENANCE */}

                <div className="toggle-setting">

                    <div>

                        <strong>

                            Maintenance Mode

                        </strong>


                        <p>

                            Temporarily disable access for
                            normal marketplace users while
                            administrators continue working.

                        </p>

                    </div>


                    <input

                        type="checkbox"

                        name="maintenance_mode"

                        checked={
                            settings.maintenance_mode === true
                        }

                        onChange={handleChange}

                    />

                </div>


                {/* REGISTRATION */}

                <div className="toggle-setting">

                    <div>

                        <strong>

                            Allow New Registrations

                        </strong>


                        <p>

                            Allow new users to create accounts.

                        </p>

                    </div>


                    <input

                        type="checkbox"

                        name="registration_enabled"

                        checked={
                            settings.registration_enabled === true
                        }

                        onChange={handleChange}

                    />

                </div>


                {/* STORE APPROVAL */}

                <div className="toggle-setting">

                    <div>

                        <strong>

                            Require Store Verification

                        </strong>


                        <p>

                            Stores must be verified before
                            they can operate.

                        </p>

                    </div>


                    <input

                        type="checkbox"

                        name="require_store_verification"

                        checked={
                            settings.require_store_verification === true
                        }

                        onChange={handleChange}

                    />

                </div>


                {/* PRODUCT APPROVAL */}

                <div className="toggle-setting">

                    <div>

                        <strong>

                            Require Product Approval

                        </strong>


                        <p>

                            Products must be approved before
                            becoming publicly visible.

                        </p>

                    </div>


                    <input

                        type="checkbox"

                        name="require_product_approval"

                        checked={
                            settings.require_product_approval === true
                        }

                        onChange={handleChange}

                    />

                </div>


            </div>


            {/* =========================================
               SAVE BUTTON
            ========================================= */}

            <div className="settings-actions">

                <button

                    className="save-btn"

                    onClick={saveSettings}

                    disabled={saving}

                >

                    {

                        saving

                            ? "Saving Settings..."

                            : "Save Marketplace Settings"

                    }

                </button>

            </div>


        </div>

    );

}


export default MarketplaceSettings;
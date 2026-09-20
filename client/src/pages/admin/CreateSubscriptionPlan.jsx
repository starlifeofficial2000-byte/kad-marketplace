import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";

import "./EditSubscription.css";

function CreateSubscriptionPlan() {

    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({

        name: "",

        description: "",

        price: 0,

        duration: 30,

        maxProducts: 10,

        maxImages: 5,

        boostCredits: 0,

        expressCredits: 0,

        featuredCredits: 0,

        aiImageChecker: false,

        aiDescriptionGenerator: false,

        aiPriceSuggestion: false,

        voiceCall: false,

        videoCall: false,

        verifiedStore: false,

        analytics: false,

        prioritySupport: false,

        priorityLevel: 1,

        active: true

    });


    /* ==========================================
       HANDLE INPUT CHANGE
    ========================================== */

    const handleChange = (e) => {

        const { name, value, checked, type } = e.target;

        setForm((previousForm) => ({

            ...previousForm,

            [name]:

                type === "checkbox"

                    ? checked

                    :

                    type === "number"

                        ? Number(value)

                        : value

        }));

    };


    /* ==========================================
       CREATE SUBSCRIPTION PLAN
    ========================================== */

    const save = async () => {

        if (!form.name.trim()) {

            alert("Please enter a subscription plan name.");

            return;

        }

        if (Number(form.price) < 0) {

            alert("Price cannot be negative.");

            return;

        }

        try {

            setSaving(true);

 await api.post(
    "/admin/subscription-plans",
    form
);

            alert(
                "Subscription Plan Created Successfully."
            );


            navigate("/admin/subscriptions");

        }

        catch (error) {

            console.error(

                "CREATE SUBSCRIPTION ERROR:",

                error.response?.data || error.message

            );


            alert(

                error.response?.data?.message ||

                "Unable to create subscription plan."

            );

        }

        finally {

            setSaving(false);

        }

    };


    return (

        <div className="edit-subscription">

            <h1>Create Subscription Plan</h1>


            <div className="form-grid">


                {/* PLAN NAME */}

                <input

                    name="name"

                    placeholder="Plan Name"

                    value={form.name}

                    onChange={handleChange}

                />


                {/* PRICE */}

                <input

                    name="price"

                    type="number"

                    min="0"

                    placeholder="Price"

                    value={form.price}

                    onChange={handleChange}

                />


                {/* DURATION */}

                <input

                    name="duration"

                    type="number"

                    min="1"

                    placeholder="Duration (Days)"

                    value={form.duration}

                    onChange={handleChange}

                />


                {/* MAX PRODUCTS */}

                <input

                    name="maxProducts"

                    type="number"

                    min="0"

                    placeholder="Maximum Products"

                    value={form.maxProducts}

                    onChange={handleChange}

                />


                {/* MAX IMAGES */}

                <input

                    name="maxImages"

                    type="number"

                    min="0"

                    placeholder="Maximum Images Per Product"

                    value={form.maxImages}

                    onChange={handleChange}

                />


                {/* BOOST CREDITS */}

                <input

                    name="boostCredits"

                    type="number"

                    min="0"

                    placeholder="Boost Credits"

                    value={form.boostCredits}

                    onChange={handleChange}

                />


                {/* EXPRESS CREDITS */}

                <input

                    name="expressCredits"

                    type="number"

                    min="0"

                    placeholder="Express Credits"

                    value={form.expressCredits}

                    onChange={handleChange}

                />


                {/* FEATURED CREDITS */}

                <input

                    name="featuredCredits"

                    type="number"

                    min="0"

                    placeholder="Featured Credits"

                    value={form.featuredCredits}

                    onChange={handleChange}

                />


                {/* PRIORITY LEVEL */}

                <input

                    name="priorityLevel"

                    type="number"

                    min="1"

                    placeholder="Priority Level"

                    value={form.priorityLevel}

                    onChange={handleChange}

                />


                {/* DESCRIPTION */}

                <textarea

                    name="description"

                    placeholder="Subscription Plan Description"

                    value={form.description}

                    onChange={handleChange}

                />

            </div>


            {/* =====================================
               FEATURES
            ====================================== */}

            <h2>Features</h2>


            <div className="checkbox-grid">


                <label>

                    <input

                        type="checkbox"

                        name="verifiedStore"

                        checked={form.verifiedStore}

                        onChange={handleChange}

                    />

                    Verified Store

                </label>


                <label>

                    <input

                        type="checkbox"

                        name="analytics"

                        checked={form.analytics}

                        onChange={handleChange}

                    />

                    Analytics

                </label>


                <label>

                    <input

                        type="checkbox"

                        name="prioritySupport"

                        checked={form.prioritySupport}

                        onChange={handleChange}

                    />

                    Priority Support

                </label>


                <label>

                    <input

                        type="checkbox"

                        name="aiImageChecker"

                        checked={form.aiImageChecker}

                        onChange={handleChange}

                    />

                    AI Image Checker

                </label>


                <label>

                    <input

                        type="checkbox"

                        name="aiDescriptionGenerator"

                        checked={form.aiDescriptionGenerator}

                        onChange={handleChange}

                    />

                    AI Description Generator

                </label>


                <label>

                    <input

                        type="checkbox"

                        name="aiPriceSuggestion"

                        checked={form.aiPriceSuggestion}

                        onChange={handleChange}

                    />

                    AI Price Suggestion

                </label>


                <label>

                    <input

                        type="checkbox"

                        name="voiceCall"

                        checked={form.voiceCall}

                        onChange={handleChange}

                    />

                    Voice Calls

                </label>


                <label>

                    <input

                        type="checkbox"

                        name="videoCall"

                        checked={form.videoCall}

                        onChange={handleChange}

                    />

                    Video Calls

                </label>


                <label>

                    <input

                        type="checkbox"

                        name="active"

                        checked={form.active}

                        onChange={handleChange}

                    />

                    Active Plan

                </label>


            </div>


            {/* =====================================
               CREATE BUTTON
            ====================================== */}

            <button

                className="save-btn"

                onClick={save}

                disabled={saving}

            >

                {

                    saving

                        ? "Creating Plan..."

                        : "Create Plan"

                }

            </button>

        </div>

    );

}

export default CreateSubscriptionPlan;
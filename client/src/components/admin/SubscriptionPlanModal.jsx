import { useEffect, useState } from "react";

import api from "../../config/axios";

import "./SubscriptionPlanModal.css";


/* =========================================
   DEFAULT PLAN
========================================= */

const defaultPlan = {

    name: "",

    description: "",

    price: 0,

    duration: 30,

    uploadLimit: 10,

    maxProducts: 10,

    listingPriority: 1,

    boostCredits: 0,

    featuredCredits: 0,

    expressCredits: 0,

    icon: "💎",

    color: "#2563eb",

    badge: "None",

    displayOrder: 1,

    visible: true,

    storeAccess: false,

    featuredProducts: false,

    verifiedStoreRequest: false,

    homepagePriority: false,

    aiRecommendation: false,

    unlimitedListings: false,

    active: true

};


/* =========================================
   COMPONENT
========================================= */

function SubscriptionPlanModal({

    show,

    onClose,

    onSuccess,

    editPlan

}) {


    /* =========================================
       STATE
    ========================================= */

    const [formData, setFormData] =
        useState(defaultPlan);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");


    /* =========================================
       LOAD EDIT DATA
    ========================================= */

    useEffect(() => {

        if (editPlan) {

            setFormData({

                ...defaultPlan,

                ...editPlan

            });

        }

        else {

            setFormData({

                ...defaultPlan

            });

        }


        setError("");

    }, [

        editPlan,

        show

    ]);


    /* =========================================
       HANDLE INPUT CHANGE
    ========================================= */

    const handleChange = (

        event

    ) => {

        const {

            name,

            value,

            type,

            checked

        } = event.target;


        setFormData((previous) => ({

            ...previous,

            [name]:

                type === "checkbox"

                    ? checked

                    : type === "number"

                        ? value === ""

                            ? ""

                            : Number(value)

                        : value

        }));

    };


    /* =========================================
       VALIDATE FORM
    ========================================= */

    const validateForm = () => {

        if (

            !formData.name ||

            !formData.name.trim()

        ) {

            return "Plan name is required.";

        }


        if (

            Number(formData.price) < 0

        ) {

            return "Price cannot be negative.";

        }


        if (

            Number(formData.duration) <= 0

        ) {

            return "Duration must be greater than zero.";

        }


        if (

            !formData.unlimitedListings &&

            Number(formData.maxProducts) < 0

        ) {

            return "Maximum products cannot be negative.";

        }


        return null;

    };


    /* =========================================
       SAVE PLAN
    ========================================= */

    const savePlan = async () => {

        const validationError =
            validateForm();


        if (validationError) {

            setError(validationError);

            return;

        }


        try {

            setSaving(true);

            setError("");


            /* =====================================
               CLEAN DATA
            ===================================== */

            const payload = {

                ...formData,

                name:

                    formData.name.trim(),

                description:

                    formData.description?.trim() || ""

            };


            /* =====================================
               UPDATE EXISTING PLAN
            ===================================== */

            if (editPlan?.id) {

                await api.put(

                    `/subscription-plans/${editPlan.id}`,

                    payload

                );

            }


            /* =====================================
               CREATE NEW PLAN
            ===================================== */

            else {

                await api.post(

                    "/subscription-plans",

                    payload

                );

            }


            alert(

                editPlan

                    ? "Subscription plan updated successfully."

                    : "Subscription plan created successfully."

            );


            /* Refresh parent data */

            if (onSuccess) {

                await onSuccess();

            }


            onClose();

        }

        catch (error) {

            console.error(

                "SAVE SUBSCRIPTION PLAN ERROR:",

                error.response?.data ||

                error.message

            );


            const message =

                error.response?.data?.message ||

                error.response?.data?.error ||

                "Unable to save subscription plan.";


            setError(message);

        }

        finally {

            setSaving(false);

        }

    };


    /* =========================================
       DO NOT RENDER IF CLOSED
    ========================================= */

    if (!show) {

        return null;

    }


    /* =========================================
       UI
    ========================================= */

    return (

        <div className="modal-overlay">

            <div className="plan-modal">


                {/* =================================
                   HEADER
                ================================= */}

                <div className="modal-header">

                    <h2>

                        {

                            editPlan

                                ? "Edit Subscription Plan"

                                : "Create Subscription Plan"

                        }

                    </h2>


                    <button

                        type="button"

                        className="close-btn"

                        onClick={onClose}

                        disabled={saving}

                        aria-label="Close"

                    >

                        ✕

                    </button>

                </div>


                {/* =================================
                   ERROR
                ================================= */}

                {

                    error && (

                        <div className="form-error">

                            {error}

                        </div>

                    )

                }


                {/* =================================
                   BASIC INFORMATION
                ================================= */}

                <div className="section">

                    <h3>

                        Basic Information

                    </h3>


                    <div className="form-grid">


                        <div className="form-group">

                            <label>

                                Plan Name

                            </label>

                            <input

                                name="name"

                                value={formData.name}

                                onChange={handleChange}

                                placeholder="e.g. Premium, VIP, Enterprise"

                                disabled={saving}

                            />

                        </div>


                        <div className="form-group">

                            <label>

                                Price (GH₵)

                            </label>

                            <input

                                type="number"

                                name="price"

                                value={formData.price}

                                onChange={handleChange}

                                min="0"

                                step="0.01"

                                disabled={saving}

                            />

                        </div>


                        <div className="form-group">

                            <label>

                                Duration (Days)

                            </label>

                            <input

                                type="number"

                                name="duration"

                                value={formData.duration}

                                onChange={handleChange}

                                min="1"

                                disabled={saving}

                            />

                        </div>


                        <div className="form-group">

                            <label>

                                Description

                            </label>

                            <textarea

                                rows="3"

                                name="description"

                                value={formData.description}

                                onChange={handleChange}

                                placeholder="Describe what customers get..."

                                disabled={saving}

                            />

                        </div>

                    </div>

                </div>


                {/* =================================
                   LISTING LIMITS
                ================================= */}

                <div className="section">

                    <h3>

                        Listing Limits

                    </h3>


                    <div className="form-grid">


                        <div className="form-group">

                            <label>

                                Maximum Products

                            </label>

                            <input

                                type="number"

                                name="maxProducts"

                                value={formData.maxProducts}

                                onChange={handleChange}

                                min="0"

                                disabled={

                                    saving ||

                                    formData.unlimitedListings

                                }

                            />

                        </div>


                        <div className="form-group">

                            <label>

                                Upload Limit

                            </label>

                            <input

                                type="number"

                                name="uploadLimit"

                                value={formData.uploadLimit}

                                onChange={handleChange}

                                min="0"

                                disabled={saving}

                            />

                        </div>


                        <div className="form-group">

                            <label>

                                Listing Priority

                            </label>

                            <input

                                type="number"

                                name="listingPriority"

                                value={formData.listingPriority}

                                onChange={handleChange}

                                min="1"

                                disabled={saving}

                            />

                        </div>


                        <div className="form-group">

                            <label>

                                Display Order

                            </label>

                            <input

                                type="number"

                                name="displayOrder"

                                value={formData.displayOrder}

                                onChange={handleChange}

                                min="1"

                                disabled={saving}

                            />

                        </div>

                    </div>

                </div>


                {/* =================================
                   CREDITS
                ================================= */}

                <div className="section">

                    <h3>

                        Credits

                    </h3>


                    <div className="form-grid">


                        <div className="form-group">

                            <label>

                                Boost Credits

                            </label>

                            <input

                                type="number"

                                name="boostCredits"

                                value={formData.boostCredits}

                                onChange={handleChange}

                                min="0"

                                disabled={saving}

                            />

                        </div>


                        <div className="form-group">

                            <label>

                                Featured Credits

                            </label>

                            <input

                                type="number"

                                name="featuredCredits"

                                value={formData.featuredCredits}

                                onChange={handleChange}

                                min="0"

                                disabled={saving}

                            />

                        </div>


                        <div className="form-group">

                            <label>

                                Express Credits

                            </label>

                            <input

                                type="number"

                                name="expressCredits"

                                value={formData.expressCredits}

                                onChange={handleChange}

                                min="0"

                                disabled={saving}

                            />

                        </div>

                    </div>

                </div>


                {/* =================================
                   DISPLAY SETTINGS
                ================================= */}

                <div className="section">

                    <h3>

                        Display Settings

                    </h3>


                    <div className="form-grid">


                        <div className="form-group">

                            <label>

                                Plan Icon

                            </label>

                            <input

                                name="icon"

                                value={formData.icon}

                                onChange={handleChange}

                                placeholder="💎 👑 ⭐ 🚀"

                                disabled={saving}

                            />

                        </div>


                        <div className="form-group">

                            <label>

                                Card Color

                            </label>

                            <input

                                type="color"

                                name="color"

                                value={formData.color}

                                onChange={handleChange}

                                disabled={saving}

                            />

                        </div>


                        <div className="form-group">

                            <label>

                                Badge

                            </label>

                            <select

                                name="badge"

                                value={formData.badge}

                                onChange={handleChange}

                                disabled={saving}

                            >

                                <option value="None">

                                    None

                                </option>

                                <option value="Most Popular">

                                    Most Popular

                                </option>

                                <option value="Recommended">

                                    Recommended

                                </option>

                                <option value="Best Value">

                                    Best Value

                                </option>

                            </select>

                        </div>


                        <div className="form-group checkbox-group">

                            <label>

                                <input

                                    type="checkbox"

                                    name="visible"

                                    checked={formData.visible}

                                    onChange={handleChange}

                                    disabled={saving}

                                />

                                Visible To Customers

                            </label>

                        </div>

                    </div>

                </div>


                {/* =================================
                   FEATURES
                ================================= */}

                <div className="section">

                    <h3>

                        Features

                    </h3>


                    <div className="checkbox-grid">


                        <label>

                            <input

                                type="checkbox"

                                name="storeAccess"

                                checked={formData.storeAccess}

                                onChange={handleChange}

                                disabled={saving}

                            />

                            Store Access

                        </label>


                        <label>

                            <input

                                type="checkbox"

                                name="featuredProducts"

                                checked={formData.featuredProducts}

                                onChange={handleChange}

                                disabled={saving}

                            />

                            Featured Products

                        </label>


                        <label>

                            <input

                                type="checkbox"

                                name="verifiedStoreRequest"

                                checked={formData.verifiedStoreRequest}

                                onChange={handleChange}

                                disabled={saving}

                            />

                            Verified Store Request

                        </label>


                        <label>

                            <input

                                type="checkbox"

                                name="homepagePriority"

                                checked={formData.homepagePriority}

                                onChange={handleChange}

                                disabled={saving}

                            />

                            Homepage Priority

                        </label>


                        <label>

                            <input

                                type="checkbox"

                                name="aiRecommendation"

                                checked={formData.aiRecommendation}

                                onChange={handleChange}

                                disabled={saving}

                            />

                            AI Recommendation

                        </label>


                        <label>

                            <input

                                type="checkbox"

                                name="unlimitedListings"

                                checked={formData.unlimitedListings}

                                onChange={handleChange}

                                disabled={saving}

                            />

                            Unlimited Listings

                        </label>


                        <label>

                            <input

                                type="checkbox"

                                name="active"

                                checked={formData.active}

                                onChange={handleChange}

                                disabled={saving}

                            />

                            Active Plan

                        </label>


                    </div>

                </div>


                {/* =================================
                   ACTION BUTTONS
                ================================= */}

                <div className="modal-buttons">


                    <button

                        type="button"

                        className="save-btn"

                        onClick={savePlan}

                        disabled={saving}

                    >

                        {

                            saving

                                ? "Saving..."

                                : "💾 Save Plan"

                        }

                    </button>


                    <button

                        type="button"

                        className="cancel-btn"

                        onClick={onClose}

                        disabled={saving}

                    >

                        Cancel

                    </button>


                </div>


            </div>

        </div>

    );

}


export default SubscriptionPlanModal;
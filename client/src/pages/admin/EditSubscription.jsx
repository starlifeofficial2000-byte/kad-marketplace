import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../config/axios";
import "./SubscriptionPlans.css";

const EditSubscription = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

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
        active: true,
    });

    // =========================
    // LOAD PLAN
    // =========================
    useEffect(() => {
        const loadPlan = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/admin/subscription-plans/${id}`
                );

                const plan = response.data?.plan;

                if (!plan) {
                    throw new Error("Subscription plan was not found.");
                }

                setForm({
                    name: plan.name || "",
                    description: plan.description || "",
                    price: plan.price ?? 0,
                    duration: plan.duration ?? 30,
                    maxProducts: plan.maxProducts ?? 10,
                    maxImages: plan.maxImages ?? 5,
                    boostCredits: plan.boostCredits ?? 0,
                    expressCredits: plan.expressCredits ?? 0,
                    featuredCredits: plan.featuredCredits ?? 0,
                    aiImageChecker: Boolean(plan.aiImageChecker),
                    aiDescriptionGenerator: Boolean(
                        plan.aiDescriptionGenerator
                    ),
                    aiPriceSuggestion: Boolean(plan.aiPriceSuggestion),
                    voiceCall: Boolean(plan.voiceCall),
                    videoCall: Boolean(plan.videoCall),
                    verifiedStore: Boolean(plan.verifiedStore),
                    analytics: Boolean(plan.analytics),
                    prioritySupport: Boolean(plan.prioritySupport),
                    priorityLevel: plan.priorityLevel ?? 1,
                    active:
                        plan.isActive !== undefined
                            ? Boolean(plan.isActive)
                            : Boolean(plan.active),
                });
            } catch (err) {
                console.error("LOAD SUBSCRIPTION ERROR:", err);

                setError(
                    err.response?.data?.message ||
                        err.message ||
                        "Failed to load subscription plan."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadPlan();
        }
    }, [id]);

    // =========================
    // HANDLE INPUT
    // =========================
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // =========================
    // SAVE PLAN
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            setError("Plan name is required.");
            return;
        }

        if (Number(form.price) < 0) {
            setError("Price cannot be negative.");
            return;
        }

        if (Number(form.duration) <= 0) {
            setError("Duration must be greater than zero.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),

                price: Number(form.price),
                duration: Number(form.duration),

                maxProducts: Number(form.maxProducts),
                maxImages: Number(form.maxImages),

                boostCredits: Number(form.boostCredits),
                expressCredits: Number(form.expressCredits),
                featuredCredits: Number(form.featuredCredits),

                aiImageChecker: Boolean(form.aiImageChecker),
                aiDescriptionGenerator: Boolean(
                    form.aiDescriptionGenerator
                ),
                aiPriceSuggestion: Boolean(form.aiPriceSuggestion),

                voiceCall: Boolean(form.voiceCall),
                videoCall: Boolean(form.videoCall),

                verifiedStore: Boolean(form.verifiedStore),
                analytics: Boolean(form.analytics),
                prioritySupport: Boolean(form.prioritySupport),

                priorityLevel: Number(form.priorityLevel),

                active: Boolean(form.active),
                isActive: Boolean(form.active),
            };

            console.log("UPDATING SUBSCRIPTION PLAN:", payload);

            await api.put(
                `/admin/subscription-plans/${id}`,
                payload
            );

            alert("Subscription plan updated successfully.");

            navigate("/admin/subscriptions");
        } catch (err) {
            console.error("UPDATE SUBSCRIPTION ERROR:", err);

            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to update subscription plan."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div className="subscription-page">
                <div className="subscription-card">
                    <h2>Loading subscription plan...</h2>
                </div>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================
    if (error && !form.name) {
        return (
            <div className="subscription-page">
                <div className="subscription-card">
                    <h2>Unable to load plan</h2>

                    <p className="error-message">{error}</p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/subscriptions")
                        }
                    >
                        Back to Subscriptions
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="subscription-page">
            <div className="subscription-header">
                <div>
                    <h1>Edit Subscription Plan</h1>
                    <p>
                        Update the pricing, limits and features of this
                        subscription plan.
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                        navigate("/admin/subscriptions")
                    }
                    disabled={saving}
                >
                    Back
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form
                className="subscription-form"
                onSubmit={handleSubmit}
            >
                {/* BASIC INFORMATION */}
                <section className="form-section">
                    <h2>Basic Information</h2>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Plan Name</label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Premium"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Price</label>

                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="form-group">
                            <label>Duration (Days)</label>

                            <input
                                type="number"
                                name="duration"
                                value={form.duration}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Description</label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Describe what this plan offers..."
                            />
                        </div>
                    </div>
                </section>

                {/* LIMITS */}
                <section className="form-section">
                    <h2>Usage Limits</h2>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Maximum Products</label>

                            <input
                                type="number"
                                name="maxProducts"
                                value={form.maxProducts}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Maximum Images</label>

                            <input
                                type="number"
                                name="maxImages"
                                value={form.maxImages}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Boost Credits</label>

                            <input
                                type="number"
                                name="boostCredits"
                                value={form.boostCredits}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Featured Credits</label>

                            <input
                                type="number"
                                name="featuredCredits"
                                value={form.featuredCredits}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Express Credits</label>

                            <input
                                type="number"
                                name="expressCredits"
                                value={form.expressCredits}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Priority Level</label>

                            <input
                                type="number"
                                name="priorityLevel"
                                value={form.priorityLevel}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>
                    </div>
                </section>

                {/* AI FEATURES */}
                <section className="form-section">
                    <h2>AI Features</h2>

                    <div className="checkbox-grid">
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="aiImageChecker"
                                checked={form.aiImageChecker}
                                onChange={handleChange}
                            />
                            <span>AI Image Checker</span>
                        </label>

                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="aiDescriptionGenerator"
                                checked={
                                    form.aiDescriptionGenerator
                                }
                                onChange={handleChange}
                            />
                            <span>AI Description Generator</span>
                        </label>

                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="aiPriceSuggestion"
                                checked={form.aiPriceSuggestion}
                                onChange={handleChange}
                            />
                            <span>AI Price Suggestion</span>
                        </label>
                    </div>
                </section>

                {/* SELLER FEATURES */}
                <section className="form-section">
                    <h2>Seller Features</h2>

                    <div className="checkbox-grid">
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="voiceCall"
                                checked={form.voiceCall}
                                onChange={handleChange}
                            />
                            <span>Voice Call</span>
                        </label>

                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="videoCall"
                                checked={form.videoCall}
                                onChange={handleChange}
                            />
                            <span>Video Call</span>
                        </label>

                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="verifiedStore"
                                checked={form.verifiedStore}
                                onChange={handleChange}
                            />
                            <span>Verified Store</span>
                        </label>

                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="analytics"
                                checked={form.analytics}
                                onChange={handleChange}
                            />
                            <span>Analytics</span>
                        </label>

                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="prioritySupport"
                                checked={form.prioritySupport}
                                onChange={handleChange}
                            />
                            <span>Priority Support</span>
                        </label>
                    </div>
                </section>

                {/* STATUS */}
                <section className="form-section">
                    <h2>Plan Status</h2>

                    <label className="checkbox-item">
                        <input
                            type="checkbox"
                            name="active"
                            checked={form.active}
                            onChange={handleChange}
                        />

                        <span>
                            Active subscription plan
                        </span>
                    </label>
                </section>

                {/* ACTIONS */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            navigate("/admin/subscriptions")
                        }
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditSubscription;
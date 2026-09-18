function MarketplaceSettings({

    settings,

    handleChange

}) {

    return (

        <div className="settings-section">

            <div className="section-header">

                <h2>Marketplace Settings</h2>

                <p>
                    Configure how your marketplace operates.
                </p>

            </div>


            {/* =====================================
                PRODUCT SETTINGS
            ===================================== */}

            <div className="settings-card">

                <h3>Product Settings</h3>


                <div className="form-group">

                    <label>
                        Maximum Product Images
                    </label>

                    <input

                        type="number"

                        min="1"

                        max="10"

                        value={
                            settings.max_product_images || 5
                        }

                        onChange={(e) =>

                            handleChange(

                                "max_product_images",

                                e.target.value

                            )

                        }

                    />

                    <small>
                        Maximum number of images sellers can upload per product.
                    </small>

                </div>


                <div className="form-group">

                    <label>
                        Maximum Products Per User
                    </label>

                    <input

                        type="number"

                        min="1"

                        value={
                            settings.max_products_per_user || 50
                        }

                        onChange={(e) =>

                            handleChange(

                                "max_products_per_user",

                                e.target.value

                            )

                        }

                    />

                    <small>
                        Maximum number of products a user can post.
                    </small>

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Allow Product Posting
                        </strong>

                        <p>
                            Allow users to post products on the marketplace.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.allow_product_posting !== "false"
                        }

                        onChange={(e) =>

                            handleChange(

                                "allow_product_posting",

                                e.target.checked.toString()

                            )

                        }

                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Require Product Approval
                        </strong>

                        <p>
                            Products must be approved by an administrator
                            before becoming visible.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.require_product_approval === "true"
                        }

                        onChange={(e) =>

                            handleChange(

                                "require_product_approval",

                                e.target.checked.toString()

                            )

                        }

                    />

                </div>

            </div>


            {/* =====================================
                STORE SETTINGS
            ===================================== */}

            <div className="settings-card">

                <h3>Store Settings</h3>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Allow Store Creation
                        </strong>

                        <p>
                            Allow users to create and manage stores.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.allow_store_creation !== "false"
                        }

                        onChange={(e) =>

                            handleChange(

                                "allow_store_creation",

                                e.target.checked.toString()

                            )

                        }

                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Require Store Verification
                        </strong>

                        <p>
                            Stores must be verified before they can operate.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.require_store_verification === "true"
                        }

                        onChange={(e) =>

                            handleChange(

                                "require_store_verification",

                                e.target.checked.toString()

                            )

                        }

                    />

                </div>

            </div>


            {/* =====================================
                PRICING SETTINGS
            ===================================== */}

            <div className="settings-card">

                <h3>Marketplace Pricing</h3>


                <div className="form-group">

                    <label>
                        Promotion Price (GH₵)
                    </label>

                    <input

                        type="number"

                        min="0"

                        step="0.01"

                        value={
                            settings.promotion_price || ""
                        }

                        onChange={(e) =>

                            handleChange(

                                "promotion_price",

                                e.target.value

                            )

                        }

                    />

                    <small>
                        Amount charged to promote a product.
                    </small>

                </div>


                <div className="form-group">

                    <label>
                        Advertisement Price (GH₵)
                    </label>

                    <input

                        type="number"

                        min="0"

                        step="0.01"

                        value={
                            settings.advertisement_price || ""
                        }

                        onChange={(e) =>

                            handleChange(

                                "advertisement_price",

                                e.target.value

                            )

                        }

                    />

                    <small>
                        Default price for marketplace advertisements.
                    </small>

                </div>

            </div>


            {/* =====================================
                MARKETPLACE CONTROL
            ===================================== */}

            <div className="settings-card">

                <h3>Marketplace Control</h3>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Allow New Registration
                        </strong>

                        <p>
                            Allow new users to create marketplace accounts.
                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.allow_registration !== "false"
                        }

                        onChange={(e) =>

                            handleChange(

                                "allow_registration",

                                e.target.checked.toString()

                            )

                        }

                    />

                </div>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Maintenance Mode
                        </strong>

                        <p>
                            Temporarily restrict access to the marketplace.
                        </p>

                    </div>


                   <div className="toggle-setting">

    <div>

        <strong>
            Developer Mode
        </strong>

        <p>
            Enable developer tools and debugging features.
        </p>

    </div>

    <input
        type="checkbox"
        checked={
            settings.developer_mode === "true" ||
            settings.developer_mode === true
        }
        onChange={(e) =>
            handleChange(
                "developer_mode",
                e.target.checked ? "true" : "false"
            )
        }
    />

</div>

                </div>

            </div>

        </div>

    );

}

export default MarketplaceSettings;
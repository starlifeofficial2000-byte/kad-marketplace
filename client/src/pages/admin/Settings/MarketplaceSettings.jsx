function MarketplaceSettings({
    settings,
    handleChange
}) {

    /* =====================================================
       SAFE SETTINGS
    ===================================================== */

    const maxProductImages =
        settings?.max_product_images || "5";

    const maxProductsPerUser =
        settings?.max_products_per_user || "50";

    const allowProductPosting =
        settings?.allow_product_posting !== "false";

    const requireProductApproval =
        settings?.require_product_approval === "true";

    const allowStoreCreation =
        settings?.allow_store_creation !== "false";

    const requireStoreVerification =
        settings?.require_store_verification === "true";

    const promotionPrice =
        settings?.promotion_price || "";

    const advertisementPrice =
        settings?.advertisement_price || "";

    const allowRegistration =
        settings?.allow_registration !== "false";

    const maintenanceMode =
        settings?.maintenance_mode === "true";

    const developerMode =
        settings?.developer_mode === "true" ||
        settings?.developer_mode === true;


    /* =====================================================
       SAFE NUMBER HANDLER
    ===================================================== */

    const updateNumber = (
        key,
        value
    ) => {

        if (value === "") {

            handleChange(
                key,
                ""
            );

            return;
        }


        const number =
            Number(value);


        if (
            Number.isNaN(number)
        ) {

            return;

        }


        handleChange(
            key,
            String(number)
        );

    };


    /* =====================================================
       BOOLEAN HANDLER
    ===================================================== */

    const updateBoolean = (
        key,
        value
    ) => {

        handleChange(
            key,
            value
                ? "true"
                : "false"
        );

    };


    /* =====================================================
       COMPONENT
    ===================================================== */

    return (

        <div className="settings-section">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="section-header">

                <div className="section-header-content">

                    <div className="section-icon">
                        🛒
                    </div>

                    <div>

                        <h2>
                            Marketplace Settings
                        </h2>

                        <p>
                            Configure how your marketplace
                            operates and how users interact
                            with products and stores.
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                PRODUCT SETTINGS
            ================================================= */}

            <div className="settings-card">

                <h3>
                    Product Settings
                </h3>


                {/* MAX PRODUCT IMAGES */}

                <div className="form-group">

                    <label>
                        Maximum Product Images
                    </label>

                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={
                            maxProductImages
                        }
                        onChange={(e) =>
                            updateNumber(
                                "max_product_images",
                                e.target.value
                            )
                        }
                    />

                    <small>
                        Maximum number of images
                        sellers can upload for
                        one product.
                    </small>

                </div>


                {/* MAX PRODUCTS PER USER */}

                <div className="form-group">

                    <label>
                        Maximum Products Per User
                    </label>

                    <input
                        type="number"
                        min="1"
                        max="10000"
                        value={
                            maxProductsPerUser
                        }
                        onChange={(e) =>
                            updateNumber(
                                "max_products_per_user",
                                e.target.value
                            )
                        }
                    />

                    <small>
                        Maximum number of products
                        one user can post.
                    </small>

                </div>


                {/* ALLOW PRODUCT POSTING */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Allow Product Posting
                        </strong>

                        <p>
                            Allow users to post
                            products on the marketplace.
                        </p>

                    </div>

                    <input
                        type="checkbox"
                        checked={
                            allowProductPosting
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "allow_product_posting",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* REQUIRE PRODUCT APPROVAL */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Require Product Approval
                        </strong>

                        <p>
                            Products must be approved by
                            an administrator before they
                            become publicly visible.
                        </p>

                    </div>

                    <input
                        type="checkbox"
                        checked={
                            requireProductApproval
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "require_product_approval",
                                e.target.checked
                            )
                        }
                    />

                </div>

            </div>


            {/* =================================================
                STORE SETTINGS
            ================================================= */}

            <div className="settings-card">

                <h3>
                    Store Settings
                </h3>


                {/* ALLOW STORE CREATION */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Allow Store Creation
                        </strong>

                        <p>
                            Allow users to create and
                            manage marketplace stores.
                        </p>

                    </div>

                    <input
                        type="checkbox"
                        checked={
                            allowStoreCreation
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "allow_store_creation",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* REQUIRE STORE VERIFICATION */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Require Store Verification
                        </strong>

                        <p>
                            Stores must be verified by
                            an administrator before
                            they can operate.
                        </p>

                    </div>

                    <input
                        type="checkbox"
                        checked={
                            requireStoreVerification
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "require_store_verification",
                                e.target.checked
                            )
                        }
                    />

                </div>

            </div>


            {/* =================================================
                PRICING SETTINGS
            ================================================= */}

            <div className="settings-card">

                <h3>
                    Marketplace Pricing
                </h3>


                {/* PROMOTION PRICE */}

                <div className="form-group">

                    <label>
                        Promotion Price (GH₵)
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                            promotionPrice
                        }
                        onChange={(e) =>
                            handleChange(
                                "promotion_price",
                                e.target.value
                            )
                        }
                        placeholder="0.00"
                    />

                    <small>
                        Default amount charged when
                        a seller promotes a product.
                    </small>

                </div>


                {/* ADVERTISEMENT PRICE */}

                <div className="form-group">

                    <label>
                        Advertisement Price (GH₵)
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                            advertisementPrice
                        }
                        onChange={(e) =>
                            handleChange(
                                "advertisement_price",
                                e.target.value
                            )
                        }
                        placeholder="0.00"
                    />

                    <small>
                        Default price for marketplace
                        advertisements.
                    </small>

                </div>

            </div>


            {/* =================================================
                MARKETPLACE CONTROL
            ================================================= */}

            <div className="settings-card">

                <h3>
                    Marketplace Control
                </h3>


                {/* REGISTRATION */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Allow New Registration
                        </strong>

                        <p>
                            Allow new users to create
                            marketplace accounts.
                        </p>

                    </div>

                    <input
                        type="checkbox"
                        checked={
                            allowRegistration
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "allow_registration",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* MAINTENANCE MODE */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Maintenance Mode
                        </strong>

                        <p>
                            Temporarily restrict access
                            to the marketplace while
                            maintenance is being performed.
                        </p>

                    </div>

                    <input
                        type="checkbox"
                        checked={
                            maintenanceMode
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "maintenance_mode",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* DEVELOPER MODE */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Developer Mode
                        </strong>

                        <p>
                            Enable developer tools and
                            additional debugging features.
                        </p>

                    </div>

                    <input
                        type="checkbox"
                        checked={
                            developerMode
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "developer_mode",
                                e.target.checked
                            )
                        }
                    />

                </div>

            </div>


            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="settings-info-card">

                <div className="settings-info-icon">
                    ℹ️
                </div>

                <div>

                    <strong>
                        Marketplace Configuration
                    </strong>

                    <p>

                        Product posting is{" "}
                        <strong>
                            {allowProductPosting
                                ? "enabled"
                                : "disabled"}
                        </strong>
                        , product approval is{" "}
                        <strong>
                            {requireProductApproval
                                ? "required"
                                : "not required"}
                        </strong>
                        , and store verification is{" "}
                        <strong>
                            {requireStoreVerification
                                ? "required"
                                : "not required"}
                        </strong>
                        .

                    </p>

                </div>

            </div>

        </div>

    );

}


export default MarketplaceSettings;
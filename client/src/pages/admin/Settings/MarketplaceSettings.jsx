function MarketplaceSettings({
    settings,
    handleChange
}) {

    /* =====================================================
       SAFE VALUES
    ===================================================== */

    const maxProductImages =
        settings?.max_product_images || "5";

    const requireProductApproval =
        settings?.require_product_approval === "true" ||
        settings?.require_product_approval === true;

    const allowRegistration =
        settings?.allow_registration !== "false" &&
        settings?.allow_registration !== false;


    /* =====================================================
       NUMBER HANDLER
    ===================================================== */

    const updateNumber = (key, value) => {

        if (value === "") {
            handleChange(key, "");
            return;
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
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

    const updateBoolean = (key, value) => {

        handleChange(
            key,
            value ? "true" : "false"
        );

    };


    /* =====================================================
       COMPONENT
    ===================================================== */

    return (

        <div className="settings-section marketplace-settings">

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
                            Configure the core rules that control
                            product listings and user registration.
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


                {/* MAXIMUM PRODUCT IMAGES */}

                <div className="form-group">

                    <label htmlFor="max_product_images">
                        Maximum Product Images
                    </label>

                    <input
                        id="max_product_images"
                        type="number"
                        min="1"
                        max="20"
                        value={maxProductImages}
                        onChange={(e) =>
                            updateNumber(
                                "max_product_images",
                                e.target.value
                            )
                        }
                    />

                    <small>
                        Maximum number of images a seller can
                        upload for one product.
                    </small>

                </div>


                {/* PRODUCT APPROVAL */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Require Product Approval
                        </strong>

                        <p>
                            Products must be reviewed and approved
                            by an administrator before they become
                            publicly visible.
                        </p>

                    </div>

                    <label className="switch">

                        <input
                            type="checkbox"
                            checked={requireProductApproval}
                            onChange={(e) =>
                                updateBoolean(
                                    "require_product_approval",
                                    e.target.checked
                                )
                            }
                        />

                        <span className="slider"></span>

                    </label>

                </div>

            </div>


            {/* =================================================
                REGISTRATION SETTINGS
            ================================================= */}

            <div className="settings-card">

                <h3>
                    Registration Settings
                </h3>

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Allow New Registration
                        </strong>

                        <p>
                            Allow new users to create accounts
                            on KAD Marketplace.
                        </p>

                    </div>

                    <label className="switch">

                        <input
                            type="checkbox"
                            checked={allowRegistration}
                            onChange={(e) =>
                                updateBoolean(
                                    "allow_registration",
                                    e.target.checked
                                )
                            }
                        />

                        <span className="slider"></span>

                    </label>

                </div>

            </div>


            {/* =================================================
                CURRENT CONFIGURATION
            ================================================= */}

            <div className="settings-info-card">

                <div className="settings-info-icon">
                    ⚙️
                </div>

                <div>

                    <strong>
                        Current Marketplace Configuration
                    </strong>

                    <p>

                        Sellers can upload up to{" "}

                        <strong>
                            {maxProductImages}
                        </strong>{" "}

                        images per product.

                        Product approval is{" "}

                        <strong>
                            {requireProductApproval
                                ? "required"
                                : "not required"}
                        </strong>.

                        New user registration is{" "}

                        <strong>
                            {allowRegistration
                                ? "enabled"
                                : "disabled"}
                        </strong>.

                    </p>

                </div>

            </div>

        </div>

    );
}

export default MarketplaceSettings;
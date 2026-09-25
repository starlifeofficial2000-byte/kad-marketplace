import React from "react";


function GeneralSettings({
    settings,
    handleChange
}) {

    /* =====================================================
       SAFE SETTINGS
    ===================================================== */

    const marketplaceName =
        settings?.marketplace_name || "";

    const currency =
        settings?.currency || "GH₵";

    const supportEmail =
        settings?.support_email || "";

    const supportPhone =
        settings?.support_phone || "";

    const defaultLanguage =
        settings?.default_language || "English";

    const timezone =
        settings?.timezone || "Africa/Accra";


    /* =====================================================
       EMAIL VALIDATION
    ===================================================== */

    const isValidEmail =
        !supportEmail ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            supportEmail
        );


    /* =====================================================
       HANDLE INPUT
    ===================================================== */

    const updateSetting = (
        key,
        value
    ) => {

        handleChange(
            key,
            value
        );

    };


    return (

        <div className="settings-section general-settings">


            {/* =================================================
                SECTION HEADER
            ================================================= */}

            <div className="section-header">

                <div className="section-header-content">

                    <div className="section-icon">
                        🌐
                    </div>

                    <div>

                        <h2>
                            General Settings
                        </h2>

                        <p>
                            Configure the basic information,
                            regional preferences and contact
                            information for your marketplace.
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                SETTINGS CARD
            ================================================= */}

            <div className="settings-card">


                {/* =================================================
                    MARKETPLACE NAME
                ================================================= */}

                <div className="form-group">

                    <label htmlFor="marketplace-name">

                        Marketplace Name

                        <span className="required">
                            *
                        </span>

                    </label>


                    <input
                        id="marketplace-name"
                        type="text"
                        value={marketplaceName}
                        onChange={(e) =>
                            updateSetting(
                                "marketplace_name",
                                e.target.value
                            )
                        }
                        placeholder="Enter marketplace name"
                        maxLength={100}
                    />


                    <small>
                        This name will appear throughout
                        your marketplace, including the
                        website header, emails and system
                        notifications.
                    </small>

                </div>


                {/* =================================================
                    CURRENCY
                ================================================= */}

                <div className="form-group">

                    <label htmlFor="marketplace-currency">

                        Currency

                        <span className="required">
                            *
                        </span>

                    </label>


                    <select
                        id="marketplace-currency"
                        value={currency}
                        onChange={(e) =>
                            updateSetting(
                                "currency",
                                e.target.value
                            )
                        }
                    >

                        <option value="GH₵">
                            Ghana Cedi (GH₵)
                        </option>

                        <option value="$">
                            US Dollar ($)
                        </option>

                        <option value="£">
                            British Pound (£)
                        </option>

                        <option value="€">
                            Euro (€)
                        </option>

                    </select>


                    <small>
                        Select the currency used to display
                        product prices throughout the marketplace.
                    </small>

                </div>


                {/* =================================================
                    SUPPORT EMAIL
                ================================================= */}

                <div className="form-group">

                    <label htmlFor="support-email">

                        Support Email

                    </label>


                    <input
                        id="support-email"
                        type="email"
                        value={supportEmail}
                        onChange={(e) =>
                            updateSetting(
                                "support_email",
                                e.target.value
                            )
                        }
                        placeholder="support@kadmarket.com"
                        autoComplete="email"
                        maxLength={150}
                    />


                    {!isValidEmail && (

                        <small className="form-error">

                            Please enter a valid email address.

                        </small>

                    )}


                    {isValidEmail && (

                        <small>
                            This email can be used by customers
                            when they need marketplace support.
                        </small>

                    )}

                </div>


                {/* =================================================
                    SUPPORT PHONE
                ================================================= */}

                <div className="form-group">

                    <label htmlFor="support-phone">

                        Support Phone Number

                    </label>


                    <input
                        id="support-phone"
                        type="tel"
                        value={supportPhone}
                        onChange={(e) =>
                            updateSetting(
                                "support_phone",
                                e.target.value
                            )
                        }
                        placeholder="+233 24 123 4567"
                        autoComplete="tel"
                        maxLength={30}
                    />


                    <small>
                        Enter the phone number customers
                        should use when contacting marketplace
                        support.
                    </small>

                </div>


                {/* =================================================
                    DEFAULT LANGUAGE
                ================================================= */}

                <div className="form-group">

                    <label htmlFor="default-language">

                        Default Language

                        <span className="required">
                            *
                        </span>

                    </label>


                    <select
                        id="default-language"
                        value={defaultLanguage}
                        onChange={(e) =>
                            updateSetting(
                                "default_language",
                                e.target.value
                            )
                        }
                    >

                        <option value="English">
                            English
                        </option>

                        <option value="French">
                            French
                        </option>

                        <option value="Spanish">
                            Spanish
                        </option>

                    </select>


                    <small>
                        Sets the default language used
                        by the marketplace interface.
                    </small>

                </div>


                {/* =================================================
                    TIMEZONE
                ================================================= */}

                <div className="form-group">

                    <label htmlFor="marketplace-timezone">

                        Timezone

                        <span className="required">
                            *
                        </span>

                    </label>


                    <select
                        id="marketplace-timezone"
                        value={timezone}
                        onChange={(e) =>
                            updateSetting(
                                "timezone",
                                e.target.value
                            )
                        }
                    >

                        <option value="Africa/Accra">
                            Africa/Accra (GMT)
                        </option>

                        <option value="UTC">
                            UTC
                        </option>

                        <option value="Europe/London">
                            Europe/London
                        </option>

                        <option value="America/New_York">
                            America/New York
                        </option>

                    </select>


                    <small>
                        Used for marketplace timestamps,
                        schedules, notifications and other
                        time-based operations.
                    </small>

                </div>


            </div>


            {/* =================================================
                CURRENT CONFIGURATION SUMMARY
            ================================================= */}

            <div className="settings-info-card">

                <div className="settings-info-icon">
                    ℹ️
                </div>


                <div>

                    <strong>
                        Current Marketplace Configuration
                    </strong>


                    <p>

                        {marketplaceName
                            ? marketplaceName
                            : "Marketplace name not configured"
                        }

                        {" • "}

                        {currency}

                        {" • "}

                        {defaultLanguage}

                        {" • "}

                        {timezone}

                    </p>

                </div>

            </div>


        </div>

    );

}


export default GeneralSettings;
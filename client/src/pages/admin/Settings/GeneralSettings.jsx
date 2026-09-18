function GeneralSettings({
    settings,
    handleChange
}) {

    return (

        <div className="settings-section">

            <div className="section-header">

                <div>

                    <h2>General Settings</h2>

                    <p>
                        Configure the basic information for your marketplace.
                    </p>

                </div>

            </div>


            <div className="settings-card">

                {/* Marketplace Name */}

                <div className="form-group">

                    <label>
                        Marketplace Name
                    </label>

                    <input
                        type="text"
                        value={settings.marketplace_name || ""}
                        onChange={(e) =>
                            handleChange(
                                "marketplace_name",
                                e.target.value
                            )
                        }
                        placeholder="Enter marketplace name"
                    />

                    <small>
                        This name will appear across your marketplace.
                    </small>

                </div>


                {/* Currency */}

                <div className="form-group">

                    <label>
                        Currency
                    </label>

                    <select
                        value={settings.currency || "GH₵"}
                        onChange={(e) =>
                            handleChange(
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

                </div>


                {/* Support Email */}

                <div className="form-group">

                    <label>
                        Support Email
                    </label>

                    <input
                        type="email"
                        value={settings.support_email || ""}
                        onChange={(e) =>
                            handleChange(
                                "support_email",
                                e.target.value
                            )
                        }
                        placeholder="support@example.com"
                    />

                </div>


                {/* Support Phone */}

                <div className="form-group">

                    <label>
                        Support Phone Number
                    </label>

                    <input
                        type="text"
                        value={settings.support_phone || ""}
                        onChange={(e) =>
                            handleChange(
                                "support_phone",
                                e.target.value
                            )
                        }
                        placeholder="+233 XXX XXX XXX"
                    />

                </div>


                {/* Default Language */}

                <div className="form-group">

                    <label>
                        Default Language
                    </label>

                    <select
                        value={
                            settings.default_language || "English"
                        }
                        onChange={(e) =>
                            handleChange(
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

                </div>


                {/* Timezone */}

                <div className="form-group">

                    <label>
                        Timezone
                    </label>

                    <select
                        value={
                            settings.timezone || "Africa/Accra"
                        }
                        onChange={(e) =>
                            handleChange(
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

                </div>

            </div>

        </div>

    );

}

export default GeneralSettings;
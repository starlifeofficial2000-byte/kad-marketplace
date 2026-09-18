function PaymentSettings({
    settings,
    handleChange
}) {

    return (

        <div className="settings-section">

            <div className="section-header">

                <div>

                    <h2>Payment Settings</h2>

                    <p>
                        Configure payment methods and transaction settings
                        for your marketplace.
                    </p>

                </div>

            </div>


            <div className="settings-card">


                {/* ================= PAYMENT METHODS ================= */}

                <h3 className="settings-subtitle">

                    Payment Methods

                </h3>


                {/* MOBILE MONEY */}

                <div className="toggle-setting">

                    <div>

                        <strong>

                            Enable Mobile Money

                        </strong>

                        <p>

                            Allow customers to make payments using
                            MTN Mobile Money, Telecel Cash, and AirtelTigo Money.

                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.enable_mobile_money === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "enable_mobile_money",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


                {/* CARD PAYMENT */}

                <div className="toggle-setting">

                    <div>

                        <strong>

                            Enable Card Payments

                        </strong>

                        <p>

                            Allow Visa, Mastercard, and other
                            international card payments.

                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.enable_card_payment === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "enable_card_payment",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


                {/* BANK TRANSFER */}

                <div className="toggle-setting">

                    <div>

                        <strong>

                            Enable Bank Transfer

                        </strong>

                        <p>

                            Allow customers to make payments
                            through bank transfers.

                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.enable_bank_transfer === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "enable_bank_transfer",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>



                {/* ================= PAYMENT PROVIDER ================= */}

                <h3 className="settings-subtitle">

                    Payment Provider

                </h3>


                <div className="form-group">

                    <label>

                        Payment Gateway

                    </label>


                    <select

                        value={
                            settings.payment_gateway ||
                            "Paystack"
                        }

                        onChange={(e) =>

                            handleChange(
                                "payment_gateway",
                                e.target.value
                            )

                        }

                    >

                        <option value="Paystack">

                            Paystack

                        </option>


                        <option value="Flutterwave">

                            Flutterwave

                        </option>


                        <option value="Hubtel">

                            Hubtel

                        </option>


                        <option value="Custom">

                            Custom Gateway

                        </option>

                    </select>


                    <small>

                        Select the primary payment provider
                        for your marketplace.

                    </small>

                </div>



                {/* ================= TRANSACTION SETTINGS ================= */}

                <h3 className="settings-subtitle">

                    Transaction Settings

                </h3>


                <div className="form-group">

                    <label>

                        Minimum Transaction Amount

                    </label>


                    <input

                        type="number"

                        min="0"

                        value={
                            settings.minimum_transaction_amount ||
                            ""
                        }

                        onChange={(e) =>

                            handleChange(
                                "minimum_transaction_amount",
                                e.target.value
                            )

                        }

                        placeholder="0"

                    />


                    <small>

                        Minimum amount allowed for transactions.

                    </small>

                </div>



                <div className="form-group">

                    <label>

                        Maximum Transaction Amount

                    </label>


                    <input

                        type="number"

                        min="0"

                        value={
                            settings.maximum_transaction_amount ||
                            ""
                        }

                        onChange={(e) =>

                            handleChange(
                                "maximum_transaction_amount",
                                e.target.value
                            )

                        }

                        placeholder="Leave empty for unlimited"

                    />

                </div>



                {/* ================= CURRENCY ================= */}

                <h3 className="settings-subtitle">

                    Payment Currency

                </h3>


                <div className="form-group">

                    <label>

                        Default Transaction Currency

                    </label>


                    <select

                        value={
                            settings.payment_currency ||
                            "GHS"
                        }

                        onChange={(e) =>

                            handleChange(
                                "payment_currency",
                                e.target.value
                            )

                        }

                    >

                        <option value="GHS">

                            Ghana Cedi (GHS)

                        </option>


                        <option value="USD">

                            US Dollar (USD)

                        </option>


                        <option value="GBP">

                            British Pound (GBP)

                        </option>


                        <option value="EUR">

                            Euro (EUR)

                        </option>

                    </select>

                </div>



                {/* ================= AUTOMATIC PAYMENT ================= */}

                <div className="toggle-setting">

                    <div>

                        <strong>

                            Automatic Payment Confirmation

                        </strong>

                        <p>

                            Automatically confirm transactions
                            when the payment provider reports
                            a successful payment.

                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.auto_confirm_payment === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "auto_confirm_payment",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


                {/* PAYMENT NOTIFICATIONS */}

                <div className="toggle-setting">

                    <div>

                        <strong>

                            Payment Notifications

                        </strong>

                        <p>

                            Send notifications when payments
                            are successfully completed.

                        </p>

                    </div>


                    <input

                        type="checkbox"

                        checked={
                            settings.payment_notifications === "true"
                        }

                        onChange={(e) =>

                            handleChange(
                                "payment_notifications",
                                e.target.checked.toString()
                            )

                        }

                    />

                </div>


            </div>

        </div>

    );

}

export default PaymentSettings;
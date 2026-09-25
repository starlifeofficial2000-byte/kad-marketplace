function PaymentSettings({
    settings,
    handleChange
}) {

    /* =====================================================
       SAFE SETTINGS
    ===================================================== */

    const paymentEnabled =
        settings?.payment_enabled === "true";

    const mobileMoneyEnabled =
        settings?.mobile_money_enabled === "true";

    const cardEnabled =
        settings?.card_enabled === "true";

    const bankTransferEnabled =
        settings?.bank_transfer_enabled === "true";

    const paymentProvider =
        settings?.payment_provider || "paystack";

    const minimumTransaction =
        settings?.minimum_transaction || "";

    const maximumTransaction =
        settings?.maximum_transaction || "";

    const paymentCurrency =
        settings?.currency_code || "GHS";

    const autoConfirmPayments =
        settings?.auto_confirm_payments === "true";

    const paymentNotifications =
        settings?.payment_notifications === "true";


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
       NUMBER HANDLER
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


        const numericValue =
            Number(value);


        if (
            Number.isNaN(numericValue) ||
            numericValue < 0
        ) {

            return;

        }


        handleChange(
            key,
            value
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

                <div>

                    <h2>
                        Payment Settings
                    </h2>

                    <p>
                        Configure payment methods,
                        payment providers and
                        transaction settings for
                        your marketplace.
                    </p>

                </div>

            </div>


            {/* =================================================
                MAIN CARD
            ================================================= */}

            <div className="settings-card">


                {/* =================================================
                    PAYMENT SYSTEM
                ================================================= */}

                <h3 className="settings-subtitle">
                    Payment System
                </h3>


                <div className="toggle-setting">

                    <div>

                        <strong>
                            Enable Payments
                        </strong>

                        <p>
                            Enable or disable payments
                            across the marketplace.
                        </p>

                    </div>


                    <input
                        type="checkbox"
                        checked={
                            paymentEnabled
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "payment_enabled",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* =================================================
                    PAYMENT METHODS
                ================================================= */}

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
                            Allow customers to pay
                            using MTN Mobile Money,
                            Telecel Cash and
                            AirtelTigo Money.
                        </p>

                    </div>


                    <input
                        type="checkbox"
                        checked={
                            mobileMoneyEnabled
                        }
                        disabled={
                            !paymentEnabled
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "mobile_money_enabled",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* CARD */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Enable Card Payments
                        </strong>

                        <p>
                            Allow Visa, Mastercard
                            and other supported
                            international cards.
                        </p>

                    </div>


                    <input
                        type="checkbox"
                        checked={
                            cardEnabled
                        }
                        disabled={
                            !paymentEnabled
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "card_enabled",
                                e.target.checked
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
                            Allow customers to pay
                            through bank transfers.
                        </p>

                    </div>


                    <input
                        type="checkbox"
                        checked={
                            bankTransferEnabled
                        }
                        disabled={
                            !paymentEnabled
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "bank_transfer_enabled",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* =================================================
                    PAYMENT PROVIDER
                ================================================= */}

                <h3 className="settings-subtitle">
                    Payment Provider
                </h3>


                <div className="form-group">

                    <label>
                        Payment Gateway
                    </label>


                    <select
                        value={
                            paymentProvider
                        }
                        disabled={
                            !paymentEnabled
                        }
                        onChange={(e) =>
                            handleChange(
                                "payment_provider",
                                e.target.value
                            )
                        }
                    >

                        <option value="paystack">
                            Paystack
                        </option>

                        <option value="flutterwave">
                            Flutterwave
                        </option>

                        <option value="hubtel">
                            Hubtel
                        </option>

                        <option value="custom">
                            Custom Gateway
                        </option>

                    </select>


                    <small>
                        Select the primary payment
                        provider used by the marketplace.
                    </small>

                </div>


                {/* =================================================
                    TRANSACTION SETTINGS
                ================================================= */}

                <h3 className="settings-subtitle">
                    Transaction Settings
                </h3>


                {/* MINIMUM */}

                <div className="form-group">

                    <label>
                        Minimum Transaction Amount
                    </label>


                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                            minimumTransaction
                        }
                        disabled={
                            !paymentEnabled
                        }
                        onChange={(e) =>
                            updateNumber(
                                "minimum_transaction",
                                e.target.value
                            )
                        }
                        placeholder="0"
                    />


                    <small>
                        Minimum amount allowed
                        for a transaction.
                    </small>

                </div>


                {/* MAXIMUM */}

                <div className="form-group">

                    <label>
                        Maximum Transaction Amount
                    </label>


                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                            maximumTransaction
                        }
                        disabled={
                            !paymentEnabled
                        }
                        onChange={(e) =>
                            updateNumber(
                                "maximum_transaction",
                                e.target.value
                            )
                        }
                        placeholder="Leave empty for unlimited"
                    />


                    <small>
                        Maximum amount allowed
                        for a transaction.
                    </small>

                </div>


                {/* TRANSACTION FEE */}

                <div className="form-group">

                    <label>
                        Transaction Fee
                    </label>


                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                            settings?.transaction_fee || ""
                        }
                        disabled={
                            !paymentEnabled
                        }
                        onChange={(e) =>
                            updateNumber(
                                "transaction_fee",
                                e.target.value
                            )
                        }
                        placeholder="0"
                    />


                    <small>
                        Default marketplace
                        transaction fee.
                    </small>

                </div>


                {/* =================================================
                    PAYMENT CURRENCY
                ================================================= */}

                <h3 className="settings-subtitle">
                    Payment Currency
                </h3>


                <div className="form-group">

                    <label>
                        Default Transaction Currency
                    </label>


                    <select
                        value={
                            paymentCurrency
                        }
                        disabled={
                            !paymentEnabled
                        }
                        onChange={(e) =>
                            handleChange(
                                "currency_code",
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


                    <small>
                        Currency used when processing
                        marketplace payments.
                    </small>

                </div>


                {/* =================================================
                    AUTOMATIC PAYMENT CONFIRMATION
                ================================================= */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Automatic Payment Confirmation
                        </strong>

                        <p>
                            Automatically confirm a
                            transaction when the payment
                            provider reports a successful
                            payment.
                        </p>

                    </div>


                    <input
                        type="checkbox"
                        checked={
                            autoConfirmPayments
                        }
                        disabled={
                            !paymentEnabled
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "auto_confirm_payments",
                                e.target.checked
                            )
                        }
                    />

                </div>


                {/* =================================================
                    PAYMENT NOTIFICATIONS
                ================================================= */}

                <div className="toggle-setting">

                    <div>

                        <strong>
                            Payment Notifications
                        </strong>

                        <p>
                            Send notifications when
                            payments are successfully
                            completed.
                        </p>

                    </div>


                    <input
                        type="checkbox"
                        checked={
                            paymentNotifications
                        }
                        onChange={(e) =>
                            updateBoolean(
                                "payment_notifications",
                                e.target.checked
                            )
                        }
                    />

                </div>


            </div>


            {/* =================================================
                PAYMENT STATUS
            ================================================= */}

            <div className="settings-info-card">

                <div className="settings-info-icon">
                    💳
                </div>


                <div>

                    <strong>
                        Payment Configuration
                    </strong>


                    <p>

                        Payments are{" "}

                        <strong>
                            {paymentEnabled
                                ? "enabled"
                                : "disabled"}
                        </strong>

                        {" "}with{" "}

                        <strong>
                            {paymentProvider}
                        </strong>

                        {" "}as the primary gateway and{" "}

                        <strong>
                            {paymentCurrency}
                        </strong>

                        {" "}as the transaction currency.

                    </p>

                </div>

            </div>


        </div>

    );

}


export default PaymentSettings;
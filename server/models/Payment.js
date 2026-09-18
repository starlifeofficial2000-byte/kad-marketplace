const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define("Payment", {

    id: {

        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true

    },

    /* =====================================
       OWNER
    ===================================== */

    userId: {

        type: DataTypes.INTEGER,
        allowNull: false

    },

    planId: {

        type: DataTypes.INTEGER,
        allowNull: false

    },

    subscriptionId: {

        type: DataTypes.INTEGER,
        allowNull: true

    },
type: {

    type: DataTypes.ENUM(

        "Subscription",

        "Advertisement",

        "Promotion",

        "Featured",

        "Express",

        "Store"

    ),

    defaultValue: "Subscription"

},
    /* =====================================
       PAYMENT DETAILS
    ===================================== */

    reference: {

        type: DataTypes.STRING,
        allowNull: false,
        unique: true

    },

    amount: {

        type: DataTypes.DECIMAL(10,2),
        allowNull: false

    },

    currency: {

        type: DataTypes.STRING,
        defaultValue: "GHS"

    },

    paymentMethod: {

        type: DataTypes.STRING,
        defaultValue: "Paystack"

    },

    paymentChannel: {

        type: DataTypes.STRING,
        allowNull: true

    },

    status: {

    type: DataTypes.ENUM(

        "Pending",

        "Successful",

        "Failed"

    ),

    defaultValue: "Pending"

},
    /* =====================================
       PAYSTACK
    ===================================== */

    authorizationCode: {

        type: DataTypes.STRING

    },

    customerCode: {

        type: DataTypes.STRING

    },

    paidAt: {

        type: DataTypes.DATE

    },

    /* =====================================
       METADATA
    ===================================== */

    gatewayResponse: {

        type: DataTypes.TEXT

    },

    notes: {

        type: DataTypes.TEXT

    }

}, {

    timestamps: true

});

module.exports = Payment;
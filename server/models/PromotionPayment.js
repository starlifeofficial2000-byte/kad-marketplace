const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PromotionPayment = sequelize.define("PromotionPayment", {

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

    productId: {

        type: DataTypes.INTEGER,
        allowNull: false

    },

    /* =====================================
       PROMOTION
    ===================================== */

    promotionType: {

        type: DataTypes.ENUM(

            "Boost",

            "Feature",

            "Express"

        ),

        allowNull: false

    },

    amount: {

        type: DataTypes.DECIMAL(10,2),
        allowNull: false

    },

    /* =====================================
       PAYMENT
    ===================================== */

    reference: {

        type: DataTypes.STRING,
        allowNull: false,
        unique: true

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

        type: DataTypes.STRING

    },

    status: {

        type: DataTypes.ENUM(

            "Pending",

            "Successful",

            "Failed"

        ),

        defaultValue: "Pending"

    },

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
       PROMOTION DURATION
    ===================================== */

    startsAt: {

        type: DataTypes.DATE

    },

    expiresAt: {

        type: DataTypes.DATE

    },

    /* =====================================
       EXTRA
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

module.exports = PromotionPayment;
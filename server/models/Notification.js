const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define("Notification", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    type: {

        type: DataTypes.ENUM(

            "Payment",

            "Product",

            "Store",

            "Message",

            "Promotion",

            "Subscription",

            "System"

        ),

        defaultValue: "System"

    },

    link: {

        type: DataTypes.STRING,

        allowNull: true

    },

    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

}, {

    timestamps: true

});

module.exports = Notification;
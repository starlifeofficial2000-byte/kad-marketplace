const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const Subscription = sequelize.define(

    "Subscription",

    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        subscriptionPlanId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        status: {
            type: DataTypes.ENUM(
                "active",
                "expired",
                "cancelled",
                "pending"
            ),

            defaultValue: "pending"
        },

        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

        endDate: {
            type: DataTypes.DATE,
            allowNull: false
        },

        uploadsUsed: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        boostsUsed: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        featuredUsed: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        expressUsed: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }

    },

    {
        tableName: "Subscriptions",
        timestamps: true
    }

);

module.exports = Subscription;
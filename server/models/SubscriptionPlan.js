const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const SubscriptionPlan = sequelize.define(

    "SubscriptionPlan",

    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },

        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 30
        },

        maxProducts: {
            type: DataTypes.INTEGER,
            defaultValue: 5
        },

        boostCredits: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        featuredCredits: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        expressCredits: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        features: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }

    },

    {
        tableName: "SubscriptionPlans",
        timestamps: true
    }

);

module.exports = SubscriptionPlan;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SecurityAlert = sequelize.define("SecurityAlert", {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    riskLevel: {
        type: DataTypes.ENUM(
            "Low",
            "Medium",
            "High",
            "Critical"
        ),
        defaultValue: "Low"
    },

    status: {
        type: DataTypes.ENUM(
            "Open",
            "Investigating",
            "Resolved"
        ),
        defaultValue: "Open"
    }

});

module.exports = SecurityAlert;
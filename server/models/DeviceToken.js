const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DeviceToken = sequelize.define("DeviceToken", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING(512),
        allowNull: false,
        unique: true
    },
    platform: {
        type: DataTypes.STRING(24),
        allowNull: true
    }
}, {
    tableName: "DeviceTokens",
    timestamps: true,
    indexes: [{ fields: ["userId"] }]
});

module.exports = DeviceToken;

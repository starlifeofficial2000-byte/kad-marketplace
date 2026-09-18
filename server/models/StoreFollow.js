const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const StoreFollow = sequelize.define("StoreFollow", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

}, {
    indexes: [
        {
            unique: true,
            fields: ["userId", "storeId"]
        }
    ]
});

module.exports = StoreFollow;
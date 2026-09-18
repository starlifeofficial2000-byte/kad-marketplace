const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Conversation = sequelize.define("Conversation", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    buyerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }

},
 {

    timestamps: true

});
module.exports = Conversation;
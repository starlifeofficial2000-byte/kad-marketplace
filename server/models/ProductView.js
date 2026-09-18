const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductView = sequelize.define(
    "ProductView",
    {

        id: {

            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true

        },

        userId: {

            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null

        },

        productId: {

            type: DataTypes.INTEGER,
            allowNull: false

        }

    },

    {

        timestamps: true

    }

);

module.exports = ProductView;
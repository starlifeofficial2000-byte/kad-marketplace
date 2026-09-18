const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HeroBanner = sequelize.define("HeroBanner", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    subtitle: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    image: {
        type: DataTypes.STRING,
        allowNull: false
    },

    buttonText: {
        type: DataTypes.STRING,
        defaultValue: "Shop Now"
    },

    buttonLink: {
        type: DataTypes.STRING,
        defaultValue: "/"
    },

    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },

    status: {
        type: DataTypes.ENUM(
            "DRAFT",
            "ACTIVE",
            "SCHEDULED",
            "EXPIRED"
        ),
        defaultValue: "DRAFT"
    },

    startDate: {
        type: DataTypes.DATE,
        allowNull: true
    },

    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    }

});

module.exports = HeroBanner;
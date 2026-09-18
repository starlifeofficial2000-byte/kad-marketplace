const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Advertisement = sequelize.define("Advertisement", {

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

    subtitle: {

        type: DataTypes.STRING,
        allowNull: true

    },

    description: {

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

    link: {

        type: DataTypes.STRING,
        defaultValue: "#"

    },

    placement: {

        type: DataTypes.ENUM(

            "Homepage",
            "Category",
            "Search",
            "Product",
            "Store"

        ),

        defaultValue: "Homepage"

    },

    position: {

        type: DataTypes.ENUM(

            "Hero",
            "Homepage",
            "Sidebar",
            "BetweenProducts",
            "Footer",
            "Store"

        ),

        defaultValue: "Homepage"

    },

    priority: {

        type: DataTypes.INTEGER,
        defaultValue: 1

    },

    status: {

        type: DataTypes.ENUM(

            "Pending",
            "Approved",
            "Running",
            "Paused",
            "Rejected",
            "Expired"

        ),

        defaultValue: "Pending"

    },

    impressions: {

        type: DataTypes.INTEGER,
        defaultValue: 0

    },

    clicks: {

        type: DataTypes.INTEGER,
        defaultValue: 0

    },

    budgetSpent: {

        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0

    },

    dailyBudget: {

        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0

    },

    startDate: {

        type: DataTypes.DATE,
        allowNull: true

    },

    endDate: {

        type: DataTypes.DATE,
        allowNull: true

    }

}, {

    timestamps: true

});

module.exports = Advertisement;
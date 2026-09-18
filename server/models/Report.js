const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Report = sequelize.define("Report", {

    id: {

        type: DataTypes.INTEGER,

        autoIncrement: true,

        primaryKey: true

    },

    reason: {

        type: DataTypes.STRING,

        allowNull: false

    },

    description: {

        type: DataTypes.TEXT,

        allowNull: true

    },

    status: {

        type: DataTypes.ENUM(

            "Pending",

            "Resolved"

        ),

        defaultValue: "Pending"

    },

    userId: {

        type: DataTypes.INTEGER,

        allowNull: false

    },

    productId: {

        type: DataTypes.INTEGER,

        allowNull: false

    }

}, {

    timestamps: true

});

module.exports = Report;
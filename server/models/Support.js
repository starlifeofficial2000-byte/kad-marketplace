const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Support = sequelize.define("Support", {

    id: {

        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true

    },

    userId: {

        type: DataTypes.INTEGER,
        allowNull: false

    },

    subject: {

        type: DataTypes.STRING,
        allowNull: false

    },

    message: {

        type: DataTypes.TEXT,
        allowNull: false

    },

    reply: {

        type: DataTypes.TEXT,
        allowNull: true

    },

    status: {

        type: DataTypes.ENUM(

            "Open",

            "Answered",

            "Closed"

        ),

        defaultValue: "Open"

    }

}, {

    timestamps: true

});

module.exports = Support;
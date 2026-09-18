const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const ContactMessage = sequelize.define(

    "ContactMessage",

    {

        id: {

            type: DataTypes.INTEGER,

            autoIncrement: true,

            primaryKey: true

        },

        name: {

            type: DataTypes.STRING,

            allowNull: false

        },

        email: {

            type: DataTypes.STRING,

            allowNull: false

        },

        phone: {

            type: DataTypes.STRING

        },

        subject: {

            type: DataTypes.STRING,

            allowNull: false

        },

        message: {

            type: DataTypes.TEXT,

            allowNull: false

        },

        status: {

            type: DataTypes.ENUM(

                "Unread",

                "Read",

                "Replied"

            ),

            defaultValue: "Unread"

        }

    },

    {

        timestamps: true

    }

);

module.exports = ContactMessage;
const { DataTypes } = require("sequelize");

const sequelize =
    require("../config/database");


const LoginHistory = sequelize.define(

    "LoginHistory",

    {

        id: {

            type:
                DataTypes.INTEGER,

            autoIncrement:
                true,

            primaryKey:
                true

        },


        userId: {

            type:
                DataTypes.INTEGER,

            allowNull:
                false

        },


        ipAddress: {

            type:
                DataTypes.STRING,

            allowNull:
                true

        },


        browser: {

            type:
                DataTypes.STRING,

            allowNull:
                true

        },


        device: {

            type:
                DataTypes.STRING,

            allowNull:
                true

        },


        operatingSystem: {

            type:
                DataTypes.STRING,

            allowNull:
                true

        },


        location: {

            type:
                DataTypes.STRING,

            allowNull:
                true

        },


        success: {

            type:
                DataTypes.BOOLEAN,

            allowNull:
                true,

            defaultValue:
                true

        },


        userAgent: {

            type:
                DataTypes.STRING(500),

            allowNull:
                true

        }

    },

    {

        timestamps:
            true

    }

);


module.exports = LoginHistory;
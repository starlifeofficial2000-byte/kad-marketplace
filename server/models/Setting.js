const { DataTypes } = require("sequelize");

const sequelize =
    require("../config/database");


const Setting = sequelize.define(

    "Setting",

    {

        id: {

            type: DataTypes.INTEGER,

            primaryKey: true,

            autoIncrement: true

        },


        settingKey: {

            type: DataTypes.STRING,

            allowNull: false,

            unique: true

        },


        settingValue: {

            type: DataTypes.TEXT,

            allowNull: true

        },


        category: {

            type: DataTypes.STRING,

            allowNull: false,

            defaultValue: "General"

        }

    },

    {

        timestamps: true

    }

);


module.exports = Setting;
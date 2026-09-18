const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Role = sequelize.define("Role", {

    id: {

        type: DataTypes.INTEGER,

        primaryKey: true,

        autoIncrement: true

    },

    name: {

        type: DataTypes.STRING,

        allowNull: false,

        unique: true

    },

    description: {

        type: DataTypes.TEXT,

        allowNull: true

    },

    color: {

        type: DataTypes.STRING,

        defaultValue: "#1976d2"

    },

    icon: {

        type: DataTypes.STRING,

        defaultValue: "FaUser"

    },

    isSystem: {

        type: DataTypes.BOOLEAN,

        defaultValue: false

    }

});

module.exports = Role;
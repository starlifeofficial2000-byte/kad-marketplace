const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RolePermission = sequelize.define("RolePermission", {

    id: {

        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true

    },

    roleId: {

        type: DataTypes.INTEGER,
        allowNull: false

    },

    permissionId: {

        type: DataTypes.INTEGER,
        allowNull: false

    }

}, {

    timestamps: false

});

module.exports = RolePermission;
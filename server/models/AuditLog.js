const { DataTypes } = require("sequelize");

const sequelize =
    require("../config/database");


const AuditLog = sequelize.define(

    "AuditLog",

    {

        id: {

            type:
                DataTypes.INTEGER,

            primaryKey:
                true,

            autoIncrement:
                true

        },


        adminId: {

            type:
                DataTypes.INTEGER,

            allowNull:
                false

        },


        action: {

            type:
                DataTypes.STRING,

            allowNull:
                false

        },


        entity: {

            type:
                DataTypes.STRING,

            allowNull:
                false

        },


        entityId: {

            type:
                DataTypes.INTEGER,

            allowNull:
                true

        },


        description: {

            type:
                DataTypes.TEXT,

            allowNull:
                true

        },


        ipAddress: {

            type:
                DataTypes.STRING,

            allowNull:
                true

        }

    },

    {

        timestamps:
            true

    }

);


module.exports = AuditLog;
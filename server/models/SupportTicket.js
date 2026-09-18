const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SupportTicket = sequelize.define("SupportTicket", {

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

    category: {

        type: DataTypes.ENUM(

            "Technical",

            "Payment",

            "Product",

            "Store",

            "Account",

            "Report",

            "Suggestion",

            "Other"

        ),

        defaultValue: "Other"

    },

    priority: {

        type: DataTypes.ENUM(

            "Low",

            "Medium",

            "High"

        ),

        defaultValue: "Medium"

    },

    message: {

        type: DataTypes.TEXT,

        allowNull: false

    },

    adminReply: {

        type: DataTypes.TEXT

    },

    status: {

        type: DataTypes.ENUM(

            "Open",

            "Pending",

            "Answered",

            "Closed"

        ),

        defaultValue: "Open"

    },

    assignedAdminId: {

        type: DataTypes.INTEGER,

        allowNull: true

    }

}, {

    timestamps: true

});

module.exports = SupportTicket;
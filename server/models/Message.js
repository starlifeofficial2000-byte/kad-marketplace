const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define("Message", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    type: {
        type: DataTypes.ENUM(
            "text",
            "image",
            "audio"
        ),
        defaultValue: "text"
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    image: {
        type: DataTypes.STRING,
        allowNull: true
    },

    audio: {
        type: DataTypes.STRING,
        allowNull: true
    },

    audioDuration: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    status: {
        type: DataTypes.ENUM(
            "sent",
            "delivered",
            "read"
        ),
        defaultValue: "sent"
    },

    readAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    /* Reply to another message */
    replyTo: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    /* Edited message */
    edited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    editedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    /* Soft delete */
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

}, {

    timestamps: true

});

module.exports = Message;
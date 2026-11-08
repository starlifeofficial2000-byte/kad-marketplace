const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SupportTicketMessage = sequelize.define("SupportTicketMessage", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ticketId: { type: DataTypes.INTEGER, allowNull: false },
  senderId: { type: DataTypes.INTEGER, allowNull: false },
  senderType: { type: DataTypes.ENUM("user", "admin"), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false }
}, { timestamps: true, indexes: [{ fields: ["ticketId", "createdAt"] }] });

module.exports = SupportTicketMessage;

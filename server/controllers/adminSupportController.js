const { Op } = require("sequelize");
const SupportTicket = require("../models/SupportTicket");
const User = require("../models/User");
const Notification = require("../models/Notification");
const SupportTicketMessage = require("../models/SupportTicketMessage");

const safeUserAttributes = ["id", "name", "email", "phone", "profileImage", "role", "status"];

exports.getTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      include: [{ model: User, as: "user", attributes: safeUserAttributes }],
      order: [["updatedAt", "DESC"], ["createdAt", "DESC"]]
    });
    return res.json({ success: true, tickets });
  } catch (error) {
    console.error("ADMIN SUPPORT LIST ERROR", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id, {
      include: [
        { model: User, as: "user", attributes: safeUserAttributes },
        { model: SupportTicketMessage, as: "messages", separate: true, order: [["createdAt", "ASC"]] }
      ]
    });
    if (!ticket) return res.status(404).json({ success: false, message: "Support ticket not found." });

    const data = ticket.toJSON();
    // Older tickets predate the conversation table. Surface their original text as the first message.
    if (!data.messages || data.messages.length === 0) {
      data.messages = [{ id: `legacy-${data.id}`, ticketId: data.id, senderId: data.userId, senderType: "user", message: data.message, createdAt: data.createdAt }];
      if (data.adminReply) data.messages.push({ id: `legacy-admin-${data.id}`, ticketId: data.id, senderId: data.assignedAdminId || 0, senderType: "admin", message: data.adminReply, createdAt: data.updatedAt });
    }
    return res.json({ success: true, ticket: data, data });
  } catch (error) {
    console.error("ADMIN SUPPORT DETAIL ERROR", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendTicketMessage = async (req, res) => {
  try {
    const message = String(req.body.message || "").trim();
    if (!message) return res.status(400).json({ success: false, message: "Message is required." });
    if (message.length > 5000) return res.status(400).json({ success: false, message: "Message cannot exceed 5,000 characters." });
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: "Support ticket not found." });
    if (ticket.status === "Closed") return res.status(409).json({ success: false, message: "This ticket is closed. Reopen it before replying." });

    const row = await SupportTicketMessage.create({ ticketId: ticket.id, senderId: req.user.id, senderType: "admin", message });
    ticket.adminReply = message;
    ticket.assignedAdminId = req.user.id;
    ticket.status = "Answered";
    await ticket.save();
    await Notification.create({ userId: ticket.userId, title: "Support team replied", message: `There is a new reply to your support ticket: ${ticket.subject}`, type: "System", isRead: false });
    return res.status(201).json({ success: true, message: "Reply sent.", data: row });
  } catch (error) {
    console.error("ADMIN SUPPORT MESSAGE ERROR", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Retain compatibility with older clients posting { reply } to /:id/reply.
exports.replyTicket = async (req, res) => {
  req.body.message = req.body.message || req.body.reply;
  return exports.sendTicketMessage(req, res);
};

exports.updateStatus = async (req, res) => {
  try {
    const allowed = ["Open", "Pending", "Answered", "Closed"];
    const status = String(req.body.status || "");
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(", ")}.` });
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: "Support ticket not found." });
    ticket.status = status;
    await ticket.save();
    return res.json({ success: true, message: "Ticket status updated.", ticket });
  } catch (error) {
    console.error("ADMIN SUPPORT STATUS ERROR", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: "Support ticket not found." });
    await SupportTicketMessage.destroy({ where: { ticketId: ticket.id } });
    await ticket.destroy();
    return res.json({ success: true, message: "Support ticket deleted." });
  } catch (error) {
    console.error("ADMIN SUPPORT DELETE ERROR", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

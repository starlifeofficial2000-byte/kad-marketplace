const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");
const SupportTicketMessage = require("../models/SupportTicketMessage");

/* ==========================================
   CREATE SUPPORT TICKET
========================================== */

exports.createTicket = async (req, res) => {

    try {

        const {

            subject,

            category,

            priority,

            message

        } = req.body;

        const ticket = await SupportTicket.create({

            userId: req.user.id,

            subject,

            category,

            priority,

            message

        });

        await SupportTicketMessage.create({
            ticketId: ticket.id,
            senderId: req.user.id,
            senderType: "user",
            message: message
        });

        await Notification.create({

            userId: req.user.id,

            title: "Support Ticket Created",

            message: `Your support ticket "${subject}" has been received.`,

            type: "System"

        });

        res.status(201).json({

            success: true,

            message: "Support ticket created successfully.",

            ticket

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   GET MY TICKETS
========================================== */

exports.getMyTickets = async (req, res) => {

    try {

        const tickets = await SupportTicket.findAll({

            where: {

                userId: req.user.id

            },

            order: [

                ["createdAt", "DESC"]

            ]

        });

        res.json(tickets);

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   GET SINGLE TICKET
========================================== */

exports.getTicket = async (req, res) => {

    try {

        const ticket = await SupportTicket.findOne({

            where: {

                id: req.params.id,

                userId: req.user.id

            }

        });

        if (!ticket) {

            return res.status(404).json({

                success: false,

                message: "Ticket not found."

            });

        }

        res.json(ticket);

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   GET TICKET CONVERSATION (OWNER ONLY)
========================================== */
exports.getTicketMessages = async (req, res) => {
    try {
        const ticket = await SupportTicket.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found." });
        let messages = await SupportTicketMessage.findAll({ where: { ticketId: ticket.id }, order: [["createdAt", "ASC"]] });
        // Backward compatibility for tickets created before conversation messages existed.
        if (!messages.length) {
            messages = [{ id: `legacy-${ticket.id}`, ticketId: ticket.id, senderId: ticket.userId, senderType: "user", message: ticket.message, createdAt: ticket.createdAt }];
            if (ticket.adminReply) messages.push({ id: `legacy-admin-${ticket.id}`, ticketId: ticket.id, senderId: 0, senderType: "admin", message: ticket.adminReply, createdAt: ticket.updatedAt });
        }
        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ==========================================
   USER REPLY TO OWN TICKET
========================================== */
exports.sendTicketMessage = async (req, res) => {
    try {
        const message = String(req.body.message || "").trim();
        if (!message) return res.status(400).json({ success: false, message: "Message is required." });
        if (message.length > 5000) return res.status(400).json({ success: false, message: "Message is too long." });
        const ticket = await SupportTicket.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found." });
        if (ticket.status === "Closed") return res.status(400).json({ success: false, message: "This ticket is closed." });
        const row = await SupportTicketMessage.create({ ticketId: ticket.id, senderId: req.user.id, senderType: "user", message });
        ticket.status = "Open";
        await ticket.save();
        res.status(201).json({ success: true, message: "Reply sent.", data: row });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");

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
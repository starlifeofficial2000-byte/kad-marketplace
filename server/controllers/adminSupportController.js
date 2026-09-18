const SupportTicket = require("../models/SupportTicket");
const User = require("../models/User");
const Notification = require("../models/Notification");

/* ==========================================
   GET ALL SUPPORT TICKETS
========================================== */

exports.getTickets = async (req, res) => {

    try {

        const tickets = await SupportTicket.findAll({

            include: [

                {

                    model: User,

                    as: "user",

                    attributes: [

                        "id",

                        "name",

                        "email",

                        "phone",

                        "profileImage"

                    ]

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });

        res.json(tickets);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   GET SINGLE SUPPORT TICKET
========================================== */

exports.getTicket = async (req, res) => {

    try {

        const ticket = await SupportTicket.findByPk(

            req.params.id,

            {

                include: [

                    {

                        model: User,

                        as: "user",

                        attributes: [

                            "id",

                            "name",

                            "email",

                            "phone",

                            "profileImage"

                        ]

                    }

                ]

            }

        );

        if (!ticket) {

            return res.status(404).json({

                success: false,

                message: "Support ticket not found."

            });

        }

        res.json(ticket);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   REPLY TO SUPPORT TICKET
========================================== */

exports.replyTicket = async (req, res) => {

    try {

        const ticket = await SupportTicket.findByPk(req.params.id);

        if (!ticket) {

            return res.status(404).json({

                success: false,

                message: "Support ticket not found."

            });

        }

        ticket.adminReply = req.body.reply;

        ticket.status = "Answered";

        await ticket.save();

        await Notification.create({

            userId: ticket.userId,

            title: "Support Reply",

            message: `Your support ticket "${ticket.subject}" has been answered by our support team.`,

            type: "System",

            isRead: false

        });

        res.json({

            success: true,

            message: "Reply sent successfully."

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   UPDATE TICKET STATUS
========================================== */

exports.updateStatus = async (req, res) => {

    try {

        const ticket = await SupportTicket.findByPk(req.params.id);

        if (!ticket) {

            return res.status(404).json({

                success: false,

                message: "Support ticket not found."

            });

        }

        ticket.status = req.body.status;

        await ticket.save();

        res.json({

            success: true,

            message: "Ticket status updated."

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   DELETE SUPPORT TICKET
========================================== */

exports.deleteTicket = async (req, res) => {

    try {

        const ticket = await SupportTicket.findByPk(req.params.id);

        if (!ticket) {

            return res.status(404).json({

                success: false,

                message: "Support ticket not found."

            });

        }

        await ticket.destroy();

        res.json({

            success: true,

            message: "Support ticket deleted successfully."

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
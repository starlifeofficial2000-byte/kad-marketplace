const ContactMessage = require("../models/ContactMessage");

/* ==========================================
   SEND CONTACT MESSAGE
========================================== */

exports.sendMessage = async (req, res) => {

    try {

        const {

            name,
            email,
            phone,
            subject,
            message

        } = req.body;

        if (

            !name ||

            !email ||

            !subject ||

            !message

        ) {

            return res.status(400).json({

                success: false,

                message: "Please fill in all required fields."

            });

        }

        const contactMessage = await ContactMessage.create({

            name,

            email,

            phone,

            subject,

            message

        });

        return res.status(201).json({

            success: true,

            message: "Your message has been sent successfully.",

            contactMessage

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   GET ALL MESSAGES (ADMIN)
========================================== */

exports.getMessages = async (req, res) => {

    try {

        const messages = await ContactMessage.findAll({

            order: [

                ["createdAt", "DESC"]

            ]

        });

        return res.json({

            success: true,

            messages

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   GET SINGLE MESSAGE
========================================== */

exports.getMessage = async (req, res) => {

    try {

        const message = await ContactMessage.findByPk(

            req.params.id

        );

        if (!message) {

            return res.status(404).json({

                success: false,

                message: "Message not found."

            });

        }

        return res.json({

            success: true,

            message

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   MARK AS READ
========================================== */

exports.markAsRead = async (req, res) => {

    try {

        const message = await ContactMessage.findByPk(req.params.id);

        if (!message) {

            return res.status(404).json({

                success: false,

                message: "Message not found."

            });

        }

        message.status = "Read";

        await message.save();

        return res.json({

            success: true,

            message: "Message marked as read."

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/* ==========================================
   DELETE MESSAGE
========================================== */

exports.deleteMessage = async (req, res) => {

    try {

        const message = await ContactMessage.findByPk(

            req.params.id

        );

        if (!message) {

            return res.status(404).json({

                success: false,

                message: "Message not found."

            });

        }

        await message.destroy();

        return res.json({

            success: true,

            message: "Message deleted successfully."

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
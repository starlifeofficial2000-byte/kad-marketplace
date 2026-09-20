const { Op } = require("sequelize");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Product = require("../models/Product");
const User = require("../models/User");

/* =========================================================
   HELPER
   CHECK IF USER BELONGS TO CONVERSATION
========================================================= */

const getConversationForUser = async (conversationId, userId) => {
    const conversation = await Conversation.findByPk(conversationId);

    if (!conversation) {
        return {
            conversation: null,
            authorized: false
        };
    }

    const authorized =
        Number(conversation.buyerId) === Number(userId) ||
        Number(conversation.sellerId) === Number(userId);

    return {
        conversation,
        authorized
    };
};


/* =========================================================
   SEND FIRST MESSAGE
========================================================= */

exports.sendMessage = async (req, res) => {
    try {
        const {
            buyerId,
            sellerId,
            productId,
            message
        } = req.body;

        const senderId = req.user.id;

        if (!buyerId || !sellerId || !productId) {
            return res.status(400).json({
                success: false,
                message: "buyerId, sellerId and productId are required."
            });
        }

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty."
            });
        }

        const isParticipant =
            Number(senderId) === Number(buyerId) ||
            Number(senderId) === Number(sellerId);

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this conversation."
            });
        }

        let conversation = await Conversation.findOne({
            where: {
                buyerId,
                sellerId,
                productId
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                buyerId,
                sellerId,
                productId
            });
        }

        const newMessage = await Message.create({
            conversationId: conversation.id,
            senderId,
            message: message.trim(),
            type: "text",
            status: "sent"
        });

        await conversation.update({
            updatedAt: new Date()
        });

        const io = req.app.get("io");

        if (io) {
            io.to(String(conversation.id)).emit(
                "receive_message",
                newMessage
            );
        }

        return res.status(201).json({
            success: true,
            conversation,
            newMessage
        });

    } catch (error) {
        console.error("SEND FIRST MESSAGE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================================
   GET ALL MESSAGES
========================================================= */

exports.getMessages = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const userId = req.user.id;

        const {
            conversation,
            authorized
        } = await getConversationForUser(
            conversationId,
            userId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        if (!authorized) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this conversation."
            });
        }

        const messages = await Message.findAll({
            where: {
                conversationId
            },
            order: [
                ["createdAt", "ASC"]
            ]
        });

        return res.json({
            success: true,
            messages
        });

    } catch (error) {
        console.error("GET MESSAGES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================================
   SEND MESSAGE TO EXISTING CONVERSATION
========================================================= */

exports.sendMessageToConversation = async (req, res) => {
    try {
        const senderId = req.user.id;
        const conversationId = req.params.conversationId;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty."
            });
        }

        const {
            conversation,
            authorized
        } = await getConversationForUser(
            conversationId,
            senderId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        if (!authorized) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this conversation."
            });
        }

        const newMessage = await Message.create({
            conversationId,
            senderId,
            message: message.trim(),
            type: "text",
            status: "sent"
        });

        await conversation.update({
            updatedAt: new Date()
        });

        const io = req.app.get("io");

        if (io) {
            io.to(String(conversationId)).emit(
                "receive_message",
                newMessage
            );
        }

        return res.status(201).json({
            success: true,
            newMessage
        });

    } catch (error) {
        console.error(
            "SEND MESSAGE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================================
   SEND IMAGE MESSAGE
========================================================= */

exports.sendImageMessage = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const senderId = req.user.id;

        console.log("====================================");
        console.log("CHAT IMAGE UPLOAD");
        console.log("Conversation ID:", conversationId);
        console.log("Sender ID:", senderId);
        console.log("Request file:", req.file);
        console.log("Request body:", req.body);
        console.log(
            "Content type:",
            req.headers["content-type"]
        );
        console.log("====================================");

        const {
            conversation,
            authorized
        } = await getConversationForUser(
            conversationId,
            senderId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        if (!authorized) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this conversation."
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image."
            });
        }

        const newMessage = await Message.create({
            conversationId,
            senderId,
            type: "image",
            image: req.file.filename,
            message: null,
            status: "sent"
        });

        await conversation.update({
            updatedAt: new Date()
        });

        const io = req.app.get("io");

        if (io) {
            io.to(String(conversationId)).emit(
                "receive_message",
                newMessage
            );
        }

        return res.status(201).json({
            success: true,
            newMessage
        });

    } catch (error) {
        console.error(
            "SEND IMAGE MESSAGE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================================
   SEND AUDIO MESSAGE
========================================================= */

exports.sendAudioMessage = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const senderId = req.user.id;

        const {
            conversation,
            authorized
        } = await getConversationForUser(
            conversationId,
            senderId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        if (!authorized) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this conversation."
            });
        }

        console.log("====================================");
        console.log("CHAT AUDIO UPLOAD");
        console.log("Conversation ID:", conversationId);
        console.log("Sender ID:", senderId);
        console.log("Request file:", req.file);
        console.log("Request body:", req.body);
        console.log(
            "Content type:",
            req.headers["content-type"]
        );
        console.log("====================================");

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please record an audio."
            });
        }

        const newMessage = await Message.create({
            conversationId,
            senderId,
            type: "audio",
            audio: req.file.filename,
            audioDuration: req.body.duration || 0,
            status: "sent"
        });

        await conversation.update({
            updatedAt: new Date()
        });

        const io = req.app.get("io");

        if (io) {
            io.to(String(conversationId)).emit(
                "receive_message",
                newMessage
            );
        }

        return res.status(201).json({
            success: true,
            newMessage
        });

    } catch (error) {
        console.error(
            "SEND AUDIO MESSAGE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================================
   GET USER CONVERSATIONS
========================================================= */

exports.getUserConversations = async (req, res) => {
    try {
        const userId = req.params.userId;

        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { buyerId: userId },
                    { sellerId: userId }
                ]
            },
            order: [
                ["updatedAt", "DESC"]
            ]
        });

        const results = [];

        for (const conversation of conversations) {
            const lastMessage = await Message.findOne({
                where: {
                    conversationId: conversation.id
                },
                order: [
                    ["createdAt", "DESC"]
                ]
            });

            const product = await Product.findByPk(
                conversation.productId
            );

            if (product && product.images) {
                try {
                    if (typeof product.images === "string") {
                        product.images = JSON.parse(
                            product.images
                        );
                    }
                } catch {
                    product.images = [];
                }
            }

            const otherUserId =
                Number(conversation.buyerId) === Number(userId)
                    ? conversation.sellerId
                    : conversation.buyerId;

            const otherUser = await User.findByPk(
                otherUserId,
                {
                    attributes: [
                        "id",
                        "name",
                        "profileImage"
                    ]
                }
            );

            results.push({
                id: conversation.id,
                buyerId: conversation.buyerId,
                sellerId: conversation.sellerId,
                product,
                user: otherUser,

                lastMessage: lastMessage
                    ? lastMessage.message || ""
                    : "",

                lastMessageType: lastMessage
                    ? lastMessage.type || "text"
                    : "text",

                lastMessageAt: lastMessage
                    ? lastMessage.createdAt
                    : null,

                updatedAt: conversation.updatedAt,

                unreadCount: 0
            });
        }

        return res.json({
            success: true,
            conversations: results
        });

    } catch (error) {
        console.error(
            "GET USER CONVERSATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================================
   GET CONVERSATION DETAILS
========================================================= */

exports.getConversationDetails = async (req, res) => {
    try {
        const conversationId =
            req.params.conversationId;

        const userId = req.user.id;

        const {
            conversation,
            authorized
        } = await getConversationForUser(
            conversationId,
            userId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        if (!authorized) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this conversation."
            });
        }

        const product = await Product.findByPk(
            conversation.productId
        );

        if (product && product.images) {
            try {
                if (typeof product.images === "string") {
                    product.images = JSON.parse(
                        product.images
                    );
                }
            } catch {
                product.images = [];
            }
        }

        const seller = await User.findByPk(
            conversation.sellerId,
            {
                attributes: [
                    "id",
                    "name",
                    "profileImage"
                ]
            }
        );

        const buyer = await User.findByPk(
            conversation.buyerId,
            {
                attributes: [
                    "id",
                    "name",
                    "profileImage"
                ]
            }
        );

        return res.json({
            success: true,
            conversation,
            product,
            seller,
            buyer
        });

    } catch (error) {
        console.error(
            "GET CONVERSATION DETAILS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================================
   MARK DELIVERED
========================================================= */

exports.markDelivered = async (req, res) => {
    try {
        const conversationId =
            req.params.conversationId;

        const userId = req.user.id;

        const {
            conversation,
            authorized
        } = await getConversationForUser(
            conversationId,
            userId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        if (!authorized) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this conversation."
            });
        }

        await Message.update(
            {
                status: "delivered"
            },
            {
                where: {
                    conversationId,
                    status: "sent"
                }
            }
        );

        return res.json({
            success: true
        });

    } catch (error) {
        console.error(
            "MARK DELIVERED ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================================
   MARK READ
========================================================= */

exports.markRead = async (req, res) => {
    try {
        const conversationId =
            req.params.conversationId;

        const userId = req.user.id;

        const {
            conversation,
            authorized
        } = await getConversationForUser(
            conversationId,
            userId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        if (!authorized) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this conversation."
            });
        }

        await Message.update(
            {
                status: "read",
                readAt: new Date()
            },
            {
                where: {
                    conversationId,
                    status: {
                        [Op.ne]: "read"
                    }
                }
            }
        );

        return res.json({
            success: true
        });

    } catch (error) {
        console.error(
            "MARK READ ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================================
   OPEN / CREATE CONVERSATION
========================================================= */

exports.openConversation = async (req, res) => {
    try {
        const {
            buyerId,
            sellerId,
            productId
        } = req.body;

        const userId = req.user.id;

        if (!buyerId || !sellerId || !productId) {
            return res.status(400).json({
                success: false,
                message:
                    "buyerId, sellerId and productId are required."
            });
        }

        const isParticipant =
            Number(userId) === Number(buyerId) ||
            Number(userId) === Number(sellerId);

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this conversation."
            });
        }

        let conversation = await Conversation.findOne({
            where: {
                buyerId,
                sellerId,
                productId
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                buyerId,
                sellerId,
                productId
            });
        }

        return res.json({
            success: true,
            conversationId: conversation.id,
            conversation
        });

    } catch (error) {
        console.error(
            "OPEN CONVERSATION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================================
   GET MY CONVERSATIONS
========================================================= */

exports.getMyConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { buyerId: userId },
                    { sellerId: userId }
                ]
            },
            order: [
                ["updatedAt", "DESC"]
            ]
        });

        const results = [];

        for (const conversation of conversations) {
            const lastMessage = await Message.findOne({
                where: {
                    conversationId: conversation.id
                },
                order: [
                    ["createdAt", "DESC"]
                ]
            });

            const product = await Product.findByPk(
                conversation.productId
            );

            if (product && product.images) {
                try {
                    if (typeof product.images === "string") {
                        product.images = JSON.parse(
                            product.images
                        );
                    }
                } catch {
                    product.images = [];
                }
            }

            const otherUserId =
                Number(conversation.buyerId) === Number(userId)
                    ? conversation.sellerId
                    : conversation.buyerId;

            const otherUser = await User.findByPk(
                otherUserId,
                {
                    attributes: [
                        "id",
                        "name",
                        "profileImage"
                    ]
                }
            );

            results.push({
                id: conversation.id,
                buyerId: conversation.buyerId,
                sellerId: conversation.sellerId,
                product,
                user: otherUser,

                lastMessage: lastMessage
                    ? lastMessage.message || ""
                    : "",

                lastMessageType: lastMessage
                    ? lastMessage.type || "text"
                    : "text",

                lastMessageAt: lastMessage
                    ? lastMessage.createdAt
                    : null,

                updatedAt: conversation.updatedAt,

                unreadCount: 0
            });
        }

        return res.json({
            success: true,
            conversations: results
        });

    } catch (error) {
        console.error(
            "GET MY CONVERSATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
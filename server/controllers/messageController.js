const { Op } = require("sequelize");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Product = require("../models/Product");
const User = require("../models/User");

/* ==========================================
   SEND FIRST MESSAGE
========================================== */

exports.sendMessage = async (req, res) => {

    try {

        const {

    buyerId,
    sellerId,
    productId,
    message

} = req.body;

const senderId = req.user.id;
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
            message

        });

        res.status(201).json({

            success: true,
            conversation,
            newMessage

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
   GET ALL MESSAGES
========================================== */

exports.getMessages = async (req, res) => {

    try {

        const messages = await Message.findAll({

            where: {

                conversationId: req.params.conversationId

            },

            order: [

                ["createdAt", "ASC"]

            ]

        });

        res.json({

            success: true,

            messages

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};/* ==========================================
   SEND MESSAGE
========================================== */
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

        const conversation = await Conversation.findByPk(
            conversationId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        const isParticipant =
            Number(conversation.buyerId) === Number(senderId) ||
            Number(conversation.sellerId) === Number(senderId);

        if (!isParticipant) {
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

/* ==========================================
   SEND IMAGE MESSAGE
========================================== */

exports.sendImageMessage = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "Please select an image."

            });

        }

        const newMessage = await Message.create({

            conversationId: req.params.conversationId,

            senderId: req.user.id,

            type: "image",

            image: req.file.filename,

            message: null,

            status: "sent"

        });

        const io = req.app.get("io");

        io.to(req.params.conversationId).emit(

            "receive_message",

            newMessage

        );

        res.status(201).json({

            success: true,

            newMessage

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
   SEND AUDIO MESSAGE
========================================== */

exports.sendAudioMessage = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "Please record an audio."

            });

        }

        const newMessage = await Message.create({

            conversationId: req.params.conversationId,

            senderId: req.user.id,

            type: "audio",

            audio: req.file.filename,

            audioDuration: req.body.duration || 0,

            status: "sent"

        });

        const io = req.app.get("io");

        io.to(req.params.conversationId).emit(

            "receive_message",

            newMessage

        );

        res.status(201).json({

            success: true,

            newMessage

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
   GET USER CONVERSATIONS
========================================== */

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

            order: [["updatedAt", "DESC"]]

        });

        const results = [];

        for (const conversation of conversations) {

            const lastMessage = await Message.findOne({

                where: {

                    conversationId: conversation.id

                },

                order: [["createdAt", "DESC"]]

            });

            const product = await Product.findByPk(

                conversation.productId

            );

            if (product && product.images) {

                try {

                    product.images = JSON.parse(product.images);

                }

                catch {

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

                product,

                user: otherUser,

                lastMessage: lastMessage

                    ? lastMessage.message

                    : "",

                updatedAt: conversation.updatedAt,

                unreadCount: 0

            });

        }

        res.json(results);

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
   GET CONVERSATION DETAILS
========================================== */

exports.getConversationDetails = async (req, res) => {

    try {

        const conversation = await Conversation.findByPk(

            req.params.conversationId

        );

        if (!conversation) {

            return res.status(404).json({

                success: false,
                message: "Conversation not found."

            });

        }

        const product = await Product.findByPk(

            conversation.productId

        );

        if (product && product.images) {

            try {

                product.images = JSON.parse(product.images);

            }

            catch {

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

        res.json({

            success: true,

            conversation,

            product,

            seller,

            buyer

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};exports.markDelivered = async (req, res) => {

    try {

        await Message.update(

            {

                status: "delivered"

            },

            {

                where: {

                    conversationId: req.params.conversationId,

                    status: "sent"

                }

            }

        );

        res.json({

            success: true

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};exports.markRead = async (req, res) => {

    try {

        await Message.update(

            {

                status: "read",

                readAt: new Date()

            },

            {

                where: {

                    conversationId: req.params.conversationId,

                    status: {

                        [Op.ne]: "read"

                    }

                }

            }

        );

        res.json({

            success: true

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};exports.openConversation = async (req, res) => {

    try {

        const {

            buyerId,

            sellerId,

            productId

        } = req.body;

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

            conversationId: conversation.id

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
   GET MY CONVERSATIONS
========================================== */

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
            order: [["updatedAt", "DESC"]]
        });

        const results = [];

        for (const conversation of conversations) {

            const lastMessage = await Message.findOne({
                where: {
                    conversationId: conversation.id
                },
                order: [["createdAt", "DESC"]]
            });

            const product = await Product.findByPk(
                conversation.productId
            );

            if (product && product.images) {
                try {
                    if (typeof product.images === "string") {
                        product.images = JSON.parse(product.images);
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
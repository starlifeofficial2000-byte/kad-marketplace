const { Op } = require("sequelize");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Product = require("../models/Product");
const User = require("../models/User");

const {
    getR2PublicUrl,
    deleteFromR2
} = require("../config/r2");

/* =========================================================
   HELPER
   CHECK IF USER BELONGS TO CONVERSATION
========================================================= */
/* =========================================================
   CHAT MEDIA URL HELPERS
========================================================= */

const resolveChatMediaUrl = (value) => {
    if (!value) return null;

    const clean = String(value).trim();

    if (!clean) return null;

    // Already a complete URL
    if (/^https?:\/\//i.test(clean)) {
        return clean;
    }

    // R2 object key
    const r2Url = getR2PublicUrl(clean);

    if (r2Url) {
        return r2Url;
    }

    return clean;
};

const formatChatMessage = (message) => {
    if (!message) return null;

    const data =
        typeof message.toJSON === "function"
            ? message.toJSON()
            : { ...message };

    if (data.image) {
        data.image = resolveChatMediaUrl(data.image);
    }

    if (data.audio) {
        data.audio = resolveChatMediaUrl(data.audio);
    }

    return data;
};
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

        const formattedMessages = messages.map(
            formatChatMessage
        );

        return res.json({
            success: true,
            messages: formattedMessages
        });

    } catch (error) {
        console.error(
            "GET MESSAGES ERROR:",
            error
        );

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
/* =========================================================
   SEND IMAGE MESSAGE
========================================================= */

exports.sendImageMessage = async (req, res) => {
    let uploadedR2Key = null;

    try {
        const conversationId = req.params.conversationId;
        const userId = Number(req.user.id);

        console.log("========== IMAGE MESSAGE ==========");
        console.log("Conversation ID:", conversationId);
        console.log("User ID:", userId);
        console.log("Uploaded file:", req.file?.r2Key);
        console.log("===================================");

        /* =================================================
           1. MAKE SURE IMAGE WAS UPLOADED
        ================================================= */

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image."
            });
        }

        uploadedR2Key =
            req.file.r2Key ||
            req.file.key ||
            null;

        if (!uploadedR2Key) {
            return res.status(500).json({
                success: false,
                message: "Image upload failed. No R2 object key was returned."
            });
        }

        /* =================================================
           2. FIND CONVERSATION
        ================================================= */

        const conversation =
            await Conversation.findByPk(conversationId);

        if (!conversation) {
            await deleteFromR2(uploadedR2Key).catch(() => {});

            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        /* =================================================
           3. CHECK PARTICIPANT
        ================================================= */

        const isParticipant =
            Number(conversation.buyerId) === userId ||
            Number(conversation.sellerId) === userId;

        if (!isParticipant) {
            await deleteFromR2(uploadedR2Key).catch(() => {});

            return res.status(403).json({
                success: false,
                message: "You are not part of this conversation."
            });
        }

        /* =================================================
           4. CREATE MESSAGE

           Store the R2 object key in the database.
        ================================================= */

        const newMessage = await Message.create({
            conversationId,
            senderId: req.user.id,
            type: "image",

            image: uploadedR2Key,

            message: null,
            status: "sent"
        });

        /* =================================================
           5. UPDATE CONVERSATION
        ================================================= */

        await conversation.update({
            updatedAt: new Date()
        });

        /* =================================================
           6. CREATE PUBLIC R2 URL
        ================================================= */

        const imageUrl =
            getR2PublicUrl(uploadedR2Key);

        /* =================================================
           7. REAL-TIME SOCKET MESSAGE

           Send the URL to connected clients.
        ================================================= */

        const socketMessage = {
            ...newMessage.toJSON(),
            image: imageUrl || uploadedR2Key
        };

        const io = req.app.get("io");

        if (io) {
            io.to(String(conversationId)).emit(
                "receive_message",
                socketMessage
            );
        }

        /* =================================================
           8. RESPONSE
        ================================================= */

        return res.status(201).json({
            success: true,
            newMessage: socketMessage
        });

    } catch (error) {

        console.error(
            "SEND IMAGE MESSAGE ERROR:",
            error
        );

        /* =================================================
           CLEAN UP ORPHANED R2 FILE
        ================================================= */

        if (uploadedR2Key) {
            try {
                await deleteFromR2(uploadedR2Key);

                console.log(
                    "Deleted orphaned chat image from R2:",
                    uploadedR2Key
                );

            } catch (cleanupError) {
                console.error(
                    "FAILED TO DELETE ORPHANED CHAT IMAGE:",
                    cleanupError
                );
            }
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to send image message."
        });
    }
};

/* =========================================================
   SEND AUDIO MESSAGE
========================================================= */

exports.sendAudioMessage = async (req, res) => {
    let uploadedR2Key = null;

    try {
        const conversationId = req.params.conversationId;
        const senderId = Number(req.user.id);

        /* =================================================
           1. CHECK CONVERSATION
        ================================================= */

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

        /* =================================================
           2. CHECK AUDIO
        ================================================= */

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please record an audio."
            });
        }

        uploadedR2Key =
            req.file.r2Key ||
            req.file.key ||
            null;

        if (!uploadedR2Key) {
            return res.status(500).json({
                success: false,
                message: "Audio upload failed. No R2 object key was returned."
            });
        }

        console.log("====================================");
        console.log("CHAT AUDIO UPLOAD");
        console.log("Conversation ID:", conversationId);
        console.log("Sender ID:", senderId);
        console.log("R2 Key:", uploadedR2Key);
        console.log("Duration:", req.body.duration || 0);
        console.log("====================================");

        /* =================================================
           3. CREATE AUDIO MESSAGE
        ================================================= */

        const newMessage = await Message.create({
            conversationId,
            senderId,
            type: "audio",

            audio: uploadedR2Key,

            audioDuration:
                Number(req.body.duration) || 0,

            status: "sent"
        });

        /* =================================================
           4. UPDATE CONVERSATION
        ================================================= */

        await conversation.update({
            updatedAt: new Date()
        });

        /* =================================================
           5. PUBLIC R2 URL
        ================================================= */

        const audioUrl =
            getR2PublicUrl(uploadedR2Key);

        /* =================================================
           6. REAL-TIME MESSAGE
        ================================================= */

        const socketMessage = {
            ...newMessage.toJSON(),
            audio: audioUrl || uploadedR2Key
        };

        const io = req.app.get("io");

        if (io) {
            io.to(String(conversationId)).emit(
                "receive_message",
                socketMessage
            );
        }

        /* =================================================
           7. RESPONSE
        ================================================= */

        return res.status(201).json({
            success: true,
            newMessage: socketMessage
        });

    } catch (error) {

        console.error(
            "SEND AUDIO MESSAGE ERROR:",
            error
        );

        /* =================================================
           CLEAN UP ORPHANED R2 FILE
        ================================================= */

        if (uploadedR2Key) {
            try {
                await deleteFromR2(uploadedR2Key);

                console.log(
                    "Deleted orphaned chat audio from R2:",
                    uploadedR2Key
                );

            } catch (cleanupError) {
                console.error(
                    "FAILED TO DELETE ORPHANED CHAT AUDIO:",
                    cleanupError
                );
            }
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to send audio message."
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
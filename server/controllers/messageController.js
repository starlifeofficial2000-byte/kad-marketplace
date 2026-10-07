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
   CHAT MEDIA URL HELPERS
========================================================= */

const resolveChatMediaUrl = (value) => {
    if (!value) {
        return null;
    }

    const clean = String(value).trim();

    if (!clean) {
        return null;
    }

    /* Already a complete URL */
    if (/^https?:\/\//i.test(clean)) {
        return clean;
    }

    /* R2 object key */
    const r2Url = getR2PublicUrl(clean);

    if (r2Url) {
        return r2Url;
    }

    return clean;
};


/* =========================================================
   FORMAT CHAT MESSAGE
========================================================= */

const formatChatMessage = (message) => {
    if (!message) {
        return null;
    }

    const data =
        typeof message.toJSON === "function"
            ? message.toJSON()
            : { ...message };

    if (data.image) {
        data.image =
            resolveChatMediaUrl(data.image);
    }

    if (data.audio) {
        data.audio =
            resolveChatMediaUrl(data.audio);
    }

    return data;
};


/* =========================================================
   CHECK CONVERSATION ACCESS
========================================================= */

const getConversationForUser = async (
    conversationId,
    userId
) => {

    const conversation =
        await Conversation.findByPk(
            conversationId
        );

    if (!conversation) {
        return {
            conversation: null,
            authorized: false
        };
    }

    const authorized =
        Number(conversation.buyerId) ===
            Number(userId) ||
        Number(conversation.sellerId) ===
            Number(userId);

    return {
        conversation,
        authorized
    };
};


/* =========================================================
   GET OTHER PARTICIPANT
========================================================= */

const getOtherParticipantId = (
    conversation,
    senderId
) => {

    const buyerId =
        Number(conversation.buyerId);

    const sellerId =
        Number(conversation.sellerId);

    const currentSenderId =
        Number(senderId);

    if (currentSenderId === buyerId) {
        return sellerId;
    }

    if (currentSenderId === sellerId) {
        return buyerId;
    }

    return null;
};


/* =========================================================
   EMIT REAL-TIME MESSAGE NOTIFICATION
========================================================= */

const emitMessageNotification = ({
    io,
    conversation,
    message
}) => {

    if (
        !io ||
        !conversation ||
        !message
    ) {
        return;
    }

    const senderId =
        Number(message.senderId);

    const recipientId =
        getOtherParticipantId(
            conversation,
            senderId
        );

    if (!recipientId) {

        console.warn(
            "⚠️ Unable to determine message recipient:",
            {
                conversationId:
                    conversation.id,

                senderId,

                buyerId:
                    conversation.buyerId,

                sellerId:
                    conversation.sellerId
            }
        );

        return;
    }

    const notification = {
        conversationId:
            conversation.id,

        messageId:
            message.id,

        senderId,

        recipientId,

        type:
            message.type ||
            "text",

        message:
            message.message ||
            "",

        image:
            message.image ||
            null,

        audio:
            message.audio ||
            null,

        audioDuration:
            Number(
                message.audioDuration
            ) || 0,

        status:
            message.status ||
            "sent",

        createdAt:
            message.createdAt ||
            new Date()
    };

    const recipientRoom =
        `user:${recipientId}`;

    io.to(recipientRoom).emit(
        "new_message_notification",
        notification
    );

    console.log(
        `🔔 Message notification sent to user ${recipientId}`
    );
};


/* =========================================================
   GET UNREAD COUNT FOR ONE CONVERSATION
========================================================= */

const getConversationUnreadCount = async (
    conversationId,
    userId
) => {

    return await Message.count({
        where: {
            conversationId,

            /* Only messages from the other person */
            senderId: {
                [Op.ne]:
                    Number(userId)
            },

            /* Anything not read is unread */
            status: {
                [Op.ne]:
                    "read"
            }
        }
    });
};


/* =========================================================
   SEND FIRST MESSAGE
========================================================= */

exports.sendMessage = async (
    req,
    res
) => {

    try {

        const {
            buyerId,
            sellerId,
            productId,
            message
        } = req.body;

        const senderId =
            Number(req.user.id);


        /* =================================================
           VALIDATION
        ================================================= */

        if (
            !buyerId ||
            !sellerId ||
            !productId
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "buyerId, sellerId and productId are required."
            });
        }

        if (
            !message ||
            !message.trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Message cannot be empty."
            });
        }


        /* =================================================
           CHECK PARTICIPANT
        ================================================= */

        const isParticipant =
            senderId === Number(buyerId) ||
            senderId === Number(sellerId);

        if (!isParticipant) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not part of this conversation."
            });
        }


        /* =================================================
           FIND / CREATE CONVERSATION
        ================================================= */

        let conversation =
            await Conversation.findOne({
                where: {
                    buyerId,
                    sellerId,
                    productId
                }
            });


        if (!conversation) {

            conversation =
                await Conversation.create({
                    buyerId,
                    sellerId,
                    productId
                });
        }


        /* =================================================
           CREATE MESSAGE
        ================================================= */

        const newMessage =
            await Message.create({

                conversationId:
                    conversation.id,

                senderId,

                message:
                    message.trim(),

                type:
                    "text",

                status:
                    "sent"
            });


        /* =================================================
           UPDATE CONVERSATION
        ================================================= */

        await conversation.update({
            updatedAt:
                new Date()
        });


        /* =================================================
           SOCKET.IO
        ================================================= */

        const io =
            req.app.get("io");


        if (io) {

            /* Active chat */
            io.to(
                String(
                    conversation.id
                )
            ).emit(
                "receive_message",
                newMessage
            );


            /* Recipient notification */
            emitMessageNotification({
                io,
                conversation,
                message:
                    newMessage
            });
        }


        /* =================================================
           RESPONSE
        ================================================= */

        return res.status(201).json({
            success: true,

            conversation,

            newMessage:
                formatChatMessage(
                    newMessage
                )
        });

    } catch (error) {

        console.error(
            "SEND FIRST MESSAGE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message
        });
    }
};


/* =========================================================
   GET ALL MESSAGES
========================================================= */

exports.getMessages = async (
    req,
    res
) => {

    try {

        const conversationId =
            req.params.conversationId;

        const userId =
            Number(req.user.id);


        /* =================================================
           CHECK CONVERSATION
        ================================================= */

        const {
            conversation,
            authorized
        } =
            await getConversationForUser(
                conversationId,
                userId
            );


        if (!conversation) {

            return res.status(404).json({
                success: false,
                message:
                    "Conversation not found."
            });
        }


        if (!authorized) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not part of this conversation."
            });
        }


        /* =================================================
           GET MESSAGES
        ================================================= */

        const messages =
            await Message.findAll({
                where: {
                    conversationId
                },

                order: [
                    [
                        "createdAt",
                        "ASC"
                    ]
                ]
            });


        const formattedMessages =
            messages.map(
                formatChatMessage
            );


        return res.json({
            success: true,
            messages:
                formattedMessages
        });

    } catch (error) {

        console.error(
            "GET MESSAGES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message
        });
    }
};


/* =========================================================
   SEND MESSAGE TO EXISTING CONVERSATION
========================================================= */

exports.sendMessageToConversation = async (
    req,
    res
) => {

    try {

        const senderId =
            Number(req.user.id);

        const conversationId =
            req.params.conversationId;

        const {
            message
        } = req.body;


        /* =================================================
           VALIDATION
        ================================================= */

        if (
            !message ||
            !message.trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Message cannot be empty."
            });
        }


        /* =================================================
           CHECK CONVERSATION
        ================================================= */

        const {
            conversation,
            authorized
        } =
            await getConversationForUser(
                conversationId,
                senderId
            );


        if (!conversation) {

            return res.status(404).json({
                success: false,
                message:
                    "Conversation not found."
            });
        }


        if (!authorized) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not part of this conversation."
            });
        }


        /* =================================================
           CREATE MESSAGE
        ================================================= */

        const newMessage =
            await Message.create({

                conversationId,

                senderId,

                message:
                    message.trim(),

                type:
                    "text",

                status:
                    "sent"
            });


        /* =================================================
           UPDATE CONVERSATION
        ================================================= */

        await conversation.update({
            updatedAt:
                new Date()
        });


        /* =================================================
           SOCKET.IO
        ================================================= */

        const io =
            req.app.get("io");


        if (io) {

            io.to(
                String(
                    conversationId
                )
            ).emit(
                "receive_message",
                newMessage
            );


            emitMessageNotification({
                io,

                conversation,

                message:
                    newMessage
            });
        }


        return res.status(201).json({
            success: true,

            newMessage:
                formatChatMessage(
                    newMessage
                )
        });

    } catch (error) {

        console.error(
            "SEND MESSAGE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message
        });
    }
};


/* =========================================================
   SEND IMAGE MESSAGE
========================================================= */

exports.sendImageMessage = async (
    req,
    res
) => {

    let uploadedR2Key =
        null;

    try {

        const conversationId =
            req.params.conversationId;

        const userId =
            Number(req.user.id);


        console.log(
            "========== IMAGE MESSAGE =========="
        );

        console.log(
            "Conversation ID:",
            conversationId
        );

        console.log(
            "User ID:",
            userId
        );

        console.log(
            "Uploaded file:",
            req.file?.r2Key
        );

        console.log(
            "==================================="
        );


        /* =================================================
           CHECK FILE
        ================================================= */

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message:
                    "Please select an image."
            });
        }


        uploadedR2Key =
            req.file.r2Key ||
            req.file.key ||
            null;


        if (!uploadedR2Key) {

            return res.status(500).json({
                success: false,
                message:
                    "Image upload failed. No R2 object key was returned."
            });
        }


        /* =================================================
           CHECK CONVERSATION
        ================================================= */

        const {
            conversation,
            authorized
        } =
            await getConversationForUser(
                conversationId,
                userId
            );


        if (!conversation) {

            await deleteFromR2(
                uploadedR2Key
            ).catch(() => {});


            return res.status(404).json({
                success: false,
                message:
                    "Conversation not found."
            });
        }


        if (!authorized) {

            await deleteFromR2(
                uploadedR2Key
            ).catch(() => {});


            return res.status(403).json({
                success: false,
                message:
                    "You are not part of this conversation."
            });
        }


        /* =================================================
           CREATE MESSAGE
        ================================================= */

        const newMessage =
            await Message.create({

                conversationId,

                senderId:
                    userId,

                type:
                    "image",

                image:
                    uploadedR2Key,

                message:
                    null,

                status:
                    "sent"
            });


        /* =================================================
           UPDATE CONVERSATION
        ================================================= */

        await conversation.update({
            updatedAt:
                new Date()
        });


        /* =================================================
           PUBLIC R2 URL
        ================================================= */

        const imageUrl =
            getR2PublicUrl(
                uploadedR2Key
            );


        /* =================================================
           SOCKET MESSAGE
        ================================================= */

        const socketMessage = {
            ...newMessage.toJSON(),

            image:
                imageUrl ||
                uploadedR2Key
        };


        const io =
            req.app.get("io");


        if (io) {

            io.to(
                String(
                    conversationId
                )
            ).emit(
                "receive_message",
                socketMessage
            );


            emitMessageNotification({
                io,

                conversation,

                message:
                    socketMessage
            });
        }


        /* =================================================
           RESPONSE
        ================================================= */

        return res.status(201).json({
            success: true,

            newMessage:
                socketMessage
        });

    } catch (error) {

        console.error(
            "SEND IMAGE MESSAGE ERROR:",
            error
        );


        /* =================================================
           CLEAN ORPHANED FILE
        ================================================= */

        if (uploadedR2Key) {

            try {

                await deleteFromR2(
                    uploadedR2Key
                );

                console.log(
                    "Deleted orphaned chat image:",
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

exports.sendAudioMessage = async (
    req,
    res
) => {

    let uploadedR2Key =
        null;

    try {

        const conversationId =
            req.params.conversationId;

        const senderId =
            Number(req.user.id);


        /* =================================================
           CHECK CONVERSATION
        ================================================= */

        const {
            conversation,
            authorized
        } =
            await getConversationForUser(
                conversationId,
                senderId
            );


        if (!conversation) {

            return res.status(404).json({
                success: false,
                message:
                    "Conversation not found."
            });
        }


        if (!authorized) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not part of this conversation."
            });
        }


        /* =================================================
           CHECK AUDIO
        ================================================= */

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message:
                    "Please record an audio."
            });
        }


        uploadedR2Key =
            req.file.r2Key ||
            req.file.key ||
            null;


        if (!uploadedR2Key) {

            return res.status(500).json({
                success: false,
                message:
                    "Audio upload failed. No R2 object key was returned."
            });
        }


        console.log(
            "===================================="
        );

        console.log(
            "CHAT AUDIO UPLOAD"
        );

        console.log(
            "Conversation ID:",
            conversationId
        );

        console.log(
            "Sender ID:",
            senderId
        );

        console.log(
            "R2 Key:",
            uploadedR2Key
        );

        console.log(
            "Duration:",
            req.body.duration || 0
        );

        console.log(
            "===================================="
        );


        /* =================================================
           CREATE AUDIO MESSAGE
        ================================================= */

        const newMessage =
            await Message.create({

                conversationId,

                senderId,

                type:
                    "audio",

                audio:
                    uploadedR2Key,

                audioDuration:
                    Number(
                        req.body.duration
                    ) || 0,

                status:
                    "sent"
            });


        /* =================================================
           UPDATE CONVERSATION
        ================================================= */

        await conversation.update({
            updatedAt:
                new Date()
        });


        /* =================================================
           PUBLIC AUDIO URL
        ================================================= */

        const audioUrl =
            getR2PublicUrl(
                uploadedR2Key
            );


        /* =================================================
           SOCKET MESSAGE
        ================================================= */

        const socketMessage = {
            ...newMessage.toJSON(),

            audio:
                audioUrl ||
                uploadedR2Key
        };


        const io =
            req.app.get("io");


        if (io) {

            io.to(
                String(
                    conversationId
                )
            ).emit(
                "receive_message",
                socketMessage
            );


            emitMessageNotification({
                io,

                conversation,

                message:
                    socketMessage
            });
        }


        /* =================================================
           RESPONSE
        ================================================= */

        return res.status(201).json({
            success: true,

            newMessage:
                socketMessage
        });

    } catch (error) {

        console.error(
            "SEND AUDIO MESSAGE ERROR:",
            error
        );


        /* =================================================
           CLEAN ORPHANED FILE
        ================================================= */

        if (uploadedR2Key) {

            try {

                await deleteFromR2(
                    uploadedR2Key
                );

                console.log(
                    "Deleted orphaned chat audio:",
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

exports.getUserConversations = async (
    req,
    res
) => {

    try {

        const userId =
            Number(req.params.userId);


        /* =================================================
           SECURITY

           A logged-in user should not be able to request
           another user's private conversations.
        ================================================= */

        if (
            userId !==
            Number(req.user.id)
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You can only access your own conversations."
            });
        }


        const conversations =
            await Conversation.findAll({

                where: {
                    [Op.or]: [
                        {
                            buyerId:
                                userId
                        },
                        {
                            sellerId:
                                userId
                        }
                    ]
                },

                order: [
                    [
                        "updatedAt",
                        "DESC"
                    ]
                ]
            });


        const results = [];


        for (
            const conversation
            of conversations
        ) {

            /* =============================================
               LAST MESSAGE
            ============================================= */

            const lastMessage =
                await Message.findOne({
                    where: {
                        conversationId:
                            conversation.id
                    },

                    order: [
                        [
                            "createdAt",
                            "DESC"
                        ]
                    ]
                });


            /* =============================================
               PRODUCT
            ============================================= */

            const product =
                await Product.findByPk(
                    conversation.productId
                );


            if (
                product &&
                product.images
            ) {

                try {

                    if (
                        typeof product.images ===
                        "string"
                    ) {

                        product.images =
                            JSON.parse(
                                product.images
                            );
                    }

                } catch {

                    product.images = [];
                }
            }


            /* =============================================
               OTHER USER
            ============================================= */

            const otherUserId =
                Number(
                    conversation.buyerId
                ) === userId

                    ? conversation.sellerId

                    : conversation.buyerId;


            const otherUser =
                await User.findByPk(
                    otherUserId,
                    {
                        attributes: [
                            "id",
                            "name",
                            "profileImage"
                        ]
                    }
                );


            /* =============================================
               UNREAD COUNT
            ============================================= */

            const unreadCount =
                await getConversationUnreadCount(
                    conversation.id,
                    userId
                );


            /* =============================================
               RESULT
            ============================================= */

            results.push({

                id:
                    conversation.id,

                buyerId:
                    conversation.buyerId,

                sellerId:
                    conversation.sellerId,

                product,

                user:
                    otherUser,

                lastMessage:
                    lastMessage
                        ? lastMessage.message || ""
                        : "",

                lastMessageType:
                    lastMessage
                        ? lastMessage.type ||
                            "text"
                        : "text",

                lastMessageAt:
                    lastMessage
                        ? lastMessage.createdAt
                        : null,

                updatedAt:
                    conversation.updatedAt,

                unreadCount
            });
        }


        return res.json({
            success: true,
            conversations:
                results
        });

    } catch (error) {

        console.error(
            "GET USER CONVERSATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message
        });
    }
};


/* =========================================================
   GET CONVERSATION DETAILS
========================================================= */

exports.getConversationDetails = async (
    req,
    res
) => {

    try {

        const conversationId =
            req.params.conversationId;

        const userId =
            Number(req.user.id);


        /* =================================================
           CHECK ACCESS
        ================================================= */

        const {
            conversation,
            authorized
        } =
            await getConversationForUser(
                conversationId,
                userId
            );


        if (!conversation) {

            return res.status(404).json({
                success: false,
                message:
                    "Conversation not found."
            });
        }


        if (!authorized) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not part of this conversation."
            });
        }


        /* =================================================
           PRODUCT
        ================================================= */

        const product =
            await Product.findByPk(
                conversation.productId
            );


        if (
            product &&
            product.images
        ) {

            try {

                if (
                    typeof product.images ===
                    "string"
                ) {

                    product.images =
                        JSON.parse(
                            product.images
                        );
                }

            } catch {

                product.images = [];
            }
        }


        /* =================================================
           SELLER
        ================================================= */

        const seller =
            await User.findByPk(
                conversation.sellerId,
                {
                    attributes: [
                        "id",
                        "name",
                        "profileImage"
                    ]
                }
            );


        /* =================================================
           BUYER
        ================================================= */

        const buyer =
            await User.findByPk(
                conversation.buyerId,
                {
                    attributes: [
                        "id",
                        "name",
                        "profileImage"
                    ]
                }
            );


        /* =================================================
           UNREAD COUNT
        ================================================= */

        const unreadCount =
            await getConversationUnreadCount(
                conversation.id,
                userId
            );


        return res.json({
            success: true,

            conversation,

            product,

            seller,

            buyer,

            unreadCount
        });

    } catch (error) {

        console.error(
            "GET CONVERSATION DETAILS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message
        });
    }
};


/* =========================================================
   MARK DELIVERED
========================================================= */

exports.markDelivered = async (
    req,
    res
) => {

    try {

        const conversationId =
            req.params.conversationId;

        const userId =
            Number(req.user.id);


        /* =================================================
           CHECK ACCESS
        ================================================= */

        const {
            conversation,
            authorized
        } =
            await getConversationForUser(
                conversationId,
                userId
            );


        if (!conversation) {

            return res.status(404).json({
                success: false,
                message:
                    "Conversation not found."
            });
        }


        if (!authorized) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not part of this conversation."
            });
        }


        /* =================================================
           MARK OTHER USER'S SENT MESSAGES DELIVERED
        ================================================= */

        await Message.update(

            {
                status:
                    "delivered"
            },

            {
                where: {

                    conversationId,

                    senderId: {
                        [Op.ne]:
                            userId
                    },

                    status:
                        "sent"
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
            message:
                error.message
        });
    }
};


/* =========================================================
   MARK READ
========================================================= */

exports.markRead = async (
    req,
    res
) => {

    try {

        const conversationId =
            req.params.conversationId;

        const userId =
            Number(req.user.id);


        /* =================================================
           CHECK ACCESS
        ================================================= */

        const {
            conversation,
            authorized
        } =
            await getConversationForUser(
                conversationId,
                userId
            );


        if (!conversation) {

            return res.status(404).json({
                success: false,
                message:
                    "Conversation not found."
            });
        }


        if (!authorized) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not part of this conversation."
            });
        }


        /* =================================================
           MARK ONLY RECEIVED MESSAGES AS READ
        ================================================= */

        const [
            updatedCount
        ] =
            await Message.update(

                {
                    status:
                        "read",

                    readAt:
                        new Date()
                },

                {
                    where: {

                        conversationId,

                        senderId: {
                            [Op.ne]:
                                userId
                        },

                        status: {
                            [Op.ne]:
                                "read"
                        }
                    }
                }
            );


        /* =================================================
           GET NEW UNREAD COUNT
        ================================================= */

        const unreadCount =
            await getConversationUnreadCount(
                conversationId,
                userId
            );


        /* =================================================
           NOTIFY USER'S FRONTEND
        ================================================= */

        const io =
            req.app.get("io");


        if (io) {

            io.to(
                `user:${userId}`
            ).emit(
                "messages_read",
                {
                    conversationId:
                        Number(
                            conversationId
                        ),

                    unreadCount
                }
            );
        }


        return res.json({

            success: true,

            markedRead:
                updatedCount,

            unreadCount
        });

    } catch (error) {

        console.error(
            "MARK READ ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message
        });
    }
};


/* =========================================================
   OPEN / CREATE CONVERSATION
========================================================= */

exports.openConversation = async (
    req,
    res
) => {

    try {

        const {
            buyerId,
            sellerId,
            productId
        } = req.body;

        const userId =
            Number(req.user.id);


        /* =================================================
           VALIDATION
        ================================================= */

        if (
            !buyerId ||
            !sellerId ||
            !productId
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "buyerId, sellerId and productId are required."
            });
        }


        /* =================================================
           CHECK PARTICIPANT
        ================================================= */

        const isParticipant =
            userId === Number(buyerId) ||
            userId === Number(sellerId);


        if (!isParticipant) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not part of this conversation."
            });
        }


        /* =================================================
           FIND / CREATE
        ================================================= */

        let conversation =
            await Conversation.findOne({
                where: {
                    buyerId,
                    sellerId,
                    productId
                }
            });


        if (!conversation) {

            conversation =
                await Conversation.create({
                    buyerId,
                    sellerId,
                    productId
                });
        }


        return res.json({

            success: true,

            conversationId:
                conversation.id,

            conversation
        });

    } catch (error) {

        console.error(
            "OPEN CONVERSATION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message
        });
    }
};


/* =========================================================
   GET MY CONVERSATIONS
========================================================= */

exports.getMyConversations = async (
    req,
    res
) => {

    try {

        const userId =
            Number(req.user.id);


        const conversations =
            await Conversation.findAll({

                where: {
                    [Op.or]: [
                        {
                            buyerId:
                                userId
                        },
                        {
                            sellerId:
                                userId
                        }
                    ]
                },

                order: [
                    [
                        "updatedAt",
                        "DESC"
                    ]
                ]
            });


        const results = [];


        for (
            const conversation
            of conversations
        ) {

            /* =============================================
               LAST MESSAGE
            ============================================= */

            const lastMessage =
                await Message.findOne({

                    where: {
                        conversationId:
                            conversation.id
                    },

                    order: [
                        [
                            "createdAt",
                            "DESC"
                        ]
                    ]
                });


            /* =============================================
               PRODUCT
            ============================================= */

            const product =
                await Product.findByPk(
                    conversation.productId
                );


            if (
                product &&
                product.images
            ) {

                try {

                    if (
                        typeof product.images ===
                        "string"
                    ) {

                        product.images =
                            JSON.parse(
                                product.images
                            );
                    }

                } catch {

                    product.images = [];
                }
            }


            /* =============================================
               OTHER USER
            ============================================= */

            const otherUserId =
                Number(
                    conversation.buyerId
                ) === userId

                    ? conversation.sellerId

                    : conversation.buyerId;


            const otherUser =
                await User.findByPk(
                    otherUserId,
                    {
                        attributes: [
                            "id",
                            "name",
                            "profileImage"
                        ]
                    }
                );


            /* =============================================
               UNREAD COUNT
            ============================================= */

            const unreadCount =
                await getConversationUnreadCount(
                    conversation.id,
                    userId
                );


            /* =============================================
               RESULT
            ============================================= */

            results.push({

                id:
                    conversation.id,

                buyerId:
                    conversation.buyerId,

                sellerId:
                    conversation.sellerId,

                product,

                user:
                    otherUser,

                lastMessage:
                    lastMessage
                        ? lastMessage.message || ""
                        : "",

                lastMessageType:
                    lastMessage
                        ? lastMessage.type ||
                            "text"
                        : "text",

                lastMessageAt:
                    lastMessage
                        ? lastMessage.createdAt
                        : null,

                updatedAt:
                    conversation.updatedAt,

                unreadCount
            });
        }


        return res.json({
            success: true,

            conversations:
                results
        });

    } catch (error) {

        console.error(
            "GET MY CONVERSATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message
        });
    }
};


/* =========================================================
   GET TOTAL UNREAD MESSAGE COUNT
========================================================= */

exports.getUnreadMessageCount = async (
    req,
    res
) => {

    try {

        const userId =
            Number(req.user.id);


        /* =================================================
           GET USER CONVERSATIONS
        ================================================= */

        const conversations =
            await Conversation.findAll({

                where: {
                    [Op.or]: [
                        {
                            buyerId:
                                userId
                        },
                        {
                            sellerId:
                                userId
                        }
                    ]
                },

                attributes: [
                    "id"
                ]
            });


        if (
            !conversations.length
        ) {

            return res.json({

                success: true,

                unreadCount:
                    0
            });
        }


        const conversationIds =
            conversations.map(
                conversation =>
                    conversation.id
            );


        /* =================================================
           COUNT UNREAD
        ================================================= */

        const unreadCount =
            await Message.count({

                where: {

                    conversationId: {
                        [Op.in]:
                            conversationIds
                    },

                    senderId: {
                        [Op.ne]:
                            userId
                    },

                    status: {
                        [Op.ne]:
                            "read"
                    }
                }
            });


        return res.json({

            success: true,

            unreadCount
        });

    } catch (error) {

        console.error(
            "GET UNREAD MESSAGE COUNT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message
        });
    }
};


/* =========================================================
   EXPORT HELPERS
   Optional internal exports for testing.
========================================================= */

exports._helpers = {
    resolveChatMediaUrl,
    formatChatMessage,
    getConversationForUser,
    getOtherParticipantId,
    getConversationUnreadCount,
    emitMessageNotification
};
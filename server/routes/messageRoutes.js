const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const chatUpload = require("../middleware/chatUpload");

const messageController = require("../controllers/messageController");

/* ==========================================
   START CONVERSATION
========================================== */

router.post(
    "/",
    auth,
    messageController.sendMessage
);

/* ==========================================
   GET CONVERSATION DETAILS
========================================== */

router.get(
    "/conversation/:conversationId",
    auth,
    messageController.getConversationDetails
);

/* ==========================================
   GET USER CONVERSATIONS
========================================== */

router.get(
    "/user/:userId",
    auth,
    messageController.getUserConversations
);

/* ==========================================
   GET MESSAGES
========================================== */

router.get(
    "/:conversationId",
    auth,
    messageController.getMessages
);

/* ==========================================
   SEND TEXT MESSAGE
========================================== */
router.post(

    "/open",

    auth,

    messageController.openConversation

);
router.post(
    "/:conversationId",
    auth,
    messageController.sendMessageToConversation
);

/* ==========================================
   SEND IMAGE MESSAGE
========================================== */

router.post(
    "/:conversationId/image",
    auth,
    chatUpload.single("image"),
    messageController.sendImageMessage
);

/* ==========================================
   SEND AUDIO MESSAGE
========================================== */
router.put(

    "/:conversationId/delivered",

    auth,

    messageController.markDelivered

);

router.put(

    "/:conversationId/read",

    auth,

    messageController.markRead

);
router.post(
    "/:conversationId/audio",
    auth,
    chatUpload.single("audio"),
    messageController.sendAudioMessage
);

module.exports = router;
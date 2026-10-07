const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const chatUpload = require("../middleware/chatUpload");

const messageController = require("../controllers/messageController");

/* =========================================================
   SEND FIRST MESSAGE
========================================================= */

router.post(
    "/",
    auth,
    messageController.sendMessage
);

/* =========================================================
   OPEN / CREATE CONVERSATION
========================================================= */

router.post(
    "/open",
    auth,
    messageController.openConversation
);

/* =========================================================
   GET MY CONVERSATIONS
========================================================= */

router.get(
    "/conversations",
    auth,
    messageController.getMyConversations
);

/* =========================================================
   GET TOTAL UNREAD MESSAGE COUNT

   IMPORTANT:
   This MUST come before /:conversationId
========================================================= */

router.get(
    "/unread/count",
    auth,
    messageController.getUnreadMessageCount
);

/* =========================================================
   GET CONVERSATION DETAILS
========================================================= */

router.get(
    "/conversation/:conversationId",
    auth,
    messageController.getConversationDetails
);

/* =========================================================
   GET USER CONVERSATIONS
   Legacy / explicit user endpoint
========================================================= */

router.get(
    "/user/:userId",
    auth,
    messageController.getUserConversations
);

/* =========================================================
   GET MESSAGES IN A CONVERSATION
========================================================= */

router.get(
    "/:conversationId",
    auth,
    messageController.getMessages
);

/* =========================================================
   SEND TEXT MESSAGE TO EXISTING CONVERSATION
========================================================= */

router.post(
    "/:conversationId",
    auth,
    messageController.sendMessageToConversation
);

/* =========================================================
   SEND IMAGE MESSAGE
========================================================= */

router.post(
    "/:conversationId/image",
    auth,
    chatUpload.single("image"),
    messageController.sendImageMessage
);

/* =========================================================
   SEND AUDIO MESSAGE
========================================================= */

router.post(
    "/:conversationId/audio",
    auth,
    chatUpload.single("audio"),
    messageController.sendAudioMessage
);

/* =========================================================
   MARK MESSAGES DELIVERED
========================================================= */

router.put(
    "/:conversationId/delivered",
    auth,
    messageController.markDelivered
);

/* =========================================================
   MARK MESSAGES READ
========================================================= */

router.put(
    "/:conversationId/read",
    auth,
    messageController.markRead
);

module.exports = router;
const express = require("express");

const router = express.Router();

const contactController = require("../controllers/contactController");

const auth = require("../middleware/auth");

const admin = require("../middleware/admin");





/* ==========================================
   PUBLIC
========================================== */

// Send Contact Message

router.post(

    "/",

    contactController.sendMessage

);

/* ==========================================
   ADMIN
========================================== */

// Get All Messages

router.get(

    "/",

    auth,

    admin,

    contactController.getMessages

);

// Get Single Message

router.get(

    "/:id",

    auth,

    admin,

    contactController.getMessage

);

// Mark As Read

router.patch(

    "/:id/read",

    auth,

    admin,

    contactController.markAsRead

);

// Delete Message

router.delete(

    "/:id",

    auth,

    admin,

    contactController.deleteMessage

);

module.exports = router;
const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const controller = require("../controllers/adminSupportController");


/* ==========================================
   GET ALL SUPPORT TICKETS
========================================== */

router.get(

    "/",

    auth,

    admin,

    controller.getTickets

);


/* ==========================================
   REPLY TO SUPPORT TICKET
========================================== */

router.put(

    "/:id/reply",

    auth,

    admin,

    controller.replyTicket

);


/* ==========================================
   UPDATE TICKET STATUS
========================================== */

router.put(

    "/:id/status",

    auth,

    admin,

    controller.updateStatus

);


/* ==========================================
   GET SINGLE SUPPORT TICKET
========================================== */

router.get(

    "/:id",

    auth,

    admin,

    controller.getTicket

);


/* ==========================================
   DELETE SUPPORT TICKET
========================================== */

router.delete(

    "/:id",

    auth,

    admin,

    controller.deleteTicket

);


module.exports = router;
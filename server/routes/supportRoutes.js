const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const controller = require("../controllers/supportController");

/* ==========================================
   CREATE SUPPORT TICKET
========================================== */

router.post(
    "/",
    auth,
    controller.createTicket
);


/* ==========================================
   GET CURRENT USER'S SUPPORT TICKETS
========================================== */

router.get(
    "/my-tickets",
    auth,
    controller.getMyTickets
);


/* ==========================================
   GET ALL CURRENT USER TICKETS
   Alternative endpoint: /api/support
========================================== */

router.get(
    "/",
    auth,
    controller.getMyTickets
);


/* ==========================================
   GET SINGLE SUPPORT TICKET

   IMPORTANT:
   This route must always be LAST because
   "/:id" can match other route names.
========================================== */

router.get(
    "/:id",
    auth,
    controller.getTicket
);


module.exports = router;
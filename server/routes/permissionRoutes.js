const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const permission = require("../middleware/permission");

const permissionController = require("../controllers/permissionController");

/* ==========================================
   GET ALL PERMISSIONS
========================================== */

router.get(

    "/",

    auth,

    permission("manage_permissions"),

    permissionController.getPermissions

);

/* ==========================================
   CREATE PERMISSION
========================================== */

router.post(

    "/",

    auth,

    permission("manage_permissions"),

    permissionController.createPermission

);

/* ==========================================
   UPDATE PERMISSION
========================================== */

router.put(

    "/:id",

    auth,

    permission("manage_permissions"),

    permissionController.updatePermission

);

/* ==========================================
   DELETE PERMISSION
========================================== */

router.delete(

    "/:id",

    auth,

    permission("manage_permissions"),

    permissionController.deletePermission

);

module.exports = router;
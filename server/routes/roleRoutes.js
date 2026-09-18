const express = require("express");

const router = express.Router();


const auth =
    require("../middleware/auth");

const admin =
    require("../middleware/admin");

const checkPermission =
    require("../middleware/checkPermission");


const roleController =
    require("../controllers/roleController");


/* ==========================================
   GET ALL ROLES
========================================== */

router.get(

    "/",

    auth,

    admin,

    checkPermission("view_roles"),

    roleController.getRoles

);


/* ==========================================
   GET ALL PERMISSIONS

   IMPORTANT:
   Must come before "/:id"
========================================== */

router.get(

    "/permissions/all",

    auth,

    admin,

    roleController.getAllPermissions

);


/* ==========================================
   GET SINGLE ROLE
========================================== */

router.get(

    "/:id",

    auth,

    admin,

    checkPermission("view_roles"),

    roleController.getRole

);


/* ==========================================
   CREATE ROLE
========================================== */

router.post(

    "/",

    auth,

    admin,

    checkPermission("manage_roles"),

    roleController.createRole

);


/* ==========================================
   UPDATE ROLE
========================================== */

router.put(

    "/:id",

    auth,

    admin,

    checkPermission("manage_roles"),

    roleController.updateRole

);


/* ==========================================
   ASSIGN PERMISSIONS
========================================== */

router.put(

    "/:id/permissions",

    auth,

    admin,

    checkPermission("assign_roles"),

    roleController.assignPermissions

);


/* ==========================================
   DELETE ROLE
========================================== */

router.delete(

    "/:id",

    auth,

    admin,

    checkPermission("manage_roles"),

    roleController.deleteRole

);


module.exports = router;
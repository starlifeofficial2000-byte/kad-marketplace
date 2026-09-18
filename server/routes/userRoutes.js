const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const permission = require("../middleware/permission");
const upload = require("../middleware/uploadProfile");

const {

    getProfile,

    updateProfile,

    getSellerProfile,

    getAllUsers,

    changeUserRole,

    blockUser,

    unblockUser,

    deleteUser,

    getUserDetails

} = require("../controllers/userController");

/* ==========================================
   USER PROFILE
========================================== */

router.get(

    "/profile",

    auth,

    getProfile

);

router.put(

    "/profile",

    auth,

    upload.single("profileImage"),

    updateProfile

);

/* ==========================================
   ADMIN - USER MANAGEMENT
========================================== */

// View all users

router.get(

    "/admin/all",

    auth,

    permission("manage_users"),

    getAllUsers

);

// View user details

router.get(

    "/admin/details/:id",

    auth,

    permission("manage_users"),

    getUserDetails

);

// Change user's role

router.put(

    "/admin/:id/role",

    auth,

    permission("manage_users"),

    changeUserRole

);

// Block user

router.put(

    "/admin/:id/block",

    auth,

    permission("block_users"),

    blockUser

);

// Unblock user

router.put(

    "/admin/:id/unblock",

    auth,

    permission("block_users"),

    unblockUser

);

// Delete user

router.delete(

    "/admin/:id",

    auth,

    permission("delete_users"),

    deleteUser

);

/* ==========================================
   PUBLIC SELLER PROFILE
========================================== */

router.get(

    "/:id",

    getSellerProfile

);

module.exports = router;
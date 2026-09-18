const express = require("express");

const router = express.Router();


/* =====================================
   MIDDLEWARE
===================================== */

const auth = require(

    "../middleware/auth"

);

const admin = require(

    "../middleware/admin"

);

const checkPermission = require(

    "../middleware/checkPermission"

);

const {

    adminLimiter

} = require(

    "../middleware/rateLimiter"

);


/* =====================================
   CONTROLLERS
===================================== */

const adminController = require(

    "../controllers/adminController"

);

const adminUserController = require(

    "../controllers/adminUserController"

);

const adminStoreController = require(

    "../controllers/adminStoreController"

);


/* =====================================
   APPLY RATE LIMITER
===================================== */

router.use(

    adminLimiter

);


/* =====================================
   ADMIN DASHBOARD
===================================== */


/*
    MAIN DASHBOARD
*/

router.get(

    "/dashboard",

    auth,

    admin,

    adminController.dashboard

);


/*
    DASHBOARD STATISTICS

    GET /api/admin/stats
*/

router.get(

    "/stats",

    auth,

    admin,

    adminController.getStats

);


/*
    REVENUE CHART

    GET /api/admin/revenue/chart
*/

router.get(

    "/revenue/chart",

    auth,

    admin,

    adminController.getRevenueChart

);


/*
    SECURITY SUMMARY
*/

router.get(

    "/activity-summary",

    auth,

    admin,

    checkPermission(

        "view_audit_logs"

    ),

    adminController.getAdminActivitySummary

);


/* =====================================
   TEST AUDIT LOG
===================================== */

router.post(

    "/test-audit",

    auth,

    admin,

    adminController.testAuditLog

);


/* =====================================
   USER MANAGEMENT
===================================== */


router.get(

    "/users",

    auth,

    admin,

    checkPermission(

        "manage_users"

    ),

    adminUserController.getUsers

);


router.get(

    "/users/:id",

    auth,

    admin,

    checkPermission(

        "manage_users"

    ),

    adminUserController.getUser

);


router.put(

    "/users/:id/block",

    auth,

    admin,

    checkPermission(

        "manage_users"

    ),

    adminUserController.blockUser

);


router.put(

    "/users/:id/unblock",

    auth,

    admin,

    checkPermission(

        "manage_users"

    ),

    adminUserController.unblockUser

);


router.put(

    "/users/:id/admin",

    auth,

    admin,

    checkPermission(

        "manage_roles"

    ),

    adminUserController.makeAdmin

);


router.put(

    "/users/:id/remove-admin",

    auth,

    admin,

    checkPermission(

        "manage_roles"

    ),

    adminUserController.removeAdmin

);


router.delete(

    "/users/:id",

    auth,

    admin,

    checkPermission(

        "manage_users"

    ),

    adminUserController.deleteUser

);


/* =====================================
   STORE MANAGEMENT
===================================== */


router.get(

    "/stores",

    auth,

    admin,

    checkPermission(

        "manage_stores"

    ),

    adminStoreController.getStores

);


router.put(

    "/stores/:id/verify",

    auth,

    admin,

    checkPermission(

        "manage_stores"

    ),

    adminStoreController.verifyStore

);


router.put(

    "/stores/:id/suspend",

    auth,

    admin,

    checkPermission(

        "manage_stores"

    ),

    adminStoreController.suspendStore

);


router.put(

    "/stores/:id/activate",

    auth,

    admin,

    checkPermission(

        "manage_stores"

    ),

    adminStoreController.activateStore

);


router.delete(

    "/stores/:id",

    auth,

    admin,

    checkPermission(

        "manage_stores"

    ),

    adminStoreController.deleteStore

);


/* =====================================
   AUDIT LOGS
===================================== */

router.get(

    "/audit-logs",

    auth,

    admin,

    checkPermission(

        "view_audit_logs"

    ),

    adminController.getAuditLogs

);


/* =====================================
   LOGIN HISTORY
===================================== */

router.get(

    "/login-history",

    auth,

    admin,

    checkPermission(

        "view_login_history"

    ),

    adminController.getLoginHistory

);


module.exports = router;
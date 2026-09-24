const express = require("express");

const router = express.Router();


/* =====================================
   MIDDLEWARE
===================================== */

const auth = require("../middleware/auth");

const admin = require("../middleware/admin");

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

/*
    USER CONTROLLER

    Used for:
    - Changing user roles
*/
const userController = require(
    "../controllers/userController"
);


/* =====================================
   APPLY ADMIN RATE LIMITER
===================================== */

router.use(
    adminLimiter
);


/* =====================================
   ADMIN DASHBOARD
===================================== */


/*
    MAIN DASHBOARD

    GET /api/admin/dashboard
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
    SECURITY / ACTIVITY SUMMARY

    GET /api/admin/activity-summary
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


/*
    POST /api/admin/test-audit
*/

router.post(
    "/test-audit",
    auth,
    admin,
    adminController.testAuditLog
);


/* =====================================
   USER MANAGEMENT
===================================== */


/*
    GET ALL USERS

    GET /api/admin/users
*/

router.get(
    "/users",
    auth,
    admin,
    checkPermission(
        "manage_users"
    ),
    adminUserController.getUsers
);


/*
    GET SINGLE USER

    GET /api/admin/users/:id
*/

router.get(
    "/users/:id",
    auth,
    admin,
    checkPermission(
        "manage_users"
    ),
    adminUserController.getUser
);


/* =====================================
   CHANGE USER ROLE
===================================== */


/*
    CHANGE USER ROLE

    PUT /api/admin/users/:id/role

    Request body:

    {
        "roleId": 2
    }

    Controller:

    userController.changeUserRole
*/

router.put(
    "/users/:id/role",
    auth,
    admin,
    checkPermission(
        "manage_roles"
    ),
    userController.changeUserRole
);


/* =====================================
   BLOCK USER
===================================== */


/*
    PUT /api/admin/users/:id/block
*/

router.put(
    "/users/:id/block",
    auth,
    admin,
    checkPermission(
        "manage_users"
    ),
    adminUserController.blockUser
);


/* =====================================
   UNBLOCK USER
===================================== */


/*
    PUT /api/admin/users/:id/unblock
*/

router.put(
    "/users/:id/unblock",
    auth,
    admin,
    checkPermission(
        "manage_users"
    ),
    adminUserController.unblockUser
);


/* =====================================
   MAKE USER ADMIN
===================================== */


/*
    PUT /api/admin/users/:id/admin
*/

router.put(
    "/users/:id/admin",
    auth,
    admin,
    checkPermission(
        "manage_roles"
    ),
    adminUserController.makeAdmin
);


/* =====================================
   REMOVE ADMIN PRIVILEGES
===================================== */


/*
    PUT /api/admin/users/:id/remove-admin
*/

router.put(
    "/users/:id/remove-admin",
    auth,
    admin,
    checkPermission(
        "manage_roles"
    ),
    adminUserController.removeAdmin
);


/* =====================================
   DELETE USER
===================================== */


/*
    DELETE /api/admin/users/:id
*/

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


/*
    GET ALL STORES

    GET /api/admin/stores
*/

router.get(
    "/stores",
    auth,
    admin,
    checkPermission(
        "manage_stores"
    ),
    adminStoreController.getStores
);


/*
    VERIFY STORE

    PUT /api/admin/stores/:id/verify
*/

router.put(
    "/stores/:id/verify",
    auth,
    admin,
    checkPermission(
        "manage_stores"
    ),
    adminStoreController.verifyStore
);


/*
    SUSPEND STORE

    PUT /api/admin/stores/:id/suspend
*/

router.put(
    "/stores/:id/suspend",
    auth,
    admin,
    checkPermission(
        "manage_stores"
    ),
    adminStoreController.suspendStore
);


/*
    ACTIVATE STORE

    PUT /api/admin/stores/:id/activate
*/

router.put(
    "/stores/:id/activate",
    auth,
    admin,
    checkPermission(
        "manage_stores"
    ),
    adminStoreController.activateStore
);


/*
    DELETE STORE

    DELETE /api/admin/stores/:id
*/

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


/*
    GET /api/admin/audit-logs
*/

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


/*
    GET /api/admin/login-history
*/

router.get(
    "/login-history",
    auth,
    admin,
    checkPermission(
        "view_login_history"
    ),
    adminController.getLoginHistory
);


/* =====================================
   EXPORT ROUTER
===================================== */

module.exports = router;
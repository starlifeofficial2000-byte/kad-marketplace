const express = require("express");

const router = express.Router();

/* =========================================================
   MIDDLEWARE
========================================================= */

const auth = require("../middleware/auth");

const admin = require("../middleware/admin");

const checkPermission = require(
    "../middleware/checkPermission"
);

const {
    adminLimiter
} = require("../middleware/rateLimiter");


/* =========================================================
   CONTROLLERS
========================================================= */

const adminController = require(
    "../controllers/adminController"
);

const adminUserController = require(
    "../controllers/adminUserController"
);

const adminStoreController = require(
    "../controllers/adminStoreController"
);

const userController = require(
    "../controllers/userController"
);


/* =========================================================
   CONTROLLER SAFETY CHECK
========================================================= */

const controllerHandler = (controller, name) => {

    if (typeof controller !== "function") {

        console.error(
            `ADMIN ROUTE ERROR: ${name} is not a function`
        );

        return (req, res) => {

            return res.status(501).json({

                success: false,

                message:
                    `${name} controller is not implemented.`

            });

        };

    }

    return controller;

};


/* =========================================================
   CONTROLLER HANDLERS
========================================================= */

const dashboard =
    controllerHandler(
        adminController.dashboard,
        "adminController.dashboard"
    );

const getStats =
    controllerHandler(
        adminController.getStats,
        "adminController.getStats"
    );

const getRevenue =
    controllerHandler(
        adminController.getRevenue,
        "adminController.getRevenue"
    );

const getRevenueChart =
    controllerHandler(
        adminController.getRevenueChart,
        "adminController.getRevenueChart"
    );

const getAdminActivitySummary =
    controllerHandler(
        adminController.getAdminActivitySummary,
        "adminController.getAdminActivitySummary"
    );

const testAuditLog =
    controllerHandler(
        adminController.testAuditLog,
        "adminController.testAuditLog"
    );

const getAuditLogs =
    controllerHandler(
        adminController.getAuditLogs,
        "adminController.getAuditLogs"
    );

const getLoginHistory =
    controllerHandler(
        adminController.getLoginHistory,
        "adminController.getLoginHistory"
    );


/* =========================================================
   USER CONTROLLER HANDLERS
========================================================= */

const getUsers =
    controllerHandler(
        adminUserController.getUsers,
        "adminUserController.getUsers"
    );

const getUser =
    controllerHandler(
        adminUserController.getUser,
        "adminUserController.getUser"
    );

const blockUser =
    controllerHandler(
        adminUserController.blockUser,
        "adminUserController.blockUser"
    );

const unblockUser =
    controllerHandler(
        adminUserController.unblockUser,
        "adminUserController.unblockUser"
    );

const makeAdmin =
    controllerHandler(
        adminUserController.makeAdmin,
        "adminUserController.makeAdmin"
    );

const removeAdmin =
    controllerHandler(
        adminUserController.removeAdmin,
        "adminUserController.removeAdmin"
    );

const deleteUser =
    controllerHandler(
        adminUserController.deleteUser,
        "adminUserController.deleteUser"
    );


/* =========================================================
   STORE CONTROLLER HANDLERS
========================================================= */

const getStores =
    controllerHandler(
        adminStoreController.getStores,
        "adminStoreController.getStores"
    );

const verifyStore =
    controllerHandler(
        adminStoreController.verifyStore,
        "adminStoreController.verifyStore"
    );

const suspendStore =
    controllerHandler(
        adminStoreController.suspendStore,
        "adminStoreController.suspendStore"
    );

const activateStore =
    controllerHandler(
        adminStoreController.activateStore,
        "adminStoreController.activateStore"
    );

const deleteStore =
    controllerHandler(
        adminStoreController.deleteStore,
        "adminStoreController.deleteStore"
    );


/* =========================================================
   USER ROLE CONTROLLER
========================================================= */

const changeUserRole =
    controllerHandler(
        userController.changeUserRole,
        "userController.changeUserRole"
    );


/* =========================================================
   RATE LIMITER
========================================================= */

if (typeof adminLimiter === "function") {

    router.use(adminLimiter);

} else {

    console.warn(
        "ADMIN ROUTES WARNING: adminLimiter is not available."
    );

}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

/*
    GET /api/admin/dashboard
*/

router.get(
    "/dashboard",
    auth,
    admin,
    dashboard
);


/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

/*
    GET /api/admin/stats

    Requires:
    view_analytics

    IMPORTANT:
    Do NOT use admin middleware here.

    Permission middleware handles access.
*/

router.get(
    "/stats",
    auth,
    checkPermission("view_analytics"),
    getStats
);


/* =========================================================
   REVENUE
========================================================= */

/*
    GET /api/admin/revenue

    Requires:
    view_analytics
*/

router.get(
    "/revenue",
    auth,
    checkPermission("view_analytics"),
    getRevenue
);


/* =========================================================
   REVENUE CHART
========================================================= */

/*
    GET /api/admin/revenue/chart

    Requires:
    view_analytics
*/

router.get(
    "/revenue/chart",
    auth,
    checkPermission("view_analytics"),
    getRevenueChart
);


/* =========================================================
   SECURITY / ACTIVITY SUMMARY
========================================================= */

/*
    GET /api/admin/activity-summary

    Requires:
    view_audit_logs
*/

router.get(
    "/activity-summary",
    auth,
    checkPermission("view_audit_logs"),
    getAdminActivitySummary
);


/* =========================================================
   TEST AUDIT
========================================================= */

/*
    POST /api/admin/test-audit

    Administrator only
*/

router.post(
    "/test-audit",
    auth,
    admin,
    testAuditLog
);


/* =========================================================
   USER MANAGEMENT
========================================================= */

/*
    GET /api/admin/users

    Requires:
    manage_users
*/

router.get(
    "/users",
    auth,
    checkPermission("manage_users"),
    getUsers
);


/*
    GET /api/admin/users/:id

    Requires:
    manage_users
*/

router.get(
    "/users/:id",
    auth,
    checkPermission("manage_users"),
    getUser
);


/* =========================================================
   CHANGE USER ROLE
========================================================= */

/*
    PUT /api/admin/users/:id/role

    Requires:
    manage_roles
*/

router.put(
    "/users/:id/role",
    auth,
    checkPermission("manage_roles"),
    changeUserRole
);


/* =========================================================
   BLOCK USER
========================================================= */

router.put(
    "/users/:id/block",
    auth,
    checkPermission("manage_users"),
    blockUser
);


/* =========================================================
   UNBLOCK USER
========================================================= */

router.put(
    "/users/:id/unblock",
    auth,
    checkPermission("manage_users"),
    unblockUser
);


/* =========================================================
   MAKE USER ADMIN
========================================================= */

router.put(
    "/users/:id/admin",
    auth,
    checkPermission("manage_roles"),
    makeAdmin
);


/* =========================================================
   REMOVE ADMIN
========================================================= */

router.put(
    "/users/:id/remove-admin",
    auth,
    checkPermission("manage_roles"),
    removeAdmin
);


/* =========================================================
   DELETE USER
========================================================= */

router.delete(
    "/users/:id",
    auth,
    checkPermission("manage_users"),
    deleteUser
);


/* =========================================================
   STORE MANAGEMENT
========================================================= */

/*
    GET /api/admin/stores
*/

router.get(
    "/stores",
    auth,
    checkPermission("manage_stores"),
    getStores
);


/*
    PUT /api/admin/stores/:id/verify
*/

router.put(
    "/stores/:id/verify",
    auth,
    checkPermission("manage_stores"),
    verifyStore
);


/*
    PUT /api/admin/stores/:id/suspend
*/

router.put(
    "/stores/:id/suspend",
    auth,
    checkPermission("manage_stores"),
    suspendStore
);


/*
    PUT /api/admin/stores/:id/activate
*/

router.put(
    "/stores/:id/activate",
    auth,
    checkPermission("manage_stores"),
    activateStore
);


/*
    DELETE /api/admin/stores/:id
*/

router.delete(
    "/stores/:id",
    auth,
    checkPermission("manage_stores"),
    deleteStore
);


/* =========================================================
   AUDIT LOGS
========================================================= */

/*
    GET /api/admin/audit-logs

    Requires:
    view_audit_logs
*/

router.get(
    "/audit-logs",
    auth,
    checkPermission("view_audit_logs"),
    getAuditLogs
);


/* =========================================================
   LOGIN HISTORY
========================================================= */

/*
    GET /api/admin/login-history

    Requires:
    view_login_history
*/

router.get(
    "/login-history",
    auth,
    checkPermission("view_login_history"),
    getLoginHistory
);


/* =========================================================
   EXPORT
========================================================= */

module.exports = router;
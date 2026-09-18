const Role = require("../models/Role");
const Permission = require("../models/Permission");


async function seedRolesAndPermissions() {

    try {

        console.log("🌱 Starting Roles & Permissions Seeder...");


        /* =====================================
           CREATE ROLES
        ===================================== */

        const roles = [

            {
                name: "Super Admin",
                description: "Full system access and complete administrative control",
                isSystem: true
            },

            {
                name: "Admin",
                description: "Marketplace administrator with administrative access",
                isSystem: true
            },

            {
                name: "Moderator",
                description: "Responsible for moderating marketplace content",
                isSystem: true
            },

            {
                name: "Support",
                description: "Responsible for customer and seller support",
                isSystem: true
            },

            {
                name: "Finance",
                description: "Responsible for payments and financial records",
                isSystem: true
            },

            {
                name: "Advertisement Manager",
                description: "Responsible for advertisements and promotions",
                isSystem: true
            },

            {
                name: "Seller",
                description: "Marketplace seller account",
                isSystem: true
            },

            {
                name: "Buyer",
                description: "Marketplace buyer account",
                isSystem: true
            }

        ];


        for (const role of roles) {

            await Role.findOrCreate({

                where: {
                    name: role.name
                },

                defaults: role

            });

        }


        console.log("✅ Roles Created");


        /* =====================================
           PERMISSIONS
        ===================================== */

        const permissions = [

            /* USER MANAGEMENT */

            {
                name: "view_users",
                description: "View registered users"
            },

            {
                name: "manage_users",
                description: "Manage user accounts"
            },

            {
                name: "block_users",
                description: "Block user accounts"
            },

            {
                name: "unblock_users",
                description: "Unblock user accounts"
            },

            {
                name: "delete_users",
                description: "Delete user accounts"
            },


            /* PRODUCT MANAGEMENT */

            {
                name: "view_products",
                description: "View marketplace products"
            },

            {
                name: "manage_products",
                description: "Manage marketplace products"
            },

            {
                name: "approve_products",
                description: "Approve pending products"
            },

            {
                name: "reject_products",
                description: "Reject products"
            },

            {
                name: "delete_products",
                description: "Delete marketplace products"
            },

            {
                name: "feature_products",
                description: "Feature products on the marketplace"
            },


            /* STORE MANAGEMENT */

            {
                name: "view_stores",
                description: "View seller stores"
            },

            {
                name: "manage_stores",
                description: "Manage seller stores"
            },

            {
                name: "approve_stores",
                description: "Approve seller stores"
            },

            {
                name: "suspend_stores",
                description: "Suspend seller stores"
            },

            {
                name: "delete_stores",
                description: "Delete seller stores"
            },


            /* ROLE MANAGEMENT */

            {
                name: "view_roles",
                description: "View system roles"
            },

            {
                name: "manage_roles",
                description: "Create and manage roles"
            },

            {
                name: "assign_roles",
                description: "Assign roles to users"
            },


            /* PERMISSION MANAGEMENT */

            {
                name: "view_permissions",
                description: "View system permissions"
            },

            {
                name: "manage_permissions",
                description: "Create and manage permissions"
            },


            /* REVIEW MANAGEMENT */

            {
                name: "view_reviews",
                description: "View product and store reviews"
            },

            {
                name: "manage_reviews",
                description: "Manage product and store reviews"
            },

            {
                name: "delete_reviews",
                description: "Delete inappropriate reviews"
            },


            /* REPORT MANAGEMENT */

            {
                name: "view_reports",
                description: "View reported content"
            },

            {
                name: "manage_reports",
                description: "Manage marketplace reports"
            },

            {
                name: "resolve_reports",
                description: "Resolve user reports"
            },


            /* CUSTOMER SUPPORT */

            {
                name: "view_messages",
                description: "View support messages"
            },

            {
                name: "manage_messages",
                description: "Manage customer support messages"
            },


            /* SECURITY MANAGEMENT */

            {
                name: "manage_security",
                description: "Manage marketplace security"
            },

            {
                name: "view_audit_logs",
                description: "View administrator audit logs"
            },

            {
                name: "view_login_history",
                description: "View user login history"
            },

            {
                name: "manage_sessions",
                description: "Manage active user sessions"
            },

            {
                name: "block_suspicious_accounts",
                description: "Block suspicious accounts"
            },


            /* PAYMENT MANAGEMENT */

            {
                name: "view_payments",
                description: "View payment transactions"
            },

            {
                name: "manage_payments",
                description: "Manage marketplace payments"
            },

            {
                name: "manage_refunds",
                description: "Manage customer refunds"
            },


            /* SUBSCRIPTION MANAGEMENT */

            {
                name: "view_subscriptions",
                description: "View seller subscriptions"
            },

            {
                name: "manage_subscriptions",
                description: "Manage subscription plans"
            },


            /* ADVERTISEMENT MANAGEMENT */

            {
                name: "view_advertisements",
                description: "View marketplace advertisements"
            },

            {
                name: "manage_advertisements",
                description: "Manage marketplace advertisements"
            },

            {
                name: "approve_advertisements",
                description: "Approve advertisements"
            },

            {
                name: "reject_advertisements",
                description: "Reject advertisements"
            },


            /* PROMOTION MANAGEMENT */

            {
                name: "manage_promotions",
                description: "Manage promoted products"
            },


            /* WEBSITE MANAGEMENT */

            {
                name: "manage_homepage",
                description: "Manage homepage content"
            },

            {
                name: "manage_categories",
                description: "Manage marketplace categories"
            },

            {
                name: "manage_settings",
                description: "Manage system settings"
            },


            /* DATABASE MANAGEMENT */

            {
                name: "backup_database",
                description: "Create database backups"
            },

            {
                name: "restore_database",
                description: "Restore database backups"
            }

        ];


        /* =====================================
           CREATE PERMISSIONS
        ===================================== */

        for (const permission of permissions) {

            await Permission.findOrCreate({

                where: {
                    name: permission.name
                },

                defaults: permission

            });

        }


        console.log("✅ Permissions Created");


        /* =====================================
           LOAD ALL PERMISSIONS
        ===================================== */

        const allPermissions = await Permission.findAll();


        /* =====================================
           HELPER FUNCTION
        ===================================== */

        const getPermissions = (permissionNames) => {

            return allPermissions.filter((permission) => {

                return permissionNames.includes(

                    permission.name

                );

            });

        };


        /* =====================================
           SUPER ADMIN
           FULL ACCESS
        ===================================== */

        const superAdmin = await Role.findOne({

            where: {
                name: "Super Admin"
            }

        });


        if (superAdmin) {

            await superAdmin.setPermissions(

                allPermissions

            );

        }


        /* =====================================
           ADMIN
        ===================================== */

        const admin = await Role.findOne({

            where: {
                name: "Admin"
            }

        });


        if (admin) {

            await admin.setPermissions(

                getPermissions([

                    "view_users",
                    "manage_users",
                    "block_users",
                    "unblock_users",
                    "delete_users",

                    "view_products",
                    "manage_products",
                    "approve_products",
                    "reject_products",
                    "delete_products",
                    "feature_products",

                    "view_stores",
                    "manage_stores",
                    "approve_stores",
                    "suspend_stores",
                    "delete_stores",

                    "view_reviews",
                    "manage_reviews",
                    "delete_reviews",

                    "view_reports",
                    "manage_reports",
                    "resolve_reports",

                    "view_messages",
                    "manage_messages",

                    "manage_security",
                    "view_audit_logs",
                    "view_login_history",

                    "view_payments",
                    "manage_payments",

                    "view_subscriptions",
                    "manage_subscriptions",

                    "view_advertisements",
                    "manage_advertisements",
                    "approve_advertisements",
                    "reject_advertisements",

                    "manage_promotions",

                    "manage_homepage",
                    "manage_categories",
                    "manage_settings"

                ])

            );

        }


        /* =====================================
           MODERATOR
        ===================================== */

        const moderator = await Role.findOne({

            where: {
                name: "Moderator"
            }

        });


        if (moderator) {

            await moderator.setPermissions(

                getPermissions([

                    "view_products",
                    "approve_products",
                    "reject_products",

                    "view_stores",
                    "approve_stores",
                    "suspend_stores",

                    "view_reviews",
                    "manage_reviews",
                    "delete_reviews",

                    "view_reports",
                    "manage_reports",
                    "resolve_reports"

                ])

            );

        }


        /* =====================================
           SUPPORT
        ===================================== */

        const support = await Role.findOne({

            where: {
                name: "Support"
            }

        });


        if (support) {

            await support.setPermissions(

                getPermissions([

                    "view_users",

                    "view_messages",
                    "manage_messages",

                    "view_reports",
                    "resolve_reports"

                ])

            );

        }


        /* =====================================
           FINANCE
        ===================================== */

        const finance = await Role.findOne({

            where: {
                name: "Finance"
            }

        });


        if (finance) {

            await finance.setPermissions(

                getPermissions([

                    "view_payments",
                    "manage_payments",
                    "manage_refunds",

                    "view_subscriptions",
                    "manage_subscriptions",

                    "manage_promotions"

                ])

            );

        }


        /* =====================================
           ADVERTISEMENT MANAGER
        ===================================== */

        const advertisementManager = await Role.findOne({

            where: {
                name: "Advertisement Manager"
            }

        });


        if (advertisementManager) {

            await advertisementManager.setPermissions(

                getPermissions([

                    "view_advertisements",
                    "manage_advertisements",
                    "approve_advertisements",
                    "reject_advertisements",

                    "manage_promotions"

                ])

            );

        }


        console.log("====================================");

        console.log("✅ Roles & Permissions Assigned");

        console.log("🚀 Seeding Completed Successfully");

        console.log("====================================");


    }

    catch (error) {

        console.error(

            "❌ SEED ROLES & PERMISSIONS ERROR:",

            error

        );

        throw error;

    }

}


module.exports = seedRolesAndPermissions;
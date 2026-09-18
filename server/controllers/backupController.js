const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const unzipper = require("unzipper");

const {
    User,
    Product,
    Store,

    Subscription,
    SubscriptionPlan,

    Payment,
    PromotionPayment,

    Conversation,
    Message,

    Wishlist,
    ProductView,
    ProductStatistic,
    Review,
    Notification,

    Report,
    Advertisement,
    SearchHistory,

    Support,
    SupportTicket,

    Lead,
    StoreFollow,

    ProductPromotion,

    AuditLog,
    LoginHistory,

    Role,
    Permission,
    RolePermission,
    UserRole,

    SecurityAlert,

    Setting
} = require("../models");


/* =====================================================
   HELPER FUNCTIONS
===================================================== */


/* DELETE FILE */

const deleteFile = (filePath) => {

    try {

        if (
            filePath &&
            fs.existsSync(filePath)
        ) {

            fs.unlinkSync(filePath);

        }

    }

    catch (error) {

        console.error(
            "File cleanup error:",
            error.message
        );

    }

};


/* DELETE DIRECTORY */

const deleteDirectory = (directoryPath) => {

    try {

        if (
            directoryPath &&
            fs.existsSync(directoryPath)
        ) {

            fs.rmSync(
                directoryPath,
                {
                    recursive: true,
                    force: true
                }
            );

        }

    }

    catch (error) {

        console.error(
            "Directory cleanup error:",
            error.message
        );

    }

};


/* CONVERT SEQUELIZE DATA */

const cleanData = (records) => {

    if (!records) {

        return [];

    }

    return records.map((record) => {

        if (record.dataValues) {

            return record.dataValues;

        }

        return record;

    });

};


/* =====================================================
   GET COMPLETE DATABASE DATA
===================================================== */

const getDatabaseData = async () => {

    try {

        const database = {


            /* =========================================
               CORE
            ========================================= */

            users: cleanData(
                await User.findAll()
            ),

            products: cleanData(
                await Product.findAll()
            ),

            stores: cleanData(
                await Store.findAll()
            ),


            /* =========================================
               SUBSCRIPTIONS
            ========================================= */

            subscriptions: cleanData(
                await Subscription.findAll()
            ),

            subscriptionPlans: cleanData(
                await SubscriptionPlan.findAll()
            ),


            /* =========================================
               PAYMENTS
            ========================================= */

            payments: cleanData(
                await Payment.findAll()
            ),

            promotionPayments: cleanData(
                await PromotionPayment.findAll()
            ),


            /* =========================================
               MESSAGING
            ========================================= */

            conversations: cleanData(
                await Conversation.findAll()
            ),

            messages: cleanData(
                await Message.findAll()
            ),


            /* =========================================
               MARKETPLACE
            ========================================= */

            wishlists: cleanData(
                await Wishlist.findAll()
            ),

            productViews: cleanData(
                await ProductView.findAll()
            ),

            productStatistics: cleanData(
                await ProductStatistic.findAll()
            ),

            reviews: cleanData(
                await Review.findAll()
            ),

            notifications: cleanData(
                await Notification.findAll()
            ),

            reports: cleanData(
                await Report.findAll()
            ),

            advertisements: cleanData(
                await Advertisement.findAll()
            ),

            searchHistory: cleanData(
                await SearchHistory.findAll()
            ),

            supports: cleanData(
                await Support.findAll()
            ),

            supportTickets: cleanData(
                await SupportTicket.findAll()
            ),

            leads: cleanData(
                await Lead.findAll()
            ),

            storeFollows: cleanData(
                await StoreFollow.findAll()
            ),


            /* =========================================
               PROMOTIONS
            ========================================= */

            productPromotions: cleanData(
                await ProductPromotion.findAll()
            ),


            /* =========================================
               SECURITY
            ========================================= */

            roles: cleanData(
                await Role.findAll()
            ),

            permissions: cleanData(
                await Permission.findAll()
            ),

            rolePermissions: cleanData(
                await RolePermission.findAll()
            ),

            userRoles: cleanData(
                await UserRole.findAll()
            ),

            securityAlerts: cleanData(
                await SecurityAlert.findAll()
            ),

            auditLogs: cleanData(
                await AuditLog.findAll()
            ),

            loginHistory: cleanData(
                await LoginHistory.findAll()
            ),


            /* =========================================
               SETTINGS
            ========================================= */

            settings: cleanData(
                await Setting.findAll()
            )

        };


        return database;

    }

    catch (error) {

        console.error(
            "Database collection error:",
            error
        );

        throw error;

    }

};


/* =====================================================
   EXPORT SETTINGS ONLY
===================================================== */

exports.exportSettings = async (req, res) => {

    try {

        const settings = cleanData(
            await Setting.findAll()
        );


        const backup = {

            application: "KAD Marketplace",

            backupType: "settings",

            version: "2.0",

            createdAt: new Date().toISOString(),

            data: settings

        };


        const filename =
            `KAD-Settings-${Date.now()}.json`;


        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );


        res.setHeader(
            "Content-Type",
            "application/json"
        );


        return res.json(backup);

    }

    catch (error) {

        console.error(
            "Settings export error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to export settings."

        });

    }

};


/* =====================================================
   EXPORT DATABASE ONLY
===================================================== */

exports.exportDatabase = async (req, res) => {

    try {

        const database =
            await getDatabaseData();


        const backup = {

            application: "KAD Marketplace",

            backupType: "database",

            version: "2.0",

            createdAt:
                new Date().toISOString(),

            data: database

        };


        const filename =
            `KAD-Database-${Date.now()}.json`;


        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );


        res.setHeader(
            "Content-Type",
            "application/json"
        );


        return res.json(backup);

    }

    catch (error) {

        console.error(
            "Database export error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to export database."

        });

    }

};


/* =====================================================
   CREATE COMPLETE SYSTEM BACKUP
===================================================== */

exports.createFullBackup = async (req, res) => {

    let backupPath = null;

    try {

        const timestamp = Date.now();


        const backupDirectory = path.join(
            __dirname,
            "../backups"
        );


        if (!fs.existsSync(backupDirectory)) {

            fs.mkdirSync(
                backupDirectory,
                {
                    recursive: true
                }
            );

        }


        const filename =
            `KAD-Marketplace-Full-Backup-${timestamp}.zip`;


        backupPath = path.join(
            backupDirectory,
            filename
        );


        /* GET ALL DATABASE DATA */

        const database =
            await getDatabaseData();


        /* BACKUP INFORMATION */

        const backupInfo = {

            application:
                "KAD Marketplace",

            version:
                "2.0",

            backupType:
                "full",

            createdAt:
                new Date().toISOString(),

            includes: {

                database: true,

                uploads: true,

                users: true,

                products: true,

                stores: true,

                payments: true,

                messages: true,

                subscriptions: true,

                promotions: true,

                security: true,

                settings: true

            }

        };


        /* CREATE ZIP */

        const output =
            fs.createWriteStream(
                backupPath
            );


        const archive =
            archiver(
                "zip",
                {

                    zlib: {

                        level: 9

                    }

                }
            );


        output.on(
            "close",
            () => {

                console.log(
                    `Backup created successfully: ${archive.pointer()} bytes`
                );


                res.download(

                    backupPath,

                    filename,

                    (error) => {

                        if (error) {

                            console.error(
                                "Download error:",
                                error
                            );

                        }


                        /* DELETE TEMP BACKUP */

                        setTimeout(() => {

                            deleteFile(
                                backupPath
                            );

                        }, 10000);

                    }

                );

            }
        );


        archive.on(
            "warning",
            (warning) => {

                console.warn(
                    "Backup warning:",
                    warning
                );

            }
        );


        archive.on(
            "error",
            (error) => {

                throw error;

            }
        );


        archive.pipe(output);


        /* DATABASE FILE */

        archive.append(

            JSON.stringify(
                database,
                null,
                2
            ),

            {

                name:
                    "database.json"

            }

        );


        /* BACKUP INFORMATION */

        archive.append(

            JSON.stringify(
                backupInfo,
                null,
                2
            ),

            {

                name:
                    "backup-info.json"

            }

        );


        /* =============================================
           ADD UPLOADS
        ============================================= */

        const uploadsDirectory =
            path.join(
                __dirname,
                "../uploads"
            );


        if (
            fs.existsSync(
                uploadsDirectory
            )
        ) {

            archive.directory(

                uploadsDirectory,

                "uploads"

            );

        }


        /* FINALIZE */

        await archive.finalize();

    }

    catch (error) {

        console.error(
            "Full backup error:",
            error
        );


        if (backupPath) {

            deleteFile(
                backupPath
            );

        }


        if (!res.headersSent) {

            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Unable to create full backup."

            });

        }

    }

};


/* =====================================================
   RESTORE HELPER
===================================================== */

const restoreDatabaseData = async (data) => {


    /* =========================================
       FOUNDATIONAL DATA FIRST
    ========================================= */


    /* ROLES */

    if (Array.isArray(data.roles)) {

        for (const item of data.roles) {

            await Role.upsert(item);

        }

    }


    /* PERMISSIONS */

    if (Array.isArray(data.permissions)) {

        for (const item of data.permissions) {

            await Permission.upsert(item);

        }

    }


    /* SUBSCRIPTION PLANS */

    if (
        Array.isArray(
            data.subscriptionPlans
        )
    ) {

        for (
            const item of data.subscriptionPlans
        ) {

            await SubscriptionPlan.upsert(
                item
            );

        }

    }


    /* USERS */

    if (Array.isArray(data.users)) {

        for (const item of data.users) {

            await User.upsert(item);

        }

    }


    /* =========================================
       MARKETPLACE DATA
    ========================================= */


    /* PRODUCTS */

    if (Array.isArray(data.products)) {

        for (const item of data.products) {

            await Product.upsert(item);

        }

    }


    /* STORES */

    if (Array.isArray(data.stores)) {

        for (const item of data.stores) {

            await Store.upsert(item);

        }

    }


    /* =========================================
       PAYMENTS
    ========================================= */

    if (Array.isArray(data.payments)) {

        for (const item of data.payments) {

            await Payment.upsert(item);

        }

    }


    if (
        Array.isArray(
            data.promotionPayments
        )
    ) {

        for (
            const item of data.promotionPayments
        ) {

            await PromotionPayment.upsert(
                item
            );

        }

    }


    /* =========================================
       SUBSCRIPTIONS
    ========================================= */

    if (
        Array.isArray(
            data.subscriptions
        )
    ) {

        for (
            const item of data.subscriptions
        ) {

            await Subscription.upsert(
                item
            );

        }

    }


    /* =========================================
       PROMOTIONS
    ========================================= */

    if (
        Array.isArray(
            data.productPromotions
        )
    ) {

        for (
            const item of data.productPromotions
        ) {

            await ProductPromotion.upsert(
                item
            );

        }

    }


    /* =========================================
       MESSAGING
    ========================================= */

    if (
        Array.isArray(
            data.conversations
        )
    ) {

        for (
            const item of data.conversations
        ) {

            await Conversation.upsert(
                item
            );

        }

    }


    if (Array.isArray(data.messages)) {

        for (const item of data.messages) {

            await Message.upsert(item);

        }

    }


    /* =========================================
       USER FEATURES
    ========================================= */

    if (Array.isArray(data.wishlists)) {

        for (const item of data.wishlists) {

            await Wishlist.upsert(item);

        }

    }


    if (
        Array.isArray(
            data.productViews
        )
    ) {

        for (
            const item of data.productViews
        ) {

            await ProductView.upsert(
                item
            );

        }

    }


    if (
        Array.isArray(
            data.productStatistics
        )
    ) {

        for (
            const item of data.productStatistics
        ) {

            await ProductStatistic.upsert(
                item
            );

        }

    }


    if (Array.isArray(data.reviews)) {

        for (const item of data.reviews) {

            await Review.upsert(item);

        }

    }


    if (
        Array.isArray(
            data.notifications
        )
    ) {

        for (
            const item of data.notifications
        ) {

            await Notification.upsert(
                item
            );

        }

    }


    /* =========================================
       REPORTS & ADMINISTRATION
    ========================================= */

    if (Array.isArray(data.reports)) {

        for (const item of data.reports) {

            await Report.upsert(item);

        }

    }


    if (
        Array.isArray(
            data.advertisements
        )
    ) {

        for (
            const item of data.advertisements
        ) {

            await Advertisement.upsert(
                item
            );

        }

    }


    if (
        Array.isArray(
            data.searchHistory
        )
    ) {

        for (
            const item of data.searchHistory
        ) {

            await SearchHistory.upsert(
                item
            );

        }

    }


    /* =========================================
       SUPPORT
    ========================================= */

    if (Array.isArray(data.supports)) {

        for (const item of data.supports) {

            await Support.upsert(item);

        }

    }


    if (
        Array.isArray(
            data.supportTickets
        )
    ) {

        for (
            const item of data.supportTickets
        ) {

            await SupportTicket.upsert(
                item
            );

        }

    }


    /* =========================================
       LEADS
    ========================================= */

    if (Array.isArray(data.leads)) {

        for (const item of data.leads) {

            await Lead.upsert(item);

        }

    }


    /* =========================================
       STORE FOLLOWS
    ========================================= */

    if (
        Array.isArray(
            data.storeFollows
        )
    ) {

        for (
            const item of data.storeFollows
        ) {

            await StoreFollow.upsert(
                item
            );

        }

    }


    /* =========================================
       USER ROLES
    ========================================= */

    if (
        Array.isArray(
            data.userRoles
        )
    ) {

        for (
            const item of data.userRoles
        ) {

            await UserRole.upsert(item);

        }

    }


    /* =========================================
       ROLE PERMISSIONS
    ========================================= */

    if (
        Array.isArray(
            data.rolePermissions
        )
    ) {

        for (
            const item of data.rolePermissions
        ) {

            await RolePermission.upsert(
                item
            );

        }

    }


    /* =========================================
       SECURITY ALERTS
    ========================================= */

    if (
        Array.isArray(
            data.securityAlerts
        )
    ) {

        for (
            const item of data.securityAlerts
        ) {

            await SecurityAlert.upsert(
                item
            );

        }

    }


    /* =========================================
       LOGIN HISTORY
    ========================================= */

    if (
        Array.isArray(
            data.loginHistory
        )
    ) {

        for (
            const item of data.loginHistory
        ) {

            await LoginHistory.upsert(
                item
            );

        }

    }


    /* =========================================
       AUDIT LOGS
    ========================================= */

    if (
        Array.isArray(
            data.auditLogs
        )
    ) {

        for (
            const item of data.auditLogs
        ) {

            await AuditLog.upsert(
                item
            );

        }

    }


    /* =========================================
       SETTINGS
    ========================================= */

    if (
        Array.isArray(
            data.settings
        )
    ) {

        for (
            const item of data.settings
        ) {

            await Setting.upsert(
                item
            );

        }

    }

};


/* =====================================================
   RESTORE DATABASE BACKUP
===================================================== */

exports.restoreDatabase = async (req, res) => {

    let uploadedFilePath = null;

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "Please upload a database backup file."

            });

        }


        uploadedFilePath =
            req.file.path;


        const backup =
            JSON.parse(

                fs.readFileSync(
                    uploadedFilePath,
                    "utf8"
                )

            );


        if (
            backup.application !==
            "KAD Marketplace"
        ) {

            throw new Error(
                "Invalid KAD Marketplace backup."
            );

        }


        if (
            backup.backupType !==
            "database"
        ) {

            throw new Error(
                "Invalid database backup."
            );

        }


        await restoreDatabaseData(
            backup.data
        );


        deleteFile(
            uploadedFilePath
        );


        return res.json({

            success: true,

            message:
                "Database restored successfully."

        });

    }

    catch (error) {

        console.error(
            "Database restore error:",
            error
        );


        if (uploadedFilePath) {

            deleteFile(
                uploadedFilePath
            );

        }


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to restore database."

        });

    }

};


/* =====================================================
   RESTORE FULL SYSTEM BACKUP
===================================================== */

exports.restoreFullBackup = async (req, res) => {

    let uploadedFilePath = null;

    let extractDirectory = null;

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "Please upload a backup ZIP file."

            });

        }


        uploadedFilePath =
            req.file.path;


        /* TEMP EXTRACTION DIRECTORY */

        extractDirectory = path.join(

            __dirname,

            "../temp/restores",

            `restore-${Date.now()}`

        );


        fs.mkdirSync(

            extractDirectory,

            {

                recursive: true

            }

        );


        /* EXTRACT ZIP */

        await fs

            .createReadStream(
                uploadedFilePath
            )

            .pipe(

                unzipper.Extract({

                    path:
                        extractDirectory

                })

            )

            .promise();


        const infoPath = path.join(
            extractDirectory,
            "backup-info.json"
        );


        const databasePath = path.join(
            extractDirectory,
            "database.json"
        );


        if (
            !fs.existsSync(infoPath) ||
            !fs.existsSync(databasePath)
        ) {

            throw new Error(
                "Invalid backup ZIP file."
            );

        }


        /* VALIDATE BACKUP */

        const backupInfo =
            JSON.parse(

                fs.readFileSync(
                    infoPath,
                    "utf8"
                )

            );


        if (
            backupInfo.application !==
            "KAD Marketplace"
        ) {

            throw new Error(
                "This backup does not belong to KAD Marketplace."
            );

        }


        /* RESTORE DATABASE */

        const database =
            JSON.parse(

                fs.readFileSync(
                    databasePath,
                    "utf8"
                )

            );


        await restoreDatabaseData(
            database
        );


        /* =============================================
           RESTORE UPLOADS
        ============================================= */

        const extractedUploads = path.join(
            extractDirectory,
            "uploads"
        );


        const liveUploads = path.join(
            __dirname,
            "../uploads"
        );


        if (
            fs.existsSync(
                extractedUploads
            )
        ) {

            fs.mkdirSync(
                liveUploads,
                {
                    recursive: true
                }
            );


            fs.cpSync(

                extractedUploads,

                liveUploads,

                {

                    recursive: true,

                    force: true

                }

            );

        }


        /* CLEANUP */

        deleteFile(
            uploadedFilePath
        );


        deleteDirectory(
            extractDirectory
        );


        return res.json({

            success: true,

            message:
                "Complete KAD Marketplace backup restored successfully."

        });

    }

    catch (error) {

        console.error(
            "Full restore error:",
            error
        );


        if (uploadedFilePath) {

            deleteFile(
                uploadedFilePath
            );

        }


        if (extractDirectory) {

            deleteDirectory(
                extractDirectory
            );

        }


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to restore full backup."

        });

    }

};
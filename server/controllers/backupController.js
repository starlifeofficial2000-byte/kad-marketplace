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


/* =========================================================
   CONFIGURATION
========================================================= */

const APPLICATION_NAME = "KAD Marketplace";
const BACKUP_VERSION = "3.0";

const MAX_BACKUP_JSON_SIZE = 1024 * 1024 * 1024; // 1 GB
const MAX_ZIP_ENTRIES = 10000;
const MAX_EXTRACTED_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

let restoreInProgress = false;


/* =========================================================
   DATABASE MODEL MAP
========================================================= */

const DATABASE_MODELS = {

    roles: Role,
    permissions: Permission,
    subscriptionPlans: SubscriptionPlan,

    users: User,

    products: Product,
    stores: Store,

    payments: Payment,
    promotionPayments: PromotionPayment,

    subscriptions: Subscription,

    productPromotions: ProductPromotion,

    conversations: Conversation,
    messages: Message,

    wishlists: Wishlist,
    productViews: ProductView,
    productStatistics: ProductStatistic,
    reviews: Review,
    notifications: Notification,

    reports: Report,
    advertisements: Advertisement,
    searchHistory: SearchHistory,

    supports: Support,
    supportTickets: SupportTicket,

    leads: Lead,
    storeFollows: StoreFollow,

    userRoles: UserRole,
    rolePermissions: RolePermission,

    securityAlerts: SecurityAlert,
    loginHistory: LoginHistory,
    auditLogs: AuditLog,

    settings: Setting
};


/*
 * Restore order.
 *
 * Parent tables are restored before child tables.
 */

const RESTORE_ORDER = [

    "roles",
    "permissions",
    "subscriptionPlans",

    "users",

    "products",
    "stores",

    "payments",
    "promotionPayments",

    "subscriptions",

    "productPromotions",

    "conversations",
    "messages",

    "wishlists",
    "productViews",
    "productStatistics",
    "reviews",
    "notifications",

    "reports",
    "advertisements",
    "searchHistory",

    "supports",
    "supportTickets",

    "leads",
    "storeFollows",

    "userRoles",
    "rolePermissions",

    "securityAlerts",
    "loginHistory",
    "auditLogs",

    "settings"
];


/* =========================================================
   FILE HELPERS
========================================================= */

const deleteFile = (filePath) => {

    try {

        if (
            filePath &&
            fs.existsSync(filePath)
        ) {

            fs.unlinkSync(filePath);

        }

    } catch (error) {

        console.error(
            "Backup file cleanup error:",
            error.message
        );

    }

};


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

    } catch (error) {

        console.error(
            "Backup directory cleanup error:",
            error.message
        );

    }

};


/* =========================================================
   SEQUELIZE DATA CLEANING
========================================================= */

const cleanData = (records) => {

    if (!Array.isArray(records)) {

        return [];

    }

    return records.map((record) => {

        if (
            record &&
            record.dataValues
        ) {

            return {
                ...record.dataValues
            };

        }

        return {
            ...record
        };

    });

};


/* =========================================================
   SAFE JSON STRINGIFY
========================================================= */

const stringifyBackup = (data) => {

    return JSON.stringify(
        data,
        null,
        2
    );

};


/* =========================================================
   VALIDATE BACKUP ENVELOPE
========================================================= */

const validateBackupEnvelope = (
    backup,
    expectedType
) => {

    if (
        !backup ||
        typeof backup !== "object"
    ) {

        throw new Error(
            "Backup file contains invalid data."
        );

    }


    if (
        backup.application !==
        APPLICATION_NAME
    ) {

        throw new Error(
            "This backup does not belong to KAD Marketplace."
        );

    }


    if (
        backup.backupType !==
        expectedType
    ) {

        throw new Error(
            `Invalid ${expectedType} backup file.`
        );

    }


    if (
        !backup.version
    ) {

        throw new Error(
            "Backup version is missing."
        );

    }


    if (
        !backup.createdAt
    ) {

        throw new Error(
            "Backup creation timestamp is missing."
        );

    }


    if (
        expectedType !== "settings" &&
        (
            !backup.data ||
            typeof backup.data !== "object"
        )
    ) {

        throw new Error(
            "Backup database data is missing."
        );

    }

};


/* =========================================================
   READ JSON FILE SAFELY
========================================================= */

const readJsonFile = (
    filePath
) => {

    if (
        !filePath ||
        !fs.existsSync(filePath)
    ) {

        throw new Error(
            "Backup file could not be found."
        );

    }


    const stats =
        fs.statSync(filePath);


    if (
        stats.size >
        MAX_BACKUP_JSON_SIZE
    ) {

        throw new Error(
            "Backup JSON file is too large."
        );

    }


    const raw =
        fs.readFileSync(
            filePath,
            "utf8"
        );


    if (!raw.trim()) {

        throw new Error(
            "Backup file is empty."
        );

    }


    try {

        return JSON.parse(raw);

    } catch (error) {

        throw new Error(
            "Backup file contains invalid JSON."
        );

    }

};


/* =========================================================
   AUDIT BACKUP OPERATION
========================================================= */

const createBackupAudit = async ({
    req,
    action,
    description
}) => {

    try {

        if (!AuditLog) {

            return;

        }


        await AuditLog.create({

            adminId:
                req?.user?.id || null,

            action,

            entity:
                "Backup",

            entityId:
                null,

            description,

            ipAddress:
                req?.ip ||
                req?.headers?.["x-forwarded-for"] ||
                "Unknown"

        });

    } catch (error) {

        /*
         * Backup must not fail simply because
         * audit logging failed.
         */

        console.error(
            "BACKUP AUDIT ERROR:",
            error.message
        );

    }

};


/* =========================================================
   GET COMPLETE DATABASE
========================================================= */

const getDatabaseData = async () => {

    const database = {};


    for (
        const key of Object.keys(
            DATABASE_MODELS
        )
    ) {

        const Model =
            DATABASE_MODELS[key];


        if (!Model) {

            database[key] = [];

            continue;

        }


        const records =
            await Model.findAll();


        database[key] =
            cleanData(records);

    }


    return database;

};


/* =========================================================
   VALIDATE DATABASE STRUCTURE
========================================================= */

const validateDatabaseStructure = (
    database
) => {

    if (
        !database ||
        typeof database !== "object"
    ) {

        throw new Error(
            "Database backup data is invalid."
        );

    }


    const suppliedKeys =
        Object.keys(database);


    if (
        suppliedKeys.length === 0
    ) {

        throw new Error(
            "Database backup contains no tables."
        );

    }


    for (
        const key of suppliedKeys
    ) {

        if (
            !Object.prototype.hasOwnProperty.call(
                DATABASE_MODELS,
                key
            )
        ) {

            /*
             * Unknown tables are ignored.
             *
             * This allows backups from newer
             * versions to be restored into an
             * older compatible version.
             */

            continue;

        }


        if (
            !Array.isArray(
                database[key]
            )
        ) {

            throw new Error(
                `Invalid database table: ${key}`
            );

        }

    }

};


/* =========================================================
   EXPORT SETTINGS
========================================================= */

exports.exportSettings = async (
    req,
    res
) => {

    try {

        const settings =
            cleanData(
                await Setting.findAll()
            );


        const backup = {

            application:
                APPLICATION_NAME,

            backupType:
                "settings",

            version:
                BACKUP_VERSION,

            createdAt:
                new Date().toISOString(),

            data:
                settings

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


        await createBackupAudit({

            req,

            action:
                "BACKUP_SETTINGS_EXPORTED",

            description:
                "Marketplace settings backup exported."

        });


        return res.send(
            stringifyBackup(
                backup
            )
        );

    } catch (error) {

        console.error(
            "SETTINGS EXPORT ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Unable to export settings."

        });

    }

};


/* =========================================================
   EXPORT DATABASE
========================================================= */

exports.exportDatabase = async (
    req,
    res
) => {

    try {

        const database =
            await getDatabaseData();


        const backup = {

            application:
                APPLICATION_NAME,

            backupType:
                "database",

            version:
                BACKUP_VERSION,

            createdAt:
                new Date().toISOString(),

            data:
                database

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


        await createBackupAudit({

            req,

            action:
                "BACKUP_DATABASE_EXPORTED",

            description:
                "Complete marketplace database backup exported."

        });


        return res.send(
            stringifyBackup(
                backup
            )
        );

    } catch (error) {

        console.error(
            "DATABASE EXPORT ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Unable to export database."

        });

    }

};


/* =========================================================
   ADD DIRECTORY TO ARCHIVE
========================================================= */

const addDirectoryToArchive = (
    archive,
    sourceDirectory,
    archiveDirectory
) => {

    if (
        !fs.existsSync(
            sourceDirectory
        )
    ) {

        return false;

    }


    const stats =
        fs.statSync(
            sourceDirectory
        );


    if (!stats.isDirectory()) {

        return false;

    }


    archive.directory(
        sourceDirectory,
        archiveDirectory
    );


    return true;

};


/* =========================================================
   CREATE FULL SYSTEM BACKUP
========================================================= */

exports.createFullBackup = async (
    req,
    res
) => {

    let backupPath = null;

    try {

        const timestamp =
            Date.now();


        const backupDirectory =
            path.join(
                __dirname,
                "../backups"
            );


        fs.mkdirSync(
            backupDirectory,
            {
                recursive: true
            }
        );


        const filename =
            `KAD-Marketplace-Full-Backup-${timestamp}.zip`;


        backupPath =
            path.join(
                backupDirectory,
                filename
            );


        /*
         * Collect database.
         */

        const database =
            await getDatabaseData();


        /*
         * Local upload directory.
         */

        const uploadsDirectory =
            path.join(
                __dirname,
                "../uploads"
            );


        const uploadsIncluded =
            fs.existsSync(
                uploadsDirectory
            );


        /*
         * Backup metadata.
         */

        const backupInfo = {

            application:
                APPLICATION_NAME,

            version:
                BACKUP_VERSION,

            backupType:
                "full",

            createdAt:
                new Date().toISOString(),

            createdBy:
                req?.user?.id || null,

            includes: {

                database:
                    true,

                uploads:
                    uploadsIncluded,

                users:
                    true,

                products:
                    true,

                stores:
                    true,

                payments:
                    true,

                messages:
                    true,

                subscriptions:
                    true,

                promotions:
                    true,

                security:
                    true,

                settings:
                    true

            },

            storage: {

                localUploads:
                    uploadsIncluded,

                cloudStorage:
                    false

            }

        };


        /*
         * Create ZIP.
         */

        const output =
            fs.createWriteStream(
                backupPath
            );


        const archive =
            archiver(
                "zip",
                {

                    zlib: {

                        level:
                            9

                    }

                }
            );


        const archiveFinished =
            new Promise(
                (
                    resolve,
                    reject
                ) => {

                    output.on(
                        "close",
                        resolve
                    );

                    output.on(
                        "error",
                        reject
                    );

                    archive.on(
                        "error",
                        reject
                    );

                }
            );


        archive.pipe(
            output
        );


        /*
         * Database.
         */

        archive.append(

            stringifyBackup(
                database
            ),

            {

                name:
                    "database.json"

            }

        );


        /*
         * Backup information.
         */

        archive.append(

            stringifyBackup(
                backupInfo
            ),

            {

                name:
                    "backup-info.json"

            }

        );


        /*
         * Uploaded files.
         */

        if (
            uploadsIncluded
        ) {

            addDirectoryToArchive(

                archive,

                uploadsDirectory,

                "uploads"

            );

        }


        /*
         * Finalize archive.
         */

        await archive.finalize();

        await archiveFinished;


        const backupStats =
            fs.statSync(
                backupPath
            );


        console.log(
            `KAD Marketplace backup created: ${backupStats.size} bytes`
        );


        await createBackupAudit({

            req,

            action:
                "BACKUP_FULL_CREATED",

            description:
                `Complete marketplace backup created successfully. Size: ${backupStats.size} bytes.`

        });


        return res.download(

            backupPath,

            filename,

            (error) => {

                if (error) {

                    console.error(
                        "FULL BACKUP DOWNLOAD ERROR:",
                        error
                    );

                }


                deleteFile(
                    backupPath
                );

            }

        );

    } catch (error) {

        console.error(
            "FULL BACKUP ERROR:",
            error
        );


        if (
            backupPath
        ) {

            deleteFile(
                backupPath
            );

        }


        if (
            !res.headersSent
        ) {

            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to create full backup."

            });

        }

    }

};


/* =========================================================
   RESTORE ONE TABLE
========================================================= */

const restoreTable = async (
    tableName,
    records
) => {

    const Model =
        DATABASE_MODELS[
            tableName
        ];


    if (!Model) {

        return {

            table:
                tableName,

            restored:
                0,

            skipped:
                true

        };

    }


    if (
        !Array.isArray(
            records
        )
    ) {

        throw new Error(
            `Invalid records for table: ${tableName}`
        );

    }


    let restored = 0;


    for (
        const item of records
    ) {

        if (
            !item ||
            typeof item !== "object"
        ) {

            continue;

        }


        await Model.upsert(
            item
        );


        restored++;

    }


    return {

        table:
            tableName,

        restored,

        skipped:
            false

    };

};


/* =========================================================
   RESTORE DATABASE DATA
========================================================= */

const restoreDatabaseData = async (
    data
) => {

    validateDatabaseStructure(
        data
    );


    const results = [];


    for (
        const tableName of
        RESTORE_ORDER
    ) {

        if (
            !Object.prototype.hasOwnProperty.call(
                data,
                tableName
            )
        ) {

            continue;

        }


        const result =
            await restoreTable(

                tableName,

                data[
                    tableName
                ]

            );


        results.push(
            result
        );

    }


    return results;

};


/* =========================================================
   RESTORE DATABASE BACKUP
========================================================= */

exports.restoreDatabase = async (
    req,
    res
) => {

    let uploadedFilePath = null;


    if (
        restoreInProgress
    ) {

        return res.status(409).json({

            success:
                false,

            message:
                "Another restore operation is already running. Please wait."

        });

    }


    restoreInProgress = true;


    try {

        if (
            !req.file
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Please upload a database backup file."

            });

        }


        uploadedFilePath =
            req.file.path;


        const backup =
            readJsonFile(
                uploadedFilePath
            );


        validateBackupEnvelope(
            backup,
            "database"
        );


        validateDatabaseStructure(
            backup.data
        );


        const results =
            await restoreDatabaseData(
                backup.data
            );


        const restoredTables =
            results.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.restored || 0
                    ),
                0
            );


        await createBackupAudit({

            req,

            action:
                "BACKUP_DATABASE_RESTORED",

            description:
                `Database backup restored successfully. ${restoredTables} records processed.`

        });


        return res.json({

            success:
                true,

            message:
                "Database backup restored successfully.",

            restoredRecords:
                restoredTables,

            tables:
                results

        });

    } catch (error) {

        console.error(
            "DATABASE RESTORE ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Unable to restore database."

        });

    } finally {

        if (
            uploadedFilePath
        ) {

            deleteFile(
                uploadedFilePath
            );

        }


        restoreInProgress = false;

    }

};


/* =========================================================
   ZIP PATH SECURITY
========================================================= */

const getSafeExtractionPath = (
    rootDirectory,
    entryPath
) => {

    if (
        typeof entryPath !==
        "string"
    ) {

        throw new Error(
            "ZIP archive contains an invalid file path."
        );

    }


    /*
     * ZIP paths always use forward slashes.
     */

    const normalizedEntry =
        path.posix.normalize(
            entryPath
                .replace(/\\/g, "/")
        );


    /*
     * Reject absolute paths.
     */

    if (
        normalizedEntry.startsWith("/")
    ) {

        throw new Error(
            "Unsafe ZIP archive detected."
        );

    }


    /*
     * Reject directory traversal.
     */

    if (
        normalizedEntry === ".." ||
        normalizedEntry.startsWith("../") ||
        normalizedEntry.includes("/../")
    ) {

        throw new Error(
            "Unsafe ZIP archive detected."
        );

    }


    const root =
        path.resolve(
            rootDirectory
        );


    const target =
        path.resolve(
            rootDirectory,
            normalizedEntry
        );


    if (
        target !== root &&
        !target.startsWith(
            root + path.sep
        )
    ) {

        throw new Error(
            "Unsafe ZIP archive path detected."
        );

    }


    return target;

};


/* =========================================================
   SAFE ZIP EXTRACTION
========================================================= */

const extractZipSafely = async (
    zipPath,
    destination
) => {

    const directory =
        await unzipper.Open.file(
            zipPath
        );


    if (
        !directory ||
        !Array.isArray(
            directory.files
        )
    ) {

        throw new Error(
            "Unable to read backup ZIP archive."
        );

    }


    if (
        directory.files.length >
        MAX_ZIP_ENTRIES
    ) {

        throw new Error(
            "Backup ZIP contains too many files."
        );

    }


    let extractedBytes = 0;


    for (
        const entry of
        directory.files
    ) {

        const targetPath =
            getSafeExtractionPath(

                destination,

                entry.path

            );


        /*
         * Directories.
         */

        if (
            entry.type ===
                "Directory" ||
            entry.path.endsWith("/")
        ) {

            fs.mkdirSync(
                targetPath,
                {
                    recursive:
                        true
                }
            );

            continue;

        }


        /*
         * Check declared size.
         */

        const declaredSize =
            Number(
                entry.uncompressedSize || 0
            );


        if (
            declaredSize >
            0
        ) {

            extractedBytes +=
                declaredSize;

        }


        if (
            extractedBytes >
            MAX_EXTRACTED_SIZE
        ) {

            throw new Error(
                "Backup ZIP exceeds the maximum extraction size."
            );

        }


        const parentDirectory =
            path.dirname(
                targetPath
            );


        fs.mkdirSync(
            parentDirectory,
            {
                recursive:
                    true
            }
        );


        await new Promise(
            (
                resolve,
                reject
            ) => {

                const input =
                    entry.stream();


                const output =
                    fs.createWriteStream(
                        targetPath
                    );


                let actualBytes = 0;


                input.on(
                    "data",
                    (chunk) => {

                        actualBytes +=
                            chunk.length;

                    }
                );


                input.on(
                    "error",
                    reject
                );


                output.on(
                    "error",
                    reject
                );


                output.on(
                    "finish",
                    () => {

                        if (
                            actualBytes >
                            MAX_EXTRACTED_SIZE
                        ) {

                            reject(
                                new Error(
                                    "Extracted backup file is too large."
                                )
                            );

                            return;

                        }


                        resolve();

                    }
                );


                input.pipe(
                    output
                );

            }
        );

    }

};


/* =========================================================
   VALIDATE FULL BACKUP
========================================================= */

const validateFullBackupContents = (
    extractDirectory
) => {

    const infoPath =
        path.join(
            extractDirectory,
            "backup-info.json"
        );


    const databasePath =
        path.join(
            extractDirectory,
            "database.json"
        );


    if (
        !fs.existsSync(
            infoPath
        )
    ) {

        throw new Error(
            "backup-info.json is missing from the backup."
        );

    }


    if (
        !fs.existsSync(
            databasePath
        )
    ) {

        throw new Error(
            "database.json is missing from the backup."
        );

    }


    const backupInfo =
        readJsonFile(
            infoPath
        );


    validateBackupEnvelope(
        backupInfo,
        "full"
    );


    const database =
        readJsonFile(
            databasePath
        );


    validateDatabaseStructure(
        database
    );


    return {

        backupInfo,

        database

    };

};


/* =========================================================
   RESTORE LOCAL UPLOADS
========================================================= */

const restoreLocalUploads = (
    extractDirectory
) => {

    const extractedUploads =
        path.join(
            extractDirectory,
            "uploads"
        );


    if (
        !fs.existsSync(
            extractedUploads
        )
    ) {

        return false;

    }


    const liveUploads =
        path.join(
            __dirname,
            "../uploads"
        );


    fs.mkdirSync(
        liveUploads,
        {
            recursive:
                true
        }
    );


    fs.cpSync(

        extractedUploads,

        liveUploads,

        {

            recursive:
                true,

            force:
                true

        }

    );


    return true;

};


/* =========================================================
   RESTORE FULL SYSTEM BACKUP
========================================================= */

exports.restoreFullBackup = async (
    req,
    res
) => {

    let uploadedFilePath = null;

    let extractDirectory = null;


    if (
        restoreInProgress
    ) {

        return res.status(409).json({

            success:
                false,

            message:
                "Another restore operation is already running. Please wait."

        });

    }


    restoreInProgress = true;


    try {

        if (
            !req.file
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Please upload a complete backup ZIP file."

            });

        }


        uploadedFilePath =
            req.file.path;


        /*
         * Verify the uploaded file exists.
         */

        if (
            !fs.existsSync(
                uploadedFilePath
            )
        ) {

            throw new Error(
                "Uploaded backup file could not be found."
            );

        }


        /*
         * Create isolated extraction directory.
         */

        extractDirectory =
            path.join(

                __dirname,

                "../temp/restores",

                `restore-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 10)}`

            );


        fs.mkdirSync(
            extractDirectory,
            {
                recursive:
                    true
            }
        );


        /*
         * Secure ZIP extraction.
         */

        await extractZipSafely(

            uploadedFilePath,

            extractDirectory

        );


        /*
         * Validate everything BEFORE
         * changing the database.
         */

        const {
            backupInfo,
            database
        } =
            validateFullBackupContents(
                extractDirectory
            );


        /*
         * Restore database.
         */

        const results =
            await restoreDatabaseData(
                database
            );


        /*
         * Restore local uploaded files.
         */

        const uploadsRestored =
            restoreLocalUploads(
                extractDirectory
            );


        const restoredRecords =
            results.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.restored || 0
                    ),
                0
            );


        await createBackupAudit({

            req,

            action:
                "BACKUP_FULL_RESTORED",

            description:
                `Complete backup restored. Original backup date: ${backupInfo.createdAt}. ${restoredRecords} database records processed. Uploads restored: ${uploadsRestored}.`

        });


        return res.json({

            success:
                true,

            message:
                "Complete KAD Marketplace backup restored successfully.",

            backupCreatedAt:
                backupInfo.createdAt,

            restoredRecords,

            uploadsRestored,

            tables:
                results

        });

    } catch (error) {

        console.error(
            "FULL BACKUP RESTORE ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Unable to restore full backup."

        });

    } finally {

        /*
         * Always clean temporary files.
         */

        if (
            uploadedFilePath
        ) {

            deleteFile(
                uploadedFilePath
            );

        }


        if (
            extractDirectory
        ) {

            deleteDirectory(
                extractDirectory
            );

        }


        restoreInProgress = false;

    }

};


/* =========================================================
   MODULE EXPORT CHECK
========================================================= */

module.exports = exports;
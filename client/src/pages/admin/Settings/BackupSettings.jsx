import { useRef, useState } from "react";
import api from "../../../config/axios";

function BackupSettings() {
    const databaseInputRef = useRef(null);
    const fullBackupInputRef = useRef(null);

    const [loading, setLoading] = useState({
        exportSettings: false,
        exportDatabase: false,
        fullBackup: false,
        restoreDatabase: false,
        restoreFull: false,
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const updateLoading = (key, value) => {
        setLoading((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const showMessage = (message, type = "success") => {
        setMessage(message);
        setMessageType(type);
    };

    const downloadFile = (data, filename, type) => {
        const blob = new Blob([data], {
            type,
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.setAttribute("download", filename);

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);
    };

    /* =====================================================
       EXPORT SETTINGS
    ====================================================== */

    const exportSettings = async () => {
        try {
            updateLoading("exportSettings", true);
            setMessage("");

            const response = await api.get(
                "/backups/export-settings",
                {
                    responseType: "blob",
                }
            );

            downloadFile(
                response.data,
                `KAD-Settings-${Date.now()}.json`,
                "application/json"
            );

            showMessage(
                "Marketplace settings exported successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Settings export error:",
                error
            );

            showMessage(
                error.response?.data?.message ||
                    "Unable to export marketplace settings.",
                "error"
            );
        } finally {
            updateLoading("exportSettings", false);
        }
    };

    /* =====================================================
       EXPORT DATABASE
    ====================================================== */

    const exportDatabase = async () => {
        const confirmed = window.confirm(
            "Download a complete database backup?"
        );

        if (!confirmed) return;

        try {
            updateLoading("exportDatabase", true);
            setMessage("");

            const response = await api.get(
                "/backups/export-database",
                {
                    responseType: "blob",
                }
            );

            downloadFile(
                response.data,
                `KAD-Database-${Date.now()}.json`,
                "application/json"
            );

            showMessage(
                "Database backup downloaded successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Database export error:",
                error
            );

            showMessage(
                error.response?.data?.message ||
                    "Unable to export database.",
                "error"
            );
        } finally {
            updateLoading("exportDatabase", false);
        }
    };

    /* =====================================================
       FULL SYSTEM BACKUP
    ====================================================== */

    const createFullBackup = async () => {
        const confirmed = window.confirm(
            "Create a complete backup including the database and uploaded files?"
        );

        if (!confirmed) return;

        try {
            updateLoading("fullBackup", true);
            setMessage("");

            const response = await api.get(
                "/backups/full-backup",
                {
                    responseType: "blob",
                }
            );

            downloadFile(
                response.data,
                `KAD-Marketplace-Full-Backup-${Date.now()}.zip`,
                "application/zip"
            );

            showMessage(
                "Full system backup downloaded successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Full backup error:",
                error
            );

            showMessage(
                error.response?.data?.message ||
                    "Unable to create full system backup.",
                "error"
            );
        } finally {
            updateLoading("fullBackup", false);
        }
    };

    /* =====================================================
       RESTORE DATABASE
    ====================================================== */

    const handleDatabaseRestore = async (file) => {
        if (!file) return;

        const confirmed = window.confirm(
            "WARNING: Restoring a database can overwrite existing marketplace data. Continue?"
        );

        if (!confirmed) {
            if (databaseInputRef.current) {
                databaseInputRef.current.value = "";
            }

            return;
        }

        const formData = new FormData();

        formData.append("backup", file);

        try {
            updateLoading("restoreDatabase", true);
            setMessage("");

            const response = await api.post(
                "/backups/restore-database",
                formData
            );

            showMessage(
                response.data?.message ||
                    "Database restored successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Database restore error:",
                error
            );

            showMessage(
                error.response?.data?.message ||
                    "Unable to restore database.",
                "error"
            );
        } finally {
            updateLoading("restoreDatabase", false);

            if (databaseInputRef.current) {
                databaseInputRef.current.value = "";
            }
        }
    };

    /* =====================================================
       RESTORE FULL BACKUP
    ====================================================== */

    const handleFullRestore = async (file) => {
        if (!file) return;

        const confirmed = window.confirm(
            "DANGER: This will restore database records and uploaded files. Existing data may be overwritten. Continue?"
        );

        if (!confirmed) {
            if (fullBackupInputRef.current) {
                fullBackupInputRef.current.value = "";
            }

            return;
        }

        const formData = new FormData();

        formData.append("backup", file);

        try {
            updateLoading("restoreFull", true);
            setMessage("");

            const response = await api.post(
                "/backups/restore-full",
                formData
            );

            showMessage(
                response.data?.message ||
                    "Full system backup restored successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Full restore error:",
                error
            );

            showMessage(
                error.response?.data?.message ||
                    "Unable to restore full system backup.",
                "error"
            );
        } finally {
            updateLoading("restoreFull", false);

            if (fullBackupInputRef.current) {
                fullBackupInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="settings-section">
            <div className="settings-section-header">
                <div>
                    <h2>Backup & Restore</h2>

                    <p>
                        Create secure backups of your KAD Marketplace
                        database, settings, and uploaded files.
                    </p>
                </div>
            </div>

            {/* =====================================================
                MESSAGE
            ====================================================== */}

            {message && (
                <div
                    className={`settings-message ${
                        messageType === "error"
                            ? "error-message"
                            : "success-message"
                    }`}
                >
                    {message}
                </div>
            )}

            {/* =====================================================
                SETTINGS BACKUP
            ====================================================== */}

            <div className="settings-card">
                <h3>Settings Backup</h3>

                <p>
                    Download all marketplace configuration settings,
                    including marketplace, payment, email,
                    notification, security, SEO, analytics, and
                    backup configuration.
                </p>

                <button
                    type="button"
                    className="settings-primary-btn"
                    onClick={exportSettings}
                    disabled={loading.exportSettings}
                >
                    {loading.exportSettings
                        ? "Exporting..."
                        : "Export Settings"}
                </button>
            </div>

            {/* =====================================================
                DATABASE BACKUP
            ====================================================== */}

            <div className="settings-card">
                <h3>Database Backup</h3>

                <p>
                    Download marketplace database records including
                    users, products, stores, payments, subscriptions,
                    messages, security records, and marketplace data.
                </p>

                <button
                    type="button"
                    className="settings-primary-btn"
                    onClick={exportDatabase}
                    disabled={loading.exportDatabase}
                >
                    {loading.exportDatabase
                        ? "Creating Backup..."
                        : "Download Database Backup"}
                </button>
            </div>

            {/* =====================================================
                FULL BACKUP
            ====================================================== */}

            <div className="settings-card">
                <h3>Complete System Backup</h3>

                <p>
                    Creates a ZIP backup containing the entire
                    database and uploaded files, including product
                    images, profile images, and marketplace branding.
                </p>

                <button
                    type="button"
                    className="settings-primary-btn"
                    onClick={createFullBackup}
                    disabled={loading.fullBackup}
                >
                    {loading.fullBackup
                        ? "Creating Full Backup..."
                        : "Create Full Backup"}
                </button>
            </div>

            {/* =====================================================
                RESTORE DATABASE
            ====================================================== */}

            <div className="settings-card warning-card">
                <h3>Restore Database</h3>

                <p>
                    Upload a previously exported KAD Marketplace
                    database JSON file.
                </p>

                <input
                    ref={databaseInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) =>
                        handleDatabaseRestore(
                            e.target.files?.[0]
                        )
                    }
                    disabled={loading.restoreDatabase}
                />

                {loading.restoreDatabase && (
                    <p>
                        Restoring database...
                    </p>
                )}
            </div>

            {/* =====================================================
                RESTORE FULL SYSTEM
            ====================================================== */}

            <div className="settings-card danger-card">
                <h3>Restore Complete System</h3>

                <p>
                    Upload a KAD Marketplace ZIP backup to restore
                    database records and uploaded files.
                </p>

                <input
                    ref={fullBackupInputRef}
                    type="file"
                    accept=".zip,application/zip"
                    onChange={(e) =>
                        handleFullRestore(
                            e.target.files?.[0]
                        )
                    }
                    disabled={loading.restoreFull}
                />

                {loading.restoreFull && (
                    <p>
                        Restoring complete system...
                    </p>
                )}
            </div>

            {/* =====================================================
                SECURITY WARNING
            ====================================================== */}

            <div className="settings-card backup-warning">
                <h3>⚠ Important</h3>

                <ul>
                    <li>
                        Store backup files in a secure location.
                    </li>

                    <li>
                        Backup files may contain sensitive user
                        information.
                    </li>

                    <li>
                        Always create a backup before restoring
                        another backup.
                    </li>

                    <li>
                        Only authorized administrators should access
                        this page.
                    </li>

                    <li>
                        Do not upload backup files to publicly
                        accessible storage.
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default BackupSettings;
import { useRef, useState } from "react";
import api from "../../../config/axios";

function BackupSettings() {

    const token = localStorage.getItem("token");

    const databaseInputRef = useRef(null);
    const fullBackupInputRef = useRef(null);

    const [loading, setLoading] = useState({
        exportSettings: false,
        exportDatabase: false,
        fullBackup: false,
        restoreDatabase: false,
        restoreFull: false
    });

    const [message, setMessage] = useState("");

    const API_URL = "/api/backups";


    /* =========================================
       GET AUTHORIZATION HEADER
    ========================================= */

    const getConfig = () => {

        return {

            headers: {

                Authorization: `Bearer ${token}`

            }

        };

    };


    /* =========================================
       DOWNLOAD FILE
    ========================================= */

    const downloadFile = (data, filename, type) => {

        const blob = new Blob(
            [data],
            {
                type
            }
        );

        const url =
            window.URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.setAttribute(
            "download",
            filename
        );

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

    };


    /* =========================================
       EXPORT SETTINGS
    ========================================= */

    const exportSettings = async () => {

        try {

            setLoading({
                ...loading,
                exportSettings: true
            });

            setMessage("");

            const response =
                await axios.get(

                    `${API_URL}/export-settings`,

                    {

                        ...getConfig(),

                        responseType: "blob"

                    }

                );


            downloadFile(

                response.data,

                `KAD-Settings-${Date.now()}.json`,

                "application/json"

            );


            setMessage(
                "Settings exported successfully."
            );

        }

        catch (error) {

            console.error(error);

            setMessage(
                "Unable to export settings."
            );

        }

        finally {

            setLoading({
                ...loading,
                exportSettings: false
            });

        }

    };


    /* =========================================
       EXPORT DATABASE
    ========================================= */

    const exportDatabase = async () => {

        const confirmed =
            window.confirm(

                "Download a complete database backup?"

            );


        if (!confirmed) return;


        try {

            setLoading({
                ...loading,
                exportDatabase: true
            });

            setMessage("");

            const response =
                await axios.get(

                    `${API_URL}/export-database`,

                    {

                        ...getConfig(),

                        responseType: "blob"

                    }

                );


            downloadFile(

                response.data,

                `KAD-Database-${Date.now()}.json`,

                "application/json"

            );


            setMessage(
                "Database backup downloaded successfully."
            );

        }

        catch (error) {

            console.error(error);

            setMessage(
                "Unable to export database."
            );

        }

        finally {

            setLoading({
                ...loading,
                exportDatabase: false
            });

        }

    };


    /* =========================================
       FULL SYSTEM BACKUP
    ========================================= */

    const createFullBackup = async () => {

        const confirmed =
            window.confirm(

                "Create a complete backup including database and uploaded files?"

            );


        if (!confirmed) return;


        try {

            setLoading({
                ...loading,
                fullBackup: true
            });

            setMessage("");

            const response =
                await axios.get(

                    `${API_URL}/full-backup`,

                    {

                        ...getConfig(),

                        responseType: "blob"

                    }

                );


            downloadFile(

                response.data,

                `KAD-Marketplace-Full-Backup-${Date.now()}.zip`,

                "application/zip"

            );


            setMessage(
                "Full system backup downloaded successfully."
            );

        }

        catch (error) {

            console.error(error);

            setMessage(
                "Unable to create full backup."
            );

        }

        finally {

            setLoading({
                ...loading,
                fullBackup: false
            });

        }

    };


    /* =========================================
       RESTORE DATABASE
    ========================================= */

    const handleDatabaseRestore = async (file) => {

        if (!file) return;


        const confirmed =
            window.confirm(

                "WARNING: Restoring a database can overwrite existing data. Continue?"

            );


        if (!confirmed) {

            databaseInputRef.current.value = "";

            return;

        }


        const formData =
            new FormData();


        formData.append(
            "backup",
            file
        );


        try {

            setLoading({
                ...loading,
                restoreDatabase: true
            });

            setMessage("");

            const response =
                await axios.post(

                    `${API_URL}/restore-database`,

                    formData,

                    {

                        headers: {

                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "multipart/form-data"

                        }

                    }

                );


            setMessage(
                response.data.message ||
                "Database restored successfully."
            );

        }

        catch (error) {

            console.error(error);

            setMessage(

                error.response?.data?.message ||

                "Unable to restore database."

            );

        }

        finally {

            setLoading({
                ...loading,
                restoreDatabase: false
            });

            if (
                databaseInputRef.current
            ) {

                databaseInputRef.current.value = "";

            }

        }

    };


    /* =========================================
       RESTORE FULL BACKUP
    ========================================= */

    const handleFullRestore = async (file) => {

        if (!file) return;


        const confirmed =
            window.confirm(

                "DANGER: This will restore database records and uploaded files. Continue?"

            );


        if (!confirmed) {

            fullBackupInputRef.current.value = "";

            return;

        }


        const formData =
            new FormData();


        formData.append(
            "backup",
            file
        );


        try {

            setLoading({
                ...loading,
                restoreFull: true
            });

            setMessage("");

            const response =
                await axios.post(

                    `${API_URL}/restore-full`,

                    formData,

                    {

                        headers: {

                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "multipart/form-data"

                        }

                    }

                );


            setMessage(
                response.data.message ||
                "Full backup restored successfully."
            );

        }

        catch (error) {

            console.error(error);

            setMessage(

                error.response?.data?.message ||

                "Unable to restore full backup."

            );

        }

        finally {

            setLoading({
                ...loading,
                restoreFull: false
            });

            if (
                fullBackupInputRef.current
            ) {

                fullBackupInputRef.current.value = "";

            }

        }

    };


    return (

        <div className="settings-section">

            <div className="settings-section-header">

                <div>

                    <h2>
                        Backup & Restore
                    </h2>

                    <p>
                        Create secure backups of your KAD Marketplace
                        database, settings, and uploaded files.
                    </p>

                </div>

            </div>


            {message && (

                <div className="settings-message">

                    {message}

                </div>

            )}


            {/* =====================================
                EXPORT SETTINGS
            ===================================== */}

            <div className="settings-card">

                <h3>
                    Settings Backup
                </h3>

                <p>
                    Download all marketplace configuration settings.
                </p>

                <button

                    className="settings-primary-btn"

                    onClick={exportSettings}

                    disabled={loading.exportSettings}

                >

                    {loading.exportSettings

                        ? "Exporting..."

                        : "Export Settings"

                    }

                </button>

            </div>


            {/* =====================================
                DATABASE BACKUP
            ===================================== */}

            <div className="settings-card">

                <h3>
                    Database Backup
                </h3>

                <p>
                    Download all users, products, stores,
                    payments, subscriptions, messages,
                    security records and marketplace data.
                </p>

                <button

                    className="settings-primary-btn"

                    onClick={exportDatabase}

                    disabled={loading.exportDatabase}

                >

                    {loading.exportDatabase

                        ? "Creating Backup..."

                        : "Download Database Backup"

                    }

                </button>

            </div>


            {/* =====================================
                FULL BACKUP
            ===================================== */}

            <div className="settings-card">

                <h3>
                    Complete System Backup
                </h3>

                <p>
                    Creates a ZIP backup containing the
                    entire database and all uploaded files,
                    including product images, profile images,
                    and marketplace branding.
                </p>

                <button

                    className="settings-primary-btn"

                    onClick={createFullBackup}

                    disabled={loading.fullBackup}

                >

                    {loading.fullBackup

                        ? "Creating Full Backup..."

                        : "Create Full Backup"

                    }

                </button>

            </div>


            {/* =====================================
                RESTORE DATABASE
            ===================================== */}

            <div className="settings-card warning-card">

                <h3>
                    Restore Database
                </h3>

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

                            e.target.files[0]

                        )

                    }

                    disabled={
                        loading.restoreDatabase
                    }

                />


                {loading.restoreDatabase && (

                    <p>
                        Restoring database...
                    </p>

                )}

            </div>


            {/* =====================================
                RESTORE FULL BACKUP
            ===================================== */}

            <div className="settings-card danger-card">

                <h3>
                    Restore Complete System
                </h3>

                <p>
                    Upload a KAD Marketplace ZIP backup to
                    restore database records and uploaded files.
                </p>

                <input

                    ref={fullBackupInputRef}

                    type="file"

                    accept=".zip,application/zip"

                    onChange={(e) =>

                        handleFullRestore(

                            e.target.files[0]

                        )

                    }

                    disabled={
                        loading.restoreFull
                    }

                />


                {loading.restoreFull && (

                    <p>
                        Restoring complete system...
                    </p>

                )}

            </div>


            {/* =====================================
                SECURITY WARNING
            ===================================== */}

            <div className="settings-card backup-warning">

                <h3>
                    ⚠ Important
                </h3>

                <ul>

                    <li>
                        Store backup files in a secure location.
                    </li>

                    <li>
                        Backup files may contain sensitive user information.
                    </li>

                    <li>
                        Always create a backup before restoring another backup.
                    </li>

                    <li>
                        Only administrators should access this page.
                    </li>

                </ul>

            </div>

        </div>

    );

}


export default BackupSettings;
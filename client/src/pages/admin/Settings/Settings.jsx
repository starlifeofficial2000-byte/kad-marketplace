import { useEffect, useState } from "react";
import api from "../../../config/axios";

import "./Settings.css";

/* ==========================================
   SETTINGS COMPONENTS
========================================== */

import GeneralSettings from "./GeneralSettings";
import BrandingSettings from "./BrandingSettings";
import MarketplaceSettings from "./MarketplaceSettings";
import PaymentSettings from "./PaymentSettings";
import EmailSettings from "./EmailSettings";
import NotificationSettings from "./NotificationSettings";
import SecuritySettings from "./SecuritySettings";
import BackupSettings from "./BackupSettings";
import SeoSettings from "./SEOSettings";


function Settings() {

    const token = localStorage.getItem("token");


    /* ==========================================
       SETTINGS STATE
    ========================================== */

    const [settings, setSettings] = useState({

        /* GENERAL */

        marketplace_name: "",
        currency: "GH₵",
        support_email: "",
        support_phone: "",
        default_language: "English",
        timezone: "Africa/Accra",

developer_mode: "false",
        /* MARKETPLACE */

        max_product_images: "5",
        promotion_price: "",
        advertisement_price: "",
        require_product_approval: "true",
        require_store_verification: "true",


        /* PAYMENT */

        payment_enabled: "true",
        payment_provider: "",
        currency_code: "GHS",
        transaction_fee: "0",


        /* EMAIL */

        email_enabled: "true",
        smtp_host: "",
        smtp_port: "",
        smtp_username: "",
        smtp_password: "",
        smtp_from_email: "",
        smtp_from_name: "",


        /* NOTIFICATIONS */

        email_notifications: "true",
        product_notifications: "true",
        order_notifications: "true",
        payment_notifications: "true",
        admin_notifications: "true",


        /* SECURITY */

        two_factor_authentication: "false",
        login_attempt_limit: "5",
        session_timeout: "60",
        account_lock_duration: "30",
        password_min_length: "8",


        /* BACKUP */

        auto_backup: "false",
        backup_frequency: "daily",
        backup_retention_days: "30",


        /* SEO */

        seo_title: "",
        seo_description: "",
        seo_keywords: "",
        google_analytics_id: "",
        google_search_console: "",


        /* BRANDING */

        logo: "",
        admin_logo: "",
        favicon: ""

    });


    /* ==========================================
       LOADING STATES
    ========================================== */

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");

    const [errorMessage, setErrorMessage] = useState("");


    /* ==========================================
       LOAD SETTINGS
    ========================================== */

    useEffect(() => {

        loadSettings();

    }, []);


    const loadSettings = async () => {

        try {

            setLoading(true);

            setErrorMessage("");


    const response = await api.get(
    "/settings"
);

            if (response.data.success) {

                setSettings((previousSettings) => {

                    const updatedSettings = {

                        ...previousSettings

                    };


                    response.data.settings.forEach((item) => {

                        updatedSettings[item.settingKey] =
                            item.settingValue;

                    });


                    return updatedSettings;

                });

            }

        }

        catch (error) {

            console.error(
                "LOAD SETTINGS ERROR:",
                error
            );


            setErrorMessage(

                error.response?.data?.message ||

                "Failed to load settings."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* ==========================================
       HANDLE SETTINGS CHANGE
    ========================================== */

    const handleChange = (key, value) => {

        setSettings((previousSettings) => ({

            ...previousSettings,

            [key]: value

        }));


        setMessage("");

    };


    /* ==========================================
       GET CATEGORY FOR EACH SETTING
    ========================================== */

    const getSettingCategory = (key) => {

        const categories = {


            /* GENERAL */

            marketplace_name: "General",
            currency: "General",
            support_email: "General",
            support_phone: "General",
            default_language: "General",
            timezone: "General",


            /* BRANDING */

            logo: "Branding",
            admin_logo: "Branding",
            favicon: "Branding",


            /* MARKETPLACE */

            max_product_images: "Marketplace",
            promotion_price: "Marketplace",
            advertisement_price: "Marketplace",
            require_product_approval: "Marketplace",
            require_store_verification: "Marketplace",


            /* PAYMENT */

            payment_enabled: "Payment",
            payment_provider: "Payment",
            currency_code: "Payment",
            transaction_fee: "Payment",


            /* EMAIL */

            email_enabled: "Email",
            smtp_host: "Email",
            smtp_port: "Email",
            smtp_username: "Email",
            smtp_password: "Email",
            smtp_from_email: "Email",
            smtp_from_name: "Email",


            /* NOTIFICATIONS */

            email_notifications: "Notifications",
            product_notifications: "Notifications",
            order_notifications: "Notifications",
            payment_notifications: "Notifications",
            admin_notifications: "Notifications",


            /* SECURITY */

            two_factor_authentication: "Security",
            login_attempt_limit: "Security",
            session_timeout: "Security",
            account_lock_duration: "Security",
            password_min_length: "Security",


            /* BACKUP */

            auto_backup: "Backup",
            backup_frequency: "Backup",
            backup_retention_days: "Backup",


            /* SEO */

            seo_title: "SEO",
            seo_description: "SEO",
            seo_keywords: "SEO",
            google_analytics_id: "SEO",
            google_search_console: "SEO"

        };


        return categories[key] || "General";

    };


    /* ==========================================
       SAVE ALL SETTINGS
    ========================================== */

    const saveSettings = async () => {

        try {

            setSaving(true);

            setMessage("");

            setErrorMessage("");


            const settingsData = Object.entries(settings)

                .filter(([key]) => {

                    /*
                       Branding files are uploaded separately.

                       We don't need to overwrite them
                       unless they already exist.
                    */

                    return true;

                })

                .map(([key, value]) => ({

                    settingKey: key,

                    settingValue:

                        value === null ||

                        value === undefined

                            ? ""

                            : String(value),

                    category:

                        getSettingCategory(key)

                }));


            const response = await axios.put(

                "/api/settings",

                settingsData,

                {

                    headers: {

                        Authorization: `Bearer ${token}`,

                        "Content-Type":

                            "application/json"

                    }

                }

            );


            if (response.data.success) {

                setMessage(

                    response.data.message ||

                    "Settings saved successfully."

                );


                setTimeout(() => {

                    setMessage("");

                }, 4000);

            }

        }

        catch (error) {

            console.error(
                "SAVE SETTINGS ERROR:",
                error
            );


            setErrorMessage(

                error.response?.data?.message ||

                "Failed to save settings."

            );

        }

        finally {

            setSaving(false);

        }

    };


    /* ==========================================
       LOADING SCREEN
    ========================================== */

    if (loading) {

        return (

            <div className="settings-loading">

                <h2>

                    Loading Settings...

                </h2>

                <p>

                    Please wait while your settings are loading.

                </p>

            </div>

        );

    }


    /* ==========================================
       SETTINGS PAGE
    ========================================== */

    return (

        <div className="settings-page">


            {/* =====================================
                PAGE HEADER
            ====================================== */}

            <div className="settings-page-header">

                <div>

                    <h1>

                        ⚙️ System Settings

                    </h1>

                    <p>

                        Manage and configure your marketplace settings.

                    </p>

                </div>


                <button

                    className="save-settings-top-btn"

                    onClick={saveSettings}

                    disabled={saving}

                >

                    {saving

                        ? "Saving..."

                        : "💾 Save All Settings"

                    }

                </button>

            </div>


            {/* =====================================
                SUCCESS MESSAGE
            ====================================== */}

            {message && (

                <div className="settings-success">

                    ✅ {message}

                </div>

            )}


            {/* =====================================
                ERROR MESSAGE
            ====================================== */}

            {errorMessage && (

                <div className="settings-error">

                    ❌ {errorMessage}

                </div>

            )}


            {/* =====================================
                GENERAL SETTINGS
            ====================================== */}

            <GeneralSettings

                settings={settings}

                handleChange={handleChange}

            />


            {/* =====================================
                BRANDING SETTINGS
            ====================================== */}

            <BrandingSettings

                settings={settings}

                loadSettings={loadSettings}

                handleChange={handleChange}

            />


            {/* =====================================
                MARKETPLACE SETTINGS
            ====================================== */}

            <MarketplaceSettings

                settings={settings}

                handleChange={handleChange}

            />


            {/* =====================================
                PAYMENT SETTINGS
            ====================================== */}

            <PaymentSettings

                settings={settings}

                handleChange={handleChange}

            />


            {/* =====================================
                EMAIL SETTINGS
            ====================================== */}

            <EmailSettings

                settings={settings}

                handleChange={handleChange}

            />


            {/* =====================================
                NOTIFICATION SETTINGS
            ====================================== */}

            <NotificationSettings

                settings={settings}

                handleChange={handleChange}

            />


            {/* =====================================
                SECURITY SETTINGS
            ====================================== */}

            <SecuritySettings

                settings={settings}

                handleChange={handleChange}

            />


            {/* =====================================
                BACKUP SETTINGS
            ====================================== */}

            <BackupSettings

                settings={settings}

                handleChange={handleChange}

                token={token}

            />


            {/* =====================================
                SEO SETTINGS
            ====================================== */}

            <SeoSettings

                settings={settings}

                handleChange={handleChange}

            />


            {/* =====================================
                BOTTOM SAVE BUTTON
            ====================================== */}

            <div className="settings-actions">

                <button

                    className="save-settings-btn"

                    onClick={saveSettings}

                    disabled={saving}

                >

                    {saving

                        ? "Saving Settings..."

                        : "💾 Save All Settings"

                    }

                </button>


                <button

                    className="reset-settings-btn"

                    onClick={loadSettings}

                    disabled={saving}

                >

                    ↻ Reload Settings

                </button>

            </div>


        </div>

    );

}


export default Settings;
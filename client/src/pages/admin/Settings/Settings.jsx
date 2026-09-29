import {
    useCallback,
    useEffect,
    useState
} from "react";

import api from "../../../config/axios";

import "./Settings.css";

/* =========================================================
   SETTINGS COMPONENTS
========================================================= */

import GeneralSettings from "./GeneralSettings";
import BrandingSettings from "./BrandingSettings";
import MarketplaceSettings from "./MarketplaceSettings";
import PaymentSettings from "./PaymentSettings";
import EmailSettings from "./EmailSettings";
import NotificationSettings from "./NotificationSettings";
import SecuritySettings from "./SecuritySettings";
import BackupSettings from "./BackupSettings";
import SeoSettings from "./SEOSettings";
import AnalyticsSettings from "./AnalyticsSettings";


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {

    /* =====================================================
       GENERAL
    ===================================================== */

    marketplace_name: "KAD Marketplace",

    logo: "",
    admin_logo: "",
    favicon: "",

    support_email: "",
    support_phone: "",
    business_address: "",

    currency: "GH₵",
    language: "English",
    timezone: "Africa/Accra",

    marketplace_description: "",

    maintenance_mode: "false",
    registration_enabled: "true",
    store_registration_enabled: "true",

    facebook: "",
    instagram: "",
    tiktok: "",
    x: "",
    whatsapp: "",

    is_active: "true",

    developer_mode: "false",


    /* =====================================================
       MARKETPLACE
    ===================================================== */

    marketplace_description: "",

    primary_color: "#0A66C2",
    secondary_color: "#198754",

    max_product_images: "5",
    max_products_per_user: "50",
    max_product_price: "1000000",

    promotion_price: "",
    advertisement_price: "",

    allow_product_posting: "true",

    require_product_approval: "true",
    require_store_verification: "true",

    allow_guest_browsing: "true",
    allow_guest_messaging: "false",

    allow_product_reviews: "true",
    allow_seller_reviews: "true",


    /* =====================================================
       PAYMENT
    ===================================================== */

    payment_enabled: "true",

    mobile_money_enabled: "true",
    card_enabled: "true",
    bank_transfer_enabled: "true",

    payment_provider: "paystack",

    currency_code: "GHS",

    minimum_transaction: "1",
    maximum_transaction: "1000000",

    transaction_fee: "0",

    auto_confirm_payments: "false",

    payment_notifications: "true",


    /* =====================================================
       EMAIL
    ===================================================== */

    email_enabled: "true",

    email_provider: "resend",

    resend_from_name: "KAD Marketplace",
    resend_from_email: "",

    smtp_host: "",
    smtp_port: "587",
    smtp_username: "",
    smtp_password: "",
    smtp_encryption: "tls",

    smtp_from_email: "",
    smtp_from_name: "KAD Marketplace",

    registration_email: "true",
    password_reset_email: "true",
    order_email: "true",
    payment_email: "true",

    subscription_email: "true",


    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    email_notifications: "true",

    welcome_email: "true",

    product_notifications: "true",
    order_notifications: "true",
    payment_notifications: "true",

    seller_notifications: "true",

    admin_notifications: "true",

    security_alerts: "true",

    maintenance_alerts: "true",

    promotional_notifications: "true",

    sms_enabled: "false",
    sms_provider: "",


    /* =====================================================
       SECURITY
    ===================================================== */

    two_factor_authentication: "false",

    require_admin_two_factor: "true",

    login_attempt_limit: "5",

    account_lock_duration: "30",

    session_timeout: "120",

    password_min_length: "8",

    require_strong_passwords: "true",

    require_uppercase_password: "true",
    require_lowercase_password: "true",
    require_number_password: "true",
    require_special_character: "true",

    password_history_count: "5",

    password_expiry_enabled: "false",
    password_expiry_days: "90",

    ip_monitoring: "true",
    suspicious_ip_blocking: "true",

    ip_failed_login_threshold: "10",
    ip_block_duration: "60",

    security_alert_failed_login: "true",
    security_alert_account_lock: "true",
    security_alert_suspicious_ip: "true",
    security_alert_admin_login: "true",
    security_alert_password_change: "true",
    security_alert_new_device: "true",

    security_admin_alerts: "true",

    audit_logging: "true",


    /* =====================================================
       BACKUP
    ===================================================== */

    auto_backup: "false",

    backup_frequency: "daily",

    backup_retention_days: "30",


    /* =====================================================
       ANALYTICS
    ===================================================== */

    analytics_enabled: "false",

    google_analytics_id: "",

    google_tag_manager_id: "",

    facebook_pixel_id: "",

    google_search_console_verification: "",

    google_search_console: "",

    anonymous_analytics: "true",


    /* =====================================================
       SEO
    ===================================================== */

    seo_title: "",

    seo_description: "",

    seo_keywords: "",

    google_site_verification: "",

    og_title: "",
    og_description: "",

    search_engine_indexing: "true",

    enable_sitemap: "true"
};


/* =========================================================
   SAFE STRING
========================================================= */

const safeString = (
    value,
    fallback = ""
) => {

    if (
        value === null ||
        value === undefined
    ) {
        return fallback;
    }

    return String(value);
};


/* =========================================================
   STRING BOOLEAN
========================================================= */

const toStringBoolean = (
    value,
    fallback = "false"
) => {

    if (
        value === true ||
        value === 1 ||
        value === "1" ||
        value === "true" ||
        value === "yes"
    ) {
        return "true";
    }

    if (
        value === false ||
        value === 0 ||
        value === "0" ||
        value === "false" ||
        value === "no"
    ) {
        return "false";
    }

    return fallback;
};


/* =========================================================
   SETTINGS COMPONENT
========================================================= */

function Settings() {

    /* =====================================================
       STATE
    ===================================================== */

    const [
        settings,
        setSettings
    ] = useState({
        ...DEFAULT_SETTINGS
    });


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        message,
        setMessage
    ] = useState("");


    const [
        errorMessage,
        setErrorMessage
    ] = useState("");


    const [
        lastSaved,
        setLastSaved
    ] = useState(null);


    /* =====================================================
       NORMALIZE SERVER SETTINGS
    ===================================================== */

    const normalizeServerSettings = useCallback(
        (serverSettings) => {

            const server =
                serverSettings || {};


            const configuration =
                server.configuration || {};


            const marketplace =
                configuration.marketplace || {};


            const payment =
                configuration.payment || {};


            const email =
                configuration.email || {};


            const notifications =
                configuration.notifications || {};


            const security =
                configuration.security || {};


            const backup =
                configuration.backup || {};


            const analytics =
                configuration.analytics || {};


            const seo =
                configuration.seo || {};


            /*
            =================================================
            FLATTEN SERVER CONFIGURATION
            =================================================
            */

            return {

                ...DEFAULT_SETTINGS,

                ...server,


                /* =========================================
                   GENERAL
                ========================================= */

                marketplace_name:
                    safeString(
                        server.marketplace_name,
                        DEFAULT_SETTINGS.marketplace_name
                    ),

                logo:
                    safeString(server.logo),

                admin_logo:
                    safeString(server.admin_logo),

                favicon:
                    safeString(server.favicon),

                support_email:
                    safeString(server.support_email),

                support_phone:
                    safeString(server.support_phone),

                business_address:
                    safeString(server.business_address),

                currency:
                    safeString(
                        server.currency,
                        "GH₵"
                    ),

                language:
                    safeString(
                        server.language,
                        "English"
                    ),

                timezone:
                    safeString(
                        server.timezone,
                        "Africa/Accra"
                    ),

                maintenance_mode:
                    toStringBoolean(
                        server.maintenance_mode,
                        "false"
                    ),

                registration_enabled:
                    toStringBoolean(
                        server.registration_enabled,
                        "true"
                    ),

                store_registration_enabled:
                    toStringBoolean(
                        server.store_registration_enabled,
                        "true"
                    ),

                facebook:
                    safeString(server.facebook),

                instagram:
                    safeString(server.instagram),

                tiktok:
                    safeString(server.tiktok),

                x:
                    safeString(server.x),

                whatsapp:
                    safeString(server.whatsapp),

                is_active:
                    toStringBoolean(
                        server.is_active,
                        "true"
                    ),


                /* =========================================
                   MARKETPLACE
                ========================================= */

                marketplace_description:
                    safeString(
                        marketplace.description ??
                        server.marketplace_description
                    ),

                primary_color:
                    safeString(
                        marketplace.primaryColor ??
                        server.primary_color,
                        "#0A66C2"
                    ),

                secondary_color:
                    safeString(
                        marketplace.secondaryColor ??
                        server.secondary_color,
                        "#198754"
                    ),

                max_product_images:
                    safeString(
                        marketplace.maxProductImages ??
                        server.max_product_images,
                        "5"
                    ),

                max_products_per_user:
                    safeString(
                        marketplace.maxProductsPerUser ??
                        server.max_products_per_user,
                        "50"
                    ),

                max_product_price:
                    safeString(
                        marketplace.maxProductPrice ??
                        server.max_product_price,
                        "1000000"
                    ),

                promotion_price:
                    safeString(
                        marketplace.promotionPrice ??
                        server.promotion_price
                    ),

                advertisement_price:
                    safeString(
                        marketplace.advertisementPrice ??
                        server.advertisement_price
                    ),

                allow_product_posting:
                    toStringBoolean(
                        marketplace.allowProductPosting ??
                        server.allow_product_posting,
                        "true"
                    ),

                require_product_approval:
                    toStringBoolean(
                        marketplace.requireProductApproval ??
                        server.require_product_approval,
                        "true"
                    ),

                require_store_verification:
                    toStringBoolean(
                        marketplace.requireStoreVerification ??
                        server.require_store_verification,
                        "true"
                    ),

                allow_guest_browsing:
                    toStringBoolean(
                        marketplace.allowGuestBrowsing ??
                        server.allow_guest_browsing,
                        "true"
                    ),

                allow_guest_messaging:
                    toStringBoolean(
                        marketplace.allowGuestMessaging ??
                        server.allow_guest_messaging,
                        "false"
                    ),

                allow_product_reviews:
                    toStringBoolean(
                        marketplace.allowProductReviews ??
                        server.allow_product_reviews,
                        "true"
                    ),

                allow_seller_reviews:
                    toStringBoolean(
                        marketplace.allowSellerReviews ??
                        server.allow_seller_reviews,
                        "true"
                    ),


                /* =========================================
                   PAYMENT
                ========================================= */

                payment_enabled:
                    toStringBoolean(
                        payment.enabled ??
                        server.payment_enabled,
                        "true"
                    ),

                mobile_money_enabled:
                    toStringBoolean(
                        payment.mobileMoneyEnabled ??
                        server.mobile_money_enabled,
                        "true"
                    ),

                card_enabled:
                    toStringBoolean(
                        payment.cardEnabled ??
                        server.card_enabled,
                        "true"
                    ),

                bank_transfer_enabled:
                    toStringBoolean(
                        payment.bankTransferEnabled ??
                        server.bank_transfer_enabled,
                        "true"
                    ),

                payment_provider:
                    safeString(
                        payment.gateway ??
                        server.payment_provider,
                        "paystack"
                    ),

                currency_code:
                    safeString(
                        payment.paymentCurrency ??
                        server.currency_code,
                        "GHS"
                    ),

                minimum_transaction:
                    safeString(
                        payment.minimumTransaction ??
                        server.minimum_transaction,
                        "1"
                    ),

                maximum_transaction:
                    safeString(
                        payment.maximumTransaction ??
                        server.maximum_transaction,
                        "1000000"
                    ),

                transaction_fee:
                    safeString(
                        payment.transactionFee ??
                        server.transaction_fee,
                        "0"
                    ),

                auto_confirm_payments:
                    toStringBoolean(
                        payment.autoConfirmPayments ??
                        server.auto_confirm_payments,
                        "false"
                    ),

                payment_notifications:
                    toStringBoolean(
                        payment.paymentNotifications ??
                        server.payment_notifications,
                        "true"
                    ),


                /* =========================================
                   EMAIL
                ========================================= */

                email_enabled:
                    toStringBoolean(
                        email.enabled ??
                        server.email_enabled,
                        "true"
                    ),

                email_provider:
                    safeString(
                        email.provider ??
                        server.email_provider,
                        "resend"
                    ),

                resend_from_name:
                    safeString(
                        email.resendFromName ??
                        server.resend_from_name,
                        "KAD Marketplace"
                    ),

                resend_from_email:
                    safeString(
                        email.resendFromEmail ??
                        server.resend_from_email
                    ),

                smtp_host:
                    safeString(
                        email.smtpHost ??
                        server.smtp_host
                    ),

                smtp_port:
                    safeString(
                        email.smtpPort ??
                        server.smtp_port,
                        "587"
                    ),

                smtp_username:
                    safeString(
                        email.smtpUsername ??
                        server.smtp_username
                    ),

                smtp_password:
                    safeString(
                        email.smtpPassword ??
                        server.smtp_password
                    ),

                smtp_encryption:
                    safeString(
                        email.encryption ??
                        server.smtp_encryption,
                        "tls"
                    ),

                smtp_from_email:
                    safeString(
                        email.fromEmail ??
                        server.smtp_from_email
                    ),

                smtp_from_name:
                    safeString(
                        email.fromName ??
                        server.smtp_from_name,
                        "KAD Marketplace"
                    ),

                registration_email:
                    toStringBoolean(
                        email.registrationEmail ??
                        server.registration_email,
                        "true"
                    ),

                password_reset_email:
                    toStringBoolean(
                        email.passwordResetEmail ??
                        server.password_reset_email,
                        "true"
                    ),

                order_email:
                    toStringBoolean(
                        email.orderEmail ??
                        server.order_email,
                        "true"
                    ),

                payment_email:
                    toStringBoolean(
                        email.paymentEmail ??
                        server.payment_email,
                        "true"
                    ),

                subscription_email:
                    toStringBoolean(
                        email.subscriptionEmail ??
                        server.subscription_email,
                        "true"
                    ),


                /* =========================================
                   NOTIFICATIONS
                ========================================= */

                email_notifications:
                    toStringBoolean(
                        notifications.emailNotifications ??
                        server.email_notifications,
                        "true"
                    ),

                welcome_email:
                    toStringBoolean(
                        notifications.welcomeEmail ??
                        server.welcome_email,
                        "true"
                    ),

                product_notifications:
                    toStringBoolean(
                        notifications.productNotifications ??
                        server.product_notifications,
                        "true"
                    ),

                order_notifications:
                    toStringBoolean(
                        notifications.orderNotifications ??
                        server.order_notifications,
                        "true"
                    ),

                payment_notifications:
                    toStringBoolean(
                        notifications.paymentNotifications ??
                        server.payment_notifications,
                        "true"
                    ),

                seller_notifications:
                    toStringBoolean(
                        notifications.sellerNotifications ??
                        server.seller_notifications,
                        "true"
                    ),

                admin_notifications:
                    toStringBoolean(
                        notifications.adminAlerts ??
                        server.admin_notifications,
                        "true"
                    ),

                security_alerts:
                    toStringBoolean(
                        notifications.securityAlerts ??
                        server.security_alerts,
                        "true"
                    ),

                maintenance_alerts:
                    toStringBoolean(
                        notifications.maintenanceAlerts ??
                        server.maintenance_alerts,
                        "true"
                    ),

                promotional_notifications:
                    toStringBoolean(
                        notifications.promotionalNotifications ??
                        server.promotional_notifications,
                        "true"
                    ),

                sms_enabled:
                    toStringBoolean(
                        notifications.smsEnabled ??
                        server.sms_enabled,
                        "false"
                    ),

                sms_provider:
                    safeString(
                        notifications.smsProvider ??
                        server.sms_provider
                    ),


                /* =========================================
                   SECURITY
                ========================================= */

                two_factor_authentication:
                    toStringBoolean(
                        security.twoFactorEnabled ??
                        server.two_factor_authentication,
                        "false"
                    ),

                require_admin_two_factor:
                    toStringBoolean(
                        security.requireAdminTwoFactor ??
                        server.require_admin_two_factor,
                        "true"
                    ),

                login_attempt_limit:
                    safeString(
                        security.maxFailedLoginAttempts ??
                        server.login_attempt_limit,
                        "5"
                    ),

                account_lock_duration:
                    safeString(
                        security.accountLockDuration ??
                        server.account_lock_duration,
                        "30"
                    ),

                session_timeout:
                    safeString(
                        security.sessionTimeout ??
                        server.session_timeout,
                        "120"
                    ),

                password_min_length:
                    safeString(
                        security.minimumPasswordLength ??
                        server.password_min_length,
                        "8"
                    ),

                require_strong_passwords:
                    toStringBoolean(
                        security.requireStrongPasswords ??
                        server.require_strong_passwords,
                        "true"
                    ),

                require_uppercase_password:
                    toStringBoolean(
                        security.requireUppercasePassword ??
                        server.require_uppercase_password,
                        "true"
                    ),

                require_lowercase_password:
                    toStringBoolean(
                        security.requireLowercasePassword ??
                        server.require_lowercase_password,
                        "true"
                    ),

                require_number_password:
                    toStringBoolean(
                        security.requireNumberPassword ??
                        server.require_number_password,
                        "true"
                    ),

                require_special_character:
                    toStringBoolean(
                        security.requireSpecialCharacter ??
                        server.require_special_character,
                        "true"
                    ),

                password_history_count:
                    safeString(
                        security.passwordHistoryCount ??
                        server.password_history_count,
                        "5"
                    ),

                password_expiry_enabled:
                    toStringBoolean(
                        security.passwordExpiryEnabled ??
                        server.password_expiry_enabled,
                        "false"
                    ),

                password_expiry_days:
                    safeString(
                        security.passwordExpiryDays ??
                        server.password_expiry_days,
                        "90"
                    ),

                ip_monitoring:
                    toStringBoolean(
                        security.ipMonitoring ??
                        server.ip_monitoring,
                        "true"
                    ),

                suspicious_ip_blocking:
                    toStringBoolean(
                        security.suspiciousIpBlocking ??
                        server.suspicious_ip_blocking,
                        "true"
                    ),

                ip_failed_login_threshold:
                    safeString(
                        security.ipFailedLoginThreshold ??
                        server.ip_failed_login_threshold,
                        "10"
                    ),

                ip_block_duration:
                    safeString(
                        security.ipBlockDuration ??
                        server.ip_block_duration,
                        "60"
                    ),

                security_alert_failed_login:
                    toStringBoolean(
                        security.securityAlertFailedLogin ??
                        server.security_alert_failed_login,
                        "true"
                    ),

                security_alert_account_lock:
                    toStringBoolean(
                        security.securityAlertAccountLock ??
                        server.security_alert_account_lock,
                        "true"
                    ),

                security_alert_suspicious_ip:
                    toStringBoolean(
                        security.securityAlertSuspiciousIp ??
                        server.security_alert_suspicious_ip,
                        "true"
                    ),

                security_alert_admin_login:
                    toStringBoolean(
                        security.securityAlertAdminLogin ??
                        server.security_alert_admin_login,
                        "true"
                    ),

                security_alert_password_change:
                    toStringBoolean(
                        security.securityAlertPasswordChange ??
                        server.security_alert_password_change,
                        "true"
                    ),

                security_alert_new_device:
                    toStringBoolean(
                        security.securityAlertNewDevice ??
                        server.security_alert_new_device,
                        "true"
                    ),

                security_admin_alerts:
                    toStringBoolean(
                        security.securityAdminAlerts ??
                        server.security_admin_alerts,
                        "true"
                    ),

                audit_logging:
                    toStringBoolean(
                        security.auditLogging ??
                        server.audit_logging,
                        "true"
                    ),


                /* =========================================
                   BACKUP
                ========================================= */

                auto_backup:
                    toStringBoolean(
                        backup.automaticBackups ??
                        server.auto_backup,
                        "false"
                    ),

                backup_frequency:
                    safeString(
                        backup.backupFrequency ??
                        server.backup_frequency,
                        "daily"
                    ),

                backup_retention_days:
                    safeString(
                        backup.retentionDays ??
                        server.backup_retention_days,
                        "30"
                    ),


                /* =========================================
                   ANALYTICS
                ========================================= */

                analytics_enabled:
                    toStringBoolean(
                        analytics.enabled ??
                        server.analytics_enabled,
                        "false"
                    ),

                google_analytics_id:
                    safeString(
                        analytics.googleAnalyticsId ??
                        server.google_analytics_id
                    ),

                google_tag_manager_id:
                    safeString(
                        analytics.googleTagManagerId ??
                        server.google_tag_manager_id
                    ),

                facebook_pixel_id:
                    safeString(
                        analytics.facebookPixelId ??
                        server.facebook_pixel_id
                    ),

                google_search_console_verification:
                    safeString(
                        analytics.googleSearchConsoleVerification ??
                        server.google_search_console_verification
                    ),

                google_search_console:
                    safeString(
                        analytics.googleSearchConsoleVerification ??
                        server.google_search_console
                    ),

                anonymous_analytics:
                    toStringBoolean(
                        analytics.anonymousAnalytics ??
                        server.anonymous_analytics,
                        "true"
                    ),


                /* =========================================
                   SEO
                ========================================= */

                seo_title:
                    safeString(
                        seo.title ??
                        server.seo_title
                    ),

                seo_description:
                    safeString(
                        seo.description ??
                        server.seo_description
                    ),

                seo_keywords:
                    safeString(
                        seo.keywords ??
                        server.seo_keywords
                    ),

                google_site_verification:
                    safeString(
                        seo.googleSiteVerification ??
                        server.google_site_verification
                    ),

                og_title:
                    safeString(
                        seo.openGraphTitle ??
                        server.og_title
                    ),

                og_description:
                    safeString(
                        seo.openGraphDescription ??
                        server.og_description
                    ),

                search_engine_indexing:
                    toStringBoolean(
                        seo.searchEngineIndexing ??
                        server.search_engine_indexing,
                        "true"
                    ),

                enable_sitemap:
                    toStringBoolean(
                        seo.sitemapEnabled ??
                        server.enable_sitemap,
                        "true"
                    ),


                /*
                =================================================
                KEEP ORIGINAL CONFIGURATION
                =================================================
                */

                configuration

            };

        },
        []
    );


    /* =====================================================
       LOAD SETTINGS
    ===================================================== */

    const loadSettings = useCallback(
        async () => {

            try {

                setLoading(true);

                setErrorMessage("");
                setMessage("");


                const response =
                    await api.get(
                        "/admin/settings"
                    );


                console.log(
                    "ADMIN SETTINGS RESPONSE:",
                    response.data
                );


                if (
                    !response.data?.success
                ) {

                    throw new Error(
                        response.data?.message ||
                        "Failed to load settings."
                    );

                }


                const serverSettings =
                    response.data.settings;


                const normalizedSettings =
                    normalizeServerSettings(
                        serverSettings
                    );


                setSettings(
                    normalizedSettings
                );


            } catch (error) {

                console.error(
                    "LOAD ADMIN SETTINGS ERROR:",
                    error
                );


                if (
                    error.response?.status === 401
                ) {

                    setErrorMessage(
                        "Your session has expired. Please log in again."
                    );

                } else if (
                    error.response?.status === 403
                ) {

                    setErrorMessage(
                        "You do not have permission to access Admin Settings."
                    );

                } else {

                    setErrorMessage(
                        error.response?.data?.message ||
                        error.message ||
                        "Failed to load settings."
                    );

                }

            } finally {

                setLoading(false);

            }

        },
        [
            normalizeServerSettings
        ]
    );


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(
        () => {

            loadSettings();

        },
        [loadSettings]
    );


    /* =====================================================
       HANDLE CHANGE
    ===================================================== */

    const handleChange = useCallback(
        (key, value) => {

            const nextValue =
                value === null ||
                value === undefined
                    ? ""
                    : value;


            setSettings(
                previousSettings => {

                    /*
                    =========================================
                    NESTED CONFIGURATION UPDATE
                    =========================================
                    */

                    if (
                        key === "configuration"
                    ) {

                        return {

                            ...previousSettings,

                            configuration: {

                                ...(
                                    previousSettings.configuration ||
                                    {}
                                ),

                                ...nextValue

                            }

                        };

                    }


                    /*
                    =========================================
                    NORMAL SETTING
                    =========================================
                    */

                    return {

                        ...previousSettings,

                        [key]:
                            nextValue

                    };

                }
            );


            setMessage("");
            setErrorMessage("");

        },
        []
    );


    /* =====================================================
       BUILD MARKETPLACE CONFIGURATION
    ===================================================== */

    const buildMarketplaceConfiguration =
        useCallback(
            () => {

                return {

                    description:
                        settings.marketplace_description,

                    primaryColor:
                        settings.primary_color,

                    secondaryColor:
                        settings.secondary_color,

                    maxProductImages:
                        Number(
                            settings.max_product_images
                        ) || 5,

                    maxProductsPerUser:
                        Number(
                            settings.max_products_per_user
                        ) || 50,

                    maxProductPrice:
                        Number(
                            settings.max_product_price
                        ) || 1000000,

                    promotionPrice:
                        Number(
                            settings.promotion_price
                        ) || 0,

                    advertisementPrice:
                        Number(
                            settings.advertisement_price
                        ) || 0,

                    allowProductPosting:
                        settings.allow_product_posting === "true",

                    requireProductApproval:
                        settings.require_product_approval === "true",

                    requireStoreVerification:
                        settings.require_store_verification === "true",

                    allowGuestBrowsing:
                        settings.allow_guest_browsing === "true",

                    allowGuestMessaging:
                        settings.allow_guest_messaging === "true",

                    allowProductReviews:
                        settings.allow_product_reviews === "true",

                    allowSellerReviews:
                        settings.allow_seller_reviews === "true",

                    developerMode:
                        settings.developer_mode === "true"

                };

            },
            [settings]
        );


    /* =====================================================
       BUILD PAYMENT CONFIGURATION
    ===================================================== */

    const buildPaymentConfiguration =
        useCallback(
            () => {

                return {

                    enabled:
                        settings.payment_enabled === "true",

                    mobileMoneyEnabled:
                        settings.mobile_money_enabled === "true",

                    cardEnabled:
                        settings.card_enabled === "true",

                    bankTransferEnabled:
                        settings.bank_transfer_enabled === "true",

                    gateway:
                        settings.payment_provider,

                    minimumTransaction:
                        Number(
                            settings.minimum_transaction
                        ) || 1,

                    maximumTransaction:
                        Number(
                            settings.maximum_transaction
                        ) || 1000000,

                    paymentCurrency:
                        settings.currency_code,

                    transactionFee:
                        Number(
                            settings.transaction_fee
                        ) || 0,

                    autoConfirmPayments:
                        settings.auto_confirm_payments === "true",

                    paymentNotifications:
                        settings.payment_notifications === "true"

                };

            },
            [settings]
        );


    /* =====================================================
       BUILD EMAIL CONFIGURATION
    ===================================================== */

    const buildEmailConfiguration =
        useCallback(
            () => {

                return {

                    enabled:
                        settings.email_enabled === "true",

                    provider:
                        settings.email_provider ||
                        "resend",

                    resendFromName:
                        settings.resend_from_name ||
                        "KAD Marketplace",

                    resendFromEmail:
                        settings.resend_from_email,

                    smtpHost:
                        settings.smtp_host,

                    smtpPort:
                        Number(
                            settings.smtp_port
                        ) || 587,

                    smtpUsername:
                        settings.smtp_username,

                    smtpPassword:
                        settings.smtp_password,

                    encryption:
                        settings.smtp_encryption,

                    fromName:
                        settings.smtp_from_name,

                    fromEmail:
                        settings.smtp_from_email,

                    registrationEmail:
                        settings.registration_email === "true",

                    passwordResetEmail:
                        settings.password_reset_email === "true",

                    orderEmail:
                        settings.order_email === "true",

                    paymentEmail:
                        settings.payment_email === "true",

                    subscriptionEmail:
                        settings.subscription_email === "true"

                };

            },
            [settings]
        );


    /* =====================================================
       BUILD NOTIFICATION CONFIGURATION
    ===================================================== */

    const buildNotificationConfiguration =
        useCallback(
            () => {

                return {

                    emailNotifications:
                        settings.email_notifications === "true",

                    welcomeEmail:
                        settings.welcome_email === "true",

                    productNotifications:
                        settings.product_notifications === "true",

                    orderNotifications:
                        settings.order_notifications === "true",

                    paymentNotifications:
                        settings.payment_notifications === "true",

                    sellerNotifications:
                        settings.seller_notifications === "true",

                    adminAlerts:
                        settings.admin_notifications === "true",

                    securityAlerts:
                        settings.security_alerts === "true",

                    maintenanceAlerts:
                        settings.maintenance_alerts === "true",

                    promotionalNotifications:
                        settings.promotional_notifications === "true",

                    smsEnabled:
                        settings.sms_enabled === "true",

                    smsProvider:
                        settings.sms_provider

                };

            },
            [settings]
        );


    /* =====================================================
       BUILD SECURITY CONFIGURATION
    ===================================================== */

    const buildSecurityConfiguration =
        useCallback(
            () => {

                return {

                    maxFailedLoginAttempts:
                        Math.max(
                            1,
                            Number(
                                settings.login_attempt_limit
                            ) || 5
                        ),

                    accountLockDuration:
                        Math.max(
                            1,
                            Number(
                                settings.account_lock_duration
                            ) || 30
                        ),

                    sessionTimeout:
                        Math.max(
                            5,
                            Number(
                                settings.session_timeout
                            ) || 120
                        ),

                    twoFactorEnabled:
                        settings.two_factor_authentication === "true",

                    requireAdminTwoFactor:
                        settings.require_admin_two_factor === "true",

                    requireStrongPasswords:
                        settings.require_strong_passwords === "true",

                    minimumPasswordLength:
                        Math.max(
                            6,
                            Number(
                                settings.password_min_length
                            ) || 8
                        ),

                    requireUppercasePassword:
                        settings.require_uppercase_password === "true",

                    requireLowercasePassword:
                        settings.require_lowercase_password === "true",

                    requireNumberPassword:
                        settings.require_number_password === "true",

                    requireSpecialCharacter:
                        settings.require_special_character === "true",

                    passwordHistoryCount:
                        Math.max(
                            0,
                            Number(
                                settings.password_history_count
                            ) || 0
                        ),

                    passwordExpiryEnabled:
                        settings.password_expiry_enabled === "true",

                    passwordExpiryDays:
                        Math.max(
                            1,
                            Number(
                                settings.password_expiry_days
                            ) || 90
                        ),

                    ipMonitoring:
                        settings.ip_monitoring === "true",

                    suspiciousIpBlocking:
                        settings.suspicious_ip_blocking === "true",

                    ipFailedLoginThreshold:
                        Math.max(
                            1,
                            Number(
                                settings.ip_failed_login_threshold
                            ) || 10
                        ),

                    ipBlockDuration:
                        Math.max(
                            1,
                            Number(
                                settings.ip_block_duration
                            ) || 60
                        ),

                    securityAlerts:
                        settings.security_alerts === "true",

                    securityAlertFailedLogin:
                        settings.security_alert_failed_login === "true",

                    securityAlertAccountLock:
                        settings.security_alert_account_lock === "true",

                    securityAlertSuspiciousIp:
                        settings.security_alert_suspicious_ip === "true",

                    securityAlertAdminLogin:
                        settings.security_alert_admin_login === "true",

                    securityAlertPasswordChange:
                        settings.security_alert_password_change === "true",

                    securityAlertNewDevice:
                        settings.security_alert_new_device === "true",

                    securityAdminAlerts:
                        settings.security_admin_alerts === "true",

                    auditLogging:
                        settings.audit_logging === "true"

                };

            },
            [settings]
        );


    /* =====================================================
       BUILD BACKUP CONFIGURATION
    ===================================================== */

    const buildBackupConfiguration =
        useCallback(
            () => {

                return {

                    automaticBackups:
                        settings.auto_backup === "true",

                    backupFrequency:
                        settings.backup_frequency,

                    retentionDays:
                        Number(
                            settings.backup_retention_days
                        ) || 30

                };

            },
            [settings]
        );


    /* =====================================================
       BUILD ANALYTICS CONFIGURATION
    ===================================================== */

    const buildAnalyticsConfiguration =
        useCallback(
            () => {

                return {

                    enabled:
                        settings.analytics_enabled === "true",

                    googleAnalyticsId:
                        settings.google_analytics_id,

                    googleTagManagerId:
                        settings.google_tag_manager_id,

                    facebookPixelId:
                        settings.facebook_pixel_id,

                    googleSearchConsoleVerification:
                        settings.google_search_console_verification ||
                        settings.google_search_console,

                    anonymousAnalytics:
                        settings.anonymous_analytics === "true"

                };

            },
            [settings]
        );


    /* =====================================================
       BUILD SEO CONFIGURATION
    ===================================================== */

    const buildSeoConfiguration =
        useCallback(
            () => {

                return {

                    title:
                        settings.seo_title || "",

                    description:
                        settings.seo_description || "",

                    keywords:
                        settings.seo_keywords || "",

                    googleAnalyticsId:
                        settings.google_analytics_id || "",

                    googleSiteVerification:
                        settings.google_site_verification ||
                        settings.google_search_console ||
                        "",

                    openGraphTitle:
                        settings.og_title || "",

                    openGraphDescription:
                        settings.og_description || "",

                    searchEngineIndexing:
                        settings.search_engine_indexing === "true",

                    sitemapEnabled:
                        settings.enable_sitemap === "true"

                };

            },
            [settings]
        );


    /* =====================================================
       BUILD COMPLETE CONFIGURATION
    ===================================================== */

    const buildConfiguration =
        useCallback(
            () => {

                return {

                    /*
                    =========================================
                    PRESERVE UNKNOWN EXISTING SETTINGS
                    =========================================
                    */

                    ...(settings.configuration || {}),


                    /*
                    =========================================
                    MARKETPLACE
                    =========================================
                    */

                    marketplace:
                        buildMarketplaceConfiguration(),


                    /*
                    =========================================
                    PAYMENT
                    =========================================
                    */

                    payment:
                        buildPaymentConfiguration(),


                    /*
                    =========================================
                    EMAIL
                    =========================================
                    */

                    email:
                        buildEmailConfiguration(),


                    /*
                    =========================================
                    NOTIFICATIONS
                    =========================================
                    */

                    notifications:
                        buildNotificationConfiguration(),


                    /*
                    =========================================
                    SECURITY
                    =========================================
                    */

                    security:
                        buildSecurityConfiguration(),


                    /*
                    =========================================
                    BACKUP
                    =========================================
                    */

                    backup:
                        buildBackupConfiguration(),


                    /*
                    =========================================
                    ANALYTICS
                    =========================================
                    */

                    analytics:
                        buildAnalyticsConfiguration(),


                    /*
                    =========================================
                    SEO
                    =========================================
                    */

                    seo:
                        buildSeoConfiguration()

                };

            },
            [
                settings.configuration,
                buildMarketplaceConfiguration,
                buildPaymentConfiguration,
                buildEmailConfiguration,
                buildNotificationConfiguration,
                buildSecurityConfiguration,
                buildBackupConfiguration,
                buildAnalyticsConfiguration,
                buildSeoConfiguration
            ]
        );


    /* =====================================================
       BUILD COMPLETE API PAYLOAD
    ===================================================== */

    const buildSettingsPayload =
        useCallback(
            () => {

                const configuration =
                    buildConfiguration();


                const seo =
                    configuration.seo;


                return {

                    /* =====================================
                       DIRECT DATABASE FIELDS
                    ===================================== */

                    marketplace_name:
                        settings.marketplace_name || "",

                    logo:
                        settings.logo || "",

                    admin_logo:
                        settings.admin_logo || "",

                    favicon:
                        settings.favicon || "",

                    support_email:
                        settings.support_email || "",

                    support_phone:
                        settings.support_phone || "",

                    business_address:
                        settings.business_address || "",

                    currency:
                        settings.currency || "GH₵",

                    language:
                        settings.language || "English",

                    timezone:
                        settings.timezone || "Africa/Accra",

                    maintenance_mode:
                        settings.maintenance_mode === "true",

                    registration_enabled:
                        settings.registration_enabled !== "false",

                    store_registration_enabled:
                        settings.store_registration_enabled !== "false",

                    facebook:
                        settings.facebook || "",

                    instagram:
                        settings.instagram || "",

                    tiktok:
                        settings.tiktok || "",

                    x:
                        settings.x || "",

                    whatsapp:
                        settings.whatsapp || "",

                    is_active:
                        settings.is_active !== "false",


                    /* =====================================
                       COMPLETE CONFIGURATION
                    ===================================== */

                    configuration,


                    /* =====================================
                       LEGACY SEO FIELDS
                    ===================================== */

                    seo_title:
                        seo.title,

                    seo_description:
                        seo.description,

                    seo_keywords:
                        seo.keywords,

                    google_analytics_id:
                        seo.googleAnalyticsId,

                    google_site_verification:
                        seo.googleSiteVerification,

                    og_title:
                        seo.openGraphTitle,

                    og_description:
                        seo.openGraphDescription,

                    search_engine_indexing:
                        seo.searchEngineIndexing,

                    enable_sitemap:
                        seo.sitemapEnabled

                };

            },
            [
                settings,
                buildConfiguration
            ]
        );


    /* =====================================================
       SAVE SETTINGS
    ===================================================== */

    const saveSettings =
        async () => {

            if (saving) {
                return;
            }


            try {

                setSaving(true);

                setMessage("");
                setErrorMessage("");


                const payload =
                    buildSettingsPayload();


                console.log(
                    "===================================="
                );

                console.log(
                    "SAVING ADMIN SETTINGS"
                );

                console.log(
                    "===================================="
                );

                console.log(
                    payload
                );

                console.log(
                    "CONFIGURATION:",
                    payload.configuration
                );

                console.log(
                    "SEO:",
                    payload.configuration?.seo
                );

                console.log(
                    "EMAIL:",
                    payload.configuration?.email
                );


                const response =
                    await api.put(
                        "/admin/settings",
                        payload
                    );


                console.log(
                    "SAVE ADMIN SETTINGS RESPONSE:",
                    response.data
                );


                if (
                    !response.data?.success
                ) {

                    throw new Error(
                        response.data?.message ||
                        "Failed to save settings."
                    );

                }


                /*
                =============================================
                UPDATE STATE WITH DATABASE RESPONSE
                =============================================
                */

                if (
                    response.data?.settings
                ) {

                    const normalized =
                        normalizeServerSettings(
                            response.data.settings
                        );


                    setSettings(
                        normalized
                    );

                }


                setLastSaved(
                    new Date()
                );


                setMessage(
                    response.data.message ||
                    "Marketplace settings saved successfully."
                );


                window.setTimeout(
                    () => {

                        setMessage("");

                    },
                    5000
                );


            } catch (error) {

                console.error(
                    "SAVE ADMIN SETTINGS ERROR:",
                    error
                );


                if (
                    error.response?.status === 401
                ) {

                    setErrorMessage(
                        "Your session has expired. Please log in again."
                    );

                } else if (
                    error.response?.status === 403
                ) {

                    setErrorMessage(
                        "You do not have permission to modify Admin Settings."
                    );

                } else {

                    setErrorMessage(
                        error.response?.data?.message ||
                        error.message ||
                        "Failed to save settings."
                    );

                }

            } finally {

                setSaving(false);

            }

        };


    /* =====================================================
       RELOAD SETTINGS
    ===================================================== */

    const handleReload =
        async () => {

            if (saving) {
                return;
            }

            setMessage("");
            setErrorMessage("");

            await loadSettings();

        };


    /* =====================================================
       LOADING SCREEN
    ===================================================== */

    if (loading) {

        return (

            <div className="settings-loading">

                <div className="settings-loading-card">

                    <div className="settings-loading-spinner" />

                    <h2>
                        Loading Settings...
                    </h2>

                    <p>
                        Please wait while your
                        marketplace settings are loaded.
                    </p>

                </div>

            </div>

        );

    }


    /* =====================================================
       PAGE
    ===================================================== */

    return (

        <div className="settings-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="settings-page-header">

                <div className="settings-header-content">

                    <div className="settings-header-icon">
                        ⚙️
                    </div>

                    <div>

                        <h1>
                            System Settings
                        </h1>

                        <p>
                            Manage and configure your
                            KAD Marketplace system.
                        </p>

                    </div>

                </div>


                <div className="settings-header-actions">

                    {lastSaved && (

                        <span className="settings-last-saved">

                            Last saved{" "}

                            {lastSaved.toLocaleTimeString(
                                [],
                                {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }
                            )}

                        </span>

                    )}


                    <button
                        type="button"
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

            </div>


            {/* =================================================
                SUCCESS
            ================================================= */}

            {message && (

                <div
                    className="settings-success"
                    role="status"
                >

                    <span>
                        ✓
                    </span>

                    <div>

                        <strong>
                            Settings Saved
                        </strong>

                        <p>
                            {message}
                        </p>

                    </div>

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {errorMessage && (

                <div
                    className="settings-error"
                    role="alert"
                >

                    <span>
                        ⚠
                    </span>

                    <div>

                        <strong>
                            Settings Error
                        </strong>

                        <p>
                            {errorMessage}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={handleReload}
                        disabled={saving}
                    >

                        Retry

                    </button>

                </div>

            )}


            {/* =================================================
                GENERAL
            ================================================= */}

            <section className="settings-section">

                <GeneralSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                BRANDING
            ================================================= */}

            <section className="settings-section">

                <BrandingSettings
                    settings={settings}
                    loadSettings={loadSettings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                MARKETPLACE
            ================================================= */}

            <section className="settings-section">

                <MarketplaceSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                PAYMENT
            ================================================= */}

            <section className="settings-section">

                <PaymentSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                EMAIL
            ================================================= */}

            <section className="settings-section">

                <EmailSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <section className="settings-section">

                <NotificationSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                SECURITY
            ================================================= */}

            <section className="settings-section">

                <SecuritySettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                BACKUP
            ================================================= */}

            <section className="settings-section">

                <BackupSettings
                    settings={settings}
                    handleChange={handleChange}
                    token={
                        localStorage.getItem("token")
                    }
                />

            </section>


            {/* =================================================
                SEO
            ================================================= */}

            <section className="settings-section">

                <SeoSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                ANALYTICS
            ================================================= */}

            <section className="settings-section">

                <AnalyticsSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                BOTTOM ACTIONS
            ================================================= */}

            <div className="settings-actions">

                <button
                    type="button"
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
                    type="button"
                    className="reset-settings-btn"
                    onClick={handleReload}
                    disabled={saving}
                >

                    ↻ Reload Settings

                </button>

            </div>

        </div>

    );

}


export default Settings;
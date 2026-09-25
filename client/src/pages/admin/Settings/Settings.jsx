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

    currency: "GH₵",

    support_email: "",

    support_phone: "",

    default_language: "English",

    timezone: "Africa/Accra",

    developer_mode: "false",


    /* =====================================================
       DIRECT MARKETPLACE CONTROL
    ===================================================== */

    maintenance_mode: "false",

    allow_registration: "true",

    allow_store_creation: "true",


    /* =====================================================
       BRANDING
    ===================================================== */

    logo: "",

    admin_logo: "",

    favicon: "",


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

    login_attempt_limit: "5",

    session_timeout: "120",

    account_lock_duration: "30",

    password_min_length: "8",

    password_expiry_enabled: "false",

    password_expiry_days: "90",

    ip_monitoring: "true",

    suspicious_ip_blocking: "true",

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
   BOOLEAN NORMALIZER
========================================================= */

const toStringBoolean = (
    value,
    fallback = "false"
) => {

    if (
        value === true ||
        value === 1 ||
        value === "true" ||
        value === "1" ||
        value === "yes"
    ) {
        return "true";
    }


    if (
        value === false ||
        value === 0 ||
        value === "false" ||
        value === "0" ||
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
       NORMALIZE DATABASE SETTINGS
    ===================================================== */

    const normalizeServerSettings =
        useCallback(
            (serverSettings) => {

                const normalized = {
                    ...DEFAULT_SETTINGS
                };


                if (
                    !serverSettings ||
                    typeof serverSettings !== "object" ||
                    Array.isArray(serverSettings)
                ) {

                    return normalized;

                }


                /* =================================================
                   DIRECT DATABASE SETTINGS
                ================================================= */

                normalized.marketplace_name =
                    safeString(
                        serverSettings.marketplace_name,
                        DEFAULT_SETTINGS.marketplace_name
                    );


                normalized.currency =
                    safeString(
                        serverSettings.currency,
                        DEFAULT_SETTINGS.currency
                    );


                normalized.support_email =
                    safeString(
                        serverSettings.support_email
                    );


                normalized.support_phone =
                    safeString(
                        serverSettings.support_phone
                    );


                normalized.default_language =
                    safeString(
                        serverSettings.language,
                        DEFAULT_SETTINGS.default_language
                    );


                normalized.timezone =
                    safeString(
                        serverSettings.timezone,
                        DEFAULT_SETTINGS.timezone
                    );


                normalized.logo =
                    safeString(
                        serverSettings.logo
                    );


                normalized.admin_logo =
                    safeString(
                        serverSettings.admin_logo
                    );


                normalized.favicon =
                    safeString(
                        serverSettings.favicon
                    );


                /* =================================================
                   DIRECT MARKETPLACE CONTROL
                ================================================= */

                normalized.maintenance_mode =
                    toStringBoolean(
                        serverSettings.maintenance_mode,
                        DEFAULT_SETTINGS.maintenance_mode
                    );


                normalized.allow_registration =
                    toStringBoolean(
                        serverSettings.registration_enabled,
                        DEFAULT_SETTINGS.allow_registration
                    );


                normalized.allow_store_creation =
                    toStringBoolean(
                        serverSettings.store_registration_enabled,
                        DEFAULT_SETTINGS.allow_store_creation
                    );


                /* =================================================
                   CONFIGURATION OBJECT
                ================================================= */

                const configuration =
                    serverSettings.configuration &&
                    typeof serverSettings.configuration === "object"
                        ? serverSettings.configuration
                        : {};


                /* =================================================
                   MARKETPLACE
                ================================================= */

                const marketplace =
                    configuration.marketplace || {};


                normalized.marketplace_description =
                    safeString(
                        marketplace.description
                    );


                normalized.primary_color =
                    safeString(
                        marketplace.primaryColor,
                        DEFAULT_SETTINGS.primary_color
                    );


                normalized.secondary_color =
                    safeString(
                        marketplace.secondaryColor,
                        DEFAULT_SETTINGS.secondary_color
                    );


                normalized.max_product_images =
                    safeString(
                        marketplace.maxProductImages,
                        DEFAULT_SETTINGS.max_product_images
                    );


                normalized.max_products_per_user =
                    safeString(
                        marketplace.maxProductsPerUser,
                        DEFAULT_SETTINGS.max_products_per_user
                    );


                normalized.max_product_price =
                    safeString(
                        marketplace.maxProductPrice,
                        DEFAULT_SETTINGS.max_product_price
                    );


                normalized.promotion_price =
                    safeString(
                        marketplace.promotionPrice
                    );


                normalized.advertisement_price =
                    safeString(
                        marketplace.advertisementPrice
                    );


                normalized.allow_product_posting =
                    toStringBoolean(
                        marketplace.allowProductPosting,
                        DEFAULT_SETTINGS.allow_product_posting
                    );


                normalized.require_product_approval =
                    toStringBoolean(
                        marketplace.requireProductApproval,
                        DEFAULT_SETTINGS.require_product_approval
                    );


                normalized.require_store_verification =
                    toStringBoolean(
                        marketplace.requireStoreVerification,
                        DEFAULT_SETTINGS.require_store_verification
                    );


                normalized.allow_guest_browsing =
                    toStringBoolean(
                        marketplace.allowGuestBrowsing,
                        DEFAULT_SETTINGS.allow_guest_browsing
                    );


                normalized.allow_guest_messaging =
                    toStringBoolean(
                        marketplace.allowGuestMessaging,
                        DEFAULT_SETTINGS.allow_guest_messaging
                    );


                normalized.allow_product_reviews =
                    toStringBoolean(
                        marketplace.allowProductReviews,
                        DEFAULT_SETTINGS.allow_product_reviews
                    );


                normalized.allow_seller_reviews =
                    toStringBoolean(
                        marketplace.allowSellerReviews,
                        DEFAULT_SETTINGS.allow_seller_reviews
                    );


                /* =================================================
                   DEVELOPER MODE
                ================================================= */

                normalized.developer_mode =
                    toStringBoolean(
                        marketplace.developerMode,
                        DEFAULT_SETTINGS.developer_mode
                    );


                /* =================================================
                   PAYMENT
                ================================================= */

                const payment =
                    configuration.payment || {};


                normalized.payment_enabled =
                    toStringBoolean(
                        payment.enabled,
                        DEFAULT_SETTINGS.payment_enabled
                    );


                normalized.mobile_money_enabled =
                    toStringBoolean(
                        payment.mobileMoneyEnabled,
                        DEFAULT_SETTINGS.mobile_money_enabled
                    );


                normalized.card_enabled =
                    toStringBoolean(
                        payment.cardEnabled,
                        DEFAULT_SETTINGS.card_enabled
                    );


                normalized.bank_transfer_enabled =
                    toStringBoolean(
                        payment.bankTransferEnabled,
                        DEFAULT_SETTINGS.bank_transfer_enabled
                    );


                normalized.payment_provider =
                    safeString(
                        payment.gateway,
                        DEFAULT_SETTINGS.payment_provider
                    );


                normalized.currency_code =
                    safeString(
                        payment.paymentCurrency,
                        DEFAULT_SETTINGS.currency_code
                    );


                normalized.minimum_transaction =
                    safeString(
                        payment.minimumTransaction,
                        DEFAULT_SETTINGS.minimum_transaction
                    );


                normalized.maximum_transaction =
                    safeString(
                        payment.maximumTransaction,
                        DEFAULT_SETTINGS.maximum_transaction
                    );


                normalized.transaction_fee =
                    safeString(
                        payment.transactionFee,
                        DEFAULT_SETTINGS.transaction_fee
                    );


                normalized.auto_confirm_payments =
                    toStringBoolean(
                        payment.autoConfirmPayments,
                        DEFAULT_SETTINGS.auto_confirm_payments
                    );


                normalized.payment_notifications =
                    toStringBoolean(
                        payment.paymentNotifications,
                        DEFAULT_SETTINGS.payment_notifications
                    );


                /* =================================================
                   EMAIL
                ================================================= */

                const email =
                    configuration.email || {};


                normalized.email_enabled =
                    toStringBoolean(
                        email.enabled,
                        DEFAULT_SETTINGS.email_enabled
                    );


                normalized.smtp_host =
                    safeString(
                        email.smtpHost
                    );


                normalized.smtp_port =
                    safeString(
                        email.smtpPort,
                        DEFAULT_SETTINGS.smtp_port
                    );


                normalized.smtp_username =
                    safeString(
                        email.smtpUsername
                    );


                normalized.smtp_password =
                    safeString(
                        email.smtpPassword
                    );


                normalized.smtp_encryption =
                    safeString(
                        email.encryption,
                        DEFAULT_SETTINGS.smtp_encryption
                    );


                normalized.smtp_from_email =
                    safeString(
                        email.fromEmail
                    );


                normalized.smtp_from_name =
                    safeString(
                        email.fromName,
                        DEFAULT_SETTINGS.smtp_from_name
                    );


                normalized.registration_email =
                    toStringBoolean(
                        email.registrationEmail,
                        DEFAULT_SETTINGS.registration_email
                    );


                normalized.password_reset_email =
                    toStringBoolean(
                        email.passwordResetEmail,
                        DEFAULT_SETTINGS.password_reset_email
                    );


                normalized.order_email =
                    toStringBoolean(
                        email.orderEmail,
                        DEFAULT_SETTINGS.order_email
                    );


                normalized.payment_email =
                    toStringBoolean(
                        email.paymentEmail,
                        DEFAULT_SETTINGS.payment_email
                    );


                /* =================================================
                   NOTIFICATIONS
                ================================================= */

                const notifications =
                    configuration.notifications || {};


                normalized.email_notifications =
                    toStringBoolean(
                        notifications.emailNotifications,
                        DEFAULT_SETTINGS.email_notifications
                    );


                normalized.welcome_email =
                    toStringBoolean(
                        notifications.welcomeEmail,
                        DEFAULT_SETTINGS.welcome_email
                    );


                normalized.product_notifications =
                    toStringBoolean(
                        notifications.productNotifications,
                        DEFAULT_SETTINGS.product_notifications
                    );


                normalized.order_notifications =
                    toStringBoolean(
                        notifications.orderNotifications,
                        DEFAULT_SETTINGS.order_notifications
                    );


                normalized.payment_notifications =
                    toStringBoolean(
                        notifications.paymentNotifications,
                        DEFAULT_SETTINGS.payment_notifications
                    );


                normalized.seller_notifications =
                    toStringBoolean(
                        notifications.sellerNotifications,
                        DEFAULT_SETTINGS.seller_notifications
                    );


                normalized.admin_notifications =
                    toStringBoolean(
                        notifications.adminAlerts,
                        DEFAULT_SETTINGS.admin_notifications
                    );


                normalized.security_alerts =
                    toStringBoolean(
                        notifications.securityAlerts,
                        DEFAULT_SETTINGS.security_alerts
                    );


                normalized.maintenance_alerts =
                    toStringBoolean(
                        notifications.maintenanceAlerts,
                        DEFAULT_SETTINGS.maintenance_alerts
                    );


                normalized.promotional_notifications =
                    toStringBoolean(
                        notifications.promotionalNotifications,
                        DEFAULT_SETTINGS.promotional_notifications
                    );


                normalized.sms_enabled =
                    toStringBoolean(
                        notifications.smsEnabled,
                        DEFAULT_SETTINGS.sms_enabled
                    );


                normalized.sms_provider =
                    safeString(
                        notifications.smsProvider
                    );


                /* =================================================
                   SECURITY
                ================================================= */

                const security =
                    configuration.security || {};


                normalized.two_factor_authentication =
                    toStringBoolean(
                        security.twoFactorEnabled,
                        DEFAULT_SETTINGS.two_factor_authentication
                    );


                normalized.login_attempt_limit =
                    safeString(
                        security.maxFailedLoginAttempts,
                        DEFAULT_SETTINGS.login_attempt_limit
                    );


                normalized.session_timeout =
                    safeString(
                        security.sessionTimeout,
                        DEFAULT_SETTINGS.session_timeout
                    );


                normalized.account_lock_duration =
                    safeString(
                        security.accountLockDuration,
                        DEFAULT_SETTINGS.account_lock_duration
                    );


                normalized.password_min_length =
                    safeString(
                        security.minimumPasswordLength,
                        DEFAULT_SETTINGS.password_min_length
                    );


                normalized.password_expiry_enabled =
                    toStringBoolean(
                        security.passwordExpiryEnabled,
                        DEFAULT_SETTINGS.password_expiry_enabled
                    );


                normalized.password_expiry_days =
                    safeString(
                        security.passwordExpiryDays,
                        DEFAULT_SETTINGS.password_expiry_days
                    );


                normalized.ip_monitoring =
                    toStringBoolean(
                        security.ipMonitoring,
                        DEFAULT_SETTINGS.ip_monitoring
                    );


                normalized.suspicious_ip_blocking =
                    toStringBoolean(
                        security.suspiciousIpBlocking,
                        DEFAULT_SETTINGS.suspicious_ip_blocking
                    );


                normalized.audit_logging =
                    toStringBoolean(
                        security.auditLogging,
                        DEFAULT_SETTINGS.audit_logging
                    );


                /* =================================================
                   BACKUP
                ================================================= */

                const backup =
                    configuration.backup || {};


                normalized.auto_backup =
                    toStringBoolean(
                        backup.automaticBackups,
                        DEFAULT_SETTINGS.auto_backup
                    );


                normalized.backup_frequency =
                    safeString(
                        backup.backupFrequency,
                        DEFAULT_SETTINGS.backup_frequency
                    );


                normalized.backup_retention_days =
                    safeString(
                        backup.retentionDays,
                        DEFAULT_SETTINGS.backup_retention_days
                    );


                /* =================================================
                   ANALYTICS
                ================================================= */

                const analytics =
                    configuration.analytics || {};


                normalized.analytics_enabled =
                    toStringBoolean(
                        analytics.enabled,
                        DEFAULT_SETTINGS.analytics_enabled
                    );


                normalized.google_analytics_id =
                    safeString(
                        analytics.googleAnalyticsId
                    );


                normalized.google_tag_manager_id =
                    safeString(
                        analytics.googleTagManagerId
                    );


                normalized.facebook_pixel_id =
                    safeString(
                        analytics.facebookPixelId
                    );


                normalized.google_search_console_verification =
                    safeString(
                        analytics.googleSearchConsoleVerification
                    );


                normalized.google_search_console =
                    normalized.google_search_console_verification;


                normalized.anonymous_analytics =
                    toStringBoolean(
                        analytics.anonymousAnalytics,
                        DEFAULT_SETTINGS.anonymous_analytics
                    );


                /* =================================================
                   SEO
                ================================================= */

                const seo =
                    configuration.seo || {};


                normalized.seo_title =
                    safeString(
                        seo.title,
                        serverSettings.seo_title || ""
                    );


                normalized.seo_description =
                    safeString(
                        seo.description,
                        serverSettings.seo_description || ""
                    );


                normalized.seo_keywords =
                    safeString(
                        seo.keywords
                    );


                normalized.google_site_verification =
                    safeString(
                        seo.googleSiteVerification
                    );


                normalized.og_title =
                    safeString(
                        seo.openGraphTitle
                    );


                normalized.og_description =
                    safeString(
                        seo.openGraphDescription
                    );


                normalized.search_engine_indexing =
                    toStringBoolean(
                        seo.searchEngineIndexing,
                        DEFAULT_SETTINGS.search_engine_indexing
                    );


                normalized.enable_sitemap =
                    toStringBoolean(
                        seo.sitemapEnabled,
                        DEFAULT_SETTINGS.enable_sitemap
                    );


                return normalized;

            },
            []
        );


    /* =====================================================
       LOAD SETTINGS
    ===================================================== */

    const loadSettings =
        useCallback(
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
       HANDLE SETTING CHANGE
    ===================================================== */

    const handleChange =
        useCallback(
            (key, value) => {

                setSettings(
                    previousSettings => ({

                        ...previousSettings,

                        [key]:
                            value === null ||
                            value === undefined
                                ? ""
                                : value

                    })
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

                /*
                 * FIX:
                 * Developer mode is now persisted.
                 */
                developerMode:
                    settings.developer_mode === "true"

            };

        };


    /* =====================================================
       BUILD PAYMENT CONFIGURATION
    ===================================================== */

    const buildPaymentConfiguration =
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

        };


    /* =====================================================
       BUILD EMAIL CONFIGURATION
    ===================================================== */

    const buildEmailConfiguration =
        () => {

            return {

                enabled:
                    settings.email_enabled === "true",

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
                    settings.payment_email === "true"

            };

        };


    /* =====================================================
       BUILD NOTIFICATION CONFIGURATION
    ===================================================== */

    const buildNotificationConfiguration =
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

        };


    /* =====================================================
       BUILD SECURITY CONFIGURATION
    ===================================================== */

    const buildSecurityConfiguration =
        () => {

            return {

                maxFailedLoginAttempts:
                    Number(
                        settings.login_attempt_limit
                    ) || 5,

                accountLockDuration:
                    Number(
                        settings.account_lock_duration
                    ) || 30,

                sessionTimeout:
                    Number(
                        settings.session_timeout
                    ) || 120,

                twoFactorEnabled:
                    settings.two_factor_authentication === "true",

                requireStrongPasswords:
                    Number(
                        settings.password_min_length
                    ) >= 8,

                minimumPasswordLength:
                    Number(
                        settings.password_min_length
                    ) || 8,

                passwordExpiryEnabled:
                    settings.password_expiry_enabled === "true",

                passwordExpiryDays:
                    Number(
                        settings.password_expiry_days
                    ) || 90,

                ipMonitoring:
                    settings.ip_monitoring === "true",

                suspiciousIpBlocking:
                    settings.suspicious_ip_blocking === "true",

                auditLogging:
                    settings.audit_logging === "true"

            };

        };


    /* =====================================================
       BUILD ANALYTICS CONFIGURATION
    ===================================================== */

    const buildAnalyticsConfiguration =
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

        };


    /* =====================================================
       BUILD SEO CONFIGURATION
    ===================================================== */

    const buildSeoConfiguration =
        () => {

            return {

                title:
                    settings.seo_title,

                description:
                    settings.seo_description,

                keywords:
                    settings.seo_keywords,

                googleAnalyticsId:
                    settings.google_analytics_id,

                googleSiteVerification:
                    settings.google_site_verification ||
                    settings.google_search_console,

                openGraphTitle:
                    settings.og_title,

                openGraphDescription:
                    settings.og_description,

                searchEngineIndexing:
                    settings.search_engine_indexing === "true",

                sitemapEnabled:
                    settings.enable_sitemap === "true"

            };

        };


    /* =====================================================
       BUILD BACKUP CONFIGURATION
    ===================================================== */

    const buildBackupConfiguration =
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

        };


    /* =====================================================
       BUILD COMPLETE DATABASE PAYLOAD
    ===================================================== */

    const buildSettingsPayload =
        () => {

            return {

                /* =============================================
                   DIRECT DATABASE FIELDS
                ============================================= */

                marketplace_name:
                    settings.marketplace_name,

                logo:
                    settings.logo,

                admin_logo:
                    settings.admin_logo,

                favicon:
                    settings.favicon,

                support_email:
                    settings.support_email,

                support_phone:
                    settings.support_phone,

                currency:
                    settings.currency,

                language:
                    settings.default_language,

                timezone:
                    settings.timezone,

                maintenance_mode:
                    settings.maintenance_mode === "true",

                registration_enabled:
                    settings.allow_registration !== "false",

                store_registration_enabled:
                    settings.allow_store_creation !== "false",

                seo_title:
                    settings.seo_title,

                seo_description:
                    settings.seo_description,


                /* =============================================
                   ADVANCED DATABASE CONFIGURATION
                ============================================= */

                configuration: {

                    marketplace:
                        buildMarketplaceConfiguration(),

                    payment:
                        buildPaymentConfiguration(),

                    email:
                        buildEmailConfiguration(),

                    notifications:
                        buildNotificationConfiguration(),

                    security:
                        buildSecurityConfiguration(),

                    analytics:
                        buildAnalyticsConfiguration(),

                    seo:
                        buildSeoConfiguration(),

                    backup:
                        buildBackupConfiguration()

                }

            };

        };


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
                    "SAVING ADMIN SETTINGS:",
                    payload
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
                =================================================
                   UPDATE FRONTEND WITH DATABASE RESPONSE
                =================================================
                */

                if (
                    response.data.settings
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
                PAGE HEADER
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
                SUCCESS MESSAGE
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
                ERROR MESSAGE
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
                GENERAL SETTINGS
            ================================================= */}

            <section className="settings-section">

                <GeneralSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                BRANDING SETTINGS
            ================================================= */}

            <section className="settings-section">

                <BrandingSettings
                    settings={settings}
                    loadSettings={loadSettings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                MARKETPLACE SETTINGS
            ================================================= */}

            <section className="settings-section">

                <MarketplaceSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                PAYMENT SETTINGS
            ================================================= */}

            <section className="settings-section">

                <PaymentSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                EMAIL SETTINGS
            ================================================= */}

            <section className="settings-section">

                <EmailSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                NOTIFICATION SETTINGS
            ================================================= */}

            <section className="settings-section">

                <NotificationSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                SECURITY SETTINGS
            ================================================= */}

            <section className="settings-section">

                <SecuritySettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                BACKUP SETTINGS
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
                SEO SETTINGS
            ================================================= */}

            <section className="settings-section">

                <SeoSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                ANALYTICS SETTINGS
            ================================================= */}

            <section className="settings-section">

                <AnalyticsSettings
                    settings={settings}
                    handleChange={handleChange}
                />

            </section>


            {/* =================================================
                BOTTOM ACTION BAR
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
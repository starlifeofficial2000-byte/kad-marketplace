const MarketplaceSetting = require("../models/MarketplaceSetting");

/*
=====================================================
 DEFAULT CONFIGURATION
=====================================================
*/

const DEFAULT_CONFIGURATION = {
    marketplace: {
        description: "",
        primaryColor: "#0A66C2",
        secondaryColor: "#198754",
        requireStoreVerification: true,
        requireProductApproval: true,
        allowGuestBrowsing: true,
        allowGuestMessaging: false,
        allowProductReviews: true,
        allowSellerReviews: true,
        maxProductImages: 5,
        maxProductPrice: 1000000
    },

    payment: {
        enabled: true,
        mobileMoneyEnabled: true,
        cardEnabled: true,
        bankTransferEnabled: true,
        gateway: "paystack",
        minimumTransaction: 1,
        maximumTransaction: 1000000,
        paymentCurrency: "GHS",
        autoConfirmPayments: false,
        paymentNotifications: true
    },

    email: {
        enabled: true,
        provider: "resend",
        resendFromName: "KAD Marketplace",
        resendFromEmail: "",
        smtpHost: "",
        smtpPort: 587,
        smtpUsername: "",
        smtpPassword: "",
        encryption: "tls",
        fromName: "KAD Marketplace",
        fromEmail: "",
        registrationEmail: true,
        passwordResetEmail: true,
        orderEmail: true,
        paymentEmail: true,
        subscriptionEmail: true
    },

    notifications: {
        emailNotifications: true,
        welcomeEmail: true,
        productNotifications: true,
        orderNotifications: true,
        paymentNotifications: true,
        sellerNotifications: true,
        adminAlerts: true,
        securityAlerts: true,
        maintenanceAlerts: true,
        promotionalNotifications: true,
        smsEnabled: false,
        smsProvider: ""
    },

    security: {
        maxFailedLoginAttempts: 5,
        accountLockDuration: 30,
        sessionTimeout: 120,
        twoFactorEnabled: false,
        requireStrongPasswords: true,
        minimumPasswordLength: 8,
        passwordExpiryEnabled: false,
        passwordExpiryDays: 90,
        ipMonitoring: true,
        suspiciousIpBlocking: true,
        auditLogging: true
    },

    analytics: {
        enabled: false,
        googleAnalyticsId: "",
        googleTagManagerId: "",
        facebookPixelId: "",
        googleSearchConsoleVerification: "",
        anonymousAnalytics: true
    },

    /*
    =================================================
    SEO
    =================================================
    */

    seo: {
        title: "KAD Marketplace | Buy & Sell in Ghana",

        description:
            "KAD Marketplace is a Ghanaian online marketplace where you can buy and sell products and services across Ghana.",

        keywords:
            "KAD Marketplace, Ghana marketplace, buy and sell Ghana, online marketplace Ghana",

        googleAnalyticsId: "",

        googleSiteVerification: "",

        openGraphTitle:
            "KAD Marketplace | Buy & Sell in Ghana",

        openGraphDescription:
            "Buy and sell products and services across Ghana on KAD Marketplace.",

        searchEngineIndexing: true,

        sitemapEnabled: true
    },

    backup: {
        automaticBackups: false,
        backupFrequency: "daily",
        retentionDays: 30
    }
};


/*
=====================================================
 DEEP MERGE
=====================================================
*/

function deepMerge(base, incoming) {

    if (
        !incoming ||
        typeof incoming !== "object" ||
        Array.isArray(incoming)
    ) {
        return base;
    }

    const result = {
        ...base
    };

    Object.keys(incoming).forEach((key) => {

        const incomingValue = incoming[key];
        const baseValue = base[key];

        if (
            incomingValue &&
            typeof incomingValue === "object" &&
            !Array.isArray(incomingValue) &&
            baseValue &&
            typeof baseValue === "object" &&
            !Array.isArray(baseValue)
        ) {

            result[key] = deepMerge(
                baseValue,
                incomingValue
            );

        } else {

            result[key] = incomingValue;

        }

    });

    return result;
}


/*
=====================================================
 GET / CREATE SETTINGS RECORD
=====================================================
*/

async function getSettingsRecord() {

    let settings =
        await MarketplaceSetting.findOne({
            order: [["id", "ASC"]]
        });

    if (!settings) {

        settings =
            await MarketplaceSetting.create({

                marketplaceName:
                    "KAD Marketplace",

                currency:
                    "GH₵",

                language:
                    "English",

                timezone:
                    "Africa/Accra",

                maintenanceMode:
                    false,

                registrationEnabled:
                    true,

                storeRegistrationEnabled:
                    true,

                configuration:
                    DEFAULT_CONFIGURATION,

                isActive:
                    true

            });

    }

    return settings;
}


/*
=====================================================
 PARSE CONFIGURATION
=====================================================
*/

function parseConfiguration(configuration) {

    if (
        typeof configuration === "string"
    ) {

        try {

            return JSON.parse(
                configuration
            );

        } catch {

            return {};

        }

    }

    return configuration || {};
}


/*
=====================================================
 FORMAT SETTINGS
=====================================================
*/

function formatSettings(record) {

    const data =
        record.toJSON
            ? record.toJSON()
            : record;

    const configuration =
        deepMerge(
            DEFAULT_CONFIGURATION,
            parseConfiguration(
                data.configuration
            )
        );

    return {

        id:
            data.id,

        marketplace_name:
            data.marketplaceName || "",

        logo:
            data.logo || "",

        admin_logo:
            data.adminLogo || "",

        favicon:
            data.favicon || "",

        support_email:
            data.supportEmail || "",

        support_phone:
            data.supportPhone || "",

        business_address:
            data.address || "",

        currency:
            data.currency || "GH₵",

        language:
            data.language || "English",

        timezone:
            data.timezone || "Africa/Accra",

        maintenance_mode:
            Boolean(data.maintenanceMode),

        registration_enabled:
            Boolean(data.registrationEnabled),

        store_registration_enabled:
            Boolean(data.storeRegistrationEnabled),

        facebook:
            data.facebook || "",

        instagram:
            data.instagram || "",

        tiktok:
            data.tiktok || "",

        x:
            data.x || "",

        whatsapp:
            data.whatsapp || "",

        seo_title:
    configuration.seo?.title ||
    data.seoTitle ||
    "",

seo_description:
    configuration.seo?.description ||
    data.seoDescription ||
    "",
        is_active:
            data.isActive !== false,

        configuration

    };
}


/*
=====================================================
 GET MARKETPLACE SETTINGS
=====================================================
*/

async function getMarketplaceSettings() {

    const record =
        await getSettingsRecord();

    return formatSettings(
        record
    );
}


/*
=====================================================
 UPDATE MARKETPLACE SETTINGS
=====================================================
*/

async function updateMarketplaceSettings(
    incoming
) {

    if (
        !incoming ||
        typeof incoming !== "object" ||
        Array.isArray(incoming)
    ) {

        throw new Error(
            "Settings payload must be an object."
        );

    }

    const record =
        await getSettingsRecord();


    /*
    =============================================
    DIRECT DATABASE FIELDS
    =============================================
    */

    const directFields = {

        marketplaceName:
            incoming.marketplace_name,

        logo:
            incoming.logo,

        adminLogo:
            incoming.admin_logo,

        favicon:
            incoming.favicon,

        supportEmail:
            incoming.support_email,

        supportPhone:
            incoming.support_phone,

        address:
            incoming.business_address,

        currency:
            incoming.currency,

        language:
            incoming.language,

        timezone:
            incoming.timezone,

        maintenanceMode:
            incoming.maintenance_mode,

        registrationEnabled:
            incoming.registration_enabled,

        storeRegistrationEnabled:
            incoming.store_registration_enabled,

        facebook:
            incoming.facebook,

        instagram:
            incoming.instagram,

        tiktok:
            incoming.tiktok,

        x:
            incoming.x,

        whatsapp:
            incoming.whatsapp,

        isActive:
            incoming.is_active

    };


    Object.entries(
        directFields
    ).forEach(
        ([key, value]) => {

            if (
                value !== undefined
            ) {

                record[key] =
                    value;

            }

        }
    );


    /*
    =============================================
    CURRENT CONFIGURATION
    =============================================
    */

    const currentConfiguration =
        parseConfiguration(
            record.configuration
        );


    /*
    =============================================
    INCOMING CONFIGURATION
    =============================================
    */

    const incomingConfiguration =
        incoming.configuration &&
        typeof incoming.configuration === "object"
            ? incoming.configuration
            : {};


    /*
    =============================================
    MERGE EVERYTHING
    =============================================
    */

    record.configuration =
        deepMerge(
            DEFAULT_CONFIGURATION,
            deepMerge(
                currentConfiguration,
                incomingConfiguration
            )
        );


    /*
    =============================================
    KEEP SEO DIRECT FIELDS SYNCHRONIZED
    =============================================
    */

    if (
        record.configuration?.seo
    ) {

        if (
            record.configuration.seo.title !== undefined
        ) {

            record.seoTitle =
                record.configuration.seo.title;

        }

        if (
            record.configuration.seo.description !== undefined
        ) {

            record.seoDescription =
                record.configuration.seo.description;

        }

    }


    await record.save();


    return formatSettings(
        record
    );
}


/*
=====================================================
 GET INDIVIDUAL SETTING
=====================================================
*/

async function getSetting(
    key,
    fallback = null
) {

    const settings =
        await getMarketplaceSettings();


    /*
    =============================================
    DIRECT SETTINGS
    =============================================
    */

    const aliases = {

        marketplace_name:
            settings.marketplace_name,

        currency:
            settings.currency,

        maintenance_mode:
            settings.maintenance_mode,

        registration_enabled:
            settings.registration_enabled,

        allow_registration:
            settings.registration_enabled,

        store_registration_enabled:
            settings.store_registration_enabled,

        max_product_images:
            settings.configuration
                ?.marketplace
                ?.maxProductImages,

        require_product_approval:
            settings.configuration
                ?.marketplace
                ?.requireProductApproval

    };


    if (
        Object.prototype.hasOwnProperty.call(
            aliases,
            key
        )
    ) {

        return aliases[key];

    }


    /*
    =============================================
    SEARCH CONFIGURATION
    =============================================
    */

    const sections =
        Object.values(
            settings.configuration || {}
        );


    for (
        const section of sections
    ) {

        if (
            section &&
            typeof section === "object" &&
            Object.prototype.hasOwnProperty.call(
                section,
                key
            )
        ) {

            return section[key];

        }

    }


    return fallback;
}


/*
=====================================================
 BOOLEAN HELPER
=====================================================
*/

function toBoolean(
    value,
    fallback = false
) {

    if (
        value === true ||
        value === false
    ) {

        return value;

    }

    if (
        typeof value === "string"
    ) {

        const normalized =
            value
                .trim()
                .toLowerCase();

        if (
            normalized === "true"
        ) {

            return true;

        }

        if (
            normalized === "false"
        ) {

            return false;

        }

    }

    return fallback;
}


/*
=====================================================
 EXPORT
=====================================================
*/

module.exports = {

    DEFAULT_CONFIGURATION,

    getSettingsRecord,

    getMarketplaceSettings,

    updateMarketplaceSettings,

    getSetting,

    toBoolean,

    formatSettings,

    deepMerge

};
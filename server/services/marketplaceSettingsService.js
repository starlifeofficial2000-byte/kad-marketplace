const MarketplaceSetting = require("../models/MarketplaceSetting");

/*
=====================================================
 DEFAULT ADVANCED CONFIGURATION
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
        paymentEmail: true
    },

    notifications: {
        emailNotifications: true,
        welcomeEmail: true,
        paymentEmail: true,
        orderNotifications: true,
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

    seo: {
        title: "",
        description: "",
        keywords: "",
        googleAnalyticsId: "",
        googleSiteVerification: "",
        openGraphTitle: "",
        openGraphDescription: "",
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

        if (
            incoming[key] &&
            typeof incoming[key] === "object" &&
            !Array.isArray(incoming[key]) &&
            base[key] &&
            typeof base[key] === "object" &&
            !Array.isArray(base[key])
        ) {

            result[key] = deepMerge(
                base[key],
                incoming[key]
            );

        } else {

            result[key] = incoming[key];

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
            order: [
                ["id", "ASC"]
            ]
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
 FORMAT SETTINGS FOR FRONTEND
=====================================================
*/

function formatSettings(record) {

    const data =
        record.toJSON
            ? record.toJSON()
            : record;

    let configuration =
        data.configuration;

    if (
        typeof configuration === "string"
    ) {

        try {

            configuration =
                JSON.parse(configuration);

        } catch {

            configuration = {};

        }

    }

    configuration =
        deepMerge(
            DEFAULT_CONFIGURATION,
            configuration || {}
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
            data.seoTitle || "",

        seo_description:
            data.seoDescription || "",

        is_active:
            data.isActive !== false,

        configuration

    };

}


/*
=====================================================
 GET SETTINGS
=====================================================
*/

async function getMarketplaceSettings() {

    const record =
        await getSettingsRecord();

    return formatSettings(record);

}


/*
=====================================================
 UPDATE SETTINGS
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
    -----------------------------------------------
     DIRECT DATABASE FIELDS
    -----------------------------------------------
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

        seoTitle:
            incoming.seo_title,

        seoDescription:
            incoming.seo_description,

        isActive:
            incoming.is_active

    };


    Object.entries(directFields)
        .forEach(([key, value]) => {

            if (
                value !== undefined
            ) {

                record[key] =
                    value;

            }

        });


    /*
    -----------------------------------------------
     ADVANCED CONFIGURATION
    -----------------------------------------------
    */

    let currentConfiguration =
        record.configuration;

    if (
        typeof currentConfiguration === "string"
    ) {

        try {

            currentConfiguration =
                JSON.parse(
                    currentConfiguration
                );

        } catch {

            currentConfiguration = {};

        }

    }


    const incomingConfiguration =
        incoming.configuration || {};


    record.configuration =
        deepMerge(
            deepMerge(
                DEFAULT_CONFIGURATION,
                currentConfiguration || {}
            ),
            incomingConfiguration
        );


    await record.save();


    return formatSettings(record);

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


    const aliases = {

        marketplace_name:
            settings.marketplace_name,

        currency:
            settings.currency,

        maintenance_mode:
            settings.maintenance_mode,

        registration_enabled:
            settings.registration_enabled,

        store_registration_enabled:
            settings.store_registration_enabled

    };


    if (
        Object.prototype.hasOwnProperty.call(
            aliases,
            key
        )
    ) {

        return aliases[key];

    }


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

        if (
            value.toLowerCase() === "true"
        ) {

            return true;

        }

        if (
            value.toLowerCase() === "false"
        ) {

            return false;

        }

    }


    return fallback;

}


module.exports = {

    DEFAULT_CONFIGURATION,

    getSettingsRecord,

    getMarketplaceSettings,

    updateMarketplaceSettings,

    getSetting,

    toBoolean,

    formatSettings

};
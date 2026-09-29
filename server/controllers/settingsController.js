const { Setting } = require("../models");

const {
    getMarketplaceSettings,
    updateMarketplaceSettings,
    getSetting,
    toBoolean
} = require("../services/marketplaceSettingsService");

const {
    sendTestEmail
} = require("../services/emailService");


/* =========================================================
   HELPERS
========================================================= */

const safeJsonParse = (value, fallback = {}) => {
    if (typeof value !== "string") {
        return value || fallback;
    }

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};


/*
   Convert frontend flat SEO settings into the
   MarketplaceSetting configuration structure.
*/
const buildSEOConfiguration = (data) => {

    const seo = {};

    if (data.seo_title !== undefined) {
        seo.title = data.seo_title;
    }

    if (data.seo_description !== undefined) {
        seo.description = data.seo_description;
    }

    if (data.seo_keywords !== undefined) {
        seo.keywords = data.seo_keywords;
    }

    if (data.google_analytics_id !== undefined) {
        seo.googleAnalyticsId =
            data.google_analytics_id;
    }

    if (data.google_site_verification !== undefined) {
        seo.googleSiteVerification =
            data.google_site_verification;
    }

    if (data.og_title !== undefined) {
        seo.openGraphTitle =
            data.og_title;
    }

    if (data.og_description !== undefined) {
        seo.openGraphDescription =
            data.og_description;
    }

    if (data.search_engine_indexing !== undefined) {
        seo.searchEngineIndexing =
            toBoolean(
                data.search_engine_indexing,
                true
            );
    }

    if (data.enable_sitemap !== undefined) {
        seo.sitemapEnabled =
            toBoolean(
                data.enable_sitemap,
                true
            );
    }

    return seo;
};

/* =========================================================
   GET ALL SETTINGS
========================================================= */

exports.getSettings = async (req, res) => {

    try {

        const settings =
            await Setting.findAll({

                order: [
                    ["category", "ASC"],
                    ["settingKey", "ASC"]
                ]

            });


        const marketplaceSettings =
            await getMarketplaceSettings();


        const seo =
            marketplaceSettings.configuration?.seo || {};

        const analytics =
            marketplaceSettings.configuration?.analytics || {};


        /*
        =====================================================
        NORMAL SETTINGS ONLY
        =====================================================
        */

        const nonSEOSettings =
            settings.filter(
                (item) =>
                    String(item.category).toLowerCase() !== "seo"
            );


        /*
        =====================================================
        AUTHORITATIVE SEO SETTINGS
        =====================================================
        */

        const seoSettings = [

            {
                settingKey:
                    "seo_title",

                settingValue:
                    seo.title ||
                    marketplaceSettings.seo_title ||
                    "",

                category:
                    "SEO"
            },

            {
                settingKey:
                    "seo_description",

                settingValue:
                    seo.description ||
                    marketplaceSettings.seo_description ||
                    "",

                category:
                    "SEO"
            },

            {
                settingKey:
                    "seo_keywords",

                settingValue:
                    seo.keywords || "",

                category:
                    "SEO"
            },

            {
                settingKey:
                    "google_analytics_id",

                settingValue:
                    seo.googleAnalyticsId ||
                    analytics.googleAnalyticsId ||
                    "",

                category:
                    "SEO"
            },

            {
                settingKey:
                    "google_site_verification",

                settingValue:
                    seo.googleSiteVerification || "",

                category:
                    "SEO"
            },

            {
                settingKey:
                    "og_title",

                settingValue:
                    seo.openGraphTitle ||
                    seo.title ||
                    "",

                category:
                    "SEO"
            },

            {
                settingKey:
                    "og_description",

                settingValue:
                    seo.openGraphDescription ||
                    seo.description ||
                    "",

                category:
                    "SEO"
            },

            {
                settingKey:
                    "search_engine_indexing",

                settingValue:
                    String(
                        seo.searchEngineIndexing !== false
                    ),

                category:
                    "SEO"
            },

            {
                settingKey:
                    "enable_sitemap",

                settingValue:
                    String(
                        seo.sitemapEnabled !== false
                    ),

                category:
                    "SEO"
            }

        ];


        return res.status(200).json({

            success: true,

            settings: [

                ...nonSEOSettings,

                ...seoSettings

            ]

        });

    }

    catch (error) {

        console.error(
            "GET SETTINGS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load settings."

        });

    }

};

/* =========================================================
   GET PUBLIC MARKETPLACE SETTINGS
========================================================= */

exports.getPublicSettings = async (req, res) => {

    try {

        const settings =
            await getMarketplaceSettings();


        const configuration =
            settings.configuration || {};

        const seo =
            configuration.seo || {};

        const analytics =
            configuration.analytics || {};

        const marketplace =
            configuration.marketplace || {};


        return res.status(200).json({

            success: true,

            settings: {

                id:
                    settings.id || null,

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
                    settings.timezone ||
                    "Africa/Accra",


                /* =========================================
                   PUBLIC STATUS
                ========================================= */

                maintenance_mode:
                    settings.maintenance_mode === true,

                registration_enabled:
                    settings.registration_enabled !== false,

                store_registration_enabled:
                    settings.store_registration_enabled !== false,


                /* =========================================
                   SEO
                ========================================= */

                seo_title:
                    settings.seo_title ||
                    seo.title ||
                    "",

                seo_description:
                    settings.seo_description ||
                    seo.description ||
                    "",

                seo_keywords:
                    seo.keywords ||
                    "",

                google_site_verification:
                    seo.googleSiteVerification ||
                    "",

                og_title:
                    seo.openGraphTitle ||
                    seo.title ||
                    settings.seo_title ||
                    "",

                og_description:
                    seo.openGraphDescription ||
                    seo.description ||
                    settings.seo_description ||
                    "",

                search_engine_indexing:
                    seo.searchEngineIndexing !== false,

                enable_sitemap:
                    seo.sitemapEnabled !== false,


                /* =========================================
                   ANALYTICS
                ========================================= */

                analytics_enabled:
                    analytics.enabled === true,

                google_analytics_id:
                    analytics.googleAnalyticsId ||
                    seo.googleAnalyticsId ||
                    "",


                /* =========================================
                   THEME
                ========================================= */

                primary_color:
                    marketplace.primaryColor ||
                    "#0A66C2",

                secondary_color:
                    marketplace.secondaryColor ||
                    "#198754"

            }

        });

    }

    catch (error) {

        console.error(
            "GET PUBLIC MARKETPLACE SETTINGS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load public marketplace settings."

        });

    }

};


/* =========================================================
   GET SETTINGS BY CATEGORY
========================================================= */

exports.getSettingsByCategory = async (req, res) => {

    try {

        const { category } =
            req.params;


        if (
            String(category).toLowerCase() ===
            "seo"
        ) {

            const marketplaceSettings =
                await getMarketplaceSettings();

            const seo =
                marketplaceSettings.configuration?.seo ||
                {};

            const analytics =
                marketplaceSettings.configuration?.analytics ||
                {};


            return res.status(200).json({

                success: true,

                settings: [

                    {
                        settingKey: "seo_title",
                        settingValue:
                            marketplaceSettings.seo_title ||
                            seo.title ||
                            "",
                        category: "SEO"
                    },

                    {
                        settingKey: "seo_description",
                        settingValue:
                            marketplaceSettings.seo_description ||
                            seo.description ||
                            "",
                        category: "SEO"
                    },

                    {
                        settingKey: "seo_keywords",
                        settingValue:
                            seo.keywords || "",
                        category: "SEO"
                    },

                    {
                        settingKey:
                            "google_analytics_id",
                        settingValue:
                            analytics.googleAnalyticsId ||
                            seo.googleAnalyticsId ||
                            "",
                        category: "SEO"
                    },

                    {
                        settingKey:
                            "google_site_verification",
                        settingValue:
                            seo.googleSiteVerification ||
                            "",
                        category: "SEO"
                    },

                    {
                        settingKey: "og_title",
                        settingValue:
                            seo.openGraphTitle ||
                            seo.title ||
                            "",
                        category: "SEO"
                    },

                    {
                        settingKey:
                            "og_description",
                        settingValue:
                            seo.openGraphDescription ||
                            seo.description ||
                            "",
                        category: "SEO"
                    },

                    {
                        settingKey:
                            "search_engine_indexing",
                        settingValue:
                            String(
                                seo.searchEngineIndexing !== false
                            ),
                        category: "SEO"
                    },

                    {
                        settingKey:
                            "enable_sitemap",
                        settingValue:
                            String(
                                seo.sitemapEnabled !== false
                            ),
                        category: "SEO"
                    }

                ]

            });

        }


        const settings =
            await Setting.findAll({

                where: {
                    category
                },

                order: [
                    ["settingKey", "ASC"]
                ]

            });


        return res.status(200).json({

            success: true,

            settings

        });

    }

    catch (error) {

        console.error(
            "GET CATEGORY SETTINGS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load category settings."

        });

    }

};


/* =========================================================
   SAVE SETTINGS
========================================================= */

exports.saveSettings = async (req, res) => {

    try {

        const settings = req.body;

        if (!Array.isArray(settings)) {

            return res.status(400).json({

                success: false,

                message:
                    "Settings must be an array."

            });

        }

        const seoData = {};

        const seoKeys = [

            "seo_title",
            "seo_description",
            "seo_keywords",
            "google_analytics_id",
            "google_site_verification",
            "og_title",
            "og_description",
            "search_engine_indexing",
            "enable_sitemap"

        ];


        /* =====================================================
           PROCESS SETTINGS
        ===================================================== */

        for (const item of settings) {

            if (
                !item ||
                !item.settingKey ||
                item.settingKey.trim() === ""
            ) {
                continue;
            }

            const key =
                item.settingKey.trim();

            const value =
                item.settingValue ?? "";


            /* ================================================
               SEO SETTINGS
            ================================================ */

            if (seoKeys.includes(key)) {

                seoData[key] = value;

                continue;

            }


            /* ================================================
               NORMAL SETTINGS
            ================================================ */

            await Setting.upsert({

                settingKey: key,

                settingValue: value,

                category:
                    item.category || "General"

            });

        }


        /* =====================================================
           SAVE SEO SETTINGS
        ===================================================== */

        if (
            Object.keys(seoData).length > 0
        ) {

            const seo =
                buildSEOConfiguration(
                    seoData
                );


            const marketplaceUpdate = {

                configuration: {

                    seo

                }

            };


            /*
            -----------------------------------------------------
            Synchronize direct SEO database fields
            -----------------------------------------------------
            */

            if (
                seoData.seo_title !== undefined
            ) {

                marketplaceUpdate.seo_title =
                    seoData.seo_title;

            }


            if (
                seoData.seo_description !== undefined
            ) {

                marketplaceUpdate.seo_description =
                    seoData.seo_description;

            }


            await updateMarketplaceSettings(
                marketplaceUpdate
            );

        }


        return res.status(200).json({

            success: true,

            message:
                "Settings updated successfully."

        });

    }

    catch (error) {

        console.error(
            "SAVE SETTINGS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to save settings."

        });

    }

};


/* =========================================================
   SAVE SINGLE SETTING
========================================================= */

exports.saveSingleSetting = async (req, res) => {

    try {

        const {
            settingKey,
            settingValue,
            category
        } = req.body;


        if (!settingKey) {

            return res.status(400).json({

                success: false,

                message:
                    "Setting key is required."

            });

        }


        const key =
            settingKey.trim();


        const seoKeys = [

            "seo_title",
            "seo_description",
            "seo_keywords",
            "google_analytics_id",
            "google_site_verification",
            "og_title",
            "og_description",
            "search_engine_indexing",
            "enable_sitemap"

        ];


        /* =====================================================
           SEO SETTING
        ===================================================== */

        if (
            seoKeys.includes(key)
        ) {

            const seoData = {

                [key]:
                    settingValue ?? ""

            };


            const seo =
                buildSEOConfiguration(
                    seoData
                );


            const marketplaceUpdate = {

                configuration: {

                    seo

                }

            };


            /*
            -----------------------------------------------------
            Keep direct SEO fields synchronized
            -----------------------------------------------------
            */

            if (
                key === "seo_title"
            ) {

                marketplaceUpdate.seo_title =
                    settingValue ?? "";

            }


            if (
                key === "seo_description"
            ) {

                marketplaceUpdate.seo_description =
                    settingValue ?? "";

            }


            await updateMarketplaceSettings(
                marketplaceUpdate
            );


            return res.status(200).json({

                success: true,

                message:
                    "SEO setting updated successfully."

            });

        }


        /* =====================================================
           NORMAL SETTING
        ===================================================== */

        const [setting, created] =
            await Setting.upsert({

                settingKey: key,

                settingValue:
                    settingValue ?? "",

                category:
                    category || "General"

            }, {

                returning: true

            });


        return res.status(200).json({

            success: true,

            message:
                created
                    ? "Setting created successfully."
                    : "Setting updated successfully.",

            setting

        });

    }

    catch (error) {

        console.error(
            "SAVE SINGLE SETTING ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to save setting."

        });

    }

};


/* =========================================================
   UPLOAD BRANDING FILE
========================================================= */

exports.uploadLogo = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "No image uploaded."

            });

        }


        const type =
            req.body.type;


        const allowedTypes = [

            "logo",
            "admin_logo",
            "favicon"

        ];


        if (
            !allowedTypes.includes(type)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid branding type."

            });

        }


        await Setting.upsert({

            settingKey: type,

            settingValue:
                req.file.filename,

            category:
                "Branding"

        });


        return res.status(200).json({

            success: true,

            message:
                "Branding image uploaded successfully.",

            filename:
                req.file.filename,

            type

        });

    }

    catch (error) {

        console.error(
            "UPLOAD BRANDING ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to upload branding image."

        });

    }

};


/* =========================================================
   DELETE BRANDING
========================================================= */

exports.deleteBranding = async (req, res) => {

    try {

        const { type } =
            req.params;


        const allowedTypes = [

            "logo",
            "admin_logo",
            "favicon"

        ];


        if (
            !allowedTypes.includes(type)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid branding type."

            });

        }


        await Setting.destroy({

            where: {

                settingKey: type

            }

        });


        return res.status(200).json({

            success: true,

            message:
                "Branding setting removed successfully."

        });

    }

    catch (error) {

        console.error(
            "DELETE BRANDING ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to remove branding setting."

        });

    }

};


/* =========================================================
   TEST EMAIL
========================================================= */

exports.testEmail = async (req, res) => {

    try {

        const { email } =
            req.body;


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email address is required."

            });

        }


        const result =
            await sendTestEmail(email);


        console.log(
            "TEST EMAIL SENT:",
            result
        );


        return res.status(200).json({

            success: true,

            message:
                `Test email sent successfully to ${email}.`,

            provider:
                result.provider,

            messageId:
                result.id

        });

    }

    catch (error) {

        console.error(
            "TEST EMAIL ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to send test email.",

            errorCode:
                error.code || null

        });

    }

};


/* =========================================================
   EXPORT SETTINGS
========================================================= */

exports.exportSettings = async (req, res) => {

    try {

        const settings =
            await Setting.findAll({

                order: [

                    ["category", "ASC"],
                    ["settingKey", "ASC"]

                ]

            });


        const marketplaceSettings =
            await getMarketplaceSettings();


        const exportData = {

            exportedAt:
                new Date().toISOString(),

            version:
                "2.0",

            settings,

            marketplaceSettings: {

                marketplace_name:
                    marketplaceSettings.marketplace_name,

                currency:
                    marketplaceSettings.currency,

                language:
                    marketplaceSettings.language,

                timezone:
                    marketplaceSettings.timezone,

                configuration:
                    marketplaceSettings.configuration

            }

        };


        res.setHeader(
            "Content-Disposition",
            "attachment; filename=settings.json"
        );

        res.setHeader(
            "Content-Type",
            "application/json"
        );


        return res.send(
            JSON.stringify(
                exportData,
                null,
                4
            )
        );

    }

    catch (error) {

        console.error(
            "EXPORT SETTINGS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to export settings."

        });

    }

};


/* =========================================================
   IMPORT SETTINGS
========================================================= */

exports.importSettings = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "Please upload a settings file."

            });

        }


        const parsedData =
            JSON.parse(
                req.file.buffer.toString()
            );


        let settings = [];


        if (
            Array.isArray(parsedData)
        ) {

            settings =
                parsedData;

        }

        else if (
            Array.isArray(
                parsedData.settings
            )
        ) {

            settings =
                parsedData.settings;

        }

        else {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid settings file format."

            });

        }


        let imported = 0;


        const seoData = {};


        for (
            const item of settings
        ) {

            if (
                !item ||
                !item.settingKey
            ) {
                continue;
            }


            const key =
                item.settingKey;


            const seoKeys = [

                "seo_title",
                "seo_description",
                "seo_keywords",
                "google_analytics_id",
                "google_site_verification",
                "og_title",
                "og_description",
                "search_engine_indexing",
                "enable_sitemap"

            ];


            if (
                seoKeys.includes(key)
            ) {

                seoData[key] =
                    item.settingValue ?? "";

            }

            else {

                await Setting.upsert({

                    settingKey:
                        key,

                    settingValue:
                        item.settingValue ?? "",

                    category:
                        item.category ||
                        "General"

                });

            }


            imported++;

        }


        if (
            Object.keys(seoData).length > 0
        ) {

            const seo =
                buildSEOConfiguration(
                    seoData
                );


            const updateData = {

                configuration: {

                    seo

                }

            };


            if (
                seoData.seo_title !== undefined
            ) {

                updateData.seo_title =
                    seoData.seo_title;

            }


            if (
                seoData.seo_description !== undefined
            ) {

                updateData.seo_description =
                    seoData.seo_description;

            }


            await updateMarketplaceSettings(
                updateData
            );

        }


        /*
        -----------------------------------------------------
        IMPORT MARKETPLACE CONFIGURATION
        -----------------------------------------------------
        */

        if (
            parsedData.marketplaceSettings
                ?.configuration
        ) {

            await updateMarketplaceSettings({

                configuration:
                    parsedData
                        .marketplaceSettings
                        .configuration

            });

        }


        return res.status(200).json({

            success: true,

            message:
                `${imported} settings imported successfully.`,

            imported

        });

    }

    catch (error) {

        console.error(
            "IMPORT SETTINGS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to import settings."

        });

    }

};


/* =========================================================
   DELETE SETTING
========================================================= */

exports.deleteSetting = async (req, res) => {

    try {

        const { key } =
            req.params;


        const seoKeys = [

            "seo_title",
            "seo_description",
            "seo_keywords",
            "google_analytics_id",
            "google_site_verification",
            "og_title",
            "og_description",
            "search_engine_indexing",
            "enable_sitemap"

        ];


        /*
        -----------------------------------------------------
        SEO SETTINGS SHOULD NOT BE DELETED FROM
        MARKETPLACE CONFIGURATION.
        Reset them instead.
        -----------------------------------------------------
        */

        if (
            seoKeys.includes(key)
        ) {

            const reset = {};


            if (
                key === "search_engine_indexing"
            ) {

                reset.search_engine_indexing =
                    true;

            }

            else if (
                key === "enable_sitemap"
            ) {

                reset.enable_sitemap =
                    true;

            }

            else {

                reset[key] = "";

            }


            const seo =
                buildSEOConfiguration(
                    reset
                );


            await updateMarketplaceSettings({

                configuration: {

                    seo

                },

                ...(key === "seo_title"
                    ? {
                        seo_title: ""
                    }
                    : {}),

                ...(key === "seo_description"
                    ? {
                        seo_description: ""
                    }
                    : {})

            });


            return res.status(200).json({

                success: true,

                message:
                    "SEO setting reset successfully."

            });

        }


        const setting =
            await Setting.findOne({

                where: {

                    settingKey:
                        key

                }

            });


        if (!setting) {

            return res.status(404).json({

                success: false,

                message:
                    "Setting not found."

            });

        }


        await setting.destroy();


        return res.status(200).json({

            success: true,

            message:
                "Setting deleted successfully."

        });

    }

    catch (error) {

        console.error(
            "DELETE SETTING ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to delete setting."

        });

    }

};
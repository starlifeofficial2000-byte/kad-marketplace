const { Setting } = require("../models");

const {
    getMarketplaceSettings
} = require("../services/marketplaceSettingsService");

const {
    sendTestEmail
} = require("../services/emailService");


/* =========================================================
   GET ALL SETTINGS
========================================================= */

exports.getSettings = async (req, res) => {

    try {

        const settings = await Setting.findAll({

            order: [

                ["category", "ASC"],

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

        /*
        -----------------------------------------------------
        Get formatted marketplace settings
        -----------------------------------------------------
        */

        const settings =
            await getMarketplaceSettings();


        /*
        -----------------------------------------------------
        Extract advanced configuration
        -----------------------------------------------------
        */

        const configuration =
            settings.configuration || {};

        const seo =
            configuration.seo || {};

        const analytics =
            configuration.analytics || {};

        const marketplace =
            configuration.marketplace || {};


        /*
        -----------------------------------------------------
        Return ONLY safe public settings
        -----------------------------------------------------
        */

        return res.status(200).json({

            success: true,

            settings: {

                /* =========================================
                   BASIC MARKETPLACE
                ========================================= */

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

                currency:
                    settings.currency || "GH₵",

                language:
                    settings.language || "English",

                timezone:
                    settings.timezone || "Africa/Accra",


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
                   MARKETPLACE THEME
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

        const { category } = req.params;


        const settings = await Setting.findAll({

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


        for (const item of settings) {

            if (

                !item.settingKey ||

                item.settingKey.trim() === ""

            ) {

                continue;

            }


            await Setting.upsert({

                settingKey:
                    item.settingKey.trim(),

                settingValue:
                    item.settingValue ?? "",

                category:
                    item.category || "General"

            });

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


        const [setting, created] =

            await Setting.upsert(

                {

                    settingKey,

                    settingValue,

                    category:
                        category || "General"

                },

                {

                    returning: true

                }

            );


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


        const type = req.body.type;


        const allowedTypes = [

            "logo",

            "admin_logo",

            "favicon"

        ];


        if (!allowedTypes.includes(type)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid branding type."

            });

        }


        await Setting.upsert({

            settingKey: type,

            settingValue: req.file.filename,

            category: "Branding"

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
   DELETE BRANDING FILE REFERENCE
========================================================= */

exports.deleteBranding = async (req, res) => {

    try {

        const { type } = req.params;


        const allowedTypes = [

            "logo",

            "admin_logo",

            "favicon"

        ];


        if (!allowedTypes.includes(type)) {

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

        const {
            email
        } = req.body;


        /* -----------------------------------------------------
           VALIDATE RECIPIENT
        ----------------------------------------------------- */

        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email address is required."

            });

        }


        /* -----------------------------------------------------
           SEND TEST EMAIL
           
           The emailService automatically determines
           whether to use Resend or SMTP based on:
           
           configuration.email.provider
        ----------------------------------------------------- */

        const result =
            await sendTestEmail(email);


        /* -----------------------------------------------------
           SUCCESS
        ----------------------------------------------------- */

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

        const settings = await Setting.findAll({

            order: [

                ["category", "ASC"],

                ["settingKey", "ASC"]

            ]

        });


        const exportData = {

            exportedAt:

                new Date().toISOString(),

            version: "1.0",

            settings

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


        const parsedData = JSON.parse(

            req.file.buffer.toString()

        );


        let settings;


        /*
        Support both:

        Old format:
        [ {...}, {...} ]

        New format:
        {
            exportedAt: "...",
            version: "1.0",
            settings: [...]
        }
        */


        if (Array.isArray(parsedData)) {

            settings = parsedData;

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


        for (const item of settings) {

            if (!item.settingKey) {

                continue;

            }


            await Setting.upsert({

                settingKey:
                    item.settingKey,

                settingValue:
                    item.settingValue ?? "",

                category:
                    item.category || "General"

            });


            imported++;

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
                "Failed to import settings."

        });

    }

};


/* =========================================================
   DELETE SETTING
========================================================= */

exports.deleteSetting = async (req, res) => {

    try {

        const { key } = req.params;


        const setting =

            await Setting.findOne({

                where: {

                    settingKey: key

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
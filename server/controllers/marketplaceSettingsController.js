const MarketplaceSetting = require("../models/MarketplaceSetting");

/*
|--------------------------------------------------------------------------
| GET MARKETPLACE SETTINGS
|--------------------------------------------------------------------------
*/

exports.getSettings = async (req, res) => {
    try {

        let settings =
            await MarketplaceSetting.findOne({
                where: {
                    isActive: true
                }
            });

        /*
        |--------------------------------------------------------------------------
        | Create default settings if none exists
        |--------------------------------------------------------------------------
        */

        if (!settings) {

            settings =
                await MarketplaceSetting.create({
                    marketplaceName: "KAD Marketplace",
                    currency: "GH₵",
                    language: "English",
                    timezone: "Africa/Accra",

                    maintenanceMode: false,

                    registrationEnabled: true,

                    storeRegistrationEnabled: true,

                    isActive: true
                });

        }

        return res.status(200).json({
            success: true,
            settings
        });

    } catch (error) {

        console.error(
            "GET MARKETPLACE SETTINGS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load marketplace settings."
        });
    }
};


/*
|--------------------------------------------------------------------------
| UPDATE MARKETPLACE SETTINGS
|--------------------------------------------------------------------------
*/

exports.updateSettings = async (req, res) => {

    try {

        let settings =
            await MarketplaceSetting.findOne({
                where: {
                    isActive: true
                }
            });

        /*
        |--------------------------------------------------------------------------
        | Create settings record if it does not exist
        |--------------------------------------------------------------------------
        */

        if (!settings) {

            settings =
                await MarketplaceSetting.create({
                    marketplaceName: "KAD Marketplace",
                    currency: "GH₵",
                    language: "English",
                    timezone: "Africa/Accra",
                    maintenanceMode: false,
                    registrationEnabled: true,
                    storeRegistrationEnabled: true,
                    isActive: true
                });
        }

        /*
        |--------------------------------------------------------------------------
        | Allowed settings
        |--------------------------------------------------------------------------
        |
        | Do not blindly update every property supplied by the browser.
        |
        */

        const allowedFields = [
            "marketplaceName",
            "logo",
            "favicon",
            "supportEmail",
            "supportPhone",
            "address",
            "currency",
            "language",
            "timezone",

            "maintenanceMode",

            "registrationEnabled",

            "storeRegistrationEnabled",

            "facebook",
            "instagram",
            "tiktok",
            "x",
            "whatsapp",

            "seoTitle",
            "seoDescription"
        ];

        const updates = {};

        for (const field of allowedFields) {

            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    field
                )
            ) {

                updates[field] =
                    req.body[field];
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Validate important fields
        |--------------------------------------------------------------------------
        */

        if (
            updates.marketplaceName !== undefined &&
            typeof updates.marketplaceName !== "string"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Marketplace name must be text."
            });
        }


        if (
            updates.currency !== undefined &&
            typeof updates.currency !== "string"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Currency must be text."
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Update database
        |--------------------------------------------------------------------------
        */

        await settings.update(updates);

        /*
        |--------------------------------------------------------------------------
        | Reload fresh database record
        |--------------------------------------------------------------------------
        */

        await settings.reload();

        return res.status(200).json({
            success: true,
            message:
                "Marketplace settings saved successfully.",
            settings
        });

    } catch (error) {

        console.error(
            "UPDATE MARKETPLACE SETTINGS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to save marketplace settings."
        });
    }
};
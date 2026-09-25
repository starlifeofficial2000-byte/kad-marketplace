const {
    getMarketplaceSettings,
    updateMarketplaceSettings
} = require("../services/marketplaceSettingsService");


/*
=====================================================
 GET ADMIN MARKETPLACE SETTINGS
=====================================================
 GET /api/admin/settings
=====================================================
*/

exports.getSettings =
    async (req, res) => {

        try {

            const settings =
                await getMarketplaceSettings();


            return res.status(200).json({

                success:
                    true,

                settings

            });

        }

        catch (error) {

            console.error(
                "GET ADMIN SETTINGS ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load marketplace settings.",

                error:
                    error.message

            });

        }

    };


/*
=====================================================
 SAVE ADMIN MARKETPLACE SETTINGS
=====================================================
 PUT /api/admin/settings
=====================================================
*/

exports.saveSettings =
    async (req, res) => {

        try {

            const settings =
                await updateMarketplaceSettings(
                    req.body
                );


            return res.status(200).json({

                success:
                    true,

                message:
                    "Marketplace settings saved successfully.",

                settings

            });

        }

        catch (error) {

            console.error(
                "SAVE ADMIN SETTINGS ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to save marketplace settings.",

                error:
                    error.message

            });

        }

    };
const {
    getMarketplaceSettings,
    updateMarketplaceSettings
} = require("../services/marketplaceSettingsService");


/* =========================================================
   GET MARKETPLACE SETTINGS
========================================================= */

exports.getSettings = async (req, res) => {

    try {

        console.log(
            "[ADMIN SETTINGS] GET /api/admin/settings"
        );

        console.log(
            "[ADMIN SETTINGS] User:",
            req.user
                ? {
                    id: req.user.id,
                    role: req.user.role
                }
                : null
        );


        const settings =
            await getMarketplaceSettings();


        console.log(
            "[ADMIN SETTINGS] Settings loaded successfully"
        );


        return res.status(200).json({

            success: true,

            settings

        });


    } catch (error) {

        console.error(
            "================================================="
        );

        console.error(
            "[ADMIN SETTINGS] GET ERROR"
        );

        console.error(
            "================================================="
        );

        console.error(
            "Name:",
            error?.name
        );

        console.error(
            "Message:",
            error?.message
        );

        console.error(
            "Code:",
            error?.code
        );

        console.error(
            "SQL:",
            error?.sql
        );

        console.error(
            "SQL Message:",
            error?.original?.message
        );

        console.error(
            "Stack:",
            error?.stack
        );

        console.error(
            "================================================="
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load marketplace settings.",

            /*
             * Temporary diagnostic information.
             * Remove after the production issue is identified.
             */

            error:
                process.env.NODE_ENV !== "production"
                    ? error.message
                    : undefined

        });

    }

};


/* =========================================================
   SAVE MARKETPLACE SETTINGS
========================================================= */

exports.saveSettings = async (req, res) => {

    try {

        console.log(
            "[ADMIN SETTINGS] PUT /api/admin/settings"
        );


        if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid settings data."

            });

        }


        const settings =
            await updateMarketplaceSettings(
                req.body
            );


        console.log(
            "[ADMIN SETTINGS] Settings saved successfully"
        );


        return res.status(200).json({

            success: true,

            message:
                "Marketplace settings saved successfully.",

            settings

        });


    } catch (error) {

        console.error(
            "================================================="
        );

        console.error(
            "[ADMIN SETTINGS] SAVE ERROR"
        );

        console.error(
            "================================================="
        );

        console.error(
            "Name:",
            error?.name
        );

        console.error(
            "Message:",
            error?.message
        );

        console.error(
            "Code:",
            error?.code
        );

        console.error(
            "SQL:",
            error?.sql
        );

        console.error(
            "SQL Message:",
            error?.original?.message
        );

        console.error(
            "Stack:",
            error?.stack
        );

        console.error(
            "================================================="
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to save marketplace settings."

        });

    }

};
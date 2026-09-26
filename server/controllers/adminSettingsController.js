const {
    getMarketplaceSettings,
    updateMarketplaceSettings
} = require("../services/marketplaceSettingsService");

const {
    uploadToR2,
    deleteFromR2,
    getR2PublicUrl
} = require("../config/r2");

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
    console.error("=================================================");
    console.error("[ADMIN SETTINGS] GET ERROR");
    console.error("=================================================");
    console.error("Name:", error?.name);
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("SQL:", error?.sql);
    console.error("SQL Message:", error?.original?.message);
    console.error("Stack:", error?.stack);
    console.error("=================================================");

    return res.status(500).json({
        success: false,
        message: "Unable to load marketplace settings.",
        debug: {
            name: error?.name,
            message: error?.message,
            code: error?.code,
            sqlMessage: error?.original?.message || null
        }
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
/* =========================================================
   UPLOAD BRANDING
========================================================= */

exports.uploadBranding = async (req, res) => {
    try {
        console.log(
            "[ADMIN SETTINGS] BRANDING UPLOAD"
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

        /* =====================================================
           CHECK FILE
        ===================================================== */

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No branding file was uploaded."
            });
        }

        /* =====================================================
           CHECK BUFFER
        ===================================================== */

        if (!Buffer.isBuffer(req.file.buffer)) {
            console.error(
                "[BRANDING UPLOAD] Invalid file buffer"
            );

            return res.status(500).json({
                success: false,
                message:
                    "Uploaded file does not contain a valid Buffer."
            });
        }

        if (req.file.buffer.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Uploaded file is empty."
            });
        }

        /* =====================================================
           DETERMINE BRANDING TYPE
           
           Supported:
           - favicon
           - logo
           - admin_logo
        ===================================================== */

        const brandingType =
            String(
                req.body?.type ||
                req.body?.field ||
                req.body?.brandingType ||
                "favicon"
            )
                .trim()
                .toLowerCase();

        const allowedTypes = [
            "favicon",
            "logo",
            "admin_logo"
        ];

        if (!allowedTypes.includes(brandingType)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid branding type. Use favicon, logo or admin_logo."
            });
        }

        /* =====================================================
           FILE INFORMATION
        ===================================================== */

        const originalName =
            req.file.originalname || "branding";

        const path =
            require("path");

        const extension =
            path
                .extname(originalName)
                .toLowerCase();

        const safeExtension =
            extension || ".png";

        /* =====================================================
           CREATE UNIQUE R2 KEY
        ===================================================== */

        const timestamp =
            Date.now();

        const randomNumber =
            Math.round(
                Math.random() * 1e9
            );

        const key =
            `uploads/branding/${brandingType}-${timestamp}-${randomNumber}${safeExtension}`;

        /* =====================================================
           UPLOAD TO CLOUDFLARE R2
        ===================================================== */

        const uploaded =
            await uploadToR2({
                key,

                buffer:
                    req.file.buffer,

                contentType:
                    req.file.mimetype,

                cacheControl:
                    "public, max-age=31536000, immutable"
            });

        if (
            !uploaded ||
            !uploaded.key
        ) {
            throw new Error(
                "R2 upload completed but no object key was returned."
            );
        }

        const publicUrl =
            uploaded.url ||
            getR2PublicUrl(
                uploaded.key
            );

        if (!publicUrl) {
            throw new Error(
                "R2 upload succeeded but no public URL was generated."
            );
        }

        /* =====================================================
           SAVE URL TO MARKETPLACE SETTINGS
        ===================================================== */

        const settings =
            await getMarketplaceSettings();

        const updatePayload = {};

        if (brandingType === "favicon") {
            updatePayload.favicon =
                publicUrl;
        }

        if (brandingType === "logo") {
            updatePayload.logo =
                publicUrl;
        }

        if (brandingType === "admin_logo") {
            updatePayload.admin_logo =
                publicUrl;
        }

        const updatedSettings =
            await updateMarketplaceSettings(
                updatePayload
            );

        /* =====================================================
           SUCCESS LOG
        ===================================================== */

        console.log(
            "[BRANDING UPLOAD] SUCCESS:",
            {
                type:
                    brandingType,

                key:
                    uploaded.key,

                url:
                    publicUrl,

                contentType:
                    req.file.mimetype,

                size:
                    req.file.size
            }
        );

        /* =====================================================
           RESPONSE
        ===================================================== */

        return res.status(200).json({
            success: true,

            message:
                `${brandingType} uploaded successfully.`,

            type:
                brandingType,

            file: {
                key:
                    uploaded.key,

                url:
                    publicUrl,

                originalName:
                    req.file.originalname,

                contentType:
                    req.file.mimetype,

                size:
                    req.file.size
            },

            settings:
                updatedSettings
        });

    } catch (error) {

        console.error(
            "================================================="
        );

        console.error(
            "[BRANDING UPLOAD] ERROR"
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
            "Stack:",
            error?.stack
        );

        console.error(
            "================================================="
        );

        return res.status(500).json({
            success: false,

            message:
                error?.message ||
                "Unable to upload branding."
        });
    }
};
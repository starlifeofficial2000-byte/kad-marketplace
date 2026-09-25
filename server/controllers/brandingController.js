const path = require("path");

const MarketplaceSetting = require("../models/MarketplaceSetting");

const {
    uploadToR2,
    deleteFromR2,
    R2_PUBLIC_URL
} = require("../services/r2Service");

/*
=========================================================
   ALLOWED BRANDING TYPES
=========================================================
*/

const ALLOWED_TYPES = {
    logo: "logo",
    admin_logo: "adminLogo",
    favicon: "favicon"
};

/*
=========================================================
   GET R2 KEY FROM STORED URL
=========================================================
*/

const getR2KeyFromUrl = (value) => {
    if (!value) {
        return null;
    }

    const stringValue = String(value).trim();

    /*
     * If the database contains a raw R2 key.
     */
    if (!/^https?:\/\//i.test(stringValue)) {
        return stringValue
            .replace(/^\/+/, "")
            .replace(/\\/g, "/");
    }

    try {
        const url = new URL(stringValue);

        if (
            R2_PUBLIC_URL &&
            !stringValue.startsWith(R2_PUBLIC_URL)
        ) {
            return null;
        }

        return decodeURIComponent(
            url.pathname.replace(/^\/+/, "")
        );
    } catch (error) {
        return null;
    }
};

/*
=========================================================
   UPLOAD BRANDING
=========================================================
*/

exports.uploadBranding = async (req, res) => {
    try {
        const { type } = req.body;

        if (!type || !ALLOWED_TYPES[type]) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid branding type. Allowed types are logo, admin_logo, and favicon."
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image to upload."
            });
        }

        /*
         * Get current marketplace settings.
         */
        let settings =
            await MarketplaceSetting.findOne({
                where: {
                    isActive: true
                },
                order: [["id", "ASC"]]
            });

        if (!settings) {
            settings =
                await MarketplaceSetting.create({});
        }

        const databaseField =
            ALLOWED_TYPES[type];

        const oldValue =
            settings[databaseField];

        /*
         * Preserve extension.
         */
        const extension =
            path.extname(
                req.file.originalname
            ).toLowerCase();

        /*
         * Generate R2 object key.
         */
        const objectKey =
            `uploads/branding/${type}-${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${extension}`;

        /*
         * Upload to Cloudflare R2.
         */
        const uploaded =
            await uploadToR2({
                key: objectKey,
                buffer: req.file.buffer,
                contentType: req.file.mimetype,
                cacheControl:
                    "public, max-age=31536000, immutable"
            });

        /*
         * Save PUBLIC CDN URL in database.
         */
        await settings.update({
            [databaseField]: uploaded.url
        });

        /*
         * Delete previous branding file
         * after successful replacement.
         */
        if (oldValue) {
            try {
                const oldKey =
                    getR2KeyFromUrl(oldValue);

                if (oldKey) {
                    await deleteFromR2(oldKey);
                }
            } catch (deleteError) {
                console.error(
                    "OLD BRANDING DELETE ERROR:",
                    deleteError
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: `${type.replace(
                "_",
                " "
            )} uploaded successfully.`,
            branding: {
                type,
                url: uploaded.url,
                key: uploaded.key
            },
            settings: {
                logo: settings.logo,
                admin_logo:
                    settings.adminLogo,
                favicon:
                    settings.favicon
            }
        });
    } catch (error) {
        console.error(
            "BRANDING UPLOAD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to upload branding image."
        });
    }
};

/*
=========================================================
   DELETE BRANDING
=========================================================
*/

exports.deleteBranding = async (req, res) => {
    try {
        const { type } = req.params;

        if (!type || !ALLOWED_TYPES[type]) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid branding type."
            });
        }

        const settings =
            await MarketplaceSetting.findOne({
                where: {
                    isActive: true
                },
                order: [["id", "ASC"]]
            });

        if (!settings) {
            return res.status(404).json({
                success: false,
                message:
                    "Marketplace settings were not found."
            });
        }

        const databaseField =
            ALLOWED_TYPES[type];

        const currentValue =
            settings[databaseField];

        if (!currentValue) {
            return res.status(404).json({
                success: false,
                message:
                    "No branding image exists for this type."
            });
        }

        /*
         * Delete from R2.
         */
        const objectKey =
            getR2KeyFromUrl(currentValue);

        if (objectKey) {
            await deleteFromR2(objectKey);
        }

        /*
         * Clear database value.
         */
        await settings.update({
            [databaseField]: null
        });

        return res.status(200).json({
            success: true,
            message: `${type.replace(
                "_",
                " "
            )} deleted successfully.`
        });
    } catch (error) {
        console.error(
            "BRANDING DELETE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to delete branding image."
        });
    }
};
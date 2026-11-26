const { User } = require("../models");

const REQUIRED_SELLER_FIELDS = [
    "name",
    "phone",
    "ghanaCard",
    "region",
    "city",
    "address"
];

module.exports = async function sellerProfileComplete(req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Please log in first."
            });
        }

        const user = await User.findByPk(req.user.id, {
            attributes: ["id", ...REQUIRED_SELLER_FIELDS]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found."
            });
        }

        const missing = REQUIRED_SELLER_FIELDS.filter((field) => {
            const value = user[field];
            return value === null || value === undefined || String(value).trim() === "";
        });

        if (missing.length) {
            return res.status(403).json({
                success: false,
                code: "SELLER_PROFILE_INCOMPLETE",
                profileIncomplete: true,
                missing,
                message: "Complete your full name, phone, Ghana Card, region, city and address in your profile before creating a store or listing products."
            });
        }

        return next();
    } catch (error) {
        console.error("SELLER PROFILE CHECK ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to verify seller profile completion."
        });
    }
};

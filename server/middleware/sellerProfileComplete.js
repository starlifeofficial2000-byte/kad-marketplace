const { User } = require("../models");

module.exports = async function sellerProfileComplete(req, res, next) {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: "Please log in first." });
    const user = await User.findByPk(req.user.id, { attributes: ["id", "phone", "region", "city"] });
    if (!user) return res.status(401).json({ success: false, message: "User account not found." });
    const missing = [!user.phone && "phone", !user.region && "region", !user.city && "city"].filter(Boolean);
    if (missing.length) return res.status(403).json({ success: false, code: "SELLER_PROFILE_INCOMPLETE", missing, message: "Complete your seller details in your profile before creating product listings or a store." });
    return next();
  } catch (error) {
    console.error("SELLER PROFILE CHECK ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Unable to verify seller profile completion." });
  }
};

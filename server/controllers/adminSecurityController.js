const { Op } = require("sequelize");
const User = require("../models/User");
const Store = require("../models/Store");
const LoginHistory = require("../models/LoginHistory");
const AuditLog = require("../models/AuditLog");

exports.getSecurityOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [users, totalUsers, totalAdmins, blockedUsers, activeUsers, successfulLogins, failedLogins, todayLogins, todayFailed, auditLogs, passwordResets, adminLogins, latestLogins, latestAuditLogs, stores] = await Promise.all([
      User.findAll({ attributes: { exclude: ["password", "loginOTP", "loginOTPExpires", "resetOTP", "resetOTPExpires", "twoFactorCode", "twoFactorExpires"] }, order: [["createdAt", "DESC"]] }),
      User.count(),
      User.count({ where: { role: "admin" } }),
      User.count({ where: { status: "blocked" } }),
      User.count({ where: { status: "active" } }),
      LoginHistory.count({ where: { success: true } }),
      LoginHistory.count({ where: { success: false } }),
      LoginHistory.count({ where: { createdAt: { [Op.gte]: today } } }),
      LoginHistory.count({ where: { success: false, createdAt: { [Op.gte]: today } } }),
      AuditLog.count(),
      AuditLog.count({ where: { action: "PASSWORD_RESET" } }),
      LoginHistory.count({ where: { success: true }, include: [{ model: User, as: "user", where: { role: "admin" } }] }),
      LoginHistory.findAll({ limit: 10, order: [["createdAt", "DESC"]], include: [{ model: User, as: "user", attributes: ["id", "name", "email", "role"] }] }),
      AuditLog.findAll({ limit: 10, order: [["createdAt", "DESC"]] }),
      Store.findAll({ attributes: ["userId"], group: ["userId"] })
    ]);
    const sellerIds = new Set(stores.map((s) => Number(s.userId)));
    const safeUsers = users.map((user) => {
      const row = user.toJSON();
      return { ...row, isSeller: sellerIds.has(Number(row.id)), isAdmin: row.role === "admin", isBlocked: row.status === "blocked" };
    });
    return res.json({
      success: true,
      statistics: { totalUsers, totalAdmins, blockedUsers, activeUsers, totalSellers: sellerIds.size, totalBuyers: safeUsers.filter((u) => u.role === "user" && !u.isSeller).length, successfulLogins, failedLogins, todayLogins, todayFailed, auditLogs, passwordResets, adminLogins },
      users: safeUsers,
      latestLogins,
      latestAuditLogs
    });
  } catch (error) {
    console.error("SECURITY OVERVIEW ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load security overview.", detail: error.message });
  }
};

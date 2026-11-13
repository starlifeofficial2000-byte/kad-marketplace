const { Op } = require("sequelize");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Store = require("../models/Store");

exports.getUsers = async (req, res) => {
  try {
    const [users, stores] = await Promise.all([
      User.findAll({ attributes: ["id", "name", "email", "phone", "role", "status"], order: [["name", "ASC"]] }),
      Store.findAll({ attributes: ["userId"], group: ["userId"] })
    ]);
    const sellerIds = new Set(stores.map((store) => Number(store.userId)));
    return res.json({ success: true, users: users.map((user) => ({ ...user.toJSON(), isSeller: sellerIds.has(Number(user.id)) })) });
  } catch (error) {
    console.error("NOTIFICATION RECIPIENTS ERROR", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const message = String(req.body.message || "").trim();
    const recipient = String(req.body.recipient || "Everyone").trim();
    if (!title || !message) return res.status(400).json({ success: false, message: "Title and message are required." });
    if (title.length > 160 || message.length > 5000) return res.status(400).json({ success: false, message: "Title or message is too long." });

    let users = [];
    if (recipient === "Single" || recipient === "User" || recipient === "Specific User") {
      const id = Number(req.body.userId);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ success: false, message: "Select a valid user." });
      const user = await User.findByPk(id, { attributes: ["id"] });
      if (!user) return res.status(404).json({ success: false, message: "Selected user was not found." });
      users = [user];
    } else if (recipient === "Sellers") {
      const stores = await Store.findAll({ attributes: ["userId"], group: ["userId"] });
      const ids = stores.map((store) => store.userId).filter(Boolean);
      users = ids.length ? await User.findAll({ where: { id: { [Op.in]: ids } }, attributes: ["id"] }) : [];
    } else if (recipient === "Buyers") {
      const stores = await Store.findAll({ attributes: ["userId"], group: ["userId"] });
      const sellerIds = stores.map((store) => store.userId).filter(Boolean);
      users = await User.findAll({ where: { role: "user", ...(sellerIds.length ? { id: { [Op.notIn]: sellerIds } } : {}) }, attributes: ["id"] });
    } else if (recipient === "Administrators") {
      users = await User.findAll({ where: { role: "admin" }, attributes: ["id"] });
    } else if (recipient === "Everyone" || recipient === "All users") {
      users = await User.findAll({ attributes: ["id"] });
    } else {
      return res.status(400).json({ success: false, message: "Unsupported recipient group." });
    }

    if (!users.length) return res.status(200).json({ success: true, sent: 0, message: "There are no users in the selected audience." });
    const records = users.map((user) => ({ userId: user.id, title, message, type: "System", isRead: false }));
    await Notification.bulkCreate(records);
    return res.status(201).json({ success: true, sent: records.length, message: `Notification delivered to ${records.length} account(s).` });
  } catch (error) {
    console.error("SEND ADMIN NOTIFICATION ERROR", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

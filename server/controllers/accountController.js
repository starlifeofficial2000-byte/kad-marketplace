const { Op } = require("sequelize");
const sequelize = require("../config/database");
const {
    User, Product, Store, Conversation, Message, Wishlist, ProductView,
    ProductStatistic, Review, Notification, Report, SearchHistory,
    Advertisement, Subscription, Payment, PromotionPayment,
    ProductPromotion, Lead, StoreFollow, SupportTicket,
    SupportTicketMessage, Support, LoginHistory, SecurityAlert, UserRole,
    DeviceToken, AuditLog
} = require("../models");
const FeaturedProduct = require("../models/FeaturedProduct");
const { deleteFromR2 } = require("../config/r2");

function parseProductImages(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        const parsed = JSON.parse(String(value));
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (_) {
        return [String(value)];
    }
}

function imageKey(value) {
    if (typeof value !== "string") return null;
    const clean = value.trim();
    if (clean.startsWith("uploads/")) return clean;
    try {
        const url = new URL(clean);
        const key = decodeURIComponent(url.pathname).replace(/^\/+/, "");
        if (key.startsWith("uploads/")) return key;
    } catch (_) {}
    return null;
}

exports.deleteMyAccount = async (req, res) => {
    const userId = Number(req.user && req.user.id);
    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(401).json({ success: false, message: "Please sign in again." });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: "Account not found." });

        const products = await Product.findAll({
            where: { userId },
            attributes: ["id", "images"]
        });
        const productIds = products.map((p) => Number(p.id));

        const stores = await Store.findAll({
            where: { userId },
            attributes: ["id", "logo", "banner"]
        });
        const storeIds = stores.map((s) => Number(s.id));

        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [{ buyerId: userId }, { sellerId: userId }]
            },
            attributes: ["id"]
        });
        const conversationIds = conversations.map((c) => Number(c.id));

        await sequelize.transaction(async (transaction) => {
            const inProducts = productIds.length ? { [Op.in]: productIds } : null;
            const inStores = storeIds.length ? { [Op.in]: storeIds } : null;
            const inConversations = conversationIds.length ? { [Op.in]: conversationIds } : null;

            if (inConversations) {
                await Message.destroy({ where: { conversationId: inConversations }, transaction });
                await Conversation.destroy({ where: { id: inConversations }, transaction });
            }

            if (inProducts) {
                await ProductPromotion.destroy({ where: { productId: inProducts }, transaction });
                await PromotionPayment.destroy({
                    where: { [Op.or]: [{ productId: inProducts }, { userId }] },
                    transaction
                });
                await Wishlist.destroy({ where: { productId: inProducts }, transaction });
                await ProductView.destroy({ where: { productId: inProducts }, transaction });
                await ProductStatistic.destroy({ where: { productId: inProducts }, transaction });
                await FeaturedProduct.destroy({ where: { productId: inProducts }, transaction });
                await Review.destroy({ where: { productId: inProducts }, transaction });
                await Report.destroy({ where: { productId: inProducts }, transaction });
                await Lead.destroy({ where: { productId: inProducts }, transaction });
            }

            await ProductPromotion.destroy({ where: { sellerId: userId }, transaction });
            await Wishlist.destroy({ where: { userId }, transaction });
            await ProductView.destroy({ where: { userId }, transaction });
            await Review.destroy({ where: { [Op.or]: [{ buyerId: userId }, { sellerId: userId }] }, transaction });
            await Report.destroy({ where: { userId }, transaction });
            await Lead.destroy({ where: { [Op.or]: [{ buyerId: userId }, { sellerId: userId }] }, transaction });

            if (inStores) {
                await StoreFollow.destroy({ where: { storeId: inStores }, transaction });
            }
            await StoreFollow.destroy({ where: { userId }, transaction });

            const tickets = await SupportTicket.findAll({
                where: { userId },
                attributes: ["id"],
                transaction
            });
            const ticketIds = tickets.map((t) => Number(t.id));
            if (ticketIds.length) {
                await SupportTicketMessage.destroy({
                    where: { ticketId: { [Op.in]: ticketIds } },
                    transaction
                });
                await SupportTicket.destroy({
                    where: { id: { [Op.in]: ticketIds } },
                    transaction
                });
            }

            await Notification.destroy({ where: { userId }, transaction });
            await Support.destroy({ where: { userId }, transaction });
            await DeviceToken.destroy({ where: { userId }, transaction });
            await Advertisement.destroy({ where: { userId }, transaction });
            await SearchHistory.destroy({ where: { userId }, transaction });
            await LoginHistory.destroy({ where: { userId }, transaction });
            await SecurityAlert.destroy({ where: { userId }, transaction });
            await UserRole.destroy({ where: { userId }, transaction });

            // Remove payment/subscription records associated with the account.
            await Payment.destroy({ where: { userId }, transaction });
            await Subscription.destroy({ where: { userId }, transaction });

            if (inProducts) {
                await Product.destroy({ where: { id: inProducts }, transaction });
            }
            if (inStores) {
                await Store.destroy({ where: { id: inStores }, transaction });
            }

            // Audit rows are retained only if the user was an admin; clear their
            // actor reference where the schema permits, otherwise delete own rows.
            await AuditLog.destroy({ where: { adminId: userId }, transaction });

            await user.destroy({ transaction });
        });

        // Best-effort deletion of account/store media after DB commit.
        const profileImageKey = imageKey(user.profileImage);
        if (profileImageKey) {
            try { await deleteFromR2(profileImageKey); }
            catch (storageError) {
                console.warn("[ACCOUNT DELETE] Profile image cleanup failed:", storageError.message);
            }
        }

        for (const store of stores) {
            for (const image of [store.logo, store.banner]) {
                const key = imageKey(image);
                if (key) {
                    try { await deleteFromR2(key); }
                    catch (storageError) {
                        console.warn("[ACCOUNT DELETE] Store image cleanup failed:", storageError.message);
                    }
                }
            }
        }

        // Best-effort deletion of product images from object storage after DB commit.
        for (const product of products) {
            for (const image of parseProductImages(product.images)) {
                const key = imageKey(image);
                if (key) {
                    try { await deleteFromR2(key); }
                    catch (storageError) {
                        console.warn("[ACCOUNT DELETE] R2 image cleanup failed:", storageError.message);
                    }
                }
            }
        }

        return res.json({
            success: true,
            accountDeleted: true,
            message: "Your KAD Marketplace account has been deleted."
        });
    } catch (error) {
        console.error("DELETE MY ACCOUNT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to delete your account right now. Please contact support if the problem continues."
        });
    }
};

/* =====================================================
   IMPORT MODELS
===================================================== */

/* CORE */
const User = require("./user");
const Product = require("./Product");
const Store = require("./Store");

/* SUBSCRIPTIONS */
const Subscription = require("./Subscription");
const SubscriptionPlan = require("./SubscriptionPlan");

/* PAYMENTS */
const Payment = require("./Payment");
const PromotionPayment = require("./PromotionPayment");

/* PROMOTIONS */
const ProductPromotion = require("./ProductPromotion");

/* MESSAGING */
const Conversation = require("./Conversation");
const Message = require("./Message");

/* MARKETPLACE */
const Wishlist = require("./Wishlist");
const ProductView = require("./ProductView");
const ProductStatistic = require("./ProductStatistic");
const Review = require("./Review");
const Notification = require("./Notification");
const Report = require("./Report");
const Advertisement = require("./Advertisement");
const SearchHistory = require("./SearchHistory");
const Support = require("./Support");
const SupportTicket = require("./SupportTicket");
const Lead = require("./Lead");
const StoreFollow = require("./StoreFollow");

/* SECURITY */
const AuditLog = require("./AuditLog");
const LoginHistory = require("./LoginHistory");
const SecurityAlert = require("./SecurityAlert");

/* ROLES */
const Role = require("./Role");
const Permission = require("./Permission");
const RolePermission = require("./RolePermission");
const UserRole = require("./UserRole");

/* SETTINGS */
const Setting = require("./Setting");


/* =====================================================
   USER ↔ ROLE
===================================================== */

User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "userId",
    otherKey: "roleId",
    as: "roles"
});

Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "roleId",
    otherKey: "userId",
    as: "users"
});


/* =====================================================
   ROLE ↔ PERMISSION
===================================================== */

Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: "roleId",
    otherKey: "permissionId",
    as: "permissions"
});

Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: "permissionId",
    otherKey: "roleId",
    as: "roles"
});


/* =====================================================
   USER ↔ STORE
===================================================== */

User.hasOne(Store, {
    foreignKey: "userId",
    as: "store",
    onDelete: "CASCADE"
});

Store.belongsTo(User, {
    foreignKey: "userId",
    as: "owner"
});


/* =====================================================
   USER ↔ PRODUCT
===================================================== */

User.hasMany(Product, {
    foreignKey: "userId",
    as: "products",
    onDelete: "CASCADE"
});

Product.belongsTo(User, {
    foreignKey: "userId",
    as: "seller"
});


/* =====================================================
   STORE ↔ PRODUCT

   Products belong to store owner through userId.
===================================================== */

Store.hasMany(Product, {
    foreignKey: "userId",
    sourceKey: "userId",
    as: "products",
    constraints: false
});

Product.belongsTo(Store, {
    foreignKey: "userId",
    targetKey: "userId",
    as: "store",
    constraints: false
});


/* =====================================================
   USER ↔ SUBSCRIPTION
===================================================== */

User.hasMany(Subscription, {
    foreignKey: "userId",
    as: "subscriptions",
    onDelete: "CASCADE"
});

Subscription.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


/* =====================================================
   SUBSCRIPTION PLAN ↔ SUBSCRIPTION
===================================================== */

SubscriptionPlan.hasMany(Subscription, {
    foreignKey: "subscriptionPlanId",
    as: "subscriptions"
});

Subscription.belongsTo(SubscriptionPlan, {
    foreignKey: "subscriptionPlanId",
    as: "subscriptionPlan"
});


/* =====================================================
   SUBSCRIPTION PLAN ↔ PRODUCT
===================================================== */

SubscriptionPlan.hasMany(Product, {
    foreignKey: "subscriptionPlanId",
    as: "products"
});

Product.belongsTo(SubscriptionPlan, {
    foreignKey: "subscriptionPlanId",
    as: "subscriptionPlan"
});


/* =====================================================
   USER ↔ PAYMENT
===================================================== */

User.hasMany(Payment, {
    foreignKey: "userId",
    as: "payments"
});

Payment.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


/* =====================================================
   SUBSCRIPTION ↔ PAYMENT
===================================================== */

Subscription.hasMany(Payment, {
    foreignKey: "subscriptionId",
    as: "payments"
});

Payment.belongsTo(Subscription, {
    foreignKey: "subscriptionId",
    as: "subscription"
});


/* =====================================================
   SUBSCRIPTION PLAN ↔ PAYMENT
===================================================== */

SubscriptionPlan.hasMany(Payment, {
    foreignKey: "planId",
    as: "payments"
});

Payment.belongsTo(SubscriptionPlan, {
    foreignKey: "planId",
    as: "subscriptionPlan"
});


/* =====================================================
   USER ↔ PROMOTION PAYMENT
===================================================== */

User.hasMany(PromotionPayment, {
    foreignKey: "userId",
    as: "promotionPayments"
});

PromotionPayment.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


/* =====================================================
   PRODUCT ↔ PROMOTION PAYMENT
===================================================== */

Product.hasMany(PromotionPayment, {
    foreignKey: "productId",
    as: "promotionPayments"
});

PromotionPayment.belongsTo(Product, {
    foreignKey: "productId",
    as: "product"
});


/* =====================================================
   PRODUCT ↔ PRODUCT PROMOTION
===================================================== */

Product.hasMany(ProductPromotion, {
    foreignKey: "productId",
    as: "promotions",
    onDelete: "CASCADE"
});

ProductPromotion.belongsTo(Product, {
    foreignKey: "productId",
    as: "product"
});


/* =====================================================
   USER ↔ PRODUCT PROMOTION
===================================================== */

User.hasMany(ProductPromotion, {
    foreignKey: "sellerId",
    as: "productPromotions"
});

ProductPromotion.belongsTo(User, {
    foreignKey: "sellerId",
    as: "seller"
});


/* =====================================================
   USER ↔ WISHLIST
===================================================== */

User.hasMany(Wishlist, {
    foreignKey: "userId",
    as: "wishlist"
});

Wishlist.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});

Product.hasMany(Wishlist, {
    foreignKey: "productId",
    as: "wishlistItems"
});

Wishlist.belongsTo(Product, {
    foreignKey: "productId",
    as: "product"
});


/* =====================================================
   USER ↔ PRODUCT VIEW
===================================================== */

User.hasMany(ProductView, {
    foreignKey: "userId",
    as: "viewHistory"
});

ProductView.belongsTo(User, {
    foreignKey: "userId",
    as: "viewer"
});

Product.hasMany(ProductView, {
    foreignKey: "productId",
    as: "viewsHistory"
});

ProductView.belongsTo(Product, {
    foreignKey: "productId",
    as: "product"
});


/* =====================================================
   PRODUCT ↔ PRODUCT STATISTICS
===================================================== */

Product.hasOne(ProductStatistic, {
    foreignKey: "productId",
    as: "statistics"
});

ProductStatistic.belongsTo(Product, {
    foreignKey: "productId",
    as: "product"
});


/* =====================================================
   USER ↔ REVIEW
===================================================== */

User.hasMany(Review, {
    foreignKey: "buyerId",
    as: "reviews"
});

Review.belongsTo(User, {
    foreignKey: "buyerId",
    as: "buyer"
});

Product.hasMany(Review, {
    foreignKey: "productId",
    as: "reviews"
});

Review.belongsTo(Product, {
    foreignKey: "productId",
    as: "product"
});


/* =====================================================
   USER ↔ LEADS
===================================================== */

User.hasMany(Lead, {
    foreignKey: "buyerId",
    as: "buyerLeads"
});

Lead.belongsTo(User, {
    foreignKey: "buyerId",
    as: "buyer"
});

User.hasMany(Lead, {
    foreignKey: "sellerId",
    as: "sellerLeads"
});

Lead.belongsTo(User, {
    foreignKey: "sellerId",
    as: "seller"
});

Product.hasMany(Lead, {
    foreignKey: "productId",
    as: "leads"
});

Lead.belongsTo(Product, {
    foreignKey: "productId",
    as: "product"
});


/* =====================================================
   USER ↔ LOGIN HISTORY
===================================================== */

User.hasMany(LoginHistory, {
    foreignKey: "userId",
    as: "loginHistory"
});

LoginHistory.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


/* =====================================================
   USER ↔ AUDIT LOG
===================================================== */

User.hasMany(AuditLog, {
    foreignKey: "adminId",
    as: "auditLogs"
});

AuditLog.belongsTo(User, {
    foreignKey: "adminId",
    as: "admin"
});


/* =====================================================
   USER ↔ SECURITY ALERT
===================================================== */

User.hasMany(SecurityAlert, {
    foreignKey: "userId",
    as: "securityAlerts"
});

SecurityAlert.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


/* =====================================================
   USER ↔ SUPPORT TICKET
===================================================== */

User.hasMany(SupportTicket, {
    foreignKey: "userId",
    as: "tickets"
});

SupportTicket.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


/* =====================================================
   USER ↔ SEARCH HISTORY
===================================================== */

User.hasMany(SearchHistory, {
    foreignKey: "userId",
    as: "searchHistory"
});

SearchHistory.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


/* =====================================================
   USER ↔ ADVERTISEMENT
===================================================== */

User.hasMany(Advertisement, {
    foreignKey: "userId",
    as: "advertisements"
});

Advertisement.belongsTo(User, {
    foreignKey: "userId",
    as: "advertiser"
});


/* =====================================================
   EXPORT MODELS
===================================================== */

module.exports = {

    /* CORE */
    User,
    Product,
    Store,

    /* SUBSCRIPTIONS */
    Subscription,
    SubscriptionPlan,

    /* PAYMENTS */
    Payment,
    PromotionPayment,

    /* PROMOTIONS */
    ProductPromotion,

    /* MESSAGING */
    Conversation,
    Message,

    /* MARKETPLACE */
    Wishlist,
    ProductView,
    ProductStatistic,
    Review,
    Notification,
    Report,
    Advertisement,
    SearchHistory,
    Support,
    SupportTicket,
    Lead,
    StoreFollow,

    /* SECURITY */
    AuditLog,
    LoginHistory,
    SecurityAlert,

    /* ROLES */
    Role,
    Permission,
    RolePermission,
    UserRole,

    /* SETTINGS */
    Setting
};
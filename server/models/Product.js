const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define("Product", {

    id: {

        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true

    },

    /* =====================================
       OWNER
    ===================================== */

    userId: {

        type: DataTypes.INTEGER,
        allowNull: false

    },

    subscriptionPlanId: {

        type: DataTypes.INTEGER,
        allowNull: true

    },

    /* =====================================
       PRODUCT INFORMATION
    ===================================== */

    title: {

        type: DataTypes.STRING,
        allowNull: false

    },

    slug: {

        type: DataTypes.STRING,
        allowNull: false,
        unique: true

    },

    description: {

        type: DataTypes.TEXT,
        allowNull: false

    },

    category: {

        type: DataTypes.STRING,
        allowNull: false

    },

    condition: {

        type: DataTypes.ENUM(

            "New",

            "Used"

        ),

        allowNull: false,

        defaultValue: "Used"

    },

    price: {

        type: DataTypes.DECIMAL(10,2),

        allowNull: false

    },

    images: {

        type: DataTypes.TEXT,

        allowNull: true

    },

    /* =====================================
       LOCATION
    ===================================== */

    location: {

        type: DataTypes.STRING,

        allowNull: false

    },

    region: {

        type: DataTypes.STRING,

        allowNull: false

    },

    city: {

        type: DataTypes.STRING,

        allowNull: false

    },

    /* =====================================
       STATUS
    ===================================== */

    status: {

        type: DataTypes.ENUM(

            "Pending",

            "Approved",

            "Rejected",

            "Sold"

        ),

        defaultValue: "Pending"

    },

    rejectionReason: {

        type: DataTypes.TEXT

    },

    approvedAt: {

        type: DataTypes.DATE

    },

    approvedBy: {

        type: DataTypes.INTEGER

    },

    soldAt: {

        type: DataTypes.DATE

    },

    deleted: {

        type: DataTypes.BOOLEAN,

        defaultValue: false

    },

    /* =====================================
       SUBSCRIPTION
    ===================================== */

    promotionType: {

        type: DataTypes.STRING,

        defaultValue: "Basic"

    },

    listingPriority: {

        type: DataTypes.INTEGER,

        defaultValue: 1

    },

    homepagePriority: {

        type: DataTypes.INTEGER,

        defaultValue: 1

    },

    searchPriority: {

        type: DataTypes.INTEGER,

        defaultValue: 1

    },

    listingScore: {

        type: DataTypes.INTEGER,

        defaultValue: 100

    },

    qualityScore: {

        type: DataTypes.INTEGER,

        defaultValue: 100

    },

    displayDate: {

        type: DataTypes.DATE,

        defaultValue: DataTypes.NOW

    },

    /* =====================================
       BOOST
    ===================================== */

    boosted: {

        type: DataTypes.BOOLEAN,

        defaultValue: false

    },

    boostCount: {

        type: DataTypes.INTEGER,

        defaultValue: 0

    },

    lastBoost: {

        type: DataTypes.DATE

    },

    nextBoost: {

        type: DataTypes.DATE

    },

    boostExpiresAt: {

        type: DataTypes.DATE

    },

    /* =====================================
       FEATURED
    ===================================== */

    featured: {

        type: DataTypes.BOOLEAN,

        defaultValue: false

    },

    featuredUntil: {

        type: DataTypes.DATE

    },

    /* =====================================
       EXPRESS
    ===================================== */

    express: {

        type: DataTypes.BOOLEAN,

        defaultValue: false

    },

    expressUntil: {

        type: DataTypes.DATE

    },

    /* =====================================
       AI
    ===================================== */

    aiRecommended: {

        type: DataTypes.BOOLEAN,

        defaultValue: false

    },

    aiScore: {

        type: DataTypes.FLOAT,

        defaultValue: 0

    },

    keywords: {

        type: DataTypes.TEXT

    },

    /* =====================================
       STORE
    ===================================== */

    verifiedStore: {

        type: DataTypes.BOOLEAN,

        defaultValue: false

    },

    /* =====================================
       ANALYTICS
    ===================================== */

    views: {

        type: DataTypes.INTEGER,

        defaultValue: 0

    },

    favourites: {

        type: DataTypes.INTEGER,

        defaultValue: 0

    },

    chatCount: {

        type: DataTypes.INTEGER,

        defaultValue: 0

    },

    shares: {

        type: DataTypes.INTEGER,

        defaultValue: 0

    },

    reports: {

        type: DataTypes.INTEGER,

        defaultValue: 0

    },

    /* =====================================
       SELLER PERFORMANCE
    ===================================== */

    sellerRating: {

        type: DataTypes.FLOAT,

        defaultValue: 5

    },

    sellerSales: {

        type: DataTypes.INTEGER,

        defaultValue: 0

    },

    /* =====================================
       SEO
    ===================================== */

    metaTitle: {

        type: DataTypes.STRING

    },

    metaDescription: {

        type: DataTypes.TEXT

    },
isTrending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
},

isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
},

isRecommended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
},

displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
},
},
 {

    timestamps: true

});

module.exports = Product;
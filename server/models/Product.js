const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
    "Product",
    {

        /* =====================================
           PRIMARY KEY
        ===================================== */

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

        /* MAIN CATEGORY */

        category: {
            type: DataTypes.STRING,
            allowNull: false
        },

        /* SUBCATEGORY */

        subcategory: {
            type: DataTypes.STRING,
            allowNull: true
        },

        /* PRODUCT CONDITION */

        condition: {
            type: DataTypes.ENUM(
                "New",
                "Used"
            ),
            allowNull: false,
            defaultValue: "Used"
        },

        /* PRICE */

        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },

        /* IMAGES */

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
           ADMIN APPROVAL STATUS

           Controlled by administrator.
        ===================================== */

        status: {
            type: DataTypes.ENUM(
                "Pending",
                "Approved",
                "Rejected"
            ),
            allowNull: false,
            defaultValue: "Pending"
        },

        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        approvedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },

        approvedBy: {
            type: DataTypes.INTEGER,
            allowNull: true
        },


        /* =====================================
           SELLER AVAILABILITY STATUS
        ===================================== */

        sellerStatus: {
            type: DataTypes.ENUM(
                "Active",
                "Inactive",
                "Sold",
                "Out of Stock"
            ),
            allowNull: false,
            defaultValue: "Active"
        },

        soldAt: {
            type: DataTypes.DATE,
            allowNull: true
        },


        /* =====================================
           DELETED
        ===================================== */

        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },


        /* =====================================
           SUBSCRIPTION / PROMOTION
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
            type: DataTypes.DATE,
            allowNull: true
        },

        nextBoost: {
            type: DataTypes.DATE,
            allowNull: true
        },

        boostExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true
        },


        /* =====================================
           FEATURED
        ===================================== */

        featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        featuredUntil: {
            type: DataTypes.DATE,
            allowNull: true
        },


        /* =====================================
           EXPRESS
        ===================================== */

        express: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        expressUntil: {
            type: DataTypes.DATE,
            allowNull: true
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
            type: DataTypes.TEXT,
            allowNull: true
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
            type: DataTypes.STRING,
            allowNull: true
        },

        metaDescription: {
            type: DataTypes.TEXT,
            allowNull: true
        },


        /* =====================================
           TRENDING / FEATURED / RECOMMENDED
        ===================================== */

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
        }

    },
    {
        timestamps: true
    }
);


module.exports = Product;
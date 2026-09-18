const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Lead = sequelize.define(
    "Lead",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        /* =====================================
           BUYER
        ===================================== */

        buyerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        /* =====================================
           SELLER
        ===================================== */

        sellerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        /* =====================================
           PRODUCT
        ===================================== */

        productId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        /* =====================================
           LEAD TYPE
        ===================================== */

        type: {
            type: DataTypes.ENUM(
                "Interested",
                "Offer",
                "Chat",
                "Phone Request",
                "Location Request",
                "Wishlist",
                "Share"
            ),
            allowNull: false
        },

        /* =====================================
           MESSAGE
        ===================================== */

        message: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        /* =====================================
           OFFER
        ===================================== */

        offerPrice: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0
        },

        /* =====================================
           STATUS
        ===================================== */

        status: {
            type: DataTypes.ENUM(
                "New",
                "Contacted",
                "Negotiating",
                "Converted",
                "Closed"
            ),
            defaultValue: "New"
        },

        /* =====================================
           SELLER NOTES
        ===================================== */

        sellerNotes: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        /* =====================================
           BUYER LOCATION
        ===================================== */

        buyerRegion: {
            type: DataTypes.STRING,
            allowNull: true
        },

        buyerCity: {
            type: DataTypes.STRING,
            allowNull: true
        },

        /* =====================================
           TRACKING
        ===================================== */

        contactedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },

        convertedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },

        closedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = Lead;
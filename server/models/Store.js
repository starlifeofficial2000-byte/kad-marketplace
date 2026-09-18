const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Store = sequelize.define("Store", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },

    storeName: {
        type: DataTypes.STRING,
        allowNull: false
    },

    storeSlug: {
        type: DataTypes.STRING,
        unique: true
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    logo: {
        type: DataTypes.STRING,
        allowNull: true
    },

    banner: {
        type: DataTypes.STRING,
        allowNull: true
    },

    phone: {
        type: DataTypes.STRING
    },

    email: {
        type: DataTypes.STRING
    },

    website: {
        type: DataTypes.STRING
    },

    followers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 5
    },

    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    status: {
        type: DataTypes.ENUM(
            "Pending",
            "Active",
            "Suspended"
        ),
        defaultValue: "Pending"
    },

    subscriptionPlanId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    totalProducts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    totalSales: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    totalViews: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    featuredUntil: {
        type: DataTypes.DATE
    },

    aiRecommended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    listingPriority: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },

    metaTitle: {
        type: DataTypes.STRING
    },

    metaDescription: {
        type: DataTypes.TEXT
    },

    businessCategory: {
        type: DataTypes.STRING
    },

    coverColor: {
        type: DataTypes.STRING,
        defaultValue: "#2563eb"
    },

    businessHours: {
        type: DataTypes.STRING
    },

    facebook: {
        type: DataTypes.STRING
    },

    instagram: {
        type: DataTypes.STRING
    },

    tiktok: {
        type: DataTypes.STRING
    },

    x: {
        type: DataTypes.STRING
    },

    whatsapp: {
        type: DataTypes.STRING
    },

    accentColor: {
        type: DataTypes.STRING,
        defaultValue: "#0A66C2"
    },

    region: {
        type: DataTypes.STRING
    },

    city: {
        type: DataTypes.STRING
    },

    address: {
        type: DataTypes.TEXT
    }

}, {

    timestamps: true

});

module.exports = Store;
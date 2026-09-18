const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MarketplaceSetting = sequelize.define("MarketplaceSetting", {

    marketplaceName: {

        type: DataTypes.STRING,

        defaultValue: "KAD Marketplace"

    },

    logo: {

        type: DataTypes.STRING

    },

    favicon: {

        type: DataTypes.STRING

    },

    supportEmail: {

        type: DataTypes.STRING

    },

    supportPhone: {

        type: DataTypes.STRING

    },

    address: {

        type: DataTypes.TEXT

    },

    currency: {

        type: DataTypes.STRING,

        defaultValue: "GH₵"

    },

    language: {

        type: DataTypes.STRING,

        defaultValue: "English"

    },

    maintenanceMode: {

        type: DataTypes.BOOLEAN,

        defaultValue: false

    },

    registrationEnabled: {

        type: DataTypes.BOOLEAN,

        defaultValue: true

    },

    storeRegistrationEnabled: {

        type: DataTypes.BOOLEAN,

        defaultValue: true

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

    seoTitle: {

        type: DataTypes.STRING

    },

    seoDescription: {

        type: DataTypes.TEXT

    }

}, {

    timestamps: true

});

module.exports = MarketplaceSetting;
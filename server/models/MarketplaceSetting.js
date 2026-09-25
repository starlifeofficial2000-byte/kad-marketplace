const { DataTypes } = require("sequelize");

const sequelize =
    require("../config/database");


const MarketplaceSetting =
    sequelize.define(

        "MarketplaceSetting",

        {

            /*
            =========================================
             BASIC MARKETPLACE INFORMATION
            =========================================
            */

            marketplaceName: {
                type:
                    DataTypes.STRING,

                allowNull:
                    false,

                defaultValue:
                    "KAD Marketplace"
            },


            logo: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            adminLogo: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            favicon: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            /*
            =========================================
             CONTACT INFORMATION
            =========================================
            */

            supportEmail: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            supportPhone: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            address: {
                type:
                    DataTypes.TEXT,

                allowNull:
                    true
            },


            /*
            =========================================
             LOCALIZATION
            =========================================
            */

            currency: {
                type:
                    DataTypes.STRING,

                allowNull:
                    false,

                defaultValue:
                    "GH₵"
            },


            language: {
                type:
                    DataTypes.STRING,

                allowNull:
                    false,

                defaultValue:
                    "English"
            },


            timezone: {
                type:
                    DataTypes.STRING,

                allowNull:
                    false,

                defaultValue:
                    "Africa/Accra"
            },


            /*
            =========================================
             MARKETPLACE ACCESS
            =========================================
            */

            maintenanceMode: {
                type:
                    DataTypes.BOOLEAN,

                allowNull:
                    false,

                defaultValue:
                    false
            },


            registrationEnabled: {
                type:
                    DataTypes.BOOLEAN,

                allowNull:
                    false,

                defaultValue:
                    true
            },


            storeRegistrationEnabled: {
                type:
                    DataTypes.BOOLEAN,

                allowNull:
                    false,

                defaultValue:
                    true
            },


            /*
            =========================================
             SOCIAL MEDIA
            =========================================
            */

            facebook: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            instagram: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            tiktok: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            x: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            whatsapp: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            /*
            =========================================
             SEO
            =========================================
            */

            seoTitle: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            seoDescription: {
                type:
                    DataTypes.TEXT,

                allowNull:
                    true
            },


            /*
            =========================================
             ADVANCED CONFIGURATION
             
             Stores:
             Payment
             Email
             Notifications
             Security
             Analytics
             SEO advanced
             Backup
             Marketplace advanced options
            =========================================
            */

            configuration: {
                type:
                    DataTypes.JSON,

                allowNull:
                    false,

                defaultValue:
                    {}
            },


            /*
            =========================================
             SETTINGS STATUS
            =========================================
            */

            isActive: {
                type:
                    DataTypes.BOOLEAN,

                allowNull:
                    false,

                defaultValue:
                    true
            }

        },

        {

            tableName:
                "MarketplaceSettings",

            timestamps:
                true

        }

    );


module.exports =
    MarketplaceSetting;
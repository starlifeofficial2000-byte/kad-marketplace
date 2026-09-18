const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");


const ProductPromotion = sequelize.define(

    "ProductPromotion",

    {

        id: {

            type: DataTypes.INTEGER,

            autoIncrement: true,

            primaryKey: true

        },


        /* =====================================
           PRODUCT
        ===================================== */

        productId: {

            type: DataTypes.INTEGER,

            allowNull: false

        },


        sellerId: {

            type: DataTypes.INTEGER,

            allowNull: false

        },


        /* =====================================
           PROMOTION TYPE
        ===================================== */

        promotionType: {

            type: DataTypes.ENUM(

                "FEATURED",

                "EXPRESS",

                "BOOST"

            ),

            allowNull: false

        },


        /* =====================================
           PAYMENT STATUS
        ===================================== */

        paymentStatus: {

            type: DataTypes.ENUM(

                "PENDING",

                "PAID",

                "FAILED"

            ),

            defaultValue: "PENDING"

        },


        /* =====================================
           PROMOTION STATUS
        ===================================== */

        status: {

            type: DataTypes.ENUM(

                "PENDING",

                "APPROVED",

                "REJECTED",

                "EXPIRED"

            ),

            defaultValue: "PENDING"

        },


        /* =====================================
           AMOUNT
        ===================================== */

        amount: {

            type: DataTypes.DECIMAL(10, 2),

            allowNull: false,

            defaultValue: 0

        },


        /* =====================================
           DURATION
        ===================================== */

        startDate: {

            type: DataTypes.DATE,

            allowNull: true

        },


        endDate: {

            type: DataTypes.DATE,

            allowNull: true

        },


        /* =====================================
           ADMIN APPROVAL
        ===================================== */

        approvedBy: {

            type: DataTypes.INTEGER,

            allowNull: true

        },


        approvedAt: {

            type: DataTypes.DATE,

            allowNull: true

        },


        /* =====================================
           HOMEPAGE DISPLAY
        ===================================== */

        showOnHomepage: {

            type: DataTypes.BOOLEAN,

            defaultValue: false

        },


        homepageOrder: {

            type: DataTypes.INTEGER,

            defaultValue: 0

        }

    },

    {

        timestamps: true

    }

);


module.exports = ProductPromotion;
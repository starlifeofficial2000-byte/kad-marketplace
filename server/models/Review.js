const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Review = sequelize.define("Review", {

    id: {

        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true

    },

    sellerId: {

        type: DataTypes.INTEGER,
        allowNull: false

    },

    buyerId: {

        type: DataTypes.INTEGER,
        allowNull: false

    },

    productId: {

        type: DataTypes.INTEGER,
        allowNull: false

    },

    rating: {

        type: DataTypes.INTEGER,
        allowNull: false,

        validate: {

            min: 1,
            max: 5

        }

    },

    title: {

        type: DataTypes.STRING,
        allowNull: false

    },

    comment: {

        type: DataTypes.TEXT,
        allowNull: false

    },

    isVerifiedPurchase: {

        type: DataTypes.BOOLEAN,
        defaultValue: false

    }

}, {

    timestamps: true

});

module.exports = Review;
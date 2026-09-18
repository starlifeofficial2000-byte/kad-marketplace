const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductStatistic = sequelize.define("ProductStatistic", {
featured:{

    type:DataTypes.BOOLEAN,

    defaultValue:false

},

boosted:{

    type:DataTypes.BOOLEAN,

    defaultValue:false

},

boostExpiry:{

    type:DataTypes.DATE

},

listingScore:{

    type:DataTypes.INTEGER,

    defaultValue:0

},
    id: {

        type: DataTypes.INTEGER,

        autoIncrement: true,

        primaryKey: true

    },

    productId: {

        type: DataTypes.INTEGER,

        allowNull: false,

        unique: true

    },

    views: {

        type: DataTypes.INTEGER,

        defaultValue: 0

    },

    wishlist: {

        type: DataTypes.INTEGER,

        defaultValue: 0

    },

    chats: {

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

    }

}, {

    timestamps: true

});

module.exports = ProductStatistic;
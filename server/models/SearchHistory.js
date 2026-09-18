const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SearchHistory = sequelize.define("SearchHistory", {

    id: {

        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true

    },

    userId: {

        type: DataTypes.INTEGER,
        allowNull: false

    },

    keyword: {

        type: DataTypes.STRING,
        allowNull: false

    }

}, {

    timestamps: true

});

module.exports = SearchHistory;
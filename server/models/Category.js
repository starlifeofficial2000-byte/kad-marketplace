const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define("Category", {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    slug: {
        type: DataTypes.STRING,
        unique: true
    },

    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    icon: {
        type: DataTypes.STRING
    },

    image: {
        type: DataTypes.STRING
    },

    banner: {
        type: DataTypes.STRING
    },

    featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },

    homepage: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    metaTitle: {
        type: DataTypes.STRING
    },

    metaDescription: {
        type: DataTypes.TEXT
    }

});

Category.belongsTo(Category,{
    foreignKey:"parentId",
    as:"parent"
});

module.exports=Category;
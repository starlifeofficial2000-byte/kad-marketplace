const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = require("./Product");

const FeaturedProduct = sequelize.define("FeaturedProduct",{

    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },

    productId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },

    position:{
        type:DataTypes.INTEGER,
        defaultValue:1
    },

    priority:{
        type:DataTypes.INTEGER,
        defaultValue:1
    },

    startDate:{
        type:DataTypes.DATE
    },

    endDate:{
        type:DataTypes.DATE
    },

    active:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }

});

FeaturedProduct.belongsTo(Product,{
    foreignKey:"productId",
    as:"product"
});

module.exports=FeaturedProduct;
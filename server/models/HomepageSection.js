const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HomepageSection = sequelize.define("HomepageSection",{

    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },

    title:{
        type:DataTypes.STRING,
        allowNull:false
    },

    sectionKey:{
        type:DataTypes.STRING,
        unique:true
    },

    displayOrder:{
        type:DataTypes.INTEGER,
        defaultValue:1
    },

    enabled:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },

    maxItems:{
        type:DataTypes.INTEGER,
        defaultValue:10
    }

});

module.exports = HomepageSection;
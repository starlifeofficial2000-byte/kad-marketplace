const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const User = sequelize.define(
    "User",
    {

        /* ==========================================
           PRIMARY KEY
        ========================================== */

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },


        /* ==========================================
           BASIC USER INFORMATION
        ========================================== */

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },


        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },


        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },


        ghanaCard: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },


        region: {
            type: DataTypes.STRING,
            allowNull: false
        },


        city: {
            type: DataTypes.STRING,
            allowNull: false
        },


        address: {
            type: DataTypes.STRING,
            allowNull: true
        },


        profileImage: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "default.png"
        },


        /* ==========================================
           AUTHENTICATION
        ========================================== */

        password: {
            type: DataTypes.STRING,
            allowNull: false
        },


        role: {
            type: DataTypes.ENUM(
                "user",
                "admin"
            ),
            allowNull: false,
            defaultValue: "user"
        },


        status: {
            type: DataTypes.ENUM(
                "active",
                "blocked"
            ),
            allowNull: false,
            defaultValue: "active"
        },


        /* ==========================================
           ACCOUNT VERIFICATION
        ========================================== */

        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },


        phoneVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },


        /* ==========================================
           LOGIN SECURITY / ACCOUNT LOCK
        ========================================== */

        loginAttempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },


        lockUntil: {
            type: DataTypes.DATE,
            allowNull: true
        },


        /* ==========================================
           LOGIN OTP
           
           Used for normal login verification if needed.
        ========================================== */

        loginOTP: {
            type: DataTypes.STRING,
            allowNull: true
        },


        loginOTPExpires: {
            type: DataTypes.DATE,
            allowNull: true
        },


        /* ==========================================
           TWO-FACTOR AUTHENTICATION

           Mainly used for administrator accounts.
        ========================================== */

        twoFactorEnabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },


        twoFactorCode: {
            type: DataTypes.STRING,
            allowNull: true
        },


        twoFactorExpires: {
            type: DataTypes.DATE,
            allowNull: true
        },


        /* ==========================================
           PASSWORD RESET
        ========================================== */

        resetOTP: {
            type: DataTypes.STRING,
            allowNull: true
        },


        resetOTPExpires: {
            type: DataTypes.DATE,
            allowNull: true
        },


        resetVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },


        /* ==========================================
           NOTIFICATION SETTINGS
        ========================================== */

        emailNotifications: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },


        smsNotifications: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },


        pushNotifications: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },


        /* ==========================================
           PRIVACY SETTINGS
        ========================================== */

        showPhone: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },


        showOnline: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },


        /* ==========================================
           FREE PLAN USAGE
        ========================================== */

        freeUploadsUsed: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }

    },


    /* ==========================================
       MODEL OPTIONS
    ========================================== */

    {

        tableName: "Users",

        timestamps: true

    }

);


module.exports = User;
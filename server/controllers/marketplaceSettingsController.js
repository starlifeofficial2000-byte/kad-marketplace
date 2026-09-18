const MarketplaceSetting = require("../models/MarketplaceSetting");

/* ==========================================
   GET ALL SETTINGS
========================================== */

exports.getSettings = async (req, res) => {

    try {

        const settings = await MarketplaceSetting.findAll({

            order: [

                ["category", "ASC"],
                ["settingKey", "ASC"]

            ]

        });

        res.json(settings);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   GET SETTINGS BY CATEGORY
========================================== */

exports.getCategorySettings = async (req, res) => {

    try {

        const settings = await MarketplaceSetting.findAll({

            where: {

                category: req.params.category

            },

            order: [

                ["settingKey", "ASC"]

            ]

        });

        res.json(settings);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   CREATE SETTING
========================================== */

exports.createSetting = async (req, res) => {

    try {

        const setting = await MarketplaceSetting.create(req.body);

        res.status(201).json({

            success: true,

            setting

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   UPDATE SETTING
========================================== */

exports.updateSetting = async (req, res) => {

    try {

        const setting = await MarketplaceSetting.findByPk(req.params.id);

        if (!setting) {

            return res.status(404).json({

                success: false,

                message: "Setting not found."

            });

        }

        await setting.update(req.body);

        res.json({

            success: true,

            setting

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   DELETE SETTING
========================================== */

exports.deleteSetting = async (req, res) => {

    try {

        const setting = await MarketplaceSetting.findByPk(req.params.id);

        if (!setting) {

            return res.status(404).json({

                success: false,

                message: "Setting not found."

            });

        }

        await setting.destroy();

        res.json({

            success: true,

            message: "Setting deleted."

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
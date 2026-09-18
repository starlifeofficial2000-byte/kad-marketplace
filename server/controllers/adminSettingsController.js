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

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   SAVE SETTINGS
========================================== */

exports.saveSettings = async (req, res) => {

    try {

        const settings = req.body;

        for (const item of settings) {

            const existing = await MarketplaceSetting.findOne({

                where: {

                    settingKey: item.settingKey

                }

            });

            if (existing) {

                existing.settingValue = item.settingValue;

                existing.category = item.category;

                existing.description = item.description;

                await existing.save();

            } else {

                await MarketplaceSetting.create({

                    settingKey: item.settingKey,

                    settingValue: item.settingValue,

                    category: item.category,

                    description: item.description

                });

            }

        }

        res.json({

            success: true,

            message: "Marketplace settings saved successfully."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
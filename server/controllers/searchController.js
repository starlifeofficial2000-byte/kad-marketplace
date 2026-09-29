const SearchHistory = require("../models/SearchHistory");

exports.saveSearch = async (req, res) => {

    try {

        const { keyword } = req.body;

        if (!keyword) {

            return res.status(400).json({

                success: false,

                message: "Keyword is required."

            });

        }

        await SearchHistory.create({

            userId: req.user.id,

            keyword

        });

        res.json({

            success: true

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
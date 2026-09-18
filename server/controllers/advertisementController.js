const Advertisement = require("../models/Advertisement");
const sanitize = require("../services/sanitizeService");


/* ==========================================
   GET ALL ACTIVE/RUNNING ADVERTISEMENTS
========================================== */

exports.getAdvertisements = async (req, res) => {

    try {

        const ads = await Advertisement.findAll({

            where: {

                status: "Running"

            },

            order: [

                ["priority", "DESC"],

                ["createdAt", "DESC"]

            ]

        });


        return res.json({

            success: true,

            advertisements: ads

        });

    }

    catch (error) {

        console.error("GET ADVERTISEMENTS ERROR:", error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/* ==========================================
   CREATE ADVERTISEMENT
========================================== */

exports.createAdvertisement = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "Advertisement image is required."

            });

        }


        const ad = await Advertisement.create({

            userId: req.user.id,

            title: sanitize(req.body.title),

            subtitle: sanitize(req.body.subtitle),

            description: sanitize(req.body.description),

            buttonText: sanitize(req.body.buttonText),

            link: sanitize(req.body.link),

            priority: Number(req.body.priority) || 1,

            placement: req.body.placement || "Homepage",

            position: req.body.position || "Homepage",

            status: req.body.status || "Pending",

            image: req.file.filename,

            dailyBudget: req.body.dailyBudget || 0,

            startDate: req.body.startDate || null,

            endDate: req.body.endDate || null

        });


        return res.status(201).json({

            success: true,

            message: "Advertisement created successfully.",

            advertisement: ad

        });

    }

    catch (error) {

        console.error("CREATE ADVERTISEMENT ERROR:", error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/* ==========================================
   UPDATE ADVERTISEMENT
========================================== */

exports.updateAdvertisement = async (req, res) => {

    try {

        const ad = await Advertisement.findByPk(req.params.id);


        if (!ad) {

            return res.status(404).json({

                success: false,

                message: "Advertisement not found."

            });

        }


        const updateData = {

            title:

                req.body.title !== undefined
                    ? sanitize(req.body.title)
                    : ad.title,


            subtitle:

                req.body.subtitle !== undefined
                    ? sanitize(req.body.subtitle)
                    : ad.subtitle,


            description:

                req.body.description !== undefined
                    ? sanitize(req.body.description)
                    : ad.description,


            buttonText:

                req.body.buttonText !== undefined
                    ? sanitize(req.body.buttonText)
                    : ad.buttonText,


            link:

                req.body.link !== undefined
                    ? sanitize(req.body.link)
                    : ad.link,


            priority:

                req.body.priority !== undefined
                    ? Number(req.body.priority)
                    : ad.priority,


            placement:

                req.body.placement || ad.placement,


            position:

                req.body.position || ad.position,


            status:

                req.body.status || ad.status,


            dailyBudget:

                req.body.dailyBudget !== undefined
                    ? req.body.dailyBudget
                    : ad.dailyBudget,


            startDate:

                req.body.startDate || ad.startDate,


            endDate:

                req.body.endDate || ad.endDate

        };


        if (req.file) {

            updateData.image = req.file.filename;

        }


        await ad.update(updateData);


        return res.json({

            success: true,

            message: "Advertisement updated successfully.",

            advertisement: ad

        });

    }

    catch (error) {

        console.error("UPDATE ADVERTISEMENT ERROR:", error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/* ==========================================
   DELETE ADVERTISEMENT
========================================== */

exports.deleteAdvertisement = async (req, res) => {

    try {

        const ad = await Advertisement.findByPk(req.params.id);


        if (!ad) {

            return res.status(404).json({

                success: false,

                message: "Advertisement not found."

            });

        }


        await ad.destroy();


        return res.json({

            success: true,

            message: "Advertisement deleted successfully."

        });

    }

    catch (error) {

        console.error("DELETE ADVERTISEMENT ERROR:", error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

exports.getApprovedAdvertisements = async (req, res) => {

    try {

        const ads = await Advertisement.findAll({

            where: {

                status: "Running",

                placement: "Homepage"

            },

            order: [

                ["priority", "DESC"],

                ["createdAt", "DESC"]

            ]

        });


        return res.json({

            success: true,

            advertisements: ads

        });

    }

    catch (error) {

        console.error(
            "GET HOMEPAGE ADS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to load advertisements."

        });

    }

};
const Advertisement = require("../models/Advertisement");
const User = require("../models/User");

/* ==========================================
   GET ALL ADVERTISEMENTS
========================================== */

exports.getAdvertisements = async (req, res) => {

    try {

        const advertisements = await Advertisement.findAll({
include: [

    {

        model: User,

        as: "advertiser",

        attributes: [

            "id",
            "name",
            "email",
            "phone"

        ]

    }

],

            order: [

                ["createdAt", "DESC"]

            ]

        });

        res.json(advertisements);

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
   APPROVE ADVERTISEMENT
========================================== */

exports.approveAdvertisement = async (req, res) => {

    try {

        const advertisement = await Advertisement.findByPk(req.params.id);

        if (!advertisement) {

            return res.status(404).json({

                success: false,

                message: "Advertisement not found."

            });

        }

        advertisement.status = "Approved";

        await advertisement.save();

        res.json({

            success: true,

            message: "Advertisement approved successfully."

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
   REJECT ADVERTISEMENT
========================================== */

exports.rejectAdvertisement = async (req, res) => {

    try {

        const advertisement = await Advertisement.findByPk(req.params.id);

        if (!advertisement) {

            return res.status(404).json({

                success: false,

                message: "Advertisement not found."

            });

        }

        advertisement.status = "Rejected";

        await advertisement.save();

        res.json({

            success: true,

            message: "Advertisement rejected."

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
   PAUSE ADVERTISEMENT
========================================== */

exports.pauseAdvertisement = async (req, res) => {

    try {

        const advertisement = await Advertisement.findByPk(req.params.id);

        if (!advertisement) {

            return res.status(404).json({

                success: false,

                message: "Advertisement not found."

            });

        }

        advertisement.status = "Paused";

        await advertisement.save();

        res.json({

            success: true,

            message: "Advertisement paused."

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
   RESUME ADVERTISEMENT
========================================== */

exports.resumeAdvertisement = async (req, res) => {

    try {

        const advertisement = await Advertisement.findByPk(req.params.id);

        if (!advertisement) {

            return res.status(404).json({

                success: false,

                message: "Advertisement not found."

            });

        }

        advertisement.status = "Running";

        await advertisement.save();

        res.json({

            success: true,

            message: "Advertisement resumed."

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
   DELETE ADVERTISEMENT
========================================== */

exports.deleteAdvertisement = async (req, res) => {

    try {

        const advertisement = await Advertisement.findByPk(req.params.id);

        if (!advertisement) {

            return res.status(404).json({

                success: false,

                message: "Advertisement not found."

            });

        }

        await advertisement.destroy();

        res.json({

            success: true,

            message: "Advertisement deleted successfully."

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
exports.getAdvertisementAnalytics = async (req,res)=>{

    try{

        const ads = await Advertisement.findAll();

        const analytics = ads.map(ad=>{

            const ctr =

                ad.impressions===0

                ?

                0

                :

                (

                    ad.clicks/

                    ad.impressions

                )*100;

            return{

                id:ad.id,

                title:ad.title,

                impressions:ad.impressions,

                clicks:ad.clicks,

                ctr:ctr.toFixed(2),

                budget:ad.dailyBudget,

                spent:ad.budgetSpent

            };

        });

        res.json(analytics);

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};
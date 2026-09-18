const SubscriptionPlan = require("../models/SubscriptionPlan");

/* ==========================================
   GET ALL PLANS
========================================== */

exports.getPlans = async (req, res) => {

    try {

        const plans = await SubscriptionPlan.findAll({

            order: [["price", "ASC"]]

        });

        res.json(plans);

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
   GET SINGLE PLAN
========================================== */

exports.getPlan = async (req, res) => {

    try {

        const plan = await SubscriptionPlan.findByPk(req.params.id);

        if (!plan) {

            return res.status(404).json({

                success: false,

                message: "Subscription plan not found."

            });

        }

        res.json(plan);

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   CREATE PLAN
========================================== */
exports.createPlan = async (req, res) => {

    try {

        const existingPlan = await SubscriptionPlan.findOne({

            where: {

                name: req.body.name

            }

        });

        if (existingPlan) {

            return res.status(400).json({

                success: false,

                message: "A subscription plan with this name already exists."

            });

        }

        const plan = await SubscriptionPlan.create(req.body);

        res.status(201).json({

            success: true,

            message: "Subscription plan created successfully.",

            plan

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
   UPDATE PLAN
========================================== */

exports.updatePlan = async (req, res) => {

    try {

        const plan = await SubscriptionPlan.findByPk(req.params.id);

        if (!plan) {

            return res.status(404).json({

                success: false,

                message: "Subscription plan not found."

            });

        }

        await plan.update(req.body);

        res.json({

            success: true,

            message: "Subscription plan updated successfully.",

            plan

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
   DELETE PLAN
========================================== */

exports.deletePlan = async (req, res) => {

    try {

        const plan = await SubscriptionPlan.findByPk(req.params.id);

        if (!plan) {

            return res.status(404).json({

                success: false,

                message: "Subscription plan not found."

            });

        }

        await plan.destroy();

        res.json({

            success: true,

            message: "Subscription plan deleted."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   TOGGLE ACTIVE/INACTIVE
========================================== */
exports.togglePlan = async (req, res) => {

    try {

        const plan = await SubscriptionPlan.findByPk(req.params.id);

        if (!plan) {

            return res.status(404).json({
                success: false,
                message: "Subscription plan not found."
            });

        }

        plan.isActive = !plan.isActive;

        await plan.save();

        res.json({
            success: true,
            message: "Plan status updated successfully.",
            isActive: plan.isActive,
            plan
        });

    } catch (error) {

        console.error("TOGGLE PLAN ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
const SubscriptionPlan = require("../models/SubscriptionPlan");


/* ==========================================
   GET ALL PLANS - ADMIN
   Includes active and inactive plans
========================================== */

exports.getPlans = async (req, res) => {

    try {

        const plans = await SubscriptionPlan.findAll({

            order: [

                ["createdAt", "DESC"]

            ]

        });


        return res.status(200).json({

            success: true,

            plans

        });

    }

    catch (error) {

        console.error(
            "GET SUBSCRIPTION PLANS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch subscription plans."

        });

    }

};


/* ==========================================
   GET SINGLE PLAN
========================================== */

exports.getPlan = async (req, res) => {

    try {

        const plan = await SubscriptionPlan.findByPk(

            req.params.id

        );


        if (!plan) {

            return res.status(404).json({

                success: false,

                message:
                    "Subscription plan not found."

            });

        }


        return res.status(200).json({

            success: true,

            plan

        });

    }

    catch (error) {

        console.error(
            "GET SUBSCRIPTION PLAN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch subscription plan."

        });

    }

};


/* ==========================================
   CREATE SUBSCRIPTION PLAN
========================================== */

exports.createPlan = async (req, res) => {

    try {

        const {

            name,
            price,
            duration,
            maxProducts,
            boostCredits,
            featuredCredits,
            expressCredits,
            description,
            features,
            isActive

        } = req.body;


        /* ==============================
           VALIDATION
        ============================== */

        if (

            !name ||

            price === undefined ||

            duration === undefined

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, price and duration are required."

            });

        }


        /* ==============================
           CHECK DUPLICATE NAME
        ============================== */

        const existingPlan =
            await SubscriptionPlan.findOne({

                where: {

                    name

                }

            });


        if (existingPlan) {

            return res.status(400).json({

                success: false,

                message:
                    "A subscription plan with this name already exists."

            });

        }


        /* ==============================
           CREATE PLAN
        ============================== */

        const plan =
            await SubscriptionPlan.create({

                name: name.trim(),

                price: Number(price),

                duration: Number(duration),

                maxProducts:

                    maxProducts !== undefined

                        ? Number(maxProducts)

                        : 5,


                boostCredits:

                    boostCredits !== undefined

                        ? Number(boostCredits)

                        : 0,


                featuredCredits:

                    featuredCredits !== undefined

                        ? Number(featuredCredits)

                        : 0,


                expressCredits:

                    expressCredits !== undefined

                        ? Number(expressCredits)

                        : 0,


                description:

                    description || null,


                features:

                    Array.isArray(features)

                        ? features

                        : [],


                isActive:

                    isActive !== undefined

                        ? isActive

                        : true

            });


        return res.status(201).json({

            success: true,

            message:
                "Subscription plan created successfully.",

            plan

        });

    }

    catch (error) {

        console.error(
            "CREATE SUBSCRIPTION PLAN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to create subscription plan."

        });

    }

};


/* ==========================================
   UPDATE SUBSCRIPTION PLAN
========================================== */

exports.updatePlan = async (req, res) => {

    try {

        const plan =
            await SubscriptionPlan.findByPk(

                req.params.id

            );


        if (!plan) {

            return res.status(404).json({

                success: false,

                message:
                    "Subscription plan not found."

            });

        }


        const {

            name,
            price,
            duration,
            maxProducts,
            boostCredits,
            featuredCredits,
            expressCredits,
            description,
            features,
            isActive

        } = req.body;


        /* ==============================
           CHECK DUPLICATE NAME
        ============================== */

        if (

            name &&

            name.trim() !== plan.name

        ) {

            const existingPlan =
                await SubscriptionPlan.findOne({

                    where: {

                        name: name.trim()

                    }

                });


            if (

                existingPlan &&

                existingPlan.id !== plan.id

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Another subscription plan already uses this name."

                });

            }

        }


        /* ==============================
           UPDATE ONLY PROVIDED VALUES
        ============================== */

        if (name !== undefined) {

            plan.name =
                name.trim();

        }


        if (price !== undefined) {

            plan.price =
                Number(price);

        }


        if (duration !== undefined) {

            plan.duration =
                Number(duration);

        }


        if (maxProducts !== undefined) {

            plan.maxProducts =
                Number(maxProducts);

        }


        if (boostCredits !== undefined) {

            plan.boostCredits =
                Number(boostCredits);

        }


        if (featuredCredits !== undefined) {

            plan.featuredCredits =
                Number(featuredCredits);

        }


        if (expressCredits !== undefined) {

            plan.expressCredits =
                Number(expressCredits);

        }


        if (description !== undefined) {

            plan.description =
                description;

        }


        if (features !== undefined) {

            plan.features =

                Array.isArray(features)

                    ? features

                    : [];

        }


        if (isActive !== undefined) {

            plan.isActive =
                Boolean(isActive);

        }


        await plan.save();


        return res.status(200).json({

            success: true,

            message:
                "Subscription plan updated successfully.",

            plan

        });

    }

    catch (error) {

        console.error(
            "UPDATE SUBSCRIPTION PLAN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to update subscription plan."

        });

    }

};


/* ==========================================
   ACTIVATE SUBSCRIPTION PLAN
========================================== */

exports.activatePlan = async (req, res) => {

    try {

        const plan =
            await SubscriptionPlan.findByPk(

                req.params.id

            );


        if (!plan) {

            return res.status(404).json({

                success: false,

                message:
                    "Subscription plan not found."

            });

        }


        plan.isActive = true;

        await plan.save();


        return res.status(200).json({

            success: true,

            message:
                "Subscription plan activated successfully.",

            plan

        });

    }

    catch (error) {

        console.error(
            "ACTIVATE PLAN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to activate subscription plan."

        });

    }

};


/* ==========================================
   SUSPEND SUBSCRIPTION PLAN
========================================== */

exports.suspendPlan = async (req, res) => {

    try {

        const plan =
            await SubscriptionPlan.findByPk(

                req.params.id

            );


        if (!plan) {

            return res.status(404).json({

                success: false,

                message:
                    "Subscription plan not found."

            });

        }


        plan.isActive = false;

        await plan.save();


        return res.status(200).json({

            success: true,

            message:
                "Subscription plan suspended successfully.",

            plan

        });

    }

    catch (error) {

        console.error(
            "SUSPEND PLAN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to suspend subscription plan."

        });

    }

};


/* ==========================================
   DELETE SUBSCRIPTION PLAN
========================================== */

exports.deletePlan = async (req, res) => {

    try {

        const plan =
            await SubscriptionPlan.findByPk(

                req.params.id

            );


        if (!plan) {

            return res.status(404).json({

                success: false,

                message:
                    "Subscription plan not found."

            });

        }


        await plan.destroy();


        return res.status(200).json({

            success: true,

            message:
                "Subscription plan deleted successfully."

        });

    }

    catch (error) {

        console.error(
            "DELETE SUBSCRIPTION PLAN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to delete subscription plan."

        });

    }

};
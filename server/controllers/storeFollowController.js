const StoreFollow = require("../models/StoreFollow");
const Store = require("../models/Store");

exports.followStore = async (req, res) => {

    try {

        const userId = req.user.id;
        const { storeId } = req.body;

        const store = await Store.findByPk(storeId);

        if (!store) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        const existingFollow = await StoreFollow.findOne({
            where: {
                userId,
                storeId
            }
        });

        if (existingFollow) {
            return res.status(400).json({
                message: "You already follow this store."
            });
        }

        await StoreFollow.create({
            userId,
            storeId
        });

        await store.increment("followers");

        res.json({
            success: true,
            message: "Store followed successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

exports.unfollowStore = async (req, res) => {

    try {

        const userId = req.user.id;
        const { storeId } = req.body;

        const follow = await StoreFollow.findOne({
            where: {
                userId,
                storeId
            }
        });

        if (!follow) {
            return res.status(404).json({
                message: "You are not following this store."
            });
        }

        await follow.destroy();

        const store = await Store.findByPk(storeId);

        if (store && store.followers > 0) {
            await store.decrement("followers");
        }

        res.json({
            success: true,
            message: "Store unfollowed successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

exports.checkFollowStatus = async (req, res) => {

    try {

        const userId = req.user.id;
        const { storeId } = req.params;

        const follow = await StoreFollow.findOne({
            where: {
                userId,
                storeId
            }
        });

        res.json({
            following: !!follow
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};
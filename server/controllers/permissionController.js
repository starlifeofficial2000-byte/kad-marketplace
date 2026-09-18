const {

    Permission

} = require("../models");

/* ==========================================
   GET ALL PERMISSIONS
========================================== */

exports.getPermissions = async (req, res) => {

    try {

        const permissions = await Permission.findAll({

            order: [["name", "ASC"]]

        });

        res.json({

            success: true,

            permissions

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
   CREATE PERMISSION
========================================== */

exports.createPermission = async (req, res) => {

    try {

        const permission = await Permission.create(req.body);

        res.status(201).json({

            success: true,

            permission

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
   UPDATE PERMISSION
========================================== */

exports.updatePermission = async (req, res) => {

    try {

        const permission = await Permission.findByPk(req.params.id);

        if (!permission) {

            return res.status(404).json({

                success: false,

                message: "Permission not found."

            });

        }

        await permission.update(req.body);

        res.json({

            success: true,

            permission

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
   DELETE PERMISSION
========================================== */

exports.deletePermission = async (req, res) => {

    try {

        const permission = await Permission.findByPk(req.params.id);

        if (!permission) {

            return res.status(404).json({

                success: false,

                message: "Permission not found."

            });

        }

        await permission.destroy();

        res.json({

            success: true,

            message: "Permission deleted."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
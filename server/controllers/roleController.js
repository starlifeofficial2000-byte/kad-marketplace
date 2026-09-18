const {
    Role,
    Permission,
    User,
    UserRole
} = require("../models");


/* ==========================================
   GET ALL ROLES
========================================== */

exports.getRoles = async (req, res) => {

    try {

        const roles = await Role.findAll({

            include: [

                {
                    model: Permission,
                    as: "permissions",

                    attributes: [
                        "id",
                        "name",
                        "description"
                    ],

                    through: {
                        attributes: []
                    },

                    required: false
                },

                {
                    model: User,
                    as: "users",

                    attributes: [
                        "id",
                        "name",
                        "email"
                    ],

                    through: {
                        attributes: []
                    },

                    required: false
                }

            ],

            order: [
                ["id", "ASC"]
            ]

        });


        return res.status(200).json({

            success: true,

            roles

        });

    }

    catch (error) {

        console.error(
            "GET ROLES ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load roles.",

            error:
                error.message

        });

    }

};


/* ==========================================
   GET SINGLE ROLE
========================================== */

exports.getRole = async (req, res) => {

    try {

        const role = await Role.findByPk(

            req.params.id,

            {

                include: [

                    {
                        model: Permission,
                        as: "permissions",

                        attributes: [
                            "id",
                            "name",
                            "description"
                        ],

                        through: {
                            attributes: []
                        },

                        required: false
                    },

                    {
                        model: User,
                        as: "users",

                        attributes: [
                            "id",
                            "name",
                            "email"
                        ],

                        through: {
                            attributes: []
                        },

                        required: false
                    }

                ]

            }

        );


        if (!role) {

            return res.status(404).json({

                success: false,

                message:
                    "Role not found."

            });

        }


        return res.status(200).json({

            success: true,

            role

        });

    }

    catch (error) {

        console.error(
            "GET ROLE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load role.",

            error:
                error.message

        });

    }

};


/* ==========================================
   CREATE ROLE
========================================== */

exports.createRole = async (req, res) => {

    try {

        const {

            name,
            description,
            color,
            icon

        } = req.body;


        /* VALIDATION */

        if (

            !name ||

            !name.trim()

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Role name is required."

            });

        }


        const existingRole =
            await Role.findOne({

                where: {

                    name:
                        name.trim()

                }

            });


        if (existingRole) {

            return res.status(400).json({

                success: false,

                message:
                    "Role already exists."

            });

        }


        const role =
            await Role.create({

                name:
                    name.trim(),

                description:
                    description || "",

                color:
                    color || null,

                icon:
                    icon || null,

                isSystem:
                    false

            });


        return res.status(201).json({

            success: true,

            message:
                "Role created successfully.",

            role

        });

    }

    catch (error) {

        console.error(
            "CREATE ROLE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create role.",

            error:
                error.message

        });

    }

};


/* ==========================================
   UPDATE ROLE
========================================== */

exports.updateRole = async (req, res) => {

    try {

        const role =
            await Role.findByPk(

                req.params.id

            );


        if (!role) {

            return res.status(404).json({

                success: false,

                message:
                    "Role not found."

            });

        }


        const {

            name,
            description,
            color,
            icon

        } = req.body;


        /* CHECK DUPLICATE NAME */

        if (

            name &&

            name.trim() !== role.name

        ) {

            const existingRole =
                await Role.findOne({

                    where: {

                        name:
                            name.trim()

                    }

                });


            if (

                existingRole &&

                existingRole.id !== role.id

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Another role already uses this name."

                });

            }

        }


        await role.update({

            name:

                name !== undefined

                    ? name.trim()

                    : role.name,


            description:

                description !== undefined

                    ? description

                    : role.description,


            color:

                color !== undefined

                    ? color

                    : role.color,


            icon:

                icon !== undefined

                    ? icon

                    : role.icon

        });


        return res.status(200).json({

            success: true,

            message:
                "Role updated successfully.",

            role

        });

    }

    catch (error) {

        console.error(
            "UPDATE ROLE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update role.",

            error:
                error.message

        });

    }

};


/* ==========================================
   DELETE ROLE
========================================== */

exports.deleteRole = async (req, res) => {

    try {

        const role =
            await Role.findByPk(

                req.params.id

            );


        if (!role) {

            return res.status(404).json({

                success: false,

                message:
                    "Role not found."

            });

        }


        /* PROTECT SYSTEM ROLES */

        if (role.isSystem) {

            return res.status(400).json({

                success: false,

                message:
                    "System roles cannot be deleted."

            });

        }


        /* REMOVE USER ROLE RELATIONSHIPS */

        await UserRole.destroy({

            where: {

                roleId:
                    role.id

            }

        });


        /*
        Sequelize will normally remove
        role-permission relationships if
        associations are configured correctly.
        */

        await role.setPermissions([]);


        await role.destroy();


        return res.status(200).json({

            success: true,

            message:
                "Role deleted successfully."

        });

    }

    catch (error) {

        console.error(
            "DELETE ROLE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete role.",

            error:
                error.message

        });

    }

};


/* ==========================================
   ASSIGN PERMISSIONS TO ROLE

   PUT /api/roles/:id/permissions

   Body:

   {
       "permissionIds": [1, 2, 3]
   }
========================================== */

exports.assignPermissions = async (req, res) => {

    try {

        const roleId =
            Number(req.params.id);


        const {

            permissionIds

        } = req.body;


        /* =====================================
           VALIDATE ROLE ID
        ===================================== */

        if (

            !roleId ||

            Number.isNaN(roleId)

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid role ID."

            });

        }


        /* =====================================
           VALIDATE PERMISSION IDS
        ===================================== */

        if (

            !Array.isArray(permissionIds)

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "permissionIds must be an array."

            });

        }


        const cleanPermissionIds =
            permissionIds

                .map(Number)

                .filter(

                    id =>

                        !Number.isNaN(id) &&

                        id > 0

                );


        /* REMOVE DUPLICATES */

        const uniquePermissionIds =
            [

                ...new Set(

                    cleanPermissionIds

                )

            ];


        /* =====================================
           FIND ROLE
        ===================================== */

        const role =
            await Role.findByPk(

                roleId

            );


        if (!role) {

            return res.status(404).json({

                success: false,

                message:
                    "Role not found."

            });

        }


        /* =====================================
           FIND VALID PERMISSIONS
        ===================================== */

        const permissions =
            await Permission.findAll({

                where: {

                    id:
                        uniquePermissionIds

                }

            });


        /*
        Prevent assignment of IDs
        that do not exist.
        */

        if (

            permissions.length !==
            uniquePermissionIds.length

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "One or more permissions do not exist."

            });

        }


        /* =====================================
           ASSIGN PERMISSIONS
        ===================================== */

        await role.setPermissions(

            permissions

        );


        /* =====================================
           GET UPDATED ROLE
        ===================================== */

        const updatedRole =
            await Role.findByPk(

                role.id,

                {

                    include: [

                        {
                            model: Permission,

                            as:
                                "permissions",

                            attributes: [

                                "id",

                                "name",

                                "description"

                            ],

                            through: {

                                attributes: []

                            }

                        }

                    ]

                }

            );


        return res.status(200).json({

            success: true,

            message:
                "Permissions assigned successfully.",

            role:
                updatedRole

        });

    }

    catch (error) {

        console.error(
            "ASSIGN PERMISSIONS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to assign permissions.",

            error:
                error.message

        });

    }

};


/* ==========================================
   GET ALL PERMISSIONS

   Useful for PermissionMatrix.jsx
========================================== */

exports.getAllPermissions = async (req, res) => {

    try {

        const permissions =
            await Permission.findAll({

                attributes: [

                    "id",

                    "name",

                    "description",

                    "createdAt"

                ],

                order: [

                    ["name", "ASC"]

                ]

            });


        return res.status(200).json({

            success: true,

            permissions

        });

    }

    catch (error) {

        console.error(
            "GET PERMISSIONS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load permissions.",

            error:
                error.message

        });

    }

};
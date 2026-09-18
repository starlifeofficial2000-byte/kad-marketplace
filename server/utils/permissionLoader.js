const { User, Role, Permission } = require("../models");

const loadUserPermissions = async (userId) => {

    const user = await User.findByPk(userId, {

        include: [

            {

                model: Role,

                as: "roles",

                include: [

                    {

                        model: Permission,

                        as: "permissions"

                    }

                ]

            }

        ]

    });

    if (!user) {

        return null;

    }

    const roles = [];

    const permissions = [];

    user.roles.forEach(role => {

        roles.push(role.name);

        role.permissions.forEach(permission => {

            if (!permissions.includes(permission.name)) {

                permissions.push(permission.name);

            }

        });

    });

    return {

        user,

        roles,

        permissions

    };

};

module.exports = loadUserPermissions;
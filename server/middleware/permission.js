module.exports = (...requiredPermissions) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message: "Authentication required."

            });

        }

        // Super Admin bypass
        if (

            req.user.roles.includes("Super Admin")

        ) {

            return next();

        }

        const userPermissions = req.user.permissions || [];

        const hasPermission = requiredPermissions.every(

            permission =>

                userPermissions.includes(permission)

        );

        if (!hasPermission) {

            return res.status(403).json({

                success: false,

                message: "You do not have permission to perform this action."

            });

        }

        next();

    };

};
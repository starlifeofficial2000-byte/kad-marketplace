module.exports = (permission) => {

    return (req, res, next) => {

        if (

            !req.user

        ) {

            return res.status(401).json({

                success: false,

                message: "Authentication required."

            });

        }

        if (

            req.user.roles.includes("Super Admin")

        ) {

            return next();

        }

        if (

            req.user.permissions.includes(permission)

        ) {

            return next();

        }

        return res.status(403).json({

            success: false,

            message: "Permission denied."

        });

    };

};
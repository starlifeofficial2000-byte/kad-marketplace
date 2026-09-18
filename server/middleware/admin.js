module.exports = (req, res, next) => {

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message: "Please login."

        });

    }

    if (

        !req.user.roles.includes("Admin") &&

        !req.user.roles.includes("Super Admin")

    ) {

        return res.status(403).json({

            success: false,

            message: "Administrator access required."

        });

    }

    next();

};
const createAuditLog = require("../utils/auditLogger");

/* ==========================================
   SAFE INPUT SANITIZER
========================================== */

const sanitize = (value) => {
    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value).trim();
};
const {

    User,

    Product,

    Review,

    Role,

    UserRole,

    LoginHistory,

    SecurityAlert

} = require("../models");
const {
    getR2PublicUrl,
    deleteFromR2
} = require("../config/r2");

/* ==========================================
   GET LOGGED IN USER PROFILE
========================================== */

exports.getProfile = async (req, res) => {

    try {

        const user = await User.findByPk(

            req.user.id,

            {

                attributes: {

                    exclude: ["password"]

                }

            }

        );

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        res.json(user);

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/* ==========================================
   UPDATE PROFILE
========================================== */


/* ==========================================
   PROFILE IMAGE HELPERS
========================================== */

const getR2ProfileKey = (image) => {
    if (!image) return null;

    let value = String(image).trim();

    if (!value) return null;

    /*
     * R2 public URL
     */
    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        const r2PublicUrl =
            process.env.R2_PUBLIC_URL
                ?.trim()
                .replace(/\/+$/, "");

        if (
            r2PublicUrl &&
            value.startsWith(r2PublicUrl)
        ) {
            try {
                const parsed = new URL(value);

                const key =
                    decodeURIComponent(
                        parsed.pathname
                            .replace(/^\/+/, "")
                    );

                if (
                    key.startsWith(
                        "uploads/profiles/"
                    )
                ) {
                    return key;
                }
            } catch {
                return null;
            }
        }

        return null;
    }

    /*
     * Stored R2 key
     */
    value = value
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

    if (
        value.startsWith(
            "uploads/profiles/"
        )
    ) {
        return value;
    }

    return null;
};


const getProfileImageUrl = (image) => {
    if (!image) return null;

    const value =
        String(image).trim();

    if (!value) return null;

    /*
     * Already a complete URL
     */
    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    const normalized =
        value
            .replace(/\\/g, "/")
            .replace(/^\/+/, "");

    /*
     * New R2 profile image
     */
    if (
        normalized.startsWith(
            "uploads/profiles/"
        )
    ) {
        return (
            getR2PublicUrl(
                normalized
            ) || null
        );
    }

    /*
     * Legacy profile image.
     *
     * Keep existing users working while
     * migration is completed.
     */
    if (
        normalized.startsWith(
            "uploads/"
        )
    ) {
        return `/${normalized}`;
    }

    /*
     * Very old database records may contain
     * only the filename.
     */
    return `/uploads/${normalized}`;
};


/* ==========================================
   UPDATE PROFILE
========================================== */

exports.updateProfile = async (req, res) => {

    try {

        const user =
            await User.findByPk(
                req.user.id
            );

        if (!user) {

            /*
             * The middleware may already have
             * uploaded the image to R2.
             *
             * If there is no user, remove it.
             */
            if (req.file?.r2Key) {

                try {

                    await deleteFromR2(
                        req.file.r2Key
                    );

                } catch (cleanupError) {

                    console.error(
                        "PROFILE IMAGE CLEANUP ERROR:",
                        cleanupError.message
                    );

                }

            }

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        /* ==========================================
           PROFILE IMAGE
        ========================================== */

        let profileImage =
            user.profileImage;

        let newProfileImageKey =
            null;


        if (req.file) {

            /*
             * New R2 upload
             */
            newProfileImageKey =
                req.file.r2Key ||
                req.file.key;

            if (!newProfileImageKey) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Profile image upload did not return an R2 object key."

                });

            }

            profileImage =
                newProfileImageKey;

        }


        /* ==========================================
           SANITIZED INPUT
        ========================================== */

        const name =
            sanitize(
                req.body.name
            );

        const email =
            sanitize(
                req.body.email
            );

        const phone =
            sanitize(
                req.body.phone
            );

        const ghanaCard =
            sanitize(
                req.body.ghanaCard
            );

        const region =
            sanitize(
                req.body.region
            );

        const city =
            sanitize(
                req.body.city
            );

        const address =
            sanitize(
                req.body.address
            );


        /* ==========================================
           BASIC VALIDATION
        ========================================== */

        if (!name) {

            if (newProfileImageKey) {

                try {

                    await deleteFromR2(
                        newProfileImageKey
                    );

                } catch {}

            }

            return res.status(400).json({

                success: false,

                message:
                    "Full name is required."

            });

        }


        if (!email) {

            if (newProfileImageKey) {

                try {

                    await deleteFromR2(
                        newProfileImageKey
                    );

                } catch {}

            }

            return res.status(400).json({

                success: false,

                message:
                    "Email address is required."

            });

        }


        /* ==========================================
           SAVE OLD PROFILE IMAGE
        ========================================== */

        const oldProfileImage =
            user.profileImage;


        /* ==========================================
           UPDATE USER
        ========================================== */

        try {

            await user.update({

                name,

                email,

                phone,

                ghanaCard,

                region,

                city,

                address,

                profileImage

            });

        } catch (databaseError) {

            /*
             * Database update failed.
             *
             * Remove the newly uploaded R2
             * object so it doesn't become orphaned.
             */
            if (newProfileImageKey) {

                try {

                    await deleteFromR2(
                        newProfileImageKey
                    );

                } catch (cleanupError) {

                    console.error(
                        "FAILED TO CLEAN NEW PROFILE IMAGE:",
                        cleanupError.message
                    );

                }

            }

            throw databaseError;

        }


        /* ==========================================
           DELETE OLD R2 IMAGE
        ========================================== */

        if (
            newProfileImageKey &&
            oldProfileImage
        ) {

            const oldKey =
                getR2ProfileKey(
                    oldProfileImage
                );

            /*
             * Only delete images that are
             * actually stored in R2.
             *
             * Legacy Railway images are left
             * untouched until migration.
             */
            if (
                oldKey &&
                oldKey !==
                    newProfileImageKey
            ) {

                try {

                    await deleteFromR2(
                        oldKey
                    );

                    console.log(
                        "OLD PROFILE IMAGE DELETED:",
                        oldKey
                    );

                } catch (deleteError) {

                    /*
                     * Do not fail the profile
                     * update just because cleanup
                     * failed.
                     */
                    console.error(
                        "OLD PROFILE IMAGE DELETE ERROR:",
                        deleteError.message
                    );

                }

            }

        }


        /* ==========================================
           GET UPDATED USER
        ========================================== */

        const updatedUser =
            await User.findByPk(
                req.user.id,
                {
                    attributes: {
                        exclude: [
                            "password"
                        ]
                    }
                }
            );


        /* ==========================================
           FORMAT PROFILE IMAGE URL
        ========================================== */

        const userData =
            updatedUser.toJSON();

        userData.profileImage =
            getProfileImageUrl(
                userData.profileImage
            );


        /* ==========================================
           RESPONSE
        ========================================== */

        return res.json({

            success: true,

            message:
                "Profile updated successfully.",

            user:
                userData

        });

    } catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to update profile."

        });

    }

};

/* ==========================================
   GET SELLER PROFILE
========================================== */

exports.getSellerProfile = async (req, res) => {

    try {

        /* ==========================================
           GET SELLER
        ========================================== */

        const seller = await User.findByPk(
            req.params.id,
            {
                attributes: {
                    exclude: [
                        "password",
                        "loginOTP",
                        "resetOTP"
                    ]
                }
            }
        );


        /* ==========================================
           SELLER NOT FOUND
        ========================================== */

        if (!seller) {

            return res.status(404).json({
                success: false,
                message: "Seller not found."
            });

        }


        /* ==========================================
           GET SELLER PRODUCTS
        ========================================== */

        const products = await Product.findAll({

            where: {

                userId: seller.id,

                status: "Approved",

                deleted: false

            },

            order: [
                ["createdAt", "DESC"]
            ]

        });


        /* ==========================================
           FORMAT PRODUCTS
        ========================================== */

        const formattedProducts = products.map(
            (product) => {

                const p = product.toJSON();

                let images = [];


                /* ======================================
                   PARSE PRODUCT IMAGES
                ====================================== */

                if (p.images) {

                    try {

                        if (
                            typeof p.images === "string"
                        ) {

                            const parsedImages =
                                JSON.parse(p.images);


                            if (
                                Array.isArray(parsedImages)
                            ) {

                                images = parsedImages;

                            } else if (
                                typeof parsedImages === "string"
                            ) {

                                images = [
                                    parsedImages
                                ];

                            }

                        } else if (
                            Array.isArray(p.images)
                        ) {

                            images = p.images;

                        }

                    } catch (imageParseError) {

                        console.log(
                            "PRODUCT IMAGE PARSE ERROR:",
                            imageParseError.message
                        );

                        images = [
                            p.images
                        ];

                    }

                }


                /* ======================================
                   CONVERT IMAGES TO PUBLIC URL
                ====================================== */

                images = images
                    .filter(
                        (image) =>
                            image &&
                            typeof image === "string"
                    )
                    .map((image) => {

                        const cleanImage =
                            image
                                .trim()
                                .replace(/^\/+/, "");


                        if (!cleanImage) {
                            return null;
                        }


                        /* Already a URL */

                        if (
                            cleanImage.startsWith(
                                "http://"
                            ) ||
                            cleanImage.startsWith(
                                "https://"
                            )
                        ) {

                            return cleanImage;

                        }


                        /* R2 public URL */

                        try {

                            return getR2PublicUrl(
                                cleanImage
                            );

                        } catch (r2Error) {

                            console.log(
                                "R2 IMAGE URL ERROR:",
                                r2Error.message
                            );

                            return `/${cleanImage}`;

                        }

                    })
                    .filter(Boolean);


                p.images = images;


                return p;

            }
        );


        /* ==========================================
           GET SELLER REVIEWS
        ========================================== */

        const reviews =
            await Review.findAll({

                where: {
                    sellerId: seller.id
                }

            });


        /* ==========================================
           CALCULATE AVERAGE RATING
        ========================================== */

        let averageRating = 0;


        if (reviews.length > 0) {

            const totalRating =
                reviews.reduce(
                    (sum, review) => {

                        return (
                            sum +
                            Number(
                                review.rating || 0
                            )
                        );

                    },
                    0
                );


            averageRating = (
                totalRating /
                reviews.length
            ).toFixed(1);

        }


        /* ==========================================
           FORMAT SELLER
        ========================================== */

        const sellerData =
            seller.toJSON();


        /* ==========================================
           FORMAT PROFILE IMAGE
        ========================================== */

        try {

            sellerData.profileImage =
                getProfileImageUrl(
                    sellerData.profileImage
                );

        } catch (profileImageError) {

            console.log(
                "PROFILE IMAGE URL ERROR:",
                profileImageError.message
            );

        }


        /* ==========================================
           SELLER STATISTICS
        ========================================== */

        sellerData.averageRating =
            Number(averageRating);

        sellerData.totalReviews =
            reviews.length;

        sellerData.totalProducts =
            formattedProducts.length;

        sellerData.lastSeen =
            seller.lastSeen ||
            "Recently Active";

        sellerData.verified =
            seller.verified ||
            false;


        /* ==========================================
           RESPONSE
        ========================================== */

        return res.json({

            success: true,

            seller: sellerData,

            products: formattedProducts

        });

    } catch (error) {

        console.error(
            "GET SELLER PROFILE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to load seller profile."

        });

    }

};


/*
=========================================
ADMIN - GET ALL USERS
=========================================
*/

exports.getAllUsers = async (req, res) => {

    try {

        const users = await User.findAll({

            attributes: {

                exclude: [
                    "password",
                    "loginOTP",
                    "resetOTP"
                ]

            },

            include: [

                {

                    model: Role,

                    as: "roles",

                    through: {

                        attributes: []

                    }

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });


        return res.json({

            success: true,

            users

        });

    } catch (error) {

        console.error(
            "GET ALL USERS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to load users."

        });

    }

};
/*
=========================================
ADMIN - GET ALL USERS
=========================================
*/

exports.getAllUsers = async (req, res) => {

    try {

        const users = await User.findAll({

            attributes: {

                exclude: [

                    "password",

                    "loginOTP",

                    "resetOTP"

                ]

            },

            include: [

                {

                    model: Role,

                    as: "roles",

                    through: {

                        attributes: []

                    }

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });

        res.json({

            success: true,

            users

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
/*
=========================================
CHANGE USER ROLE
=========================================
*/

exports.changeUserRole = async (req, res) => {

    try {

        const { roleId } = req.body;

        const user = await User.findByPk(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        const role = await Role.findByPk(roleId);

        if (!role) {

            return res.status(404).json({

                success: false,

                message: "Role not found."

            });

        }

        await UserRole.destroy({

            where: {

                userId: user.id

            }

        });

        await UserRole.create({

            userId: user.id,

            roleId: role.id

        });

        await createAuditLog(

            req.user.id,

            "Changed User Role",

            `Changed ${user.name}'s role to ${role.name}`,

            req

        );

        const updatedUser = await User.findByPk(

            user.id,

            {

                include: [

                    {

                        model: Role,

                        as: "roles"

                    }

                ]

            }

        );

        res.json({

            success: true,

            message: "Role updated successfully.",

            user: updatedUser

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
/*
=========================================
ADMIN - BLOCK USER
=========================================
*/

exports.blockUser = async (req, res) => {

    try {

        const user = await User.findByPk(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        user.status = "blocked";

        await user.save();

        await createAuditLog(

            req.user.id,

            "Blocked User",

            `Blocked user ${user.name}`,

            req

        );

        res.json({

            success: true,

            message: "User blocked."

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
/*
=========================================
ADMIN - UNBLOCK USER
=========================================
*/

exports.unblockUser = async (req, res) => {

    try {

        const user = await User.findByPk(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        user.status = "active";

        user.loginAttempts = 0;

        user.lockUntil = null;

        await user.save();

        await createAuditLog(

            req.user.id,

            "Unblocked User",

            `Unblocked user ${user.name}`,

            req

        );

        res.json({

            success: true,

            message: "User unblocked."

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
/*
=========================================
ADMIN - DELETE USER
=========================================
*/

exports.deleteUser = async (req, res) => {

    try {

        const user = await User.findByPk(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        const deletedUser = user.name;

        await user.destroy();

        await createAuditLog(

            req.user.id,

            "Deleted User",

            `Deleted user ${deletedUser}`,

            req

        );

        res.json({

            success: true,

            message: "User deleted."

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

/*
=========================================
ADMIN - GET USER DETAILS
=========================================
*/

exports.getUserDetails = async (req, res) => {

    try {

        const user = await User.findByPk(

            req.params.id,

            {

                attributes: {

                    exclude: [

                        "password",

                        "loginOTP",

                        "resetOTP"

                    ]

                },

                include: [

                    {

                        model: Role,

                        as: "roles"

                    },

                    {

                        model: LoginHistory,

                        as: "loginHistory",

                        limit: 10,

                        separate: true,

                        order: [

                            ["createdAt", "DESC"]

                        ]

                    },

                    {

                        model: SecurityAlert,

                        as: "securityAlerts",

                        limit: 10,

                        separate: true,

                        order: [

                            ["createdAt", "DESC"]

                        ]

                    }

                ]

            }

        );

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found."

            });

        }

        res.json({

            success: true,

            user

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};exports.getRoles = async (req, res) => {

    try {

        const roles = await Role.findAll({

            include: [

                {

                    model: Permission,

                    as: "permissions",

                    through: {

                        attributes: []

                    }

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

                    }

                }

            ],

            order: [

                ["name", "ASC"]

            ]

        });

        res.json({

            success: true,

            roles

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
const createAuditLog = require("../utils/auditLogger");

const {
    User,
    Product,
    Review,
    Role,
    Permission,
    UserRole,
    LoginHistory,
    SecurityAlert,
    Subscription,
    Store,
} = require("../models");

const {
    getR2PublicUrl,
    deleteFromR2,
} = require("../config/r2");

/* =========================================================
   HELPERS
========================================================= */

const sanitize = (value) => {
    if (value === undefined || value === null) {
        return "";
    }

    return String(value).trim();
};

const normalizeRoleId = (value) => {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
};

const getBackendPublicUrl = () => {
    return (
        process.env.SERVER_URL ||
        process.env.API_URL ||
        process.env.BACKEND_URL ||
        ""
    )
        .trim()
        .replace(/\/+$/, "");
};

/* =========================================================
   PROFILE IMAGE HELPERS
========================================================= */

const getR2ProfileKey = (image) => {
    if (!image) {
        return null;
    }

    let value = String(image).trim();

    if (!value) {
        return null;
    }

    /*
     * If database contains the complete R2 URL,
     * extract the object key.
     */
    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        const r2PublicUrl = (
            process.env.R2_PUBLIC_URL || ""
        )
            .trim()
            .replace(/\/+$/, "");

        if (
            !r2PublicUrl ||
            !value.startsWith(r2PublicUrl)
        ) {
            return null;
        }

        try {
            const parsed = new URL(value);

            const key = decodeURIComponent(
                parsed.pathname.replace(/^\/+/, "")
            );

            if (
                key.startsWith(
                    "uploads/profiles/"
                )
            ) {
                return key;
            }

            return null;
        } catch {
            return null;
        }
    }

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

/* =========================================================
   GET PUBLIC PROFILE IMAGE URL
========================================================= */

const getProfileImageUrl = (image) => {
    if (!image) {
        return null;
    }

    const value = String(image).trim();

    if (!value) {
        return null;
    }

    /*
     * Already a complete URL.
     */
    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    const normalized = value
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

    /*
     * New R2 profile image.
     */
    if (
        normalized.startsWith(
            "uploads/profiles/"
        )
    ) {
        return (
            getR2PublicUrl(normalized) ||
            null
        );
    }

    /*
     * Default image.
     */
    if (normalized === "default.png") {
        return null;
    }

    /*
     * Legacy Railway uploads.
     */
    const backendUrl =
        getBackendPublicUrl();

    if (
        normalized.startsWith(
            "uploads/"
        )
    ) {
        if (backendUrl) {
            return `${backendUrl}/${normalized}`;
        }

        return `/${normalized}`;
    }

    /*
     * Very old records containing only
     * the filename.
     */
    if (backendUrl) {
        return `${backendUrl}/uploads/${normalized}`;
    }

    return `/uploads/${normalized}`;
};

/* =========================================================
   FORMAT USER RESPONSE
========================================================= */

const formatUser = (user) => {
    if (!user) {
        return null;
    }

    const data =
        typeof user.toJSON === "function"
            ? user.toJSON()
            : { ...user };

    /*
     * Always return roles as an array.
     */
    data.roles = Array.isArray(data.roles)
        ? data.roles
        : [];

    /*
     * Convenient primary role for frontend.
     */
    data.primaryRole =
        data.roles.length > 0
            ? data.roles[0]
            : null;

    /*
     * Public profile image URL.
     */
    data.profileImageUrl =
        getProfileImageUrl(
            data.profileImage
        );

    return data;
};

/* =========================================================
   SAFE ERROR MESSAGE
========================================================= */

const getErrorMessage = (error) => {
    console.error(error);

    if (
        process.env.NODE_ENV ===
        "development"
    ) {
        return (
            error.message ||
            "An unexpected server error occurred."
        );
    }

    return "An unexpected server error occurred.";
};

/* =========================================================
   GET LOGGED-IN USER PROFILE
========================================================= */

exports.getProfile = async (
    req,
    res
) => {
    try {
        const user =
            await User.findByPk(
                req.user.id,
                {
                    attributes: {
                        exclude: [
                            "password",
                            "loginOTP",
                            "loginOTPExpires",
                            "resetOTP",
                            "resetOTPExpires",
                            "twoFactorCode",
                            "twoFactorExpires",
                        ],
                    },

                    include: [
                        {
                            model: Role,
                            as: "roles",
                            through: {
                                attributes: [],
                            },
                            required: false,
                        },
                    ],
                }
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found.",
            });
        }

        return res.json({
            success: true,
            user: formatUser(user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                getErrorMessage(error),
        });
    }
};

/* =========================================================
   UPDATE PROFILE
========================================================= */

exports.updateProfile = async (
    req,
    res
) => {
    let newProfileImageKey = null;

    try {
        const user =
            await User.findByPk(
                req.user.id
            );

        if (!user) {
            if (req.file?.r2Key) {
                try {
                    await deleteFromR2(
                        req.file.r2Key
                    );
                } catch (
                    cleanupError
                ) {
                    console.error(
                        "PROFILE IMAGE CLEANUP ERROR:",
                        cleanupError.message
                    );
                }
            }

            return res.status(404).json({
                success: false,
                message:
                    "User not found.",
            });
        }

        let profileImage =
            user.profileImage;

        /*
         * New R2 upload.
         */
        if (req.file) {
            newProfileImageKey =
                req.file.r2Key ||
                req.file.key;

            if (!newProfileImageKey) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Profile image upload did not return an R2 object key.",
                });
            }

            profileImage =
                newProfileImageKey;
        }

        const name = sanitize(
            req.body.name
        );

        const email = sanitize(
            req.body.email
        );

        const phone = sanitize(
            req.body.phone
        );

        const ghanaCard = sanitize(
            req.body.ghanaCard
        );

        const region = sanitize(
            req.body.region
        );

        const city = sanitize(
            req.body.city
        );

        const address = sanitize(
            req.body.address
        );

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
                    "Full name is required.",
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
                    "Email address is required.",
            });
        }

        const oldProfileImage =
            user.profileImage;

        try {
            await user.update({
                name,
                email,
                phone,
                ghanaCard,
                region,
                city,
                address,
                profileImage,
            });
        } catch (
            databaseError
        ) {
            if (newProfileImageKey) {
                try {
                    await deleteFromR2(
                        newProfileImageKey
                    );
                } catch {}
            }

            throw databaseError;
        }

        /*
         * Delete old R2 image after successful
         * database update.
         */
        if (
            newProfileImageKey &&
            oldProfileImage
        ) {
            const oldKey =
                getR2ProfileKey(
                    oldProfileImage
                );

            if (
                oldKey &&
                oldKey !==
                    newProfileImageKey
            ) {
                try {
                    await deleteFromR2(
                        oldKey
                    );
                } catch (
                    deleteError
                ) {
                    console.error(
                        "OLD PROFILE IMAGE DELETE ERROR:",
                        deleteError.message
                    );
                }
            }
        }

        /*
         * Load updated user with roles.
         */
        const updatedUser =
            await User.findByPk(
                req.user.id,
                {
                    attributes: {
                        exclude: [
                            "password",
                            "loginOTP",
                            "loginOTPExpires",
                            "resetOTP",
                            "resetOTPExpires",
                            "twoFactorCode",
                            "twoFactorExpires",
                        ],
                    },

                    include: [
                        {
                            model: Role,
                            as: "roles",
                            through: {
                                attributes: [],
                            },
                            required: false,
                        },
                    ],
                }
            );

        return res.json({
            success: true,
            message:
                "Profile updated successfully.",
            user:
                formatUser(
                    updatedUser
                ),
        });
    } catch (error) {
        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                getErrorMessage(error),
        });
    }
};

/* =========================================================
   GET SELLER PROFILE
========================================================= */

exports.getSellerProfile =
    async (req, res) => {
        try {
            const seller =
                await User.findByPk(
                    req.params.id,
                    {
                        attributes: {
                            exclude: [
                                "password",
                                "loginOTP",
                                "loginOTPExpires",
                                "resetOTP",
                                "resetOTPExpires",
                                "twoFactorCode",
                                "twoFactorExpires",
                            ],
                        },

                        include: [
                            {
                                model: Role,
                                as: "roles",
                                through: {
                                    attributes: [],
                                },
                                required: false,
                            },
                        ],
                    }
                );

            if (!seller) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Seller not found.",
                });
            }

            const products =
                await Product.findAll({
                    where: {
                        userId:
                            seller.id,
                        status:
                            "Approved",
                    },

                    order: [
                        [
                            "createdAt",
                            "DESC",
                        ],
                    ],
                });

            const formattedProducts =
                products.map(
                    (product) => {
                        const data =
                            product.toJSON();

                        if (
                            Array.isArray(
                                data.images
                            )
                        ) {
                            return data;
                        }

                        try {
                            data.images =
                                data.images
                                    ? JSON.parse(
                                          data.images
                                      )
                                    : [];
                        } catch {
                            data.images =
                                [];
                        }

                        return data;
                    }
                );

            const reviews =
                await Review.findAll({
                    where: {
                        sellerId:
                            seller.id,
                    },
                });

            const averageRating =
                reviews.length > 0
                    ? (
                          reviews.reduce(
                              (
                                  total,
                                  review
                              ) =>
                                  total +
                                  Number(
                                      review.rating ||
                                          0
                                  ),
                              0
                          ) /
                          reviews.length
                      ).toFixed(1)
                    : 0;

            const sellerData =
                formatUser(seller);

            sellerData.averageRating =
                averageRating;

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

            return res.json({
                success: true,
                seller: sellerData,
                products:
                    formattedProducts,
            });
        } catch (error) {
            console.error(
                "GET SELLER PROFILE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    getErrorMessage(
                        error
                    ),
            });
        }
    };

/* =========================================================
   ADMIN - GET ALL USERS
========================================================= */

exports.getUsers = async (
    req,
    res
) => {
    try {
        const users =
            await User.findAll({
                attributes: {
                    exclude: [
                        "password",
                        "loginOTP",
                        "loginOTPExpires",
                        "resetOTP",
                        "resetOTPExpires",
                        "twoFactorCode",
                        "twoFactorExpires",
                    ],
                },

                include: [
                    {
                        model: Role,
                        as: "roles",
                        through: {
                            attributes: [],
                        },
                        required: false,
                    },
                ],

                order: [
                    [
                        "createdAt",
                        "DESC",
                    ],
                ],
            });

        return res.json({
            success: true,

            users: users.map(
                formatUser
            ),
        });
    } catch (error) {
        console.error(
            "ADMIN GET USERS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                getErrorMessage(error),
        });
    }
};

/*
 * Backward compatibility.
 *
 * Some older routes may still call
 * getAllUsers.
 */
exports.getAllUsers =
    exports.getUsers;

/* =========================================================
   ADMIN - GET SINGLE USER
========================================================= */

exports.getUser = async (
    req,
    res
) => {
    try {
        const user =
            await User.findByPk(
                req.params.id,
                {
                    attributes: {
                        exclude: [
                            "password",
                            "loginOTP",
                            "loginOTPExpires",
                            "resetOTP",
                            "resetOTPExpires",
                            "twoFactorCode",
                            "twoFactorExpires",
                        ],
                    },

                    include: [
                        {
                            model: Role,
                            as: "roles",
                            through: {
                                attributes: [],
                            },
                            required: false,
                        },
                    ],
                }
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found.",
            });
        }

        const products =
            await Product.findAll({
                where: {
                    userId: user.id,
                },

                order: [
                    [
                        "createdAt",
                        "DESC",
                    ],
                ],
            });

        const store =
            await Store.findOne({
                where: {
                    userId: user.id,
                },
            });

        const subscription =
            await Subscription.findOne({
                where: {
                    userId: user.id,
                },

                order: [
                    [
                        "createdAt",
                        "DESC",
                    ],
                ],
            });

        return res.json({
            success: true,

            user:
                formatUser(user),

            store,

            subscription,

            products,

            stats: {
                totalProducts:
                    products.length,
            },
        });
    } catch (error) {
        console.error(
            "ADMIN GET USER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                getErrorMessage(error),
        });
    }
};

/* =========================================================
   ADMIN - GET USER DETAILS
========================================================= */

exports.getUserDetails =
    async (req, res) => {
        try {
            const user =
                await User.findByPk(
                    req.params.id,
                    {
                        attributes: {
                            exclude: [
                                "password",
                                "loginOTP",
                                "loginOTPExpires",
                                "resetOTP",
                                "resetOTPExpires",
                                "twoFactorCode",
                                "twoFactorExpires",
                            ],
                        },

                        include: [
                            {
                                model: Role,
                                as: "roles",
                                through: {
                                    attributes: [],
                                },
                                required: false,
                            },

                            {
                                model:
                                    LoginHistory,
                                as:
                                    "loginHistory",
                                limit: 10,
                                separate: true,
                                order: [
                                    [
                                        "createdAt",
                                        "DESC",
                                    ],
                                ],
                            },

                            {
                                model:
                                    SecurityAlert,
                                as:
                                    "securityAlerts",
                                limit: 10,
                                separate: true,
                                order: [
                                    [
                                        "createdAt",
                                        "DESC",
                                    ],
                                ],
                            },
                        ],
                    }
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found.",
                });
            }

            return res.json({
                success: true,
                user:
                    formatUser(user),
            });
        } catch (error) {
            console.error(
                "ADMIN GET USER DETAILS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    getErrorMessage(
                        error
                    ),
            });
        }
    };

/* =========================================================
   ADMIN - CHANGE USER ROLE
========================================================= */

exports.changeUserRole =
    async (req, res) => {
        try {
            const userId =
                Number(req.params.id);

            const roleId =
                normalizeRoleId(
                    req.body.roleId
                );

            if (
                !Number.isInteger(
                    userId
                ) ||
                userId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid user ID.",
                });
            }

            if (!roleId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A valid role ID is required.",
                });
            }

            const user =
                await User.findByPk(
                    userId
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found.",
                });
            }

            const role =
                await Role.findByPk(
                    roleId
                );

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Role not found.",
                });
            }

            /*
             * Replace existing RBAC roles.
             */
            await UserRole.destroy({
                where: {
                    userId:
                        user.id,
                },
            });

            await UserRole.create({
                userId:
                    user.id,

                roleId:
                    role.id,
            });

            /*
             * Keep legacy User.role synchronized.
             */
            if (
                Object.prototype.hasOwnProperty.call(
                    User.rawAttributes,
                    "role"
                )
            ) {
                const normalizedName =
                    String(
                        role.name
                    ).toLowerCase();

                if (
                    normalizedName ===
                        "admin" ||
                    normalizedName ===
                        "administrator"
                ) {
                    user.role =
                        "admin";
                } else {
                    user.role =
                        "user";
                }

                await user.save();
            }

            await createAuditLog(
                req.user.id,
                "Changed User Role",
                `Changed ${user.name}'s role to ${role.name}`,
                req
            );

            const updatedUser =
                await User.findByPk(
                    user.id,
                    {
                        attributes: {
                            exclude: [
                                "password",
                                "loginOTP",
                                "loginOTPExpires",
                                "resetOTP",
                                "resetOTPExpires",
                                "twoFactorCode",
                                "twoFactorExpires",
                            ],
                        },

                        include: [
                            {
                                model: Role,
                                as: "roles",
                                through: {
                                    attributes: [],
                                },
                                required: false,
                            },
                        ],
                    }
                );

            return res.json({
                success: true,
                message:
                    "Role updated successfully.",

                user:
                    formatUser(
                        updatedUser
                    ),
            });
        } catch (error) {
            console.error(
                "CHANGE USER ROLE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    getErrorMessage(
                        error
                    ),
            });
        }
    };

/* =========================================================
   ADMIN - MAKE ADMIN
========================================================= */

exports.makeAdmin =
    async (req, res) => {
        try {
            const user =
                await User.findByPk(
                    req.params.id
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found.",
                });
            }

            const adminRole =
                await Role.findOne({
                    where: {
                        name: "Admin",
                    },
                });

            if (!adminRole) {
                return res.status(404).json({
                    success: false,
                    message:
                        'The "Admin" role does not exist.',
                });
            }

            await UserRole.destroy({
                where: {
                    userId:
                        user.id,
                },
            });

            await UserRole.create({
                userId:
                    user.id,

                roleId:
                    adminRole.id,
            });

            if (
                Object.prototype.hasOwnProperty.call(
                    User.rawAttributes,
                    "role"
                )
            ) {
                user.role =
                    "admin";

                await user.save();
            }

            await createAuditLog(
                req.user.id,
                "Made User Admin",
                `Made ${user.name} an admin`,
                req
            );

            return res.json({
                success: true,
                message:
                    "User is now an administrator.",
            });
        } catch (error) {
            console.error(
                "MAKE ADMIN ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    getErrorMessage(
                        error
                    ),
            });
        }
    };

/* =========================================================
   ADMIN - REMOVE ADMIN
========================================================= */

exports.removeAdmin =
    async (req, res) => {
        try {
            const user =
                await User.findByPk(
                    req.params.id
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found.",
                });
            }

            const adminRole =
                await Role.findOne({
                    where: {
                        name: "Admin",
                    },
                });

            if (adminRole) {
                await UserRole.destroy({
                    where: {
                        userId:
                            user.id,

                        roleId:
                            adminRole.id,
                    },
                });
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    User.rawAttributes,
                    "role"
                )
            ) {
                user.role =
                    "user";

                await user.save();
            }

            await createAuditLog(
                req.user.id,
                "Removed Admin",
                `Removed admin privileges from ${user.name}`,
                req
            );

            return res.json({
                success: true,
                message:
                    "Administrator privileges removed.",
            });
        } catch (error) {
            console.error(
                "REMOVE ADMIN ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    getErrorMessage(
                        error
                    ),
            });
        }
    };

/* =========================================================
   ADMIN - BLOCK USER
========================================================= */

exports.blockUser =
    async (req, res) => {
        try {
            const user =
                await User.findByPk(
                    req.params.id
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found.",
                });
            }

            user.status =
                "blocked";

            await user.save();

            await createAuditLog(
                req.user.id,
                "Blocked User",
                `Blocked user ${user.name}`,
                req
            );

            return res.json({
                success: true,
                message:
                    "User blocked.",
            });
        } catch (error) {
            console.error(
                "BLOCK USER ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    getErrorMessage(
                        error
                    ),
            });
        }
    };

/* =========================================================
   ADMIN - UNBLOCK USER
========================================================= */

exports.unblockUser =
    async (req, res) => {
        try {
            const user =
                await User.findByPk(
                    req.params.id
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found.",
                });
            }

            user.status =
                "active";

            user.loginAttempts = 0;
            user.lockUntil = null;

            await user.save();

            await createAuditLog(
                req.user.id,
                "Unblocked User",
                `Unblocked user ${user.name}`,
                req
            );

            return res.json({
                success: true,
                message:
                    "User unblocked.",
            });
        } catch (error) {
            console.error(
                "UNBLOCK USER ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    getErrorMessage(
                        error
                    ),
            });
        }
    };

/* =========================================================
   ADMIN - DELETE USER
========================================================= */

exports.deleteUser =
    async (req, res) => {
        try {
            const user =
                await User.findByPk(
                    req.params.id
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found.",
                });
            }

            /*
             * Do not allow an administrator
             * to delete their own account.
             */
            if (
                Number(user.id) ===
                Number(req.user.id)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "You cannot delete your own administrator account.",
                });
            }

            const deletedUser =
                user.name;

            /*
             * Remove RBAC assignments.
             */
            await UserRole.destroy({
                where: {
                    userId:
                        user.id,
                },
            });

            await user.destroy();

            await createAuditLog(
                req.user.id,
                "Deleted User",
                `Deleted user ${deletedUser}`,
                req
            );

            return res.json({
                success: true,
                message:
                    "User deleted.",
            });
        } catch (error) {
            console.error(
                "DELETE USER ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    getErrorMessage(
                        error
                    ),
            });
        }
    };

/* =========================================================
   ADMIN - GET ROLES
========================================================= */

exports.getRoles =
    async (req, res) => {
        try {
            const roles =
                await Role.findAll({
                    include: [
                        {
                            model:
                                Permission,

                            as:
                                "permissions",

                            through: {
                                attributes: [],
                            },

                            required:
                                false,
                        },

                        {
                            model:
                                User,

                            as:
                                "users",

                            attributes: [
                                "id",
                                "name",
                                "email",
                            ],

                            through: {
                                attributes: [],
                            },

                            required:
                                false,
                        },
                    ],

                    order: [
                        [
                            "name",
                            "ASC",
                        ],
                    ],
                });

            return res.json({
                success: true,
                roles,
            });
        } catch (error) {
            console.error(
                "GET ROLES ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    getErrorMessage(
                        error
                    ),
            });
        }
    };
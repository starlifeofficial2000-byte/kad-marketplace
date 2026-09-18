const rateLimit = require("express-rate-limit");

/* ==========================================
   LOGIN LIMITER
========================================== */

const loginLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 5,

    message: {

        success: false,

        message:
            "Too many login attempts. Please try again in 15 minutes."

    },

    standardHeaders: true,

    legacyHeaders: false

});

/* ==========================================
   REGISTER LIMITER
========================================== */

const registerLimiter = rateLimit({

    windowMs: 60 * 60 * 1000,

    max: 3,

    message: {

        success: false,

        message:
            "Too many accounts created. Please try again later."

    }

});

/* ==========================================
   PRODUCT UPLOAD LIMITER
========================================== */

const uploadLimiter = rateLimit({

    windowMs: 60 * 1000,

    max: 20,

    message: {

        success: false,

        message:
            "Too many uploads. Please slow down."

    }

});

/* ==========================================
   ADMIN LIMITER
========================================== */

const adminLimiter = rateLimit({

    windowMs: 60 * 1000,

    max: 100,

    message: {

        success: false,

        message:
            "Too many admin requests."

    }

});

/* ==========================================
   EXPORTS
========================================== */

module.exports = {

    loginLimiter,

    registerLimiter,

    uploadLimiter,

    adminLimiter

};
const express = require("express");

const router = express.Router();

const authController =
    require("../controllers/authController");

const auth =
    require("../middleware/auth");


/* =====================================================
   AUTHENTICATION
===================================================== */

router.post(

    "/register",

    authController.register

);


router.post(

    "/login",

    authController.login

);


/* =====================================================
   TWO FACTOR AUTHENTICATION
===================================================== */

router.post(

    "/verify-login-otp",

    authController.verifyLoginOTP

);


router.post(

    "/resend-login-otp",

    authController.resendLoginOTP

);


/* =====================================================
   PASSWORD RESET
===================================================== */

router.post(

    "/forgot-password",

    authController.forgotPassword

);


router.post(

    "/verify-reset-otp",

    authController.verifyResetOTP

);


router.post(

    "/reset-password",

    authController.resetPassword

);


/* =====================================================
   CURRENT USER
===================================================== */

router.get(

    "/me",

    auth,

    authController.getCurrentUser

);


module.exports = router;
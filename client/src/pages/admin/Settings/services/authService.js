import api from "../config/axios";


/* =========================================
   REGISTER USER
========================================= */

export const registerUser = (data) => {

    return api.post(
        "/auth/register",
        data
    );

};


/* =========================================
   LOGIN USER
========================================= */

export const loginUser = (data) => {

    return api.post(
        "/auth/login",
        data
    );

};


/* =========================================
   GET CURRENT USER
========================================= */

export const getCurrentUser = () => {

    return api.get(
        "/auth/me"
    );

};


/* =========================================
   LOGOUT USER
========================================= */

export const logoutUser = () => {

    return api.post(
        "/auth/logout"
    );

};


/* =========================================
   VERIFY EMAIL
========================================= */

export const verifyEmail = (data) => {

    return api.post(
        "/auth/verify-email",
        data
    );

};


/* =========================================
   FORGOT PASSWORD
========================================= */

export const forgotPassword = (data) => {

    return api.post(
        "/auth/forgot-password",
        data
    );

};


/* =========================================
   RESET PASSWORD
========================================= */

export const resetPassword = (data) => {

    return api.post(
        "/auth/reset-password",
        data
    );

};


export default {

    registerUser,

    loginUser,

    getCurrentUser,

    logoutUser,

    verifyEmail,

    forgotPassword,

    resetPassword

};
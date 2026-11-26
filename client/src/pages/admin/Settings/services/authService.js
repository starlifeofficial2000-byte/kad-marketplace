import api from "../../../../config/axios";


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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return Promise.resolve({ data: { success: true, message: "Signed out locally." } });
};


/* =========================================
   VERIFY EMAIL
========================================= */

export const verifyEmail = () => {
    return Promise.reject(new Error("The supplied backend does not expose an email-verification endpoint."));
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
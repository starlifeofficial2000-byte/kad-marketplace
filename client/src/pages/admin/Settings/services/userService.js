import api from "../../../../config/axios";


/* =========================================
   GET USER PROFILE
========================================= */

export const getProfile = () => {

    return api.get(
        "/users/profile"
    );

};


/* =========================================
   UPDATE PROFILE
========================================= */

export const updateProfile = (
    data
) => {

    return api.put(
        "/users/profile",
        data
    );

};


/* =========================================
   UPLOAD PROFILE IMAGE
========================================= */

export const uploadProfileImage = (
    formData
) => {

    return api.post(

        "/users/profile",

        formData,

        {
            headers: {
                "Content-Type":
                    "multipart/form-data"
            }
        }

    );

};


/* =========================================
   CHANGE PASSWORD
========================================= */

export const changePassword = () => {
    return Promise.reject(new Error("The supplied backend does not expose an authenticated change-password route. Use the existing OTP password-reset flow."));
};


/* =========================================
   DELETE ACCOUNT
========================================= */

export const deleteAccount = () => {

    return api.delete(
        "/users/me"
    );

};
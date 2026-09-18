import api from "../config/axios";


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

        "/users/profile/image",

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

export const changePassword = (
    data
) => {

    return api.put(
        "/users/change-password",
        data
    );

};


/* =========================================
   DELETE ACCOUNT
========================================= */

export const deleteAccount = () => {

    return api.delete(
        "/users/account"
    );

};
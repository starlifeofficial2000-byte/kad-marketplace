import api from "../config/axios";


/* =========================================
   GET ALL SETTINGS
========================================= */

export const getSettings = () => {

    return api.get(
        "/settings"
    );

};


/* =========================================
   GET PUBLIC SETTINGS
========================================= */

export const getPublicSettings = () => {

    return api.get(
        "/settings/public"
    );

};


/* =========================================
   SAVE MULTIPLE SETTINGS
========================================= */

export const saveSettings = (data) => {

    return api.put(
        "/settings",
        data
    );

};


/* =========================================
   SAVE SINGLE SETTING
========================================= */

export const saveSingleSetting = (data) => {

    return api.post(
        "/settings/single",
        data
    );

};


/* =========================================
   GET SETTINGS BY CATEGORY
========================================= */

export const getSettingsByCategory = (
    category
) => {

    return api.get(
        `/settings/category/${category}`
    );

};


/* =========================================
   UPLOAD LOGO
========================================= */

export const uploadLogo = (
    formData
) => {

    return api.post(

        "/settings/upload-logo",

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
   DELETE BRANDING
========================================= */

export const deleteBranding = (
    type
) => {

    return api.delete(
        `/settings/branding/${type}`
    );

};


/* =========================================
   TEST EMAIL
========================================= */

export const testEmail = (
    data
) => {

    return api.post(
        "/settings/test-email",
        data
    );

};


/* =========================================
   EXPORT SETTINGS
========================================= */

export const exportSettings = () => {

    return api.get(

        "/settings/export",

        {

            responseType:
                "blob"

        }

    );

};


/* =========================================
   IMPORT SETTINGS
========================================= */

export const importSettings = (
    formData
) => {

    return api.post(

        "/settings/import",

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
   DELETE SETTING
========================================= */

export const deleteSetting = (
    key
) => {

    return api.delete(
        `/settings/${key}`
    );

};
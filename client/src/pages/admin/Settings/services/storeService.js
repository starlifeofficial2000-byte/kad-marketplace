import api from "../../../../config/axios";


/* =========================================
   GET ALL STORES
========================================= */

export const getStores = (
    params = {}
) => {

    return api.get(
        "/admin/stores",
        { params }
    );

};


/* =========================================
   GET SINGLE STORE
========================================= */

export const getStoreById = (
    id
) => {

    return api.get(
        `/admin/stores/${id}`
    );

};


/* =========================================
   CREATE STORE
========================================= */

export const createStore = (
    formData
) => {

    return api.post(

        "/store/my-store",

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
   UPDATE STORE
========================================= */

export const updateStore = (
    id,
    data
) => {

    return api.put(
        "/store/my-store",
        data
    );

};


/* =========================================
   DELETE STORE
========================================= */

export const deleteStore = (
    id
) => {

    return api.delete(
        `/admin/stores/${id}`
    );

};


/* =========================================
   GET MY STORE
========================================= */

export const getMyStore = () => {

    return api.get(
        "/store/my-store"
    );

};
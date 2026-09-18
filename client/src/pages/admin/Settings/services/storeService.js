import api from "../config/axios";


/* =========================================
   GET ALL STORES
========================================= */

export const getStores = (
    params = {}
) => {

    return api.get(
        "/stores",
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
        `/stores/${id}`
    );

};


/* =========================================
   CREATE STORE
========================================= */

export const createStore = (
    formData
) => {

    return api.post(

        "/stores",

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
        `/stores/${id}`,
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
        `/stores/${id}`
    );

};


/* =========================================
   GET MY STORE
========================================= */

export const getMyStore = () => {

    return api.get(
        "/stores/my-store"
    );

};
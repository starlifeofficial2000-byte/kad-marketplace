import api from "../config/axios";


/* =========================================
   ADMIN DASHBOARD STATS
========================================= */

export const getAdminStats = () => {

    return api.get(
        "/admin/stats"
    );

};


/* =========================================
   GET PENDING PRODUCTS
========================================= */

export const getPendingProducts = () => {

    return api.get(
        "/admin/pending"
    );

};


/* =========================================
   APPROVE PRODUCT
========================================= */

export const approveProduct = (
    id
) => {

    return api.put(
        `/admin/approve/${id}`
    );

};


/* =========================================
   REJECT PRODUCT
========================================= */

export const rejectProduct = (
    id,
    data = {}
) => {

    return api.put(
        `/admin/reject/${id}`,
        data
    );

};


/* =========================================
   GET USERS
========================================= */

export const getAdminUsers = (
    params = {}
) => {

    return api.get(
        "/admin/users",
        { params }
    );

};


/* =========================================
   BLOCK USER
========================================= */

export const blockUser = (
    id
) => {

    return api.put(
        `/admin/users/${id}/block`
    );

};


/* =========================================
   UNBLOCK USER
========================================= */

export const unblockUser = (
    id
) => {

    return api.put(
        `/admin/users/${id}/unblock`
    );

};
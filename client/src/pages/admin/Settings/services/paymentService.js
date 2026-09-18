import api from "../config/axios";


/* =========================================
   INITIALIZE PAYMENT
========================================= */

export const initializePayment = (
    data
) => {

    return api.post(
        "/payments/initialize",
        data
    );

};


/* =========================================
   VERIFY PAYMENT
========================================= */

export const verifyPayment = (
    reference
) => {

    return api.get(
        `/payments/verify/${reference}`
    );

};


/* =========================================
   PAYMENT HISTORY
========================================= */

export const getPaymentHistory = () => {

    return api.get(
        "/payments/history"
    );

};
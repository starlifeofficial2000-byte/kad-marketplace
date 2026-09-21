import axios from "axios";

/* =========================================
   API SERVER
========================================= */

const API_SERVER =
    import.meta.env.VITE_API_SERVER ||
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:5000";


/* =========================================
   API BASE URL
=========================================

   Development:
   http://localhost:5000/api

   Production:
   https://kad-marketplace-production.up.railway.app/api

========================================= */

const API_URL =
    `${API_SERVER.replace(/\/+$/, "")}/api`;


/* =========================================
   CREATE AXIOS INSTANCE
========================================= */

const api = axios.create({

    baseURL: API_URL,

    timeout: 30000,

    headers: {

        Accept: "application/json"

    }

});


/* =========================================
   REQUEST INTERCEPTOR

   Automatically attaches JWT token.

   FormData requests must NOT manually
   specify multipart boundaries.
========================================= */

api.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem("token");


        /* =====================================
           JWT AUTHENTICATION
        ===================================== */

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        /* =====================================
           HANDLE FORM DATA
        ===================================== */

        if (
            config.data instanceof FormData
        ) {

            delete config.headers[
                "Content-Type"
            ];

            delete config.headers[
                "content-type"
            ];

        }

        else {

            config.headers[
                "Content-Type"
            ] = "application/json";

        }


        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


/* =========================================
   RESPONSE INTERCEPTOR
========================================= */

api.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        if (
            error.response?.status === 401
        ) {

            console.warn(
                "Authentication expired or invalid."
            );

        }

        return Promise.reject(error);

    }

);


export default api;
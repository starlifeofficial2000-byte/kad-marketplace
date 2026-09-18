import axios from "axios";

/* =========================================
   API BASE URL
========================================= */

const API_URL =
    import.meta.env.VITE_API_URL ||
    "/api";


/* =========================================
   CREATE AXIOS INSTANCE
========================================= */

const api = axios.create({

    baseURL: API_URL,

    headers: {

        "Content-Type": "application/json"

    }

});


/* =========================================
   REQUEST INTERCEPTOR

   Automatically attaches JWT token.
========================================= */

api.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem("token");


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

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
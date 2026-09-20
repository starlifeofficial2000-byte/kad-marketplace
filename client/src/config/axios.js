import axios from "axios";

/* =========================================
   API BASE URL
========================================= */

const API_URL =
    import.meta.env.VITE_API_URL || "/api";


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

   IMPORTANT:
   FormData requests must NOT use
   application/json.
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

            /*
             * VERY IMPORTANT:
             *
             * Do NOT manually set:
             *
             * Content-Type:
             * multipart/form-data
             *
             * and do NOT use:
             *
             * application/json
             *
             * Axios/browser will automatically
             * generate the correct boundary.
             */

            delete config.headers[
                "Content-Type"
            ];

            delete config.headers[
                "content-type"
            ];

        }

        else {

            /*
             * Normal JSON requests
             */

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
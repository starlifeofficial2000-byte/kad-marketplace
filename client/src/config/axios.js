import axios from "axios";

/*
=========================================================
KAD MARKETPLACE
CENTRAL API CLIENT
=========================================================
*/

/* =====================================================
   DEFAULT SERVER
===================================================== */

const DEFAULT_API_SERVER =
    "http://localhost:5000";


/* =====================================================
   READ ENVIRONMENT VARIABLES
===================================================== */

const RAW_API_SERVER =
    import.meta.env.VITE_API_SERVER ||
    import.meta.env.VITE_SERVER_URL ||
    DEFAULT_API_SERVER;


/* =====================================================
   NORMALIZE SERVER URL
===================================================== */

const normalizeServerUrl = (url) => {

    if (!url) {
        return DEFAULT_API_SERVER;
    }

    let normalized = String(url).trim();

    /*
    Remove trailing slash.
    */

    normalized = normalized.replace(/\/+$/, "");

    /*
    Prevent accidental /api/api
    if somebody puts /api in the environment variable.
    */

    normalized = normalized.replace(/\/api$/i, "");

    return normalized;
};


/* =====================================================
   FINAL SERVER URL
===================================================== */

const SERVER_URL =
    normalizeServerUrl(RAW_API_SERVER);


/* =====================================================
   FINAL API BASE URL
===================================================== */

const API_URL =
    `${SERVER_URL}/api`;


/* =====================================================
   DEVELOPMENT DEBUG
===================================================== */

if (import.meta.env.DEV) {

    console.log(
        "🔧 KAD MARKETPLACE SERVER:",
        SERVER_URL
    );

    console.log(
        "🔧 KAD MARKETPLACE API:",
        API_URL
    );
}


/* =====================================================
   CREATE AXIOS INSTANCE
===================================================== */

const api = axios.create({

    baseURL: API_URL,

    timeout: 30000,

    headers: {
        Accept: "application/json"
    }

});


/* =====================================================
   REQUEST INTERCEPTOR
===================================================== */

api.interceptors.request.use(

    (config) => {

        /*
        -----------------------------------------------
        JWT
        -----------------------------------------------
        */

        const token =
            localStorage.getItem("token");

        if (token) {

            config.headers =
                config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;
        }


        /*
        -----------------------------------------------
        FORM DATA
        -----------------------------------------------
        */

        if (
            typeof FormData !== "undefined" &&
            config.data instanceof FormData
        ) {

            /*
            Let Axios/browser generate:

            multipart/form-data;
            boundary=...

            */

            delete config.headers["Content-Type"];

            delete config.headers["content-type"];

        } else {

            config.headers =
                config.headers || {};

            config.headers["Content-Type"] =
                "application/json";
        }


        /*
        -----------------------------------------------
        DEVELOPMENT REQUEST LOG
        -----------------------------------------------
        */

        if (import.meta.env.DEV) {

            console.log(
                "➡️ API REQUEST:",
                config.method?.toUpperCase(),
                `${config.baseURL}${config.url}`
            );
        }


        return config;
    },

    (error) => {

        return Promise.reject(error);

    }

);


/* =====================================================
   RESPONSE INTERCEPTOR
===================================================== */

api.interceptors.response.use(

    (response) => {

        if (import.meta.env.DEV) {

            console.log(
                "⬅️ API RESPONSE:",
                response.status,
                response.config?.url
            );
        }

        return response;
    },


    (error) => {

        const status =
            error.response?.status;


        /*
        -----------------------------------------------
        401
        -----------------------------------------------
        */

        if (status === 401) {

            console.warn(
                "🔐 Authentication expired or invalid."
            );
        }


        /*
        -----------------------------------------------
        404
        -----------------------------------------------
        */

        if (status === 404) {

            console.error(
                "❌ API ROUTE NOT FOUND",
                {
                    method:
                        error.config?.method?.toUpperCase(),

                    baseURL:
                        error.config?.baseURL,

                    url:
                        error.config?.url,

                    fullURL:
                        `${error.config?.baseURL || ""}${error.config?.url || ""}`
                }
            );
        }


        /*
        -----------------------------------------------
        500+
        -----------------------------------------------
        */

        if (status >= 500) {

            console.error(
                "🔥 API SERVER ERROR",
                {
                    status,

                    url:
                        error.config?.url,

                    message:
                        error.response?.data?.message ||
                        error.message
                }
            );
        }


        return Promise.reject(error);

    }

);


export default api;
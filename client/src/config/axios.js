import axios from "axios";

/*
=========================================================
KAD MARKETPLACE
CENTRAL API CLIENT
=========================================================

Development:
http://localhost:5000/api

Production:
https://kad-marketplace-production.up.railway.app/api

IMPORTANT:
All frontend API requests should use this instance:

    api.get("/products")
    api.get("/subscription/plans")
    api.get("/subscription/my-subscription")

DO NOT use:

    axios.get("/products")

because that bypasses this configuration.
=========================================================
*/


/* =====================================================
   API SERVER
===================================================== */

const DEFAULT_API_SERVER =
    "http://localhost:5000";

const API_SERVER =
    import.meta.env.VITE_API_SERVER ||
    import.meta.env.VITE_SERVER_URL ||
    DEFAULT_API_SERVER;


/* =====================================================
   NORMALIZE API SERVER
=====================================================

Examples:

https://example.com
https://example.com/
https://example.com/api
https://example.com/api/
*/

const normalizeServerUrl = (url) => {

    if (!url) {
        return DEFAULT_API_SERVER;
    }

    let normalized = String(url).trim();

    /*
    Remove trailing slashes
    */

    normalized = normalized.replace(/\/+$/, "");

    /*
    Remove /api if someone accidentally puts it
    inside VITE_API_SERVER.

    This prevents:

    /api/api/products
    */

    normalized = normalized.replace(/\/api$/i, "");

    return normalized;
};


/* =====================================================
   SERVER URL
===================================================== */

const SERVER_URL =
    normalizeServerUrl(API_SERVER);


/* =====================================================
   FINAL API BASE URL
===================================================== */

const API_URL =
    `${SERVER_URL}/api`;


/* =====================================================
   DEBUG INFORMATION
=====================================================

This helps us immediately see what the production
frontend is using.

It does NOT expose the JWT token.
===================================================== */

if (import.meta.env.DEV) {

    console.log(
        "🔧 KAD API SERVER:",
        SERVER_URL
    );

    console.log(
        "🔧 KAD API BASE URL:",
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
        JWT TOKEN
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

        IMPORTANT:

        Do NOT manually set:

        multipart/form-data

        Axios/browser must generate the boundary.
        -----------------------------------------------
        */

        if (
            typeof FormData !== "undefined" &&
            config.data instanceof FormData
        ) {

            delete config.headers["Content-Type"];

            delete config.headers["content-type"];

        }

        else {

            config.headers =
                config.headers || {};

            config.headers["Content-Type"] =
                "application/json";
        }


        /*
        -----------------------------------------------
        DEBUG REQUEST URL
        -----------------------------------------------
        */

        if (import.meta.env.DEV) {

            console.log(
                "➡️ API REQUEST:",
                config.method?.toUpperCase(),
                config.baseURL,
                config.url
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

        /*
        -----------------------------------------------
        SERVER RESPONSE
        -----------------------------------------------
        */

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

            /*
            Do not automatically remove the token here.

            Some pages intentionally receive 401 responses
            while authentication is being initialized.

            Authentication handling should remain controlled
            by the application's auth layer.
            */
        }


        /*
        -----------------------------------------------
        404
        -----------------------------------------------

        This is particularly useful during the current
        Marketplace deployment.
        -----------------------------------------------
        */

        if (status === 404) {

            console.error(
                "❌ API ROUTE NOT FOUND:",
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
                "🔥 API SERVER ERROR:",
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


/* =====================================================
   EXPORT
===================================================== */

export default api;
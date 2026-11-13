import axios from "axios";

/*
=========================================================
KAD MARKETPLACE
CENTRAL API CLIENT
=========================================================
*/

/* =====================================================
   ENVIRONMENT
===================================================== */
import SERVER_URL from "./server";
const API_URL = `${SERVER_URL}/api`;

/* =====================================================
   DEVELOPMENT DEBUG
===================================================== */

if (import.meta.env.DEV) {

    console.log(
        "========================================"
    );

    console.log(
        "🔧 KAD MARKETPLACE API CONFIG"
    );

    console.log(
        "========================================"
    );

    console.log(
        "Environment:",
        import.meta.env.MODE
    );

    console.log(
        "API Server:",
        SERVER_URL
    );

    console.log(
        "API Base URL:",
        API_URL
    );

    console.log(
        "========================================"
    );
}


/* =====================================================
   CREATE AXIOS INSTANCE
===================================================== */

const api = axios.create({

    baseURL: API_URL,

    timeout: 30000,

    headers: {
        Accept:
            "application/json"
    }

});


/* =====================================================
   REQUEST INTERCEPTOR
===================================================== */

api.interceptors.request.use(

    (config) => {

        /*
        =================================================
        JWT AUTHENTICATION
        =================================================
        */

        const token =
            localStorage.getItem(
                "token"
            );


        if (token) {

            config.headers =
                config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;
        }


        /*
        =================================================
        CONTENT TYPE
        =================================================
        */

        /*
         * Axios/browser must generate the
         * multipart boundary automatically
         * for FormData.
         */

        if (
            typeof FormData !==
                "undefined" &&
            config.data instanceof
                FormData
        ) {

            if (
                config.headers
            ) {

                delete config.headers[
                    "Content-Type"
                ];

                delete config.headers[
                    "content-type"
                ];
            }

        } else {

            config.headers =
                config.headers || {};

            /*
             * Only set JSON automatically
             * when the caller has not supplied
             * another content type.
             */

            if (
                !config.headers[
                    "Content-Type"
                ] &&
                !config.headers[
                    "content-type"
                ]
            ) {

                config.headers[
                    "Content-Type"
                ] =
                    "application/json";
            }
        }


        /*
        =================================================
        DEVELOPMENT REQUEST LOG
        =================================================
        */

        if (import.meta.env.DEV) {

            console.log(
                "➡️ API REQUEST",
                {
                    method:
                        config.method
                            ?.toUpperCase(),

                    url:
                        config.url,

                    fullURL:
                        `${config.baseURL || ""}${config.url || ""}`,

                    hasToken:
                        Boolean(token),

                    isFormData:
                        typeof FormData !==
                            "undefined" &&
                        config.data instanceof
                            FormData
                }
            );
        }


        return config;
    },


    (error) => {

        console.error(
            "❌ API REQUEST SETUP ERROR:",
            error
        );

        return Promise.reject(
            error
        );
    }
);


/* =====================================================
   RESPONSE INTERCEPTOR
===================================================== */

api.interceptors.response.use(

    (response) => {

        /*
        =================================================
        DEVELOPMENT RESPONSE LOG
        =================================================
        */

        if (import.meta.env.DEV) {

            console.log(
                "⬅️ API RESPONSE",
                {
                    status:
                        response.status,

                    method:
                        response.config
                            ?.method
                            ?.toUpperCase(),

                    url:
                        response.config
                            ?.url
                }
            );
        }


        return response;
    },


    (error) => {

        const status =
            error.response?.status;

        const responseData =
            error.response?.data;

        const requestConfig =
            error.config;


        /*
        =================================================
        401 UNAUTHORIZED
        =================================================
        */

        if (status === 401) {

            console.warn(
                "🔐 Authentication expired or invalid.",
                {
                    url:
                        requestConfig?.url,

                    message:
                        responseData?.message ||
                        "Unauthorized"
                }
            );


            /*
             * IMPORTANT:
             *
             * Do NOT automatically remove
             * the token here.
             *
             * Some endpoints can return 401
             * during temporary authentication
             * states such as:
             *
             * - login
             * - 2FA
             * - OTP verification
             * - password reset
             *
             * Individual authentication pages
             * should control logout/session
             * cleanup.
             */
        }


        /*
        =================================================
        403 FORBIDDEN
        =================================================
        */

        if (status === 403) {

            console.warn(
                "⛔ API FORBIDDEN:",
                {
                    url:
                        requestConfig?.url,

                    message:
                        responseData?.message ||
                        "Access denied"
                }
            );
        }


        /*
        =================================================
        404 NOT FOUND
        =================================================
        */

        if (status === 404) {

            console.error(
                "❌ API ROUTE NOT FOUND",
                {
                    method:
                        requestConfig
                            ?.method
                            ?.toUpperCase(),

                    baseURL:
                        requestConfig
                            ?.baseURL,

                    url:
                        requestConfig
                            ?.url,

                    fullURL:
                        `${requestConfig?.baseURL || ""}${requestConfig?.url || ""}`,

                    message:
                        responseData?.message ||
                        "Route not found"
                }
            );
        }


        /*
        =================================================
        409 CONFLICT
        =================================================
        */

        if (status === 409) {

            console.warn(
                "⚠️ API CONFLICT:",
                {
                    url:
                        requestConfig?.url,

                    message:
                        responseData?.message ||
                        "Request conflict"
                }
            );
        }


        /*
        =================================================
        422 VALIDATION ERROR
        =================================================
        */

        if (status === 422) {

            console.warn(
                "⚠️ API VALIDATION ERROR:",
                {
                    url:
                        requestConfig?.url,

                    message:
                        responseData?.message ||
                        "Validation failed",

                    errors:
                        responseData?.errors ||
                        responseData?.validationErrors ||
                        null
                }
            );
        }


        /*
        =================================================
        429 RATE LIMIT
        =================================================
        */

        if (status === 429) {

            console.warn(
                "🚦 API RATE LIMIT:",
                {
                    url:
                        requestConfig?.url,

                    message:
                        responseData?.message ||
                        "Too many requests"
                }
            );
        }


        /*
        =================================================
        500+ SERVER ERROR
        =================================================
        */

        if (
            typeof status === "number" &&
            status >= 500
        ) {

            console.error(
                "🔥 API SERVER ERROR",
                {
                    status,

                    method:
                        requestConfig
                            ?.method
                            ?.toUpperCase(),

                    url:
                        requestConfig
                            ?.url,

                    message:
                        responseData?.message ||
                        error.message
                }
            );
        }


        /*
        =================================================
        NETWORK ERROR
        =================================================
        */

        if (
            !error.response
        ) {

            console.error(
                "🌐 API NETWORK ERROR",
                {
                    message:
                        error.message,

                    code:
                        error.code,

                    url:
                        requestConfig?.url,

                    baseURL:
                        requestConfig?.baseURL
                }
            );
        }


        /*
        =================================================
        RETURN ORIGINAL AXIOS ERROR
        =================================================
        */

        return Promise.reject(
            error
        );
    }
);


/* =====================================================
   EXPORT
===================================================== */

export default api;
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

/*
 * Local development server.
 */
const LOCAL_API_SERVER =
    "http://localhost:5000";

/*
 * Production API server.
 *
 * This should point to the Railway/API domain that
 * serves:
 *
 * https://api.kadmarket.com/api/...
 */
const PRODUCTION_API_SERVER =
    "https://api.kadmarket.com";


/* =====================================================
   READ ENVIRONMENT VARIABLES
===================================================== */

const ENV_API_SERVER =
    import.meta.env.VITE_API_SERVER;

const ENV_SERVER_URL =
    import.meta.env.VITE_SERVER_URL;


/* =====================================================
   SELECT SERVER
===================================================== */

const RAW_API_SERVER =
    ENV_API_SERVER ||
    ENV_SERVER_URL ||
    (
        import.meta.env.DEV
            ? LOCAL_API_SERVER
            : PRODUCTION_API_SERVER
    );


/* =====================================================
   NORMALIZE SERVER URL
===================================================== */

const normalizeServerUrl = (url) => {

    if (!url) {
        return import.meta.env.DEV
            ? LOCAL_API_SERVER
            : PRODUCTION_API_SERVER;
    }

    let normalized =
        String(url).trim();


    /*
     * Remove surrounding quotes that may
     * accidentally be placed in .env.
     */

    normalized =
        normalized.replace(
            /^["']|["']$/g,
            ""
        );


    /*
     * Remove trailing slash.
     */

    normalized =
        normalized.replace(
            /\/+$/,
            ""
        );


    /*
     * Prevent accidental:
     *
     * https://api.kadmarket.com/api/api
     *
     * if the environment variable already
     * contains /api.
     */

    normalized =
        normalized.replace(
            /\/api$/i,
            ""
        );


    /*
     * Remove accidental whitespace.
     */

    normalized =
        normalized.trim();


    return normalized;
};


/* =====================================================
   FINAL SERVER URL
===================================================== */

const SERVER_URL =
    normalizeServerUrl(
        RAW_API_SERVER
    );


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
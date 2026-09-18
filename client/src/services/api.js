import axios from "axios";

const api = axios.create({

    baseURL: import.meta.env.VITE_API_URL || "/api",

    headers: {

        "Content-Type": "application/json"

    }

});


/* =========================================
   AUTOMATICALLY ATTACH JWT TOKEN
========================================= */

api.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");


        console.log(
            "API REQUEST:",
            config.method?.toUpperCase(),
            config.url
        );

        console.log(
            "TOKEN EXISTS:",
            !!token
        );

        console.log(
            "TOKEN:",
            token
        );


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    },

    (error) => Promise.reject(error)

);


export default api;
import axios from "axios";


const API_URL =

    import.meta.env.VITE_API_URL ||

    "";


const getHeaders = () => {

    const token = localStorage.getItem("token");

    return {

        Authorization: `Bearer ${token}`

    };

};


/* =========================================
   UPLOAD BRANDING FILE
========================================= */

export const uploadBrandingFile = async (

    type,

    file

) => {

    const formData = new FormData();


    // Backend expects "image"

    formData.append(

        "image",

        file

    );


    // Tell backend what is being uploaded

    formData.append(

        "type",

        type

    );


    const response = await axios.post(

        `${API_URL}/api/settings/upload-logo`,

        formData,

        {

            headers: {

                ...getHeaders(),

                "Content-Type":

                    "multipart/form-data"

            }

        }

    );


    return response.data;

};
import api from "../config/axios";


/* =========================================
   GET ALL PRODUCTS
========================================= */

export const getProducts = (params = {}) => {

    return api.get(
        "/products",
        { params }
    );

};


/* =========================================
   GET SINGLE PRODUCT
========================================= */

export const getProductById = (id) => {

    return api.get(
        `/products/${id}`
    );

};


/* =========================================
   CREATE PRODUCT
========================================= */

export const createProduct = (formData) => {

    return api.post(

        "/products",

        formData,

        {
            headers: {
                "Content-Type":
                    "multipart/form-data"
            }
        }

    );

};


/* =========================================
   UPDATE PRODUCT
========================================= */

export const updateProduct = (
    id,
    data
) => {

    return api.put(
        `/products/${id}`,
        data
    );

};


/* =========================================
   DELETE PRODUCT
========================================= */

export const deleteProduct = (id) => {

    return api.delete(
        `/products/${id}`
    );

};


/* =========================================
   GET MY PRODUCTS
========================================= */

export const getMyProducts = () => {

    return api.get(
        "/products/my-products"
    );

};


/* =========================================
   SEARCH PRODUCTS
========================================= */

export const searchProducts = (
    query
) => {

    return api.get(
        "/products/search",
        {
            params: {
                q: query
            }
        }
    );

};
const sanitizeHtml = require("sanitize-html");

const sanitize = (text) => {

    if (!text) return "";

    return sanitizeHtml(text, {

        allowedTags: [],

        allowedAttributes: {}

    }).trim();

};

module.exports = sanitize;
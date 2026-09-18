const Setting = require("../models/Setting");


/* =========================================================
   GET ONE SETTING
========================================================= */

const getSetting = async (
    key,
    defaultValue = null
) => {

    try {

        if (!key) {

            return defaultValue;

        }


        const setting = await Setting.findOne({

            where: {

                settingKey: key

            }

        });


        if (!setting) {

            return defaultValue;

        }


        if (

            setting.settingValue === null ||

            setting.settingValue === undefined

        ) {

            return defaultValue;

        }


        return setting.settingValue;

    }

    catch (error) {

        console.error(

            `GET SETTING ERROR (${key}):`,

            error.message

        );


        return defaultValue;

    }

};

const getBooleanSetting = async (

    key,

    defaultValue = false

) => {

    try {

        const value = await getSetting(
            key,
            defaultValue ? "true" : "false"
        );


        if (typeof value === "boolean") {

            return value;

        }


        const normalizedValue = String(value)
            .trim()
            .toLowerCase();


        return [

            "true",
            "1",
            "yes",
            "on"

        ].includes(normalizedValue);

    }

    catch (error) {

        console.error(

            "GET BOOLEAN SETTING ERROR:",

            error.message

        );


        return defaultValue;

    }

};


/* =========================================================
   GET NUMBER SETTING
========================================================= */

const getNumberSetting = async (
    key,
    defaultValue = 0
) => {

    try {

        const value = await getSetting(
            key,
            null
        );


        if (

            value === null ||

            value === undefined ||

            value === ""

        ) {

            return defaultValue;

        }


        const number =
            Number(value);


        if (

            Number.isNaN(number)

        ) {

            return defaultValue;

        }


        return number;

    }

    catch (error) {

        console.error(

            `GET NUMBER SETTING ERROR (${key}):`,

            error.message

        );


        return defaultValue;

    }

};


/* =========================================================
   SET ONE SETTING

   Useful throughout the backend.
========================================================= */

const setSetting = async (
    key,
    value,
    category = "General"
) => {

    try {

        if (!key) {

            throw new Error(
                "Setting key is required."
            );

        }


        const settingValue =

            value === null ||

            value === undefined

                ? ""

                : String(value);


        const [setting] = await Setting.upsert(

            {

                settingKey: key,

                settingValue,

                category

            },

            {

                returning: true

            }

        );


        return setting;

    }

    catch (error) {

        console.error(

            `SET SETTING ERROR (${key}):`,

            error.message

        );


        throw error;

    }

};


/* =========================================================
   DELETE SETTING
========================================================= */

const deleteSetting = async (
    key
) => {

    try {

        return await Setting.destroy({

            where: {

                settingKey: key

            }

        });

    }

    catch (error) {

        console.error(

            `DELETE SETTING ERROR (${key}):`,

            error.message

        );


        throw error;

    }

};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {

    getSetting,

    getBooleanSetting,

    getNumberSetting,

    setSetting,

    deleteSetting

};
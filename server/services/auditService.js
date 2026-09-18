const AuditLog = require("../models/AuditLog");


/* =========================================================
   CREATE AUDIT LOG
========================================================= */

const createAuditLog = async ({

    adminId,

    action,

    entity,

    entityId = null,

    description = "",

    req = null

}) => {

    try {

        let ipAddress = null;


        if (req) {

            ipAddress =

                req.headers["x-forwarded-for"]
                    ?.split(",")[0]
                    ?.trim()

                ||

                req.ip

                ||

                req.socket?.remoteAddress

                ||

                null;

        }


        const log = await AuditLog.create({

            adminId,

            action,

            entity,

            entityId,

            description,

            ipAddress

        });


        return log;

    }

    catch (error) {

        /*
        Do not crash the main system
        if audit logging fails.
        */

        console.error(

            "AUDIT LOG ERROR:",

            error.message

        );


        return null;

    }

};


module.exports = {

    createAuditLog

};
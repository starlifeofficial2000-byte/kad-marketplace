const AuditLog = require("../models/AuditLog");

/* ==========================================
   CREATE AUDIT LOG
========================================== */

const createAuditLog = async ({

    adminId,

    action,

    entity,

    entityId = null,

    description = null,

    ipAddress = null

}) => {

    try {

        if (!adminId || !action || !entity) {

            console.log(
                "AUDIT LOG WARNING: Missing required fields."
            );

            return null;

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
const { AuditLog } = require("../models");

const createAuditLog = async (
    adminId,
    action,
    description,
    req
) => {

    try {

        await AuditLog.create({

            adminId,

            action,

            description,

            ipAddress: req.ip,

            userAgent: req.headers["user-agent"]

        });

    }

    catch (error) {

        console.log("Audit Log Error:", error);

    }

};

module.exports = createAuditLog;
const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {

    res.json({

        marketplaceName: "Kad Marketplace",

        marketplaceDescription: "",

        supportEmail: "",

        supportPhone: "",

        address: "",

        primaryColor: "#0A66C2",

        secondaryColor: "#198754",

        maintenanceMode: false,

        registrationEnabled: true,

        storeApprovalRequired: true,

        productApprovalRequired: true,

        defaultCurrency: "GHS"

    });

});

router.put("/", (req, res) => {

    res.json({

        success: true,

        message: "Settings saved."

    });

});

module.exports = router;
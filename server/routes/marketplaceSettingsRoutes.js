const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const controller = require("../controllers/marketplaceSettingsController");

/*
|--------------------------------------------------------------------------
| Marketplace Settings
|--------------------------------------------------------------------------
| These endpoints use the MarketplaceSetting database record.
|--------------------------------------------------------------------------
*/

/**
 * GET /api/admin/settings
 */
router.get(
    "/",
    auth,
    admin,
    controller.getSettings
);

/**
 * PUT /api/admin/settings
 */
router.put(
    "/",
    auth,
    admin,
    controller.updateSettings
);

module.exports = router;
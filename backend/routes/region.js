const express = require("express");
const { createRegion, fetchRegions } = require("../controllers/region");
const router = express.Router();
router.post("/region", createRegion);
router.get("/regions", fetchRegions);
module.exports = router;

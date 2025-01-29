const express = require("express");
const {
  createRegion,
  fetchRegions,
  deleteRegion,
} = require("../controllers/region");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

router.post("/register", verifyToken, createRegion);
router.get("/regions", verifyToken, fetchRegions);
router.delete("/:id", verifyToken, deleteRegion);

module.exports = router;

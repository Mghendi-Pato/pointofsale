const express = require("express");
const {
  createPool,
  getAllPools,
  editPool,
  deletePool,
} = require("../controllers/pool");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Create a new pool
router.post("/new", verifyToken, createPool);

// Get all pools
router.get("/all", verifyToken, getAllPools);

// Edit an existing pool
router.put("/:id", verifyToken, editPool);

// Delete a pool
router.delete("/:id", verifyToken, deletePool);

module.exports = router;

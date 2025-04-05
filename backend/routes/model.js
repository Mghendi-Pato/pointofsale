const express = require("express");
const { verifyToken } = require("../middleware/auth");
const {
  createPhoneModel,
  getAllPhoneModels,
  editPhoneModel,
  deletePhoneModel, // ✅ Import the new controller
} = require("../controllers/model");

const router = express.Router();

// Existing routes
router.post("/", verifyToken, createPhoneModel);
router.get("/", verifyToken, getAllPhoneModels);
router.put("/", verifyToken, editPhoneModel);
router.delete("/:id", verifyToken, deletePhoneModel);

module.exports = router;

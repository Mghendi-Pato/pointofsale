const express = require("express");
const { verifyToken } = require("../middleware/auth");
const {
  createPhoneModel,
  getAllPhoneModels,
  editPhoneModel,
} = require("../controllers/model");

const router = express.Router();
router.post("/", verifyToken, createPhoneModel);
router.get("/", verifyToken, getAllPhoneModels);
router.put("/", verifyToken, editPhoneModel);

module.exports = router;

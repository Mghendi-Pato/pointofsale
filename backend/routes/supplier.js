const express = require("express");
const {
  registerSupplier,
  fetchSuppliers,
  deleteSupplier,
  editSupplier,
} = require("../controllers/supplier");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/register", verifyToken, registerSupplier);
router.get("/", verifyToken, fetchSuppliers);
router.delete("/:id", verifyToken, deleteSupplier);
router.put("/:id", verifyToken, editSupplier);

module.exports = router;

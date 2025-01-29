const express = require("express");
const {
  login,
  register,
  toggleUserStatus,
  deleteUser,
} = require("../controllers/auth");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.post("/register", verifyToken, register);
router.put("/:userId/toggle-status", verifyToken, toggleUserStatus);
router.delete("/:userId", verifyToken, deleteUser);

module.exports = router;

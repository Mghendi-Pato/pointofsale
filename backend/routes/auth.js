const express = require("express");
const { login, register } = require("../controllers/auth");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.post("/register", verifyToken, register);

module.exports = router;

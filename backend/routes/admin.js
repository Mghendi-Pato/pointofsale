const express = require("express");
const { verifyToken } = require("../middleware/auth");
const { getAllAdmins } = require("../controllers/admin");

const router = express.Router();

router.get("/", verifyToken, getAllAdmins);

module.exports = router;

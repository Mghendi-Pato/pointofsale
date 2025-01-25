const express = require("express");
const { verifyToken } = require("../middleware/auth");
const { getActiveAdmins, getSuspendedAdmins } = require("../controllers/admin");

const router = express.Router();

router.get("/active", verifyToken, getActiveAdmins);
router.get("/dormant", verifyToken, getSuspendedAdmins);

module.exports = router;

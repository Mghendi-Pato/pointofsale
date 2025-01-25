const express = require("express");
const {
  getActiveManagers,
  getSuspendedManagers,
} = require("../controllers/manager");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();
router.get("/active", verifyToken, getActiveManagers);
router.get("/suspended", verifyToken, getSuspendedManagers);

module.exports = router;

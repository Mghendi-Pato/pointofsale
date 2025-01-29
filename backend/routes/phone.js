const express = require("express");
const {
  getActivePhones,
  getSuspendedPhones,
  getSoldPhones,
  getLostPhones,
  registerPhone,
  editPhone,
} = require("../controllers/phone");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/register", verifyToken, registerPhone);
router.put("/edit/:id", verifyToken, editPhone);
router.get("/active", getActivePhones);
router.get("/suspended", getSuspendedPhones);
router.get("/sold", getSoldPhones);
router.get("/lost", getLostPhones);

module.exports = router;

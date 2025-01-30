const express = require("express");
const {
  getActivePhones,
  getSuspendedPhones,
  getSoldPhones,
  getLostPhones,
  registerPhone,
  editPhone,
  declareLost,
  sellPhone,
} = require("../controllers/phone");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/register", verifyToken, registerPhone);
router.put("/edit/:id", verifyToken, editPhone);
router.get("/active", getActivePhones);
router.get("/suspended", getSuspendedPhones);
router.put("/lost/:id", verifyToken, declareLost);
router.get("/sold", getSoldPhones);
router.get("/lost", getLostPhones);
router.post("/sell", verifyToken, sellPhone);

module.exports = router;

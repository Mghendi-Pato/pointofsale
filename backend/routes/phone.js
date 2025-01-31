const express = require("express");
const {
  getActivePhones,
  getSuspendedPhones,
  getLostPhones,
  registerPhone,
  editPhone,
  declareLost,
  sellPhone,
  getSoldPhones,
} = require("../controllers/phone");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/register", verifyToken, registerPhone);
router.put("/edit/:id", verifyToken, editPhone);
router.get("/active", getActivePhones);
router.get("/suspended", getSuspendedPhones);
router.put("/lost/:id", verifyToken, declareLost);
router.get("/lost", getLostPhones);
router.post("/sell", verifyToken, sellPhone);
router.get("/sold", getSoldPhones);

module.exports = router;

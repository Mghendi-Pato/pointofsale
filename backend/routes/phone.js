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
  getSalesComparison,
  searchPhonesByIMEI,
  getReconciledPhones,
  declareReconciled,
  getActivePhonesByRegion,
  revertSale,
  deletePhone,
  getCustomerInformation,
} = require("../controllers/phone");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/register", verifyToken, registerPhone);
router.put("/edit/:id", verifyToken, editPhone);
router.get("/active", verifyToken, getActivePhones);
router.get("/suspended", verifyToken, getSuspendedPhones);
router.put("/lost/:id", verifyToken, declareLost);
router.get("/lost", verifyToken, getLostPhones);
router.post("/sell", verifyToken, sellPhone);
router.put("/revert-sale", verifyToken, revertSale);
router.get("/sold", verifyToken, getSoldPhones);
router.get("/customers", verifyToken, getCustomerInformation);
router.get("/dashboard", verifyToken, getSalesComparison);
router.get("/search/:imei", searchPhonesByIMEI);
router.get("/reconciled", verifyToken, getReconciledPhones);
router.put("/reconcile/:id", verifyToken, declareReconciled);
router.get("/by-region", verifyToken, getActivePhonesByRegion);
router.delete("/delete/:imei", verifyToken, deletePhone);

module.exports = router;

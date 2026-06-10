const express = require("express");
const controller = require("../controllers/paymentController");
const verifyToken = require("../middlewares/verifyToken");
const authorize = require("../middlewares/authorize");
const policy = require("../middlewares/policyMiddleware");
const validate = require("../middlewares/validate");
const { paymentSchema, checkoutSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/unlock-price", controller.getUnlockPrice);

router.get(
  "/my-payments",
  verifyToken,
  policy,
  authorize("tenant"),
  controller.getMyPayments
);

router.get(
  "/purchased-listings",
  verifyToken,
  policy,
  authorize("tenant"),
  controller.getPurchasedListings
);

router.post(
  "/momo/mock",
  verifyToken,
  policy,
  authorize("tenant"),
  validate(paymentSchema),
  controller.mockMomoPayment
);

router.post(
  "/momo/checkout",
  verifyToken,
  policy,
  authorize("tenant"),
  validate(checkoutSchema),
  controller.momoCheckout
);

module.exports = router;

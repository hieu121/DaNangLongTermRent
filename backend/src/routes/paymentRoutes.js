const express = require("express");
const controller = require("../controllers/paymentController");
const verifyToken = require("../middlewares/verifyToken");
const authorize = require("../middlewares/authorize");
const policy = require("../middlewares/policyMiddleware");
const validate = require("../middlewares/validate");
const { paymentSchema } = require("../validators/schemas");

const router = express.Router();

router.post(
  "/momo/mock",
  verifyToken,
  policy,
  authorize("tenant"),
  validate(paymentSchema),
  controller.mockMomoPayment
);

module.exports = router;

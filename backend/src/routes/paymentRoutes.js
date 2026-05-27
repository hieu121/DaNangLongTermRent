const express = require("express");
const controller = require("../controllers/paymentController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const policy = require("../middlewares/policyMiddleware");
const validate = require("../middlewares/validate");
const { paymentSchema } = require("../validators/schemas");

const router = express.Router();

router.post(
  "/momo/mock",
  auth,
  policy,
  role("tenant"),
  validate(paymentSchema),
  controller.mockMomoPayment
);

module.exports = router;

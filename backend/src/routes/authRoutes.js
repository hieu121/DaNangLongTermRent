const express = require("express");
const controller = require("../controllers/authController");
const auth = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const {
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  googleLoginSchema
} = require("../validators/schemas");

const router = express.Router();

router.post("/register", validate(registerSchema), controller.register);
router.post("/verify-email", validate(verifyEmailSchema), controller.verifyEmail);
router.post("/resend-otp", validate(resendOtpSchema), controller.resendOtp);
router.post("/login", validate(loginSchema), controller.login);
router.post("/google-login", validate(googleLoginSchema), controller.googleLogin);
router.get("/me", auth, controller.me);

module.exports = router;

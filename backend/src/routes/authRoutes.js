const express = require("express");
const controller = require("../controllers/authController");
const verifyToken = require("../middlewares/verifyToken");
const validate = require("../middlewares/validate");
const { authLimiter, registerLimiter, otpLimiter } = require("../middlewares/rateLimiter");
const {
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  googleLoginSchema,
  updateProfileSchema,
  changePasswordSchema
} = require("../validators/schemas");

const router = express.Router();

router.post("/register", registerLimiter, validate(registerSchema), controller.register);
router.post("/verify-email", otpLimiter, validate(verifyEmailSchema), controller.verifyEmail);
router.post("/resend-otp", otpLimiter, validate(resendOtpSchema), controller.resendOtp);
router.post("/login", authLimiter, validate(loginSchema), controller.login);
router.post("/google-login", authLimiter, validate(googleLoginSchema), controller.googleLogin);
router.get("/me", verifyToken, controller.me);
router.patch("/profile", verifyToken, validate(updateProfileSchema), controller.updateProfile);
router.post("/change-password", verifyToken, validate(changePasswordSchema), controller.changePassword);

module.exports = router;

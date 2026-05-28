const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many requests, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many registration attempts, please try again after 1 hour"
  },
  standardHeaders: true,
  legacyHeaders: false
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many OTP requests, please try again after 5 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter, registerLimiter, otpLimiter };

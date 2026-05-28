const authService = require("../services/authService");
const policyService = require("../services/policyService");
const { success } = require("../utils/response");

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    return success(res, data, "Register success", 201);
  } catch (error) {
    return next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const data = await authService.verifyEmail(req.body);
    return success(res, data, "Email verified");
  } catch (error) {
    return next(error);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const data = await authService.resendOtp(req.body);
    return success(res, data, "OTP resent successfully");
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    const policyState = await policyService.getPolicyState(data.user.id, data.user.role);
    return success(res, { ...data, policyState }, "Login success");
  } catch (error) {
    return next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const data = await authService.loginWithGoogle(req.body);
    const policyState = await policyService.getPolicyState(data.user.id, data.user.role);
    return success(res, { ...data, policyState }, "Google login success");
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.me(req.user.id);
    const policyState = await policyService.getPolicyState(user.id, user.role);
    return success(res, { user, policyState });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    return success(res, { user }, "Profile updated");
  } catch (error) {
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user.id, req.body);
    return success(res, null, "Password changed");
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, verifyEmail, resendOtp, login, googleLogin, me, updateProfile, changePassword };

const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const userRepository = require("../repositories/userRepository");
const otpRepository = require("../repositories/otpRepository");
const { signToken } = require("../utils/jwt");
const { GOOGLE_CLIENT_ID } = require("../config/env");
const { sendVerificationCode } = require("./mailService");

const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID || undefined);

const register = async ({ email, password, fullName, phone, role }) => {
  const existed = await userRepository.findByEmail(email);
  if (existed) {
    if (existed.is_verified) {
      throw new Error("Email already registered");
    } else {
      // Nếu email đã đăng ký nhưng chưa xác thực, cho phép cập nhật thông tin và gửi lại mã OTP
      const canSend = await otpRepository.checkRateLimit(email);
      if (!canSend) {
        throw new Error("Too many OTP requests. Please wait 1 minute before requesting another OTP.");
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await userRepository.updateUserDetails(existed.id, {
        passwordHash,
        fullName,
        phone,
        role
      });

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
      await otpRepository.createOtp({ email, code, expiresAt });
      await sendVerificationCode(email, code);

      return { userId: existed.id, email, codeSent: true };
    }
  }

  // Kiểm tra Rate limit gửi OTP
  const canSend = await otpRepository.checkRateLimit(email);
  if (!canSend) {
    throw new Error("Too many OTP requests. Please wait 1 minute before requesting another OTP.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = await userRepository.createUser({
    email,
    passwordHash,
    fullName,
    phone,
    role,
    isVerified: false
  });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
  await otpRepository.createOtp({ email, code, expiresAt });
  await sendVerificationCode(email, code);

  return { userId, email, codeSent: true };
};

const verifyEmail = async ({ email, code }) => {
  const latestOtp = await otpRepository.findLatestOtp(email);
  if (!latestOtp || latestOtp.code !== code || new Date() > latestOtp.expires_at) {
    throw new Error("Invalid or expired verification code");
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  await userRepository.updateVerification(user.id, true);
  await otpRepository.markAsUsed(latestOtp.id);

  // Tự động ký mã token để sau khi xác thực OTP thành công thì FE có thể login trực tiếp luôn
  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return { token, user: await userRepository.findById(user.id) };
};

const resendOtp = async ({ email }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.is_verified) {
    throw new Error("Email is already verified");
  }

  const canSend = await otpRepository.checkRateLimit(email);
  if (!canSend) {
    throw new Error("Too many OTP requests. Please wait 1 minute before requesting another OTP.");
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
  await otpRepository.createOtp({ email, code, expiresAt });
  await sendVerificationCode(email, code);

  return { email, codeSent: true };
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.is_verified) {
    throw new Error("Email is not verified. Please verify your email first.");
  }

  const ok = await bcrypt.compare(password, user.password_hash || "");
  if (!ok) {
    throw new Error("Invalid credentials");
  }
  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return { token, user: await userRepository.findById(user.id) };
};

const loginWithGoogle = async ({ idToken, fallbackRole = "tenant" }) => {
  let payload;
  if (GOOGLE_CLIENT_ID) {
    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });
    payload = ticket.getPayload();
  } else {
    const ticket = await oauthClient.verifyIdToken({ idToken });
    payload = ticket.getPayload();
  }

  const email = payload.email;
  const googleId = payload.sub;
  const fullName = payload.name || "Google User";

  let user = await userRepository.findByEmail(email);
  if (!user) {
    const userId = await userRepository.createUser({
      email,
      fullName,
      role: fallbackRole,
      isVerified: true
    });
    user = await userRepository.findById(userId);
  } else if (!user.is_verified) {
    await userRepository.updateVerification(user.id, true);
    user = await userRepository.findById(user.id);
  }
  await userRepository.upsertGoogleAccount({ userId: user.id, googleId, email });

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return { token, user };
};

const me = async (userId) => userRepository.findById(userId);

module.exports = { register, verifyEmail, resendOtp, login, loginWithGoogle, me };

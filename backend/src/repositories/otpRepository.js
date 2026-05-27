const { Otp } = require("../database/models");
const { Op } = require("sequelize");

const createOtp = async ({ email, code, expiresAt }) => {
  return await Otp.create({
    email,
    code,
    expires_at: expiresAt
  });
};

const findLatestOtp = async (email) => {
  return await Otp.findOne({
    where: { email, is_used: false },
    order: [["created_at", "DESC"]]
  });
};

const markAsUsed = async (id) => {
  return await Otp.update(
    { is_used: true },
    { where: { id } }
  );
};

const checkRateLimit = async (email) => {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  // 1. Tối đa 1 OTP trong vòng 60 giây
  const countLastMinute = await Otp.count({
    where: {
      email,
      created_at: {
        [Op.gt]: oneMinuteAgo
      }
    }
  });

  if (countLastMinute >= 1) {
    return false;
  }

  // 2. Tối đa 3 OTP trong vòng 5 phút
  const countLastFiveMinutes = await Otp.count({
    where: {
      email,
      created_at: {
        [Op.gt]: fiveMinutesAgo
      }
    }
  });

  if (countLastFiveMinutes >= 3) {
    return false;
  }

  return true;
};

module.exports = {
  createOtp,
  findLatestOtp,
  markAsUsed,
  checkRateLimit
};

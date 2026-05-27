const { User } = require("../database/models");
const sequelize = require("../config/sequelize");

const createUser = async (payload) => {
  const user = await User.create({
    email: payload.email,
    password_hash: payload.passwordHash || null,
    full_name: payload.fullName,
    phone: payload.phone || null,
    role: payload.role,
    is_verified: payload.isVerified ?? false
  });
  return user.id;
};

const findByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });
  return user ? user.get({ plain: true }) : null;
};

const findById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: ["id", "email", "full_name", "phone", "role", "avatar_url", "is_verified", "is_active"]
  });
  return user ? user.get({ plain: true }) : null;
};

const updateVerification = async (userId, isVerified) => {
  await User.update({ is_verified: isVerified }, { where: { id: userId } });
};

const updateUserDetails = async (userId, payload) => {
  await User.update({
    password_hash: payload.passwordHash,
    full_name: payload.fullName,
    phone: payload.phone,
    role: payload.role
  }, {
    where: { id: userId }
  });
};

const upsertGoogleAccount = async ({ userId, googleId, email }) => {
  await sequelize.query(
    `INSERT INTO user_google_accounts(user_id, google_id, email)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), email = VALUES(email)`,
    {
      replacements: [userId, googleId, email]
    }
  );
};

const findAllUsers = async () => {
  const users = await User.findAll({
    attributes: ["id", "email", "full_name", "phone", "role", "is_verified", "is_active", "created_at"],
    order: [["created_at", "DESC"]]
  });
  return users.map(u => u.get({ plain: true }));
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  updateVerification,
  updateUserDetails,
  upsertGoogleAccount,
  findAllUsers
};

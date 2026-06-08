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
  const updateData = {};
  if (payload.passwordHash !== undefined) updateData.password_hash = payload.passwordHash;
  if (payload.fullName !== undefined) updateData.full_name = payload.fullName;
  if (payload.phone !== undefined) updateData.phone = payload.phone;
  if (payload.role !== undefined) updateData.role = payload.role;
  if (payload.isActive !== undefined) updateData.is_active = payload.isActive;
  if (payload.avatarUrl !== undefined) updateData.avatar_url = payload.avatarUrl;

  await User.update(updateData, { where: { id: userId } });
};

const findByPkWithPassword = async (id) => {
  const user = await User.findByPk(id);
  return user ? user.get({ plain: true }) : null;
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

const findUserDetailForAdmin = async (userId) => {
  const user = await findById(userId);
  if (!user) return null;

  const fullUser = await User.findByPk(userId, {
    attributes: ["id", "email", "full_name", "phone", "role", "avatar_url", "is_verified", "is_active", "created_at"]
  });
  const userData = fullUser.get({ plain: true });

  const [listingRows] = await sequelize.query(
    `SELECT id, title, status, price, area, created_at
     FROM listings WHERE owner_id = ? ORDER BY created_at DESC`,
    { replacements: [userId] }
  );
  const [paymentRows] = await sequelize.query(
    `SELECT COUNT(*) AS total FROM payments WHERE tenant_id = ?`,
    { replacements: [userId] }
  );
  const [googleRows] = await sequelize.query(
    `SELECT google_id, email FROM user_google_accounts WHERE user_id = ? LIMIT 1`,
    { replacements: [userId] }
  );
  const [landlordReqRows] = await sequelize.query(
    `SELECT id, status, created_at, reviewed_at, note
     FROM landlord_requests WHERE user_id = ? ORDER BY created_at DESC`,
    { replacements: [userId] }
  );

  return {
    ...userData,
    listings: listingRows,
    stats: {
      listingCount: listingRows.length,
      paymentCount: Number(paymentRows[0]?.total || 0)
    },
    googleAccount: googleRows[0] || null,
    landlordRequests: landlordReqRows
  };
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  findByPkWithPassword,
  updateVerification,
  updateUserDetails,
  upsertGoogleAccount,
  findAllUsers,
  findUserDetailForAdmin
};

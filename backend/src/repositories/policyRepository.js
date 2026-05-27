const pool = require("../config/db");

const getLatestPolicyByRole = async (role) => {
  const [rows] = await pool.query(
    `SELECT * FROM policies
     WHERE role = ? AND is_active = TRUE
     ORDER BY version DESC LIMIT 1`,
    [role]
  );
  return rows[0] || null;
};

const getAcceptance = async (userId, policyId) => {
  const [rows] = await pool.query(
    "SELECT * FROM user_policy_acceptances WHERE user_id = ? AND policy_id = ? LIMIT 1",
    [userId, policyId]
  );
  return rows[0] || null;
};

const acceptPolicy = async (userId, policyId, version) => {
  await pool.query(
    `INSERT INTO user_policy_acceptances(user_id, policy_id, version)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE version = VALUES(version), accepted_at = CURRENT_TIMESTAMP`,
    [userId, policyId, version]
  );
};

const createPolicy = async ({ role, title, content, version }) => {
  const [result] = await pool.query(
    "INSERT INTO policies(role, title, content, version, is_active) VALUES (?, ?, ?, ?, TRUE)",
    [role, title, content, version]
  );
  return result.insertId;
};

module.exports = {
  getLatestPolicyByRole,
  getAcceptance,
  acceptPolicy,
  createPolicy
};

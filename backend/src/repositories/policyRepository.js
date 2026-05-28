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

const getAllPolicies = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM policies ORDER BY role, version DESC"
  );
  return rows;
};

const getPolicyById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM policies WHERE id = ?", [id]);
  return rows[0] || null;
};

const updatePolicy = async (id, { title, content, version, isActive }) => {
  const sets = [];
  const params = [];
  if (title !== undefined) { sets.push("title = ?"); params.push(title); }
  if (content !== undefined) { sets.push("content = ?"); params.push(content); }
  if (version !== undefined) { sets.push("version = ?"); params.push(version); }
  if (isActive !== undefined) { sets.push("is_active = ?"); params.push(isActive); }
  if (sets.length === 0) return;
  params.push(id);
  await pool.query(`UPDATE policies SET ${sets.join(", ")} WHERE id = ?`, params);
};

module.exports = {
  getLatestPolicyByRole,
  getAcceptance,
  acceptPolicy,
  createPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy
};

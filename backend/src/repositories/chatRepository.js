const pool = require("../config/db");

const getOrCreateConversationWithAdmin = async (userId) => {
  const [rows] = await pool.query(
    `SELECT c.id
     FROM conversations c
     JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = ?
     JOIN conversation_participants cp2 ON cp2.conversation_id = c.id
     JOIN users u2 ON u2.id = cp2.user_id AND u2.role = 'admin'
     LIMIT 1`,
    [userId]
  );

  if (rows[0]) {
    return rows[0].id;
  }

  const [adminRows] = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  const adminId = adminRows[0]?.id;
  if (!adminId) {
    throw new Error("Admin account not found");
  }

  const [result] = await pool.query("INSERT INTO conversations() VALUES ()");
  const conversationId = result.insertId;
  await pool.query(
    "INSERT INTO conversation_participants(conversation_id, user_id) VALUES (?, ?), (?, ?)",
    [conversationId, userId, conversationId, adminId]
  );
  return conversationId;
};

const createMessage = async ({ conversationId, senderId, content }) => {
  const [result] = await pool.query(
    "INSERT INTO messages(conversation_id, sender_id, content) VALUES (?, ?, ?)",
    [conversationId, senderId, content]
  );
  return result.insertId;
};

const getConversationMessages = async (conversationId, limit = 20, offset = 0) => {
  const [rows] = await pool.query(
    `SELECT m.*, u.full_name sender_name
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = ?
     ORDER BY m.created_at DESC
     LIMIT ? OFFSET ?`,
    [conversationId, limit, offset]
  );
  return rows.reverse();
};

const getConversationList = async (userId) => {
  const [rows] = await pool.query(
    `SELECT c.id conversation_id, MAX(m.created_at) last_message_at, SUBSTRING_INDEX(GROUP_CONCAT(m.content ORDER BY m.created_at DESC), ',', 1) last_message
     FROM conversation_participants cp
     JOIN conversations c ON c.id = cp.conversation_id
     LEFT JOIN messages m ON m.conversation_id = c.id
     WHERE cp.user_id = ?
     GROUP BY c.id
     ORDER BY last_message_at DESC`,
    [userId]
  );
  return rows;
};

const getParticipantIds = async (conversationId) => {
  const [rows] = await pool.query(
    "SELECT user_id FROM conversation_participants WHERE conversation_id = ?",
    [conversationId]
  );
  return rows.map((r) => r.user_id);
};

module.exports = {
  getOrCreateConversationWithAdmin,
  createMessage,
  getConversationMessages,
  getConversationList,
  getParticipantIds
};

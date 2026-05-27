const pool = require("../config/db");

const createNotification = async ({ userId, type, content }) => {
  await pool.query(
    "INSERT INTO notifications(user_id, type, content) VALUES (?, ?, ?)",
    [userId, type, content]
  );
};

const getNotifications = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30",
    [userId]
  );
  return rows;
};

const markAsRead = async (notificationId, userId) => {
  await pool.query("UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?", [
    notificationId,
    userId
  ]);
};

module.exports = { createNotification, getNotifications, markAsRead };

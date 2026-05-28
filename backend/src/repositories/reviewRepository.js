const pool = require("../config/db");

const upsertReview = async ({ listingId, tenantId, rating, comment }) => {
  await pool.query(
    `INSERT INTO reviews(listing_id, tenant_id, rating, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), updated_at = CURRENT_TIMESTAMP`,
    [listingId, tenantId, rating, comment]
  );
};

const getListingReviews = async (listingId) => {
  const [rows] = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.owner_reply, r.created_at, r.updated_at,
            u.id tenant_id, u.full_name tenant_name
     FROM reviews r
     JOIN users u ON u.id = r.tenant_id
     WHERE r.listing_id = ?
     ORDER BY COALESCE(r.updated_at, r.created_at) DESC`,
    [listingId]
  );
  return rows;
};

const findByPk = async (id) => {
  const [rows] = await pool.query(
    `SELECT r.*, u.full_name tenant_name FROM reviews r
     JOIN users u ON u.id = r.tenant_id WHERE r.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const updateReview = async (id, tenantId, { rating, comment }) => {
  await pool.query(
    "UPDATE reviews SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?",
    [rating, comment, id, tenantId]
  );
};

const deleteReview = async (id, tenantId) => {
  await pool.query("DELETE FROM reviews WHERE id = ? AND tenant_id = ?", [id, tenantId]);
};

const replyToReview = async (id, ownerReply) => {
  await pool.query(
    "UPDATE reviews SET owner_reply = ?, owner_replied_at = CURRENT_TIMESTAMP WHERE id = ?",
    [ownerReply, id]
  );
};

module.exports = {
  upsertReview,
  getListingReviews,
  findByPk,
  updateReview,
  deleteReview,
  replyToReview
};

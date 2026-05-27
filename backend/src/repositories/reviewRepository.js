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
    `SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at, u.full_name tenant_name
     FROM reviews r
     JOIN users u ON u.id = r.tenant_id
     WHERE r.listing_id = ?
     ORDER BY COALESCE(r.updated_at, r.created_at) DESC`,
    [listingId]
  );
  return rows;
};

module.exports = {
  upsertReview,
  getListingReviews
};

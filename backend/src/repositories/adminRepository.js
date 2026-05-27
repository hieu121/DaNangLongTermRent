const pool = require("../config/db");

const createOwnerWarning = async ({ ownerId, adminId, reason }) => {
  await pool.query(
    "INSERT INTO owner_warnings(owner_id, admin_id, reason) VALUES (?, ?, ?)",
    [ownerId, adminId, reason]
  );
};

const createListingReviewLog = async ({ listingId, adminId, action, note }) => {
  await pool.query(
    "INSERT INTO listing_reviews(listing_id, admin_id, action, note) VALUES (?, ?, ?, ?)",
    [listingId, adminId, action, note || null]
  );
};

module.exports = {
  createOwnerWarning,
  createListingReviewLog
};

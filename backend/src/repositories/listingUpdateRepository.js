const pool = require("../config/db");

const createUpdateRequest = async ({ listingId, ownerId, proposedData }) => {
  const [result] = await pool.query(
    `INSERT INTO listing_update_requests(listing_id, owner_id, proposed_data)
     VALUES (?, ?, ?)`,
    [listingId, ownerId, JSON.stringify(proposedData)]
  );
  return result.insertId;
};

const findPendingByListingId = async (listingId) => {
  const [rows] = await pool.query(
    `SELECT * FROM listing_update_requests
     WHERE listing_id = ? AND status = 'pending'
     ORDER BY created_at DESC LIMIT 1`,
    [listingId]
  );
  if (!rows[0]) return null;
  return {
    ...rows[0],
    proposed_data: typeof rows[0].proposed_data === "string"
      ? JSON.parse(rows[0].proposed_data)
      : rows[0].proposed_data
  };
};

const findPendingUpdates = async () => {
  const [rows] = await pool.query(
    `SELECT r.*, l.title listing_title, l.price listing_price, l.area listing_area,
            l.address listing_address, l.min_stay listing_min_stay,
            l.available_date listing_available_date, l.status listing_status,
            u.full_name owner_name, u.email owner_email
     FROM listing_update_requests r
     JOIN listings l ON l.id = r.listing_id
     JOIN users u ON u.id = r.owner_id
     WHERE r.status = 'pending'
     ORDER BY r.created_at ASC`
  );
  return rows.map((row) => ({
    ...row,
    proposed_data: typeof row.proposed_data === "string"
      ? JSON.parse(row.proposed_data)
      : row.proposed_data
  }));
};

const findById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM listing_update_requests WHERE id = ?", [id]);
  if (!rows[0]) return null;
  return {
    ...rows[0],
    proposed_data: typeof rows[0].proposed_data === "string"
      ? JSON.parse(rows[0].proposed_data)
      : rows[0].proposed_data
  };
};

const updateStatus = async (id, status, reviewedBy, note) => {
  await pool.query(
    `UPDATE listing_update_requests
     SET status = ?, reviewed_by = ?, reviewed_at = NOW(), note = ?
     WHERE id = ?`,
    [status, reviewedBy, note || null, id]
  );
};

module.exports = {
  createUpdateRequest,
  findPendingByListingId,
  findPendingUpdates,
  findById,
  updateStatus
};

const pool = require("../config/db");

const createListing = async (payload) => {
  const [result] = await pool.query(
    `INSERT INTO listings
      (owner_id, title, description, price, area, address, min_stay, available_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      payload.ownerId,
      payload.title,
      payload.description,
      payload.price,
      payload.area,
      payload.address,
      payload.minStay,
      payload.availableDate
    ]
  );
  return result.insertId;
};

const setListingAssets = async (listingId, imageUrls = [], amenities = []) => {
  if (imageUrls.length) {
    await pool.query(
      "INSERT INTO listing_images(listing_id, image_url) VALUES ?",
      [imageUrls.map((url) => [listingId, url])]
    );
  }

  if (amenities.length) {
    await pool.query(
      "INSERT INTO listing_amenities(listing_id, amenity) VALUES ?",
      [amenities.map((a) => [listingId, a])]
    );
  }
};

const findActiveListings = async ({ area, minPrice, maxPrice, minStay, sortBy }) => {
  let sql = `
    SELECT l.*, u.full_name owner_name,
      AVG(r.rating) AS avg_rating
    FROM listings l
    JOIN users u ON u.id = l.owner_id
    LEFT JOIN reviews r ON r.listing_id = l.id
    WHERE l.status = 'active'
  `;
  const params = [];
  if (area) {
    sql += " AND l.area = ?";
    params.push(area);
  }
  if (minPrice !== undefined) {
    sql += " AND l.price >= ?";
    params.push(minPrice);
  }
  if (maxPrice !== undefined) {
    sql += " AND l.price <= ?";
    params.push(maxPrice);
  }
  if (minStay !== undefined) {
    sql += " AND l.min_stay <= ?";
    params.push(minStay);
  }

  sql += " GROUP BY l.id";
  if (sortBy === "best_match") {
    sql += " ORDER BY l.priority_score DESC, l.created_at DESC";
  } else {
    sql += " ORDER BY l.created_at DESC";
  }
  const [rows] = await pool.query(sql, params);
  return rows;
};

const findListingById = async (listingId) => {
  const [rows] = await pool.query(
    `SELECT l.*, u.full_name owner_name, u.phone owner_phone, u.email owner_email
     FROM listings l
     JOIN users u ON u.id = l.owner_id
     WHERE l.id = ? LIMIT 1`,
    [listingId]
  );
  return rows[0] || null;
};

const findListingImages = async (listingId) => {
  const [rows] = await pool.query("SELECT image_url FROM listing_images WHERE listing_id = ?", [
    listingId
  ]);
  return rows.map((i) => i.image_url);
};

const findListingAmenities = async (listingId) => {
  const [rows] = await pool.query("SELECT amenity FROM listing_amenities WHERE listing_id = ?", [
    listingId
  ]);
  return rows.map((a) => a.amenity);
};

const updateListingStatus = async (listingId, status) => {
  await pool.query("UPDATE listings SET status = ? WHERE id = ?", [status, listingId]);
};

const resetMissedWeeks = async (listingId) => {
  await pool.query("UPDATE listings SET missed_weeks = 0, priority_score = 100 WHERE id = ?", [
    listingId
  ]);
  await pool.query(
    "INSERT INTO listing_update_logs(listing_id, action) VALUES (?, 'updated')",
    [listingId]
  );
};

const penalizeInactiveListings = async () => {
  await pool.query(
    `UPDATE listings
     SET missed_weeks = missed_weeks + 1, priority_score = GREATEST(priority_score - 5, 0)
     WHERE status = 'active' AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`
  );
};

const findPendingListings = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM listings WHERE status = 'pending' ORDER BY created_at ASC"
  );
  return rows;
};

const updateListing = async (listingId, ownerId, payload) => {
  const [result] = await pool.query(
    `UPDATE listings SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      area = COALESCE(?, area),
      address = COALESCE(?, address),
      min_stay = COALESCE(?, min_stay)
     WHERE id = ? AND owner_id = ?`,
    [
      payload.title || null,
      payload.description || null,
      payload.price ?? null,
      payload.area || null,
      payload.address || null,
      payload.minStay ?? null,
      listingId,
      ownerId
    ]
  );
  return result.affectedRows > 0;
};

const deleteListing = async (listingId, ownerId) => {
  const [result] = await pool.query(
    "DELETE FROM listings WHERE id = ? AND owner_id = ?",
    [listingId, ownerId]
  );
  return result.affectedRows > 0;
};

const findByOwnerId = async (ownerId) => {
  const [rows] = await pool.query(
    `SELECT l.*, COUNT(r.id) review_count, AVG(r.rating) avg_rating
     FROM listings l
     LEFT JOIN reviews r ON r.listing_id = l.id
     WHERE l.owner_id = ?
     GROUP BY l.id
     ORDER BY l.created_at DESC`,
    [ownerId]
  );
  return rows;
};

const countListings = async () => {
  const [rows] = await pool.query("SELECT COUNT(*) total FROM listings");
  return rows[0].total;
};

module.exports = {
  createListing,
  setListingAssets,
  findActiveListings,
  findListingById,
  findListingImages,
  findListingAmenities,
  updateListingStatus,
  resetMissedWeeks,
  penalizeInactiveListings,
  findPendingListings,
  updateListing,
  deleteListing,
  findByOwnerId,
  countListings
};

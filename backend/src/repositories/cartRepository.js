const pool = require("../config/db");

const findByTenantId = async (tenantId) => {
  const [rows] = await pool.query(
    `SELECT ci.id, ci.listing_id, ci.created_at,
            l.title, l.price, l.status, l.owner_id,
            (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY id LIMIT 1) AS image_url
     FROM cart_items ci
     JOIN listings l ON l.id = ci.listing_id
     WHERE ci.tenant_id = ?
     ORDER BY ci.created_at DESC`,
    [tenantId]
  );
  return rows;
};

const addItem = async (tenantId, listingId) => {
  await pool.query(
    "INSERT IGNORE INTO cart_items(tenant_id, listing_id) VALUES (?, ?)",
    [tenantId, listingId]
  );
  const [rows] = await pool.query(
    "SELECT id FROM cart_items WHERE tenant_id = ? AND listing_id = ? LIMIT 1",
    [tenantId, listingId]
  );
  return rows[0]?.id;
};

const removeItem = async (tenantId, listingId) => {
  const [result] = await pool.query(
    "DELETE FROM cart_items WHERE tenant_id = ? AND listing_id = ?",
    [tenantId, listingId]
  );
  return result.affectedRows > 0;
};

const removeItems = async (tenantId, listingIds) => {
  if (!listingIds.length) return;
  await pool.query("DELETE FROM cart_items WHERE tenant_id = ? AND listing_id IN (?)", [
    tenantId,
    listingIds
  ]);
};

const countByTenantId = async (tenantId) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM cart_items WHERE tenant_id = ?",
    [tenantId]
  );
  return Number(rows[0].total);
};

module.exports = { findByTenantId, addItem, removeItem, removeItems, countByTenantId };

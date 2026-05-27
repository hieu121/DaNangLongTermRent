const pool = require("../config/db");

const createPayment = async ({ tenantId, amount, listingId, status = "success" }) => {
  const [paymentResult] = await pool.query(
    "INSERT INTO payments(tenant_id, amount, method, status, momo_transaction_id) VALUES (?, ?, 'momo', ?, ?)",
    [tenantId, amount, status, `MOCK-${Date.now()}`]
  );

  await pool.query(
    "INSERT INTO payment_listing_access(payment_id, listing_id, unlocked) VALUES (?, ?, ?)",
    [paymentResult.insertId, listingId, status === "success"]
  );

  return paymentResult.insertId;
};

const hasListingAccess = async (tenantId, listingId) => {
  const [rows] = await pool.query(
    `SELECT 1
     FROM payments p
     JOIN payment_listing_access pla ON pla.payment_id = p.id
     WHERE p.tenant_id = ? AND pla.listing_id = ? AND p.status = 'success' AND pla.unlocked = TRUE
     LIMIT 1`,
    [tenantId, listingId]
  );
  return Boolean(rows[0]);
};

const sumRevenue = async () => {
  const [rows] = await pool.query("SELECT COALESCE(SUM(amount), 0) total FROM payments WHERE status = 'success'");
  return Number(rows[0].total);
};

module.exports = { createPayment, hasListingAccess, sumRevenue };

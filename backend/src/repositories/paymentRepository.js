const pool = require("../config/db");
const { CONTACT_UNLOCK_PRICE } = require("../constants/payment");

const createPayment = async ({ tenantId, amount, listingIds, status = "success", method = "momo" }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [paymentResult] = await connection.query(
      "INSERT INTO payments(tenant_id, amount, method, status, momo_transaction_id) VALUES (?, ?, ?, ?, ?)",
      [tenantId, amount, method, status, status === "success" ? `MOMO-${Date.now()}` : null]
    );
    const paymentId = paymentResult.insertId;

    for (const listingId of listingIds) {
      await connection.query(
        "INSERT INTO payment_listing_access(payment_id, listing_id, unlocked) VALUES (?, ?, ?)",
        [paymentId, listingId, status === "success"]
      );
    }

    await connection.commit();
    return paymentId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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

const filterListingsWithAccess = async (tenantId, listingIds) => {
  if (!listingIds.length) return [];
  const [rows] = await pool.query(
    `SELECT DISTINCT pla.listing_id
     FROM payments p
     JOIN payment_listing_access pla ON pla.payment_id = p.id
     WHERE p.tenant_id = ? AND pla.listing_id IN (?) AND p.status = 'success' AND pla.unlocked = TRUE`,
    [tenantId, listingIds]
  );
  return rows.map((row) => row.listing_id);
};

const sumRevenue = async () => {
  const [rows] = await pool.query(
    "SELECT COALESCE(SUM(amount), 0) total FROM payments WHERE status = 'success'"
  );
  return Number(rows[0].total);
};

const getRevenueStats = async () => {
  const [rows] = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) AS total_revenue,
       COALESCE(SUM(CASE WHEN status = 'success' AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) THEN amount ELSE 0 END), 0) AS current_month_revenue,
       SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS success_count,
       SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_count
     FROM payments`
  );

  const [roomRows] = await pool.query(
    `SELECT COUNT(DISTINCT pla.listing_id) AS paid_rooms
     FROM payment_listing_access pla
     JOIN payments p ON p.id = pla.payment_id
     WHERE p.status = 'success' AND pla.unlocked = TRUE`
  );

  const stats = rows[0];
  return {
    totalRevenue: Number(stats.total_revenue),
    currentMonthRevenue: Number(stats.current_month_revenue),
    successCount: Number(stats.success_count),
    failedCount: Number(stats.failed_count),
    paidRoomsCount: Number(roomRows[0].paid_rooms)
  };
};

const getMonthlyRevenue = async () => {
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
            COALESCE(SUM(amount), 0) AS revenue,
            COUNT(*) AS transaction_count
     FROM payments
     WHERE status = 'success'
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY month ASC`
  );
  return rows.map((row) => ({
    month: row.month,
    revenue: Number(row.revenue),
    transactionCount: Number(row.transaction_count)
  }));
};

const findMyPayments = async (tenantId) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.amount, p.method, p.status, p.created_at, p.momo_transaction_id,
            pla.listing_id, l.title AS listing_title
     FROM payments p
     LEFT JOIN payment_listing_access pla ON pla.payment_id = p.id
     LEFT JOIN listings l ON l.id = pla.listing_id
     WHERE p.tenant_id = ?
     ORDER BY p.created_at DESC, pla.listing_id ASC`,
    [tenantId]
  );

  const paymentsMap = new Map();
  rows.forEach((row) => {
    if (!paymentsMap.has(row.id)) {
      paymentsMap.set(row.id, {
        id: row.id,
        amount: Number(row.amount),
        method: row.method,
        status: row.status,
        created_at: row.created_at,
        momo_transaction_id: row.momo_transaction_id,
        listings: []
      });
    }
    if (row.listing_id) {
      paymentsMap.get(row.id).listings.push({
        listing_id: row.listing_id,
        listing_title: row.listing_title
      });
    }
  });

  return Array.from(paymentsMap.values());
};

const findPurchasedListings = async (tenantId) => {
  const [rows] = await pool.query(
    `SELECT l.id, l.title, l.price, l.area, l.status,
            p.id AS payment_id, p.status AS payment_status, p.method, p.created_at AS purchased_at,
            (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY id LIMIT 1) AS image_url
     FROM payment_listing_access pla
     JOIN payments p ON p.id = pla.payment_id
     JOIN listings l ON l.id = pla.listing_id
     WHERE p.tenant_id = ? AND pla.unlocked = TRUE AND p.status = 'success'
     ORDER BY p.created_at DESC`,
    [tenantId]
  );
  return rows.map((row) => ({
    ...row,
    price: Number(row.price)
  }));
};

const findTransactionsForAdmin = async ({ search = "", status = "", method = "", fromDate = "", toDate = "" }) => {
  let sql = `
    SELECT p.id AS payment_id, p.amount, p.method, p.status, p.created_at,
           u.full_name, u.email,
           pla.listing_id, l.title AS listing_title
    FROM payments p
    JOIN users u ON u.id = p.tenant_id
    JOIN payment_listing_access pla ON pla.payment_id = p.id
    JOIN listings l ON l.id = pla.listing_id
    WHERE 1=1`;
  const params = [];

  if (search) {
    sql += " AND (u.full_name LIKE ? OR u.email LIKE ? OR l.title LIKE ? OR CAST(p.id AS CHAR) LIKE ?)";
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }
  if (status) {
    sql += " AND p.status = ?";
    params.push(status);
  }
  if (method) {
    sql += " AND p.method = ?";
    params.push(method);
  }
  if (fromDate) {
    sql += " AND DATE(p.created_at) >= ?";
    params.push(fromDate);
  }
  if (toDate) {
    sql += " AND DATE(p.created_at) <= ?";
    params.push(toDate);
  }

  sql += " ORDER BY p.created_at DESC, p.id DESC";

  const [rows] = await pool.query(sql, params);
  return rows.map((row) => ({
    payment_id: row.payment_id,
    amount: CONTACT_UNLOCK_PRICE,
    total_payment_amount: Number(row.amount),
    method: row.method,
    status: row.status,
    created_at: row.created_at,
    full_name: row.full_name,
    email: row.email,
    listing_id: row.listing_id,
    listing_title: row.listing_title
  }));
};

module.exports = {
  createPayment,
  hasListingAccess,
  filterListingsWithAccess,
  sumRevenue,
  getRevenueStats,
  getMonthlyRevenue,
  findMyPayments,
  findPurchasedListings,
  findTransactionsForAdmin,
  CONTACT_UNLOCK_PRICE
};

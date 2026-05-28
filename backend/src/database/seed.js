const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../config/env");

const run = async () => {
  const adminPassword = await bcrypt.hash(ADMIN_PASSWORD || "Admin@123", 10);
  const tenantPassword = await bcrypt.hash("Tenant@123", 10);

  await pool.query(
    `INSERT INTO roles(name, description)
     VALUES
     ('tenant', 'Tenant user with booking and review rights'),
     ('owner', 'Owner user with listing management rights'),
     ('admin', 'Administrator with full management rights')
     ON DUPLICATE KEY UPDATE description = VALUES(description)`
  );

  await pool.query(
    `INSERT INTO users(email, password_hash, full_name, role, is_verified)
     VALUES (?, ?, 'System Admin', 'admin', TRUE)
     ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)`,
    [ADMIN_EMAIL || "admin@rent.vn", adminPassword]
  );

  await pool.query(
    `INSERT INTO users(email, password_hash, full_name, role, is_verified)
     VALUES (?, ?, 'Tenant Demo', 'tenant', TRUE)
     ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)`,
    ["tenant1@rent.vn", tenantPassword]
  );

  await pool.query(
    `INSERT INTO policies(role, title, content, version, is_active)
     VALUES
     ('tenant', 'Tenant Policy v1', 'Chinh sach cho nguoi thue', 1, TRUE),
     ('owner', 'Owner Policy v1', 'Chinh sach cho chu nha', 1, TRUE)`
  );

  console.log("Seed completed");
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

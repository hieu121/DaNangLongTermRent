const bcrypt = require("bcrypt");
const pool = require("../config/db");

const run = async () => {
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const ownerPassword = await bcrypt.hash("Owner@123", 10);
  const tenantPassword = await bcrypt.hash("Tenant@123", 10);

  await pool.query(
    `INSERT INTO users(email, password_hash, full_name, role, is_verified)
     VALUES
     ('admin@rent.vn', ?, 'System Admin', 'admin', TRUE),
     ('owner1@rent.vn', ?, 'Owner Demo', 'owner', TRUE),
     ('tenant1@rent.vn', ?, 'Tenant Demo', 'tenant', TRUE)
     ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)`,
    [adminPassword, ownerPassword, tenantPassword]
  );

  await pool.query(
    `INSERT INTO policies(role, title, content, version, is_active)
     VALUES
     ('tenant', 'Tenant Policy v1', 'Chinh sach cho nguoi thue', 1, TRUE),
     ('owner', 'Owner Policy v1', 'Chinh sach cho chu nha', 1, TRUE)`
  );

  // eslint-disable-next-line no-console
  console.log("Seed completed");
  process.exit(0);
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});

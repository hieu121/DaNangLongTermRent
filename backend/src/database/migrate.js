const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const sequelize = require("../config/sequelize");

async function ensureMetaTable(queryInterface) {
  const tables = await queryInterface.showAllTables();
  if (!tables.includes("SequelizeMeta")) {
    await queryInterface.createTable("SequelizeMeta", {
      name: { type: Sequelize.STRING, primaryKey: true }
    });
  }
}

async function getExecutedMigrations() {
  const [rows] = await sequelize.query("SELECT name FROM SequelizeMeta");
  return new Set(rows.map((r) => r.name));
}

async function migrate() {
  const queryInterface = sequelize.getQueryInterface();
  await ensureMetaTable(queryInterface);

  const executed = await getExecutedMigrations();
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".js")).sort();

  for (const file of files) {
    if (executed.has(file)) {
      console.log(`Skip: ${file}`);
      continue;
    }

    console.log(`Run: ${file}`);
    const migration = require(path.join(migrationsDir, file));
    await migration.up(queryInterface, Sequelize);
    await sequelize.query("INSERT INTO SequelizeMeta (name) VALUES (?)", {
      replacements: [file]
    });
    console.log(`Done: ${file}`);
  }

  console.log("Migrations completed.");
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });

const http = require("http");
const app = require("./src/app");
const { initSocket } = require("./src/socket");
const { runListingAutomation } = require("./src/jobs/listingAutomationJob");
const { PORT } = require("./src/config/env");
const db = require("./src/config/db");
const sequelize = require("./src/config/sequelize");

const server = http.createServer(app);
initSocket(server);
runListingAutomation();

async function startServer() {
  try {
    await db.query("SELECT 1");
    // eslint-disable-next-line no-console
    console.log("Database connected successfully.");

    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log("Sequelize connection established successfully.");

    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();

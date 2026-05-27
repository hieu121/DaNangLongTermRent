const cron = require("node-cron");
const listingRepository = require("../repositories/listingRepository");

const runListingAutomation = () => {
  cron.schedule("0 1 * * 1", async () => {
    await listingRepository.penalizeInactiveListings();
  });
};

module.exports = { runListingAutomation };

const express = require("express");
const controller = require("../controllers/listingController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const policy = require("../middlewares/policyMiddleware");
const validate = require("../middlewares/validate");
const { createListingSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/", controller.getListings);
router.get("/:id", auth, controller.getListingDetail);
router.post("/", auth, policy, role("owner"), validate(createListingSchema), controller.createListing);
router.patch("/:id/mark-updated", auth, role("owner"), controller.markListingUpdated);

module.exports = router;

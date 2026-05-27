const express = require("express");
const controller = require("../controllers/reviewController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const policy = require("../middlewares/policyMiddleware");
const validate = require("../middlewares/validate");
const { reviewSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/listing/:listingId", controller.getListingReviews);
router.post("/", auth, policy, role("tenant"), validate(reviewSchema), controller.upsertReview);

module.exports = router;

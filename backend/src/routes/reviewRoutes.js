const express = require("express");
const controller = require("../controllers/reviewController");
const verifyToken = require("../middlewares/verifyToken");
const authorize = require("../middlewares/authorize");
const policy = require("../middlewares/policyMiddleware");
const validate = require("../middlewares/validate");
const { reviewSchema, updateReviewSchema, replyReviewSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/listing/:listingId", controller.getListingReviews);
router.post("/", verifyToken, policy, authorize("tenant"), validate(reviewSchema), controller.upsertReview);
router.put("/:id", verifyToken, authorize("tenant"), validate(updateReviewSchema), controller.updateReview);
router.delete("/:id", verifyToken, authorize("tenant", "admin"), controller.deleteReview);
router.post("/:id/reply", verifyToken, authorize("owner"), validate(replyReviewSchema), controller.replyToReview);

module.exports = router;

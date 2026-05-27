const express = require("express");
const controller = require("../controllers/adminController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validate");
const {
  adminReviewListingSchema,
  warningSchema,
  createPolicySchema
} = require("../validators/schemas");

const router = express.Router();
router.use(auth, role("admin"));

router.get("/pending-listings", controller.getPendingListings);
router.post("/review-listing", validate(adminReviewListingSchema), controller.reviewListing);
router.post("/owner-warning", validate(warningSchema), controller.warnOwner);
router.get("/users", controller.getUsers);
router.post("/policies", validate(createPolicySchema), controller.createPolicy);
router.get("/stats", controller.stats);

module.exports = router;

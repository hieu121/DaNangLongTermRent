const express = require("express");
const controller = require("../controllers/adminController");
const verifyToken = require("../middlewares/verifyToken");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {
  adminReviewListingSchema,
  warningSchema,
  createPolicySchema,
  ownerRequestNoteSchema
} = require("../validators/schemas");

const router = express.Router();
router.use(verifyToken, authorize("admin"));

router.get("/pending-listings", controller.getPendingListings);
router.post("/review-listing", validate(adminReviewListingSchema), controller.reviewListing);
router.post("/owner-warning", validate(warningSchema), controller.warnOwner);
router.get("/users", controller.getUsers);
router.patch("/users/:userId/toggle-status", controller.toggleUserStatus);
router.post("/policies", validate(createPolicySchema), controller.createPolicy);
router.get("/stats", controller.stats);

router.get("/owner-requests", controller.getOwnerRequests);
router.post("/owner-requests/:requestId/approve", controller.approveOwnerRequest);
router.post("/owner-requests/:requestId/reject", validate(ownerRequestNoteSchema), controller.rejectOwnerRequest);

router.get("/policies", controller.getPolicies);
router.put("/policies/:id", controller.updatePolicy);
router.delete("/policies/:id", controller.deletePolicy);

module.exports = router;

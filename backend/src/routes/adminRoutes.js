const express = require("express");
const controller = require("../controllers/adminController");
const amenityController = require("../controllers/amenityController");
const verifyToken = require("../middlewares/verifyToken");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {
  adminReviewListingSchema,
  warningSchema,
  createPolicySchema,
  ownerRequestNoteSchema,
  createAmenitySchema,
  adminReviewUpdateSchema
} = require("../validators/schemas");

const router = express.Router();
router.use(verifyToken, authorize("admin"));

router.get("/pending-listings", controller.getPendingListings);
router.get("/listings", controller.getAllListings);
router.get("/listings/active", controller.getActiveListings);
router.get("/listings/:listingId", controller.getListingDetail);
router.delete("/listings/:listingId", controller.deleteListing);
router.post("/review-listing", validate(adminReviewListingSchema), controller.reviewListing);
router.get("/pending-updates", controller.getPendingUpdates);
router.post("/review-update", validate(adminReviewUpdateSchema), controller.reviewUpdateRequest);
router.post("/owner-warning", validate(warningSchema), controller.warnOwner);
router.get("/users", controller.getUsers);
router.get("/users/:userId", controller.getUserDetail);
router.patch("/users/:userId/toggle-status", controller.toggleUserStatus);
router.post("/policies", validate(createPolicySchema), controller.createPolicy);
router.get("/stats", controller.stats);

router.get("/owner-requests", controller.getOwnerRequests);
router.post("/owner-requests/:requestId/approve", controller.approveOwnerRequest);
router.post("/owner-requests/:requestId/reject", validate(ownerRequestNoteSchema), controller.rejectOwnerRequest);

router.get("/policies", controller.getPolicies);
router.put("/policies/:id", controller.updatePolicy);
router.delete("/policies/:id", controller.deletePolicy);

router.get("/amenities", amenityController.getAmenities);
router.post("/amenities", validate(createAmenitySchema), amenityController.createAmenity);
router.delete("/amenities/:id", amenityController.deleteAmenity);

module.exports = router;

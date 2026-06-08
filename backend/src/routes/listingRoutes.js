const express = require("express");
const controller = require("../controllers/listingController");
const verifyToken = require("../middlewares/verifyToken");
const optionalAuth = require("../middlewares/optionalAuth");
const authorize = require("../middlewares/authorize");
const policy = require("../middlewares/policyMiddleware");
const validate = require("../middlewares/validate");
const { createListingSchema, updateListingSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/", controller.getListings);
router.get("/my-listings", verifyToken, authorize("owner"), controller.getMyListings);
router.get("/:id", optionalAuth, controller.getListingDetail);
router.post("/", verifyToken, policy, authorize("owner"), validate(createListingSchema), controller.createListing);
router.put("/:id", verifyToken, authorize("owner"), validate(updateListingSchema), controller.updateListing);
router.delete("/:id", verifyToken, authorize("owner"), controller.deleteListing);
router.patch("/:id/mark-updated", verifyToken, authorize("owner"), controller.markListingUpdated);

module.exports = router;

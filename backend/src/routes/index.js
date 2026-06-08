const express = require("express");
const authRoutes = require("./authRoutes");
const listingRoutes = require("./listingRoutes");
const paymentRoutes = require("./paymentRoutes");
const reviewRoutes = require("./reviewRoutes");
const chatRoutes = require("./chatRoutes");
const notificationRoutes = require("./notificationRoutes");
const policyRoutes = require("./policyRoutes");
const adminRoutes = require("./adminRoutes");
const ownerRequestRoutes = require("./ownerRequestRoutes");
const bookingRoutes = require("./bookingRoutes");
const amenityRoutes = require("./amenityRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/listings", listingRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/chat", chatRoutes);
router.use("/notifications", notificationRoutes);
router.use("/policies", policyRoutes);
router.use("/admin", adminRoutes);
router.use("/owner-requests", ownerRequestRoutes);
router.use("/bookings", bookingRoutes);
router.use("/amenities", amenityRoutes);

module.exports = router;

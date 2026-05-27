const express = require("express");
const authRoutes = require("./authRoutes");
const listingRoutes = require("./listingRoutes");
const paymentRoutes = require("./paymentRoutes");
const reviewRoutes = require("./reviewRoutes");
const chatRoutes = require("./chatRoutes");
const notificationRoutes = require("./notificationRoutes");
const policyRoutes = require("./policyRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/listings", listingRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/chat", chatRoutes);
router.use("/notifications", notificationRoutes);
router.use("/policies", policyRoutes);
router.use("/admin", adminRoutes);

module.exports = router;

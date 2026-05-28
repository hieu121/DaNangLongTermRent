const express = require("express");
const controller = require("../controllers/bookingController");
const verifyToken = require("../middlewares/verifyToken");
const authorize = require("../middlewares/authorize");
const policy = require("../middlewares/policyMiddleware");
const validate = require("../middlewares/validate");
const { createBookingSchema } = require("../validators/schemas");

const router = express.Router();

router.use(verifyToken, policy);
router.post("/", authorize("tenant"), validate(createBookingSchema), controller.createBooking);
router.get("/my-bookings", authorize("tenant"), controller.getMyBookings);
router.patch("/:id/cancel", authorize("tenant"), controller.cancelBooking);

module.exports = router;

const bookingService = require("../services/bookingService");
const { success } = require("../utils/response");

const createBooking = async (req, res, next) => {
  try {
    const bookingId = await bookingService.createBooking(req.user.id, req.body);
    return success(res, { bookingId }, "Booking created", 201);
  } catch (error) {
    return next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const data = await bookingService.getMyBookings(req.user.id);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    await bookingService.cancelBooking(Number(req.params.id), req.user.id);
    return success(res, null, "Booking cancelled");
  } catch (error) {
    return next(error);
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking };

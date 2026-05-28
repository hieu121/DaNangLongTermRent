const bookingRepository = require("../repositories/bookingRepository");
const listingRepository = require("../repositories/listingRepository");

const createBooking = async (tenantId, data) => {
  const listing = await listingRepository.findListingById(data.listingId);
  if (!listing) {
    throw new Error("Listing not found");
  }
  if (listing.status !== "active") {
    throw new Error("Listing is not available");
  }
  if (listing.owner_id === tenantId) {
    throw new Error("You cannot book your own listing");
  }

  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  if (checkIn >= checkOut) {
    throw new Error("Check-out must be after check-in");
  }

  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * Number(listing.price);

  return bookingRepository.createBooking({
    tenantId,
    listingId: data.listingId,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests || 1,
    totalPrice
  });
};

const getMyBookings = async (tenantId) => {
  return bookingRepository.findByTenantId(tenantId);
};

const cancelBooking = async (bookingId, tenantId) => {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }
  if (booking.tenant_id !== tenantId) {
    throw new Error("Unauthorized");
  }
  if (booking.status !== "pending" && booking.status !== "confirmed") {
    throw new Error("Booking cannot be cancelled");
  }

  await bookingRepository.updateStatus(bookingId, "cancelled");
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking
};

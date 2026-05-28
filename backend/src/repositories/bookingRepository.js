const { Booking, User } = require("../database/models");

const createBooking = async (data) => {
  const booking = await Booking.create({
    tenant_id: data.tenantId,
    listing_id: data.listingId,
    check_in: data.checkIn,
    check_out: data.checkOut,
    guests: data.guests || 1,
    total_price: data.totalPrice,
    status: "pending"
  });
  return booking.id;
};

const findByTenantId = async (tenantId) => {
  const bookings = await Booking.findAll({
    where: { tenant_id: tenantId },
    include: [
      {
        model: User,
        attributes: ["id", "full_name", "email", "phone"]
      }
    ],
    order: [["created_at", "DESC"]]
  });
  return bookings.map((b) => b.get({ plain: true }));
};

const findById = async (id) => {
  const booking = await Booking.findByPk(id);
  return booking ? booking.get({ plain: true }) : null;
};

const updateStatus = async (id, status) => {
  await Booking.update(
    { status, updated_at: new Date() },
    { where: { id } }
  );
};

module.exports = {
  createBooking,
  findByTenantId,
  findById,
  updateStatus
};

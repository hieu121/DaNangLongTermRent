const paymentService = require("../services/paymentService");
const { success } = require("../utils/response");

const mockMomoPayment = async (req, res, next) => {
  try {
    const data = await paymentService.createMockMomoPayment({
      tenantId: req.user.id,
      listingId: req.body.listingId,
      amount: req.body.amount
    });
    return success(res, data, "Payment success (mock)");
  } catch (error) {
    return next(error);
  }
};

module.exports = { mockMomoPayment };
